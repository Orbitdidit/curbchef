import React from 'react';
import { Link } from 'react-router-dom';

const MOODS = [
  { label:'Order Now', emoji:'', href:'/explore', color:'rgba(var(--cc-accent-rgb),0.12)', border:'rgba(var(--cc-accent-rgb),0.25)', textColor:'var(--cc-accent)'},
  { label:'Food Scan', emoji:'', href:'/scan', color:'rgba(var(--cc-accent-rgb),0.08)', border:'rgba(var(--cc-accent-rgb),0.2)', textColor:'var(--cc-accent)'},
  { label:'Watch Live', emoji:'', href:'/live', color:'rgba(var(--cc-warm-red-rgb),0.1)', border:'rgba(var(--cc-warm-red-rgb),0.25)', textColor:'var(--cc-warm-red)'},
  { label:'Find on Map', emoji:'', href:'/map', color:'rgba(var(--cc-warm-rgb),0.1)', border:'rgba(var(--cc-warm-rgb),0.25)', textColor:'var(--cc-warm)'},
  { label:'My Rewards', emoji:'', href:'/rewards', color:'rgba(251,191,36,0.1)', border:'rgba(251,191,36,0.25)', textColor:'var(--cc-amber)'},
  { label:'Hot Deals', emoji:'', href:'/deals', color:'rgba(var(--cc-warm-rgb),0.1)', border:'rgba(var(--cc-warm-rgb),0.2)', textColor:'var(--cc-warm)'},
];

export default function FoodMoodRail() {
  return (
    <div className="px-4 mt-3">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {MOODS.map(m => (
          <Link key={m.label} to={m.href} className="flex-shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full active:scale-95 transition-transform" style={{ background: m.color, border: `1px solid ${m.border}` }}>
              <span className="text-base leading-none">{m.emoji}</span>
              <p className="text-[11px] font-black whitespace-nowrap" style={{ color: m.textColor }}>{m.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}