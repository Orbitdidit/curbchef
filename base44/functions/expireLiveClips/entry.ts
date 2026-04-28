import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Find all live clips that have an expires_at in the past
  const liveClips = await base44.asServiceRole.entities.LiveClip.filter({ is_live: true });
  const now = new Date();
  const expired = liveClips.filter(c => c.expires_at && new Date(c.expires_at) <= now);

  let count = 0;
  for (const clip of expired) {
    await base44.asServiceRole.entities.LiveClip.update(clip.id, { is_live: false });
    count++;
    // Also flip the truck's is_live flag off if it belongs to this clip
    if (clip.truck_id) {
      const trucks = await base44.asServiceRole.entities.FoodTruck.filter({ id: clip.truck_id, is_live: true });
      if (trucks.length > 0) {
        await base44.asServiceRole.entities.FoodTruck.update(clip.truck_id, { is_live: false });
      }
    }
  }

  return Response.json({ expired: count, checked: liveClips.length });
});