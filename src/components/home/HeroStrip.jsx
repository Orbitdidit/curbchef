import React from 'react';

export default function HeroStrip({ liveTrucks, openTrucks, trucks }) {
  const stats = [
    { emoji: '🔴', label: `${liveTrucks.length || 0} Trucks Live`, sub: 'Right now', glow: 'rgba(255,59,48,0.25)', color: '#ff3b30' },
    { emoji: '🍔', label: `${openTrucks.length || 0} Open Now`, sub: 'Near you', glow: 'rgba(119,255,200,0.2)', color: '#77ffc8' },
    { emoji: '🔥', label: 'Trending', sub: 'In Houston', glow: 'rgba(253,89,30,0.2)', color: '#fd591e' },
  ];

  return (
    <div className="px-5 pt-4">
      <div className="flex gap-3">
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex-1 rounded-2xl p-3 flex flex-col items-center text-center"
            style={{
              background: '#192123',
              border: `1px solid ${s.glow}`,
              boxShadow: `0 0 16px ${s.glow}`,
            }}
          >
            <span className="text-xl mb-1">{s.emoji}</span>
            <p className="font-heading font-black text-sm leading-tight" style={{ color: s.color }}>{s.label}</p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: '#bacbc0' }}>{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}