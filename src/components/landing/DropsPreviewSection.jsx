import React from 'react';

const SAMPLE_DROPS = [
  {
    emoji: '🥤',
    name: 'Cyberade',
    desc: 'Neon blue electrolyte drink — Houston exclusive',
    dealPrice: '$5.00',
    originalPrice: '$8.00',
    truck: 'Curb Hydration Co.',
  },
  {
    emoji: '🥛',
    name: 'Street Horchata',
    desc: 'House-made cinnamon horchata, ice cold',
    dealPrice: '$3.99',
    originalPrice: '$6.50',
    truck: 'El Camino Cantina',
  },
];

export default function DropsPreviewSection({ onJoinWaitlist }) {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-px flex-1" style={{ background: 'rgba(59,74,66,0.4)' }} />
        <p className="font-heading font-black text-sm tracking-widest" style={{ color: '#fd591e' }}>CURB DROPS</p>
        <div className="h-px flex-1" style={{ background: 'rgba(59,74,66,0.4)' }} />
      </div>
      <h2 className="font-heading font-black text-2xl text-center mb-1" style={{ color: '#dff0e8' }}>
        💥 $5 Curb Drops drop daily
      </h2>
      <p className="text-sm text-center mb-8" style={{ color: '#bacbc0' }}>
        Flash deals from real Houston trucks. Be first when we go live.
      </p>

      <div className="flex flex-col gap-4">
        {SAMPLE_DROPS.map(drop => (
          <button key={drop.name} onClick={() => onJoinWaitlist('drops_peek')}
            className="relative rounded-3xl p-4 text-left active:scale-95 transition-transform overflow-hidden"
            style={{ background: '#151d1f', border: '1px solid rgba(253,89,30,0.25)' }}>
            {/* Available at launch overlay */}
            <div className="absolute inset-0 rounded-3xl flex items-center justify-center z-10"
              style={{ background: 'rgba(13,21,23,0.45)', backdropFilter: 'blur(1px)' }}>
              <span className="text-xs font-black px-4 py-1.5 rounded-full"
                style={{ background: 'rgba(253,89,30,0.9)', color: '#fff', boxShadow: '0 0 16px rgba(253,89,30,0.4)' }}>
                🔒 Available at launch — Join waitlist
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: 'rgba(253,89,30,0.1)' }}>
                {drop.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>{drop.name}</p>
                <p className="text-xs truncate mb-1" style={{ color: '#bacbc0' }}>{drop.desc}</p>
                <p className="text-[10px]" style={{ color: 'rgba(186,203,192,0.5)' }}>from {drop.truck}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-heading font-black text-xl" style={{ color: '#fd591e' }}>{drop.dealPrice}</p>
                <p className="text-xs line-through" style={{ color: '#6B665C' }}>{drop.originalPrice}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button onClick={() => onJoinWaitlist('drops_peek')}
        className="w-full mt-6 py-3.5 rounded-full font-heading font-black text-sm transition-all active:scale-95"
        style={{ background: 'rgba(253,89,30,0.1)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.3)' }}>
        ⚡ Get notified when drops go live →
      </button>
    </section>
  );
}