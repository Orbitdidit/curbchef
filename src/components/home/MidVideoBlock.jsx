import React from 'react';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';

const DEFAULTS = {
  video_url: 'https://assets.mixkit.co/videos/preview/mixkit-man-eating-in-a-food-truck-1231-large.mp4',
  poster_url: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800',
  headline: 'Real Food.\nReal Trucks.',
  subline: 'STREET FOOD CULTURE',
};

export default function MidVideoBlock() {
  const cfg = useHomepageConfig();
  const c = { ...DEFAULTS, ...cfg['mid_video'] };

  return (
    <div className="px-5 mt-8">
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{ height: '40vw', maxHeight: '200px', minHeight: '130px' }}
      >
        <video
          src={c.video_url}
          poster={c.poster_url}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(13,21,23,0.75) 0%, transparent 60%, rgba(13,21,23,0.6) 100%)' }}
        />
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <p className="text-[10px] font-black tracking-widest mb-1" style={{ color: '#77ffc8' }}>
            {c.subline}
          </p>
          <p className="font-heading font-black text-xl text-white leading-tight" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)', whiteSpace: 'pre-line' }}>
            {c.headline}
          </p>
        </div>
      </div>
    </div>
  );
}