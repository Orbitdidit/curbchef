import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, MapPin } from 'lucide-react';
import { useHomepageConfig } from '@/hooks/useHomepageConfig';

const DEFAULTS = {
  video_url: 'https://assets.mixkit.co/videos/preview/mixkit-preparing-a-barbecue-with-fire-1208-large.mp4',
  poster_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=900',
  headline: "Houston's Hottest\nStreet Food — Live",
  subline: 'Order from trucks cooking right now',
};

export default function HeroPromo() {
  const cfg = useHomepageConfig();
  const c = { ...DEFAULTS, ...cfg['hero_video'] };
  const videoRef = useRef(null);

  return (
    <div className="px-5 mt-4">
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{ height: '52vw', maxHeight: '260px', minHeight: '180px' }}
      >
        <video
          ref={videoRef}
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
          style={{
            background:
              'linear-gradient(135deg, rgba(13,21,23,0.7) 0%, rgba(13,21,23,0.3) 60%, transparent 100%), linear-gradient(0deg, rgba(13,21,23,0.85) 0%, transparent 50%)',
          }}
        />

        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3 self-start"
            style={{ background: 'rgba(119,255,200,0.15)', border: '1px solid rgba(119,255,200,0.35)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#77ffc8' }} />
            <span className="text-[10px] font-black tracking-widest" style={{ color: '#77ffc8' }}>CURBCHEF LIVE</span>
          </div>

          <h2
            className="font-heading font-black text-white leading-tight mb-1"
            style={{ fontSize: 'clamp(1.1rem, 5vw, 1.5rem)', textShadow: '0 2px 20px rgba(0,0,0,0.8)', whiteSpace: 'pre-line' }}
          >
            {c.headline}
          </h2>
          <p className="text-xs mb-4 font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {c.subline}
          </p>

          <div className="flex items-center gap-2">
            <Link to={c.cta_href || '/live'}>
              <div
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black"
                style={{ background: 'linear-gradient(135deg, #77ffc8, #00e6a7)', color: '#003826', boxShadow: '0 0 16px rgba(119,255,200,0.4)' }}
              >
                <Play className="w-3 h-3 fill-current" />
                {c.cta_label || 'Watch Live'}
              </div>
            </Link>
            <Link to="/map">
              <div
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <MapPin className="w-3 h-3" />
                Explore Nearby
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}