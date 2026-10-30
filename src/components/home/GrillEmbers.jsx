import React from 'react';

const EMBERS = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  bottom: (i * 23) % 90,
  size: 3 + (i % 3),
  delay: (i * 0.7) % 7,
  duration: 5 + (i % 4),
  drift: ((i % 5) - 2) * 10,
}));

export default function GrillEmbers() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {EMBERS.map((e, i) => (
        <span key={i} className="cc-ember" style={{
          left: `${e.left}%`, bottom: `${e.bottom}%`, width: e.size, height: e.size,
          animationDelay: `${e.delay}s`, animationDuration: `${e.duration}s`, '--drift': `${e.drift}px`,
        }} />
      ))}
    </div>
  );
}