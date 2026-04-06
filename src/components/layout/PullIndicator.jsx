import React from 'react';

export default function PullIndicator({ pullDist, refreshing }) {
  const visible = pullDist > 0 || refreshing;
  if (!visible) return null;

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-all duration-200"
      style={{ height: Math.min(pullDist, 52) }}
    >
      <div
        className="w-6 h-6 rounded-full border-2"
        style={{
          borderColor: '#77ffc8 rgba(119,255,200,0.2) rgba(119,255,200,0.2) rgba(119,255,200,0.2)',
          animation: refreshing ? 'spin 0.7s linear infinite' : 'none',
          transform: refreshing ? 'none' : `rotate(${(pullDist / 72) * 270}deg)`,
          transition: refreshing ? 'none' : 'transform 0.05s linear',
        }}
      />
    </div>
  );
}