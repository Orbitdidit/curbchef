import { useState, useEffect } from 'react';

/**
 * Returns a live closing-status label for a truck, recalculated every minute.
 * Returns: { label, variant }
 * variant: 'normal' | 'soon' | 'last_call' | 'cutoff' | 'closed'
 */
export function useCloseCountdown(truck) {
  const [result, setResult] = useState(() => compute(truck));

  useEffect(() => {
    setResult(compute(truck));
    const id = setInterval(() => setResult(compute(truck)), 60_000);
    return () => clearInterval(id);
  }, [truck?.status, truck?.scheduled_close_time, truck?.scheduled_open_time, truck?.order_cutoff_minutes]);

  return result;
}

function parseTimeToday(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function fmt12(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function compute(truck) {
  if (!truck) return { label: '', variant: 'closed' };

  const now = new Date();
  const closeTime = parseTimeToday(truck.scheduled_close_time);
  const openTime = parseTimeToday(truck.scheduled_open_time);
  const cutoffMins = truck.order_cutoff_minutes ?? 15;

  // Truck is manually closed
  if (truck.status === 'closed' || truck.status === 'sold_out') {
    if (openTime && openTime > now) {
      return { label: `Opens today at ${fmt12(openTime)}`, variant: 'closed' };
    }
    if (openTime) {
      return { label: `Opens tomorrow at ${fmt12(openTime)}`, variant: 'closed' };
    }
    return { label: 'Closed', variant: 'closed' };
  }

  // No close time set — just show open
  if (!closeTime) {
    return { label: 'Open', variant: 'normal' };
  }

  const minsUntilClose = (closeTime - now) / 60_000;

  // Past close time
  if (minsUntilClose <= 0) {
    return { label: 'Closed for today', variant: 'closed' };
  }

  // Past order cutoff (cutoffMins before close)
  if (minsUntilClose <= cutoffMins) {
    return { label: 'No longer taking orders', variant: 'cutoff' };
  }

  // Last call: under 30 min
  if (minsUntilClose <= 30) {
    return { label: `🔔 Last orders in ${Math.ceil(minsUntilClose)} min`, variant: 'last_call' };
  }

  // Closing in under 2 hrs
  if (minsUntilClose <= 120) {
    const h = Math.floor(minsUntilClose / 60);
    const m = Math.floor(minsUntilClose % 60);
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    return { label: `Closes in ${parts.join(' ')}`, variant: 'soon' };
  }

  // More than 2 hrs
  return { label: `Closes at ${fmt12(closeTime)}`, variant: 'normal' };
}