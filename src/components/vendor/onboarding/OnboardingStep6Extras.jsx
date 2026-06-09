import React from 'react';

const FEATURES = [
  {
    emoji: '⚡',
    name: 'Curb Drops',
    desc: 'Flash deals that expire in 30 min. Drive immediate foot traffic when you have slow moments.',
    badge: 'Popular',
    badgeStyle: { background: 'rgba(255,107,26,0.15)', color: '#FF6B1A' },
  },
  {
    emoji: '📹',
    name: 'Live Streaming',
    desc: 'Show customers what\'s cooking right now. Live clips get 5× more profile visits.',
    badge: 'High Impact',
    badgeStyle: { background: 'rgba(119,255,200,0.12)', color: '#77ffc8' },
  },
  {
    emoji: '🎁',
    name: 'Loyalty Perks',
    desc: 'Reward repeat customers with points and exclusive offers. Keeps them coming back.',
    badge: 'Coming Soon',
    badgeStyle: { background: 'rgba(59,74,66,0.3)', color: '#bacbc0' },
  },
];

export default function OnboardingStep6Extras() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>Power-up your truck</p>
        <p className="text-sm" style={{ color: '#bacbc0' }}>These optional tools help you sell more. All available after setup.</p>
      </div>

      <div className="flex flex-col gap-3">
        {FEATURES.map(f => (
          <div key={f.name} className="flex gap-4 p-4 rounded-2xl"
            style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}>
            <div className="text-3xl">{f.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-sm" style={{ color: '#dff0e8' }}>{f.name}</p>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={f.badgeStyle}>{f.badge}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#bacbc0' }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 rounded-2xl"
        style={{ background: 'rgba(119,255,200,0.05)', border: '1px solid rgba(119,255,200,0.12)' }}>
        <p className="text-xs" style={{ color: '#bacbc0' }}>
          🚀 All these features are unlocked in your <strong style={{ color: '#77ffc8' }}>Vendor Dashboard</strong> after you launch.
        </p>
      </div>
    </div>
  );
}