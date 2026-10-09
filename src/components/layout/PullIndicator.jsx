import React from 'react';

export default function PullIndicator({ pullDist, refreshing }) {
  const visible = pullDist > 0 || refreshing;
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label={refreshing ? 'Refreshing food trucks and live feeds' : pullDist >= 72 ? 'Release to refresh' : 'Pull to refresh'}
      className="flex items-center justify-center overflow-hidden transition-all duration-200"
      style={{ height: refreshing ? 52 : Math.min(pullDist, 52) }}
    >
      <div
        className="w-6 h-6 rounded-full border-2"
        style={{
          borderColor: 'var(--cc-accent) rgba(var(--cc-accent-rgb),0.2) rgba(var(--cc-accent-rgb),0.2) rgba(var(--cc-accent-rgb),0.2)',
          animation: refreshing ? 'spin 0.7s linear infinite' : 'none',
          transform: refreshing ? 'none' : `rotate(${(pullDist / 72) * 270}deg)`,
          transition: refreshing ? 'none' : 'transform 0.05s linear',
        }}
      />
    </div>
  );
}