import React, { useState, useEffect } from 'react';

export default function OrderEtaBadge({ order }) {
  const [minsLeft, setMinsLeft] = useState(null);

  useEffect(() => {
    const calc = () => {
      if (!order.customer_eta_set_at || order.customer_eta_minutes == null) {
        setMinsLeft(null);
        return;
      }
      const setAt = new Date(order.customer_eta_set_at).getTime();
      const arrivalMs = setAt + order.customer_eta_minutes * 60 * 1000;
      const diff = Math.max(0, Math.round((arrivalMs - Date.now()) / 60000));
      setMinsLeft(diff);
    };
    calc();
    const id = setInterval(calc, 10000);
    return () => clearInterval(id);
  }, [order.customer_eta_set_at, order.customer_eta_minutes]);

  if (order.customer_eta_type === 'arrived') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full"
        style={{ background: 'rgba(119,255,200,0.2)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.5)' }}
      >
        👋 ARRIVED
      </span>
    );
  }

  if (minsLeft === null || !order.customer_eta_type) return null;

  const emoji = order.customer_eta_type === 'walking' ? '🚶' : '🚗';

  if (minsLeft <= 5) {
    // Red pulsing — should be ready
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse"
        style={{ background: 'rgba(253,89,30,0.2)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.5)', boxShadow: '0 0 8px rgba(253,89,30,0.35)' }}
      >
        {emoji} {minsLeft}m — READY NOW
      </span>
    );
  }

  if (minsLeft <= 10) {
    // Yellow — start cooking
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full"
        style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' }}
      >
        {emoji} {minsLeft}m — START COOKING
      </span>
    );
  }

  // Green — ETA > 10 min
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.25)' }}
    >
      {emoji} {minsLeft}m away
    </span>
  );
}