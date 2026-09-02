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
        <div className="h-px flex-1" style={{ background: 'rgba(var(--cc-line-rgb),0.4)' }} />
        <p className="font-heading font-black text-sm tracking-widest" style={{ color: 'var(--cc-accent)' }}>WHY JOIN</p>
        <div className="h-px flex-1" style={{ background: 'rgba(var(--cc-line-rgb),0.4)' }} />
      </div>
      <h2 className="font-heading font-black text-2xl text-center mb-1" style={{ color: 'var(--cc-ink)' }}>
        🎁 Why join the waitlist?
      </h2>
      <p className="text-sm text-center mb-8" style={{ color: 'var(--cc-ink-dim)' }}>
        Founders get hooked up. More details revealed at launch.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {PERKS.map(({ emoji, title, desc }) => (
          <div key={title} className="flex items-start gap-4 p-4 rounded-2xl"
            style={{ background: 'var(--cc-bg-1)', border: '1px solid rgba(var(--cc-line-rgb),0.25)' }}>
            <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
            <div>
              <p className="font-heading font-black text-sm mb-1" style={{ color: 'var(--cc-ink)' }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--cc-ink-dim)' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => onJoinWaitlist('perks')}
        className="w-full py-4 rounded-full font-heading font-black text-base transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color: 'var(--cc-accent-deep)', boxShadow: '0 0 24px rgba(var(--cc-accent-rgb),0.3)' }}>
        🚀 Claim my Founding Member spot
      </button>
    </section>
  );
}