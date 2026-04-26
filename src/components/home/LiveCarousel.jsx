import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

/**
 * Determines the content label based on clip source:
 *  - is_live=true  → "LIVE FEED" (red pulse badge)
 *  - is_live=false, has video_url → "FEATURED CLIP"
 *  - truck card (no video_url) → "COOKING NOW"
 */
function ClipBadge({ clip, isTruckCard }) {
  if (!isTruckCard && clip.is_live) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ background: 'rgba(255,59,48,0.9)', backdropFilter: 'blur(8px)' }}>
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span className="text-white text-[11px] font-bold font-mono tracking-widest">LIVE FEED</span>
      </div>
    );
  }
  if (isTruckCard) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ background: 'rgba(253,89,30,0.85)', backdropFilter: 'blur(8px)' }}>
        <span className="text-white text-[11px] font-black tracking-widest">🔥 COOKING NOW</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
      style={{ background: 'rgba(13,21,23,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
      <span className="text-white text-[11px] font-black tracking-widest">🎬 FEATURED CLIP</span>
    </div>
  );
}

function LiveCard({ clip, isActive, isTruckCard }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) { v.currentTime = 0; v.play().catch(() => {}); }
    else v.pause();
  }, [isActive]);

  return (
    <Link to="/live" className="block relative overflow-hidden flex-shrink-0 rounded-3xl"
      style={{ width: '100%', aspectRatio: '16/9' }}>
      {clip.video_url ? (
        <video ref={videoRef} src={clip.video_url} poster={clip.poster_url || undefined}
          className="absolute inset-0 w-full h-full object-cover"
          muted loop playsInline autoPlay={isActive} />
      ) : (
        <img
          src={clip.image_url || clip.poster_url || clip.cover_image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800'}
          alt={clip.title || clip.name}
          className="absolute inset-0 w-full h-full object-cover" />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0) 35%, rgba(10,10,10,0.92) 100%)' }} />

      {/* Badge top-left */}
      <div className="absolute top-4 left-4">
        <ClipBadge clip={clip} isTruckCard={isTruckCard} />
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="font-heading font-black text-xl text-white leading-tight mb-1"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
          {clip.truck_name || clip.name || 'Live Truck'}
        </p>
        <p className="text-white/70 text-sm font-medium">
          {clip.title || clip.live_description || 'Tap to watch'}
        </p>
      </div>
    </Link>
  );
}

export default function LiveCarousel({ trucks }) {
  const [active, setActive] = useState(0);
  const scrollRef = useRef(null);

  const { data: liveVideos = [] } = useQuery({
    queryKey: ['live-clip-videos'],
    queryFn: () => base44.entities.LiveClipVideo.filter({ is_active: true }, 'sort_order', 20),
  });

  const dbClips = liveVideos.map(v => ({ ...v, _isTruckCard: false }));
  const truckClips = trucks.map(t => ({ ...t, _isTruckCard: true, video_url: null }));
  const clips = dbClips.length > 0 ? dbClips : truckClips;

  if (clips.length === 0) return null;

  const goTo = (i) => {
    setActive(i);
    // scroll the card into view
    const container = scrollRef.current;
    if (!container) return;
    const cardW = container.offsetWidth;
    container.scrollTo({ left: i * (cardW + 12), behavior: 'smooth' });
  };

  return (
    <div>
      {/* Horizontal card carousel */}
      <div ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory"
        style={{ paddingLeft: '20px', paddingRight: '20px', scrollPaddingLeft: '20px' }}
        onScroll={e => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / (el.offsetWidth + 12));
          if (i !== active) setActive(i);
        }}>
        {clips.map((clip, i) => (
          <div key={clip.id} className="flex-shrink-0 snap-center" style={{ width: clips.length === 1 ? 'calc(100%)' : 'calc(100% - 48px)' }}>
            <LiveCard clip={clip} isActive={i === active} isTruckCard={clip._isTruckCard} />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {clips.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {clips.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === active ? 20 : 6,
                height: 6,
                background: i === active ? '#00F5D4' : 'rgba(255,255,255,0.15)',
              }} />
          ))}
        </div>
      )}
    </div>
  );
}