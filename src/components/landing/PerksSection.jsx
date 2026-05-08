import React from 'react';

const PERKS = [
  {
    emoji: '🪂',
    title: 'Loyalty that pays you back',
    desc: 'Unlike other apps, expired points get redistributed to active users monthly. More info at launch.',
  },
  {
    emoji: '🥇',
    title: 'Founding Member status',
    desc: 'Early waitlist members get special perks, badges, and a lifetime rewards multiplier. Spots filling fast.',
  },
  {
    emoji: '⚡',
    title: 'First dibs on Curb Drops',
    desc: 'Flash deals notify Founders first. Skip the line, claim before they\'re gone.',
  },
  {
    emoji: '🚀',
    title: 'AR Truck Radar early access',
    desc: 'Point your phone, see trucks in AR. Founders test it first — before public launch.',
  },
];

export default function PerksSection({ onJoinWaitlist }) {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-px flex-1" style={{ background: 'rgba(59,74,66,0.4)' }} />
        <p className="font-heading font-black text-sm tracking-widest" style={{ color: '#77ffc8' }}>WHY JOIN</p>
        <div className="h-px flex-1" style={{ background: 'rgba(59,74,66,0.4)' }} />
      </div>
      <h2 className="font-heading font-black text-2xl text-center mb-1" style={{ color: '#dff0e8' }}>
        🎁 Why join the waitlist?
      </h2>
      <p className="text-sm text-center mb-8" style={{ color: '#bacbc0' }}>
        Founders get hooked up. More details revealed at launch.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {PERKS.map(({ emoji, title, desc }) => (
          <div key={title} className="flex items-start gap-4 p-4 rounded-2xl"
            style={{ background: '#151d1f', border: '1px solid rgba(59,74,66,0.25)' }}>
            <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
            <div>
              <p className="font-heading font-black text-sm mb-1" style={{ color: '#dff0e8' }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#bacbc0' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => onJoinWaitlist('perks')}
        className="w-full py-4 rounded-full font-heading font-black text-base transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 24px rgba(119,255,200,0.3)' }}>
        🚀 Claim my Founding Member spot
      </button>
    </section>
  );
}