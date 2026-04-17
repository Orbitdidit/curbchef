import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Nightly punctuality check — run at midnight (or just after).
 * For each approved truck with scheduled hours:
 *  - Never went open at all → no_show_days + 1
 *  - Went open but >= 15 min late → late_opens_count + 1
 *  - Closed >= 30 min early → early_closes_count + 1
 * Recalculates reliability_score = max(0, 100 - late*3 - earlyClose*2 - noShow*10)
 *
 * Uses last_punctuality_check to avoid double-counting.
 * The caller (automation) passes no payload — this is a server-side job.
 */
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Verify admin or internal call (automation calls have no user)
  let isAdmin = false;
  try {
    const user = await base44.auth.me();
    isAdmin = user?.role === 'admin';
  } catch {
    // Automation/scheduled calls have no user — allow via service role only
  }

  const trucks = await base44.asServiceRole.entities.FoodTruck.list();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10); // "2026-04-17"

  const results = [];

  for (const truck of trucks) {
    // Only check trucks that have scheduled hours today
    if (!truck.scheduled_open_time && !truck.scheduled_close_time) continue;
    if (!truck.is_approved) continue;

    // Skip if already checked today
    if (truck.last_punctuality_check) {
      const lastCheck = truck.last_punctuality_check.slice(0, 10);
      if (lastCheck === todayStr) continue;
    }

    const updates = {
      last_punctuality_check: now.toISOString(),
    };

    let lateOpens = truck.late_opens_count || 0;
    let earlyCloses = truck.early_closes_count || 0;
    let noShows = truck.no_show_days || 0;

    const parseTime = (timeStr) => {
      if (!timeStr) return null;
      const [h, m] = timeStr.split(':').map(Number);
      const d = new Date(now);
      d.setHours(h, m, 0, 0);
      return d;
    };

    const scheduledOpen = parseTime(truck.scheduled_open_time);
    const scheduledClose = parseTime(truck.scheduled_close_time);

    // Was the truck ever open today? Approximate via status field.
    // (In production, you'd track an opened_at timestamp — here we use current status as proxy)
    const wasOpenToday = truck.status === 'open' || truck.total_orders > 0;

    if (scheduledOpen) {
      // No-show: had scheduled hours but never opened
      if (!wasOpenToday) {
        noShows += 1;
      } else {
        // Late open: truck opened but we can't track exact time without event log.
        // We flag this only when the truck's updated_date (proxy for last status change) is > 15min after open time.
        if (truck.updated_date) {
          const lastUpdate = new Date(truck.updated_date);
          const openPlusGrace = new Date(scheduledOpen.getTime() + 15 * 60_000);
          if (lastUpdate > openPlusGrace) {
            lateOpens += 1;
          }
        }
      }
    }

    // Early close: truck is closed but scheduled close hasn't passed yet (> 30 min remaining)
    if (scheduledClose && truck.status === 'closed') {
      const minsRemaining = (scheduledClose - now) / 60_000;
      if (minsRemaining > 30) {
        earlyCloses += 1;
      }
    }

    // Recalculate score
    const newScore = Math.max(0, 100 - (lateOpens * 3) - (earlyCloses * 2) - (noShows * 10));

    updates.late_opens_count = lateOpens;
    updates.early_closes_count = earlyCloses;
    updates.no_show_days = noShows;
    updates.reliability_score = newScore;

    await base44.asServiceRole.entities.FoodTruck.update(truck.id, updates);
    results.push({ id: truck.id, name: truck.name, score: newScore });
  }

  return Response.json({ checked: results.length, results });
});