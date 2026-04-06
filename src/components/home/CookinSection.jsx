import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Play } from 'lucide-react';

// Ember particle — pure CSS, no canvas, ultra-lightweight
function EmberParticle({ style }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: Math.random() * 4 + 2 + 'px',
        height: Math.random() * 4 + 2 + 'px',
        background: `rgba(${Math.random() > 0.5 ? '253,89,30' : '255,180,60'},${Math.random() * 0.5 + 0.2})`,
        filter: 'blur(1px)',
        ...style,
      }}
    />
  );
}

// Static ember positions so they don't re-randomize on render
const EMBERS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 11) % 100}%`,
  animDuration: 3 + (i % 5) * 0.8 + 's',
  animDelay: `-${(i * 0.7) % 4}s`,
  size: 2 + (i % 3),
  opacity: 0.2 + (i % 4) * 0.08,
  color: i % 3 === 0 ? '253,89,30' : i % 3 === 1 ? '255,160,50' : '255,220,80',
}));

const CARDS = [
  {
    id: 'heat',
    headline: 'THE STREETS\nARE COOKING',
    sub: 'Real food. Real trucks. Live right now.',
    cta1: { label: 'Watch Live', to: '/live' },
    cta2: { label: 'Explore Map', to: '/map' },
    bg: 'radial-gradient(ellipse at 30% 60%, rgba(253,89,30,0.22) 0%, rgba(13,21,23,0) 70%), radial-gradient(ellipse at 80% 20%, rgba(255,140,0,0.12) 0%, transparent 60%)',
    accent: '#fd591e',
    emoji: '🔥',
  },
  {
    id: 'chefs',
    headline: "CHEFS\nCOOKIN' UP 🔥",
    sub: 'Fresh drops all day. Don\'t sleep.',
    cta1: { label: 'See What\'s Hot', to: '/' },
    cta2: null,
    bg: 'radial-gradient(ellipse at 60% 40%, rgba(253,89,30,0.18) 0%, rgba(13,21,23,0) 65%), radial-gradient(ellipse at 10% 80%, rgba(255,60,0,0.1) 0%, transparent 50%)',
    accent: '#ff6b1a',
    emoji: '👨‍🍳',
  },
  {
    id: 'heatmap',
    headline: 'HOT SPOTS\nNEAR YOU',
    sub: 'Tap in before it\'s gone.',
    cta1: { label: 'View Heat Map', to: '/map' },
    cta2: null,
    bg: 'radial-gradient(ellipse at 50% 50%, rgba(253,89,30,0.15) 0%, rgba(13,21,23,0) 70%), radial-gradient(ellipse at 20% 20%, rgba(255,100,0,0.1) 0%, transparent 60%)',
    accent: '#fd591e',
    emoji: '📍',
  },
];

export default function CookinSection() {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  // Auto-rotate cards every 4s
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % CARDS.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  const card = CARDS[active];

  return (
    <div className="mt-8 px-5">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🔥</span>
        <h2 className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>Cookin' on CurbChef</h2>
        <span
          className="text-[10px] font-black px-2 py-0.5 rounded-full ml-auto"
          style={{ background: 'rgba(253,89,30,0.15)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.3)' }}
        >
          LIVE CULTURE
        </span>
      </div>

      {/* Main card */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          minHeight: '220px',
          background: `${card.bg}, #0d1517`,
          border: '1px solid rgba(253,89,30,0.2)',
          transition: 'background 0.8s ease',
        }}
      >
        {/* Ember particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {EMBERS.map(e => (
            <div
              key={e.id}
              className="absolute rounded-full"
              style={{
                left: e.left,
                bottom: '-8px',
                width: e.size + 'px',
                height: e.size + 'px',
                background: `rgba(${e.color},${e.opacity})`,
                filter: 'blur(0.5px)',
                animation: `emberFloat ${e.animDuration} ${e.animDelay} ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        {/* Grill mark texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(253,89,30,0.03) 0px, rgba(253,89,30,0.03) 2px, transparent 2px, transparent 28px)',
          }}
        />

        {/* Heat distortion shimmer */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{
            background: 'linear-gradient(0deg, rgba(253,89,30,0.08) 0%, transparent 100%)',
            animation: 'shimmerPulse 2.5s ease-in-out infinite',
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col justify-between" style={{ minHeight: '220px' }}>
          <div className="text-4xl">{card.emoji}</div>
          <div className="mt-auto">
            <h3
              className="font-heading font-black leading-tight mb-2 whitespace-pre-line"
              style={{ color: '#ffffff', fontSize: 'clamp(1.5rem,6vw,2rem)', textShadow: '0 2px 20px rgba(253,89,30,0.3)' }}
            >
              {card.headline}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>{card.sub}</p>
            <div className="flex gap-3">
              <Link to={card.cta1.to}>
                <button
                  className="px-5 py-2.5 rounded-full font-heading font-black text-sm transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #fd591e, #ff8c00)',
                    color: '#fff',
                    boxShadow: '0 0 18px rgba(253,89,30,0.45)',
                  }}
                >
                  {card.cta1.label}
                </button>
              </Link>
              {card.cta2 && (
                <Link to={card.cta2.to}>
                  <button
                    className="px-5 py-2.5 rounded-full font-heading font-black text-sm transition-all active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {card.cta2.label}
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="absolute top-4 right-4 flex gap-1.5 z-10">
          {CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); clearInterval(timerRef.current); }}
              className="rounded-full transition-all"
              style={{
                width: i === active ? '20px' : '6px',
                height: '6px',
                background: i === active ? '#fd591e' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes emberFloat {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
          30%  { transform: translateY(-40px) translateX(6px) scale(1.1); opacity: 0.4; }
          60%  { transform: translateY(-80px) translateX(-4px) scale(0.9); opacity: 0.25; }
          100% { transform: translateY(-130px) translateX(8px) scale(0.5); opacity: 0; }
        }
        @keyframes shimmerPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  );
}