import React from 'react';
import { Link } from 'react-router-dom';

const EXTRAS = [
  {
    emoji: '🪂',
    title: 'Curb Drops',
    description: 'Post flash deals — e.g. "First 10 orders get 20% off." Customers get notified in real time. Great way to fill slow hours.',
    badge: 'Boosts orders',
    badgeColor: '#fd591e',
  },
  {
    emoji: '📹',
    title: 'Go Live from your truck',
    description: 'Show customers what\'s on the grill right now. Live streams appear at the top of the feed and drive same-day orders.',
    badge: 'Top of feed',
    badgeColor: '#77ffc8',
  },
  {
    emoji: '🏆',
    title: 'Loyalty perks',
    description: 'Customers earn points on every order. They come back more when there\'s a reward waiting for them.',
    badge: 'Built in',
    badgeColor: '#fbbf24',
  },
];

export default function OnboardingStep6Extras({ truck }) {
  return (
    <div className="flex flex-col gap-6 pb-4">
      <div>
        <h2 className="font-heading font-black text-2xl mb-1" style={{ color: '#dff0e8' }}>Power-ups (optional) ⚡</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#bacbc0' }}>
          These are optional but can seriously boost your sales. You can set them up now or come back later.
        </p>
      </div>

      {EXTRAS.map(extra => (
        <div key={extra.title} className="p-5 rounded-2xl flex gap-4"
          style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}>
          <span className="text-3xl flex-shrink-0">{extra.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-heading font-bold text-base" style={{ color: '#dff0e8' }}>{extra.title}</p>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: `${extra.badgeColor}20`, color: extra.badgeColor }}>
                {extra.badge}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#bacbc0' }}>{extra.description}</p>
          </div>
        </div>
      ))}

      <div className="p-4 rounded-2xl text-center" style={{ background: 'rgba(119,255,200,0.05)', border: '1px solid rgba(119,255,200,0.15)' }}>
        <p className="text-sm font-semibold" style={{ color: '#bacbc0' }}>
          You can set up all of these from your <span style={{ color: '#77ffc8' }}>Vendor Dashboard</span> once you go live.
        </p>
      </div>
    </div>
  );
}