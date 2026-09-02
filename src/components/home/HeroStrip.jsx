import React from'react';

export default function HeroStrip({ liveTrucks, openTrucks, trucks }) {
  const stats = [
    { emoji:'', label: `${liveTrucks.length || 0} Trucks Live`, sub:'Right now', glow:'rgba(var(--cc-warm-red-rgb),0.25)', color:'var(--cc-warm-red)'},
    { emoji:'', label: `${openTrucks.length || 0} Open Now`, sub:'Near you', glow:'rgba(var(--cc-accent-rgb),0.2)', color:'var(--cc-accent)'},
    { emoji:'', label:'Trending', sub:'In Houston', glow:'rgba(var(--cc-warm-rgb),0.2)', color:'var(--cc-warm)'},
  ];

  return (
    <div className="px-5 pt-4">
      <div className="flex gap-3">
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex-1 rounded-2xl p-3 flex flex-col items-center text-center"style={{
              background:'var(--cc-bg-2)',
              border: `1px solid ${s.glow}`,
              boxShadow: `0 0 16px ${s.glow}`,
            }}
          >
            <span className="text-xl mb-1">{s.emoji}</span>
            <p className="font-display text-sm leading-tight"style={{ color: s.color }}>{s.label}</p>
            <p className="text-[10px] font-medium mt-0.5"style={{ color:'var(--cc-ink-dim)'}}>{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}