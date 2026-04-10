import React from 'react';
import { Link } from 'react-router-dom';

const MOODS = [
  { label: 'Order Now', emoji: '🛒', href: '/explore', color: 'rgba(119,255,200,0.12)', border: 'rgba(119,255,200,0.25)', textColor: '#77ffc8' },
  { label: 'Food Scan', emoji: '📸', href: '/scan', color: 'rgba(119,255,200,0.08)', border: 'rgba(119,255,200,0.2)', textColor: '#77ffc8' },
  { label: 'Watch Live', emoji: '📺', href: '/live', color: 'rgba(255,59,48,0.1)', border: 'rgba(255,59,48,0.25)', textColor: '#ff3b30' },
  { label: 'Find on Map', emoji: '🗺️', href: '/map', color: 'rgba(253,89,30,0.1)', border: 'rgba(253,89,30,0.25)', textColor: '#fd591e' },
  { label: 'My Rewards', emoji: '🏆', href: '/rewards', color: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', textColor: '#fbbf24' },
  { label: 'Hot Deals', emoji: '🔥', href: '/deals', color: 'rgba(253,89,30,0.1)', border: 'rgba(253,89,30,0.2)', textColor: '#fd591e' },
];

export default function FoodMoodRail() {
  return (
    <div className="px-5 mt-6">
      <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: 'rgba(186,203,192,0.5)' }}>QUICK ACCESS</p>
      <div className="grid grid-cols-3 gap-2.5">
        {MOODS.map(m => (
          <Link key={m.label} to={m.href}>
            <div className="flex flex-col items-center justify-center py-4 rounded-2xl gap-1.5 active:scale-95 transition-transform"
              style={{ background: m.color, border: `1px solid ${m.border}` }}>
              <span className="text-2xl">{m.emoji}</span>
              <p className="text-[11px] font-black text-center" style={{ color: m.textColor }}>{m.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}