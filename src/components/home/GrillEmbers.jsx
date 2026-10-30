import React, { useEffect, useRef, useState } from 'react';

const EMBERS = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 2 + (i % 3),
  delay: (i * 0.7) % 6,
  duration: 4 + (i % 4),
  drift: ((i % 5) - 2) * 8,
}));

export default function GrillEmbers() {
  const ref = useRef(null);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const scroller = ref.current?.closest('main') || window;
    const onScroll = () => {
      const y = scroller === window ? window.scrollY : scroller.scrollTop;
      setOpacity(Math.max(0, 1 - y / 240));
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden z-0"
      style={{ opacity, transition: 'opacity 0.3s ease-out' }}>
      {EMBERS.map((e, i) => (
        <span key={i} className="cc-ember" style={{
          left: `${e.left}%`, width: e.size, height: e.size,
          animationDelay: `${e.delay}s`, animationDuration: `${e.duration}s`, '--drift': `${e.drift}px`,
        }} />
      ))}
    </div>
  );
}