import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, MapPin } from 'lucide-react';

const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop',
    label: 'BAYOU LIVE',
    title: 'Gulf Shrimp hitting\nthe grill now',
    accent: '#ff3b30',
  },
  {
    img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=900&auto=format&fit=crop',
    label: 'LIVE FIRE',
    title: 'Skewers over\nopen flame',
    accent: '#fd591e',
  },
  {
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop',
    label: 'FRESH OUT',
    title: 'Neapolitan pies,\nfresh from the oven',
    accent: '#fbbf24',
  },
  {
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop',
    label: 'TRENDING',
    title: 'Wagyu sliders\ngoing viral',
    accent: '#77ffc8',
  },
];

export default function LiveHeroBanner({ liveTrucks = [], openTrucks = [] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 3800);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[idx];

  return (
    <div className="mx-4 mt-3 rounded-3xl overflow-hidden relative" style={{ height: 220 }}>
      {/* Background image with crossfade */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === idx ? 1 : 0 }}
        >
          <img src={s.img} alt="" className="w-full h-full object-cover" />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to top, rgba(13,21,23,0.95) 0%, rgba(13,21,23,0.5) 50%, rgba(13,21,23,0.15) 100%)'
      }} />

      {/* Live badge top-left */}
      <div className="absolute top-3.5 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
        style={{ background: 'rgba(255,40,40,0.88)', backdropFilter: 'blur(8px)' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-white live-dot" />
        <span className="text-[10px] font-black text-white tracking-wide">{slide.label}</span>
      </div>

      {/* Slide dots top-right */}
      <div className="absolute top-4 right-4 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className="rounded-full transition-all"
            style={{
              width: i === idx ? 16 : 5,
              height: 5,
              background: i === idx ? slide.accent : 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>

      {/* Content bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="font-heading font-black text-xl text-white leading-tight mb-3 whitespace-pre-line">
          {slide.title}
        </p>
        <div className="flex gap-2">
          <Link to="/live"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-xs"
            style={{ background: slide.accent === '#77ffc8' ? 'linear-gradient(135deg,#77ffc8,#00e6a7)' : slide.accent, color: slide.accent === '#77ffc8' ? '#003826' : '#fff' }}>
            <Play className="w-3 h-3" fill="currentColor" />
            Watch Live
          </Link>
          <Link to="/explore"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-xs"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <MapPin className="w-3 h-3" />
            Explore Nearby
          </Link>
        </div>
      </div>
    </div>
  );
}