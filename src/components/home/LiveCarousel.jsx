import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

function VideoCard({ clip, isActive }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isActive]);

  return (
    <Link to="/live" className="block relative overflow-hidden rounded-3xl" style={{ height: '68vw', maxHeight: '340px' }}>
      {clip.video_url ? (
        <video
          ref={videoRef}
          src={clip.video_url}
          poster={clip.poster_url || undefined}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
          autoPlay={isActive}
        />
      ) : (
        <img
          src={clip.image_url || clip.poster_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800'}
          alt={clip.title || clip.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Cinematic gradient */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,21,23,0.15) 0%, rgba(13,21,23,0.1) 40%, rgba(13,21,23,0.92) 100%)' }} />

      {/* LIVE badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,59,48,0.92)', backdropFilter: 'blur(8px)', boxShadow: '0 0 16px rgba(255,59,48,0.6)' }}>
          <span className="w-2 h-2 rounded-full bg-white" style={{ animation: 'pulse 1s infinite' }} />
          <span className="text-white text-[11px] font-black tracking-widest">LIVE</span>
        </div>
        <div className="px-2.5 py-1.5 rounded-full text-[10px] font-bold"
          style={{ background: 'rgba(13,21,23,0.7)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.8)' }}>
          🔥 NOW COOKING
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="font-heading font-black text-2xl text-white leading-tight mb-1"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
          {clip.truck_name || clip.name || 'Live Truck'}
        </p>
        <p className="text-white/70 text-sm font-medium mb-3">
          {clip.title || clip.live_description || '🔥 Watch live'}
        </p>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold w-fit"
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
          👁 Tap to watch live
        </div>
      </div>
    </Link>
  );
}

export default function LiveCarousel({ trucks }) {
  const [active, setActive] = useState(0);

  const { data: liveVideos = [] } = useQuery({
    queryKey: ['live-clip-videos'],
    queryFn: () => base44.entities.LiveClipVideo.filter({ is_active: true }, 'sort_order', 20),
  });

  // Use DB videos if no live trucks; otherwise use live trucks
  const clips = trucks.length > 0
    ? trucks.map(t => ({ ...t, video_url: null }))
    : liveVideos;

  if (clips.length === 0) return null;

  return (
    <div className="relative">
      <div className="px-5">
        {clips.map((clip, i) => (
          <div key={clip.id} className={i !== active ? 'hidden' : ''}>
            <VideoCard clip={clip} isActive={i === active} />
          </div>
        ))}
      </div>

      {/* Thumbnail strip */}
      {clips.length > 1 && (
        <div className="flex gap-2 px-5 mt-3 overflow-x-auto no-scrollbar">
          {clips.map((clip, i) => (
            <button
              key={clip.id}
              onClick={() => setActive(i)}
              className="flex-shrink-0 relative overflow-hidden rounded-xl transition-all duration-200"
              style={{
                width: 64, height: 64,
                outline: i === active ? '2px solid #ff3b30' : '2px solid transparent',
                outlineOffset: '2px',
                opacity: i === active ? 1 : 0.5,
              }}
            >
              {clip.poster_url || clip.image_url ? (
                <img src={clip.poster_url || clip.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl"
                  style={{ background: '#192123' }}>🎬</div>
              )}
              {i === active && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" style={{ boxShadow: '0 0 6px #ff3b30' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}