import React from 'react';

const PARKS = [
  { name: 'Truck Yard Heights', emoji: '🏛️', desc: 'Heights' },
  { name: 'POST Houston Food Hall', emoji: '🏢', desc: 'Downtown' },
  { name: 'Buffalo Bayou Brewing Co.', emoji: '🍺', desc: 'Sawyer Yards' },
  { name: 'Karbach Brewing Backyard', emoji: '🌿', desc: 'Northwest Houston' },
];

export default function ParkPartnershipsSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-px flex-1" style={{ background: 'rgba(var(--cc-line-rgb),0.4)' }} />
        <p className="font-heading font-black text-sm tracking-widest" style={{ color: 'var(--cc-accent)' }}>LOCATIONS</p>
        <div className="h-px flex-1" style={{ background: 'rgba(var(--cc-line-rgb),0.4)' }} />
      </div>
      <h2 className="font-heading font-black text-2xl text-center mb-2" style={{ color: 'var(--cc-ink)' }}>
        🏛️ Featured at Houston's hottest truck parks
      </h2>
      <p className="text-sm text-center mb-8" style={{ color: 'var(--cc-ink-dim)' }}>
        Approved trucks get featured at Houston's premier multi-vendor locations.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {PARKS.map(park => (
          <div key={park.name} className="p-4 rounded-2xl flex flex-col items-center text-center gap-2"
            style={{ background: 'var(--cc-bg-1)', border: '1px solid rgba(var(--cc-line-rgb),0.25)' }}>
            <span className="text-3xl">{park.emoji}</span>
            <p className="font-heading font-black text-xs leading-tight" style={{ color: 'var(--cc-ink)' }}>{park.name}</p>
            <p className="text-[10px]" style={{ color: 'var(--cc-ink-dim)' }}>{park.desc}</p>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(var(--cc-accent-rgb),0.08)', color: 'var(--cc-accent)', border: '1px solid rgba(var(--cc-accent-rgb),0.2)' }}>
              COMING SOON
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}