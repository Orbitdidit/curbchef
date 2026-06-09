import React from 'react';

const FEATURES = [
  { emoji: '⚡', title: 'Curb Drops', desc: 'Post flash deals that expire in 30 min. Drive urgency and sell more.', badge: 'Free', badgeStyle: { background: 'rgba(119,255,200,0.12)', color: '#77ffc8' } },
  { emoji: '🎥', title: 'Live Streaming', desc: 'Go live from your truck. Show what\'s cooking and build hype.', badge: 'Free', badgeStyle: { background: 'rgba(119,255,200,0.12)', color: '#77ffc8' } },
  { emoji: '🏆', title: 'Loyalty Perks', desc: 'Reward repeat customers automatically. Turn one-timers into regulars.', badge: 'Plus+', badgeStyle: { background: 'rgba(255,107,26,0.15)', color: '#FF6B1A' } },
  { emoji: '🚀', title: 'Boost Visibility', desc: 'Pin your truck to the top of Explore, Nearby, and Live feeds.', badge: 'Credits', badgeStyle: { background: 'rgba(255,59,48,0.1)', color: '#FF3B30' } },
];

export default function OnboardingStep6Extras() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>Power-ups 🚀</h2>
        <p className="text-sm" style={{ color: '#bacbc0' }}>These features are all available from your dashboard after you launch.</p>
      </div>

      <div className="space-y-3">
        {FEATURES.map(f => (
          <div key={f.title} className="flex items-start gap-4 p-4 rounded-2xl"
            style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.4)' }}>
            <span className="text-2xl flex-shrink-0">{f.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>{f.title}</p>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={f.badgeStyle}>{f.badge}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#bacbc0' }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}