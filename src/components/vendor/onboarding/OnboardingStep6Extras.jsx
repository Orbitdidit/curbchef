import React from 'react';

const FEATURES = [
  {
    emoji: '⚡',
    name: 'Curb Drops',
    desc: 'Flash deals that expire in 30 min. Drive immediate foot traffic when you have slow moments.',
    badge: 'Popular',
    badgeStyle: { background: 'rgba(255,107,26,0.15)', color: 'var(--cc-warm-2)' },
  },
  {
    emoji: '📹',
    name: 'Live Streaming',
    desc: 'Show customers what\'s cooking right now. Live clips get 5× more profile visits.',
    badge: 'High Impact',
    badgeStyle: { background: 'rgba(var(--cc-accent-rgb),0.12)', color: 'var(--cc-accent)' },
  },
  {
    emoji: '🎁',
    name: 'Loyalty Perks',
    desc: 'Reward repeat customers with points and exclusive offers. Keeps them coming back.',
    badge: 'Coming Soon',
    badgeStyle: { background: 'rgba(var(--cc-line-rgb),0.3)', color: 'var(--cc-ink-dim)' },
  },
];

export default function OnboardingStep6Extras() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-heading font-black text-xl mb-1" style={{ color: 'var(--cc-ink)' }}>Power-up your truck</p>
        <p className="text-sm" style={{ color: 'var(--cc-ink-dim)' }}>These optional tools help you sell more. All available after setup.</p>
      </div>

      <div className="flex flex-col gap-3">
        {FEATURES.map(f => (
          <div key={f.name} className="flex gap-4 p-4 rounded-2xl"
            style={{ background: 'var(--cc-bg-2)', border: '1px solid rgba(var(--cc-line-rgb),0.3)' }}>
            <div className="text-3xl">{f.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-sm" style={{ color: 'var(--cc-ink)' }}>{f.name}</p>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={f.badgeStyle}>{f.badge}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--cc-ink-dim)' }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 rounded-2xl"
        style={{ background: 'rgba(var(--cc-accent-rgb),0.05)', border: '1px solid rgba(var(--cc-accent-rgb),0.12)' }}>
        <p className="text-xs" style={{ color: 'var(--cc-ink-dim)' }}>
          🚀 All these features are unlocked in your <strong style={{ color: 'var(--cc-accent)' }}>Vendor Dashboard</strong> after you launch.
        </p>
      </div>
    </div>
  );
}