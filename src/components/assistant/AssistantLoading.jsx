import React, { useState, useEffect } from 'react';

const PHRASES = [
  'Scanning nearby trucks...',
  'Matching your cravings...',
  'Finding the best bites...',
];

export default function AssistantLoading() {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => setIdx(i => (i + 1) % PHRASES.length), 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: '#77ffc8' }} />
        <div className="absolute inset-0 flex items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', boxShadow: '0 0 24px rgba(119,255,200,0.4)' }}>
          <span className="text-2xl">🍽️</span>
        </div>
      </div>
      <p className="font-heading font-bold text-sm transition-opacity" style={{ color: '#dff0e8' }}>
        {PHRASES[idx]}
      </p>
      <div className="flex gap-1 mt-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full animate-pulse"
            style={{
              background: '#77ffc8',
              opacity: i === idx % 3 ? 1 : 0.3,
              animationDelay: `${i * 200}ms`,
            }} />
        ))}
      </div>
    </div>
  );
}