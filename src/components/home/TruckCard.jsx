import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin } from 'lucide-react';

export default function TruckCard({ truck, rank }) {
  // Simulated distance — replace with real geo calc when location API is wired
  const distance = truck.latitude
    ? `${(Math.abs(truck.latitude - 29.76) * 69 + Math.random() * 0.8).toFixed(1)} mi`
    : `${(Math.random() * 3 + 0.3).toFixed(1)} mi`;

  return (
    <Link to={`/truck/${truck.id}`} className="block group">
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{
          background: '#192123',
          boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.55)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.35)'; }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: '210px' }}>
          <img
            src={truck.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=600'}
            alt={truck.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 45%, rgba(13,21,23,0.96) 100%)' }}
          />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              {truck.status === 'open' && (
                <span
                  className="text-[10px] font-black px-2.5 py-1 rounded-full self-start"
                  style={{ background: 'rgba(119,255,200,0.18)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.4)', backdropFilter: 'blur(8px)' }}
                >
                  ● OPEN NOW
                </span>
              )}
              {truck.is_live && (
                <span
                  className="text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 self-start"
                  style={{ background: 'rgba(255,59,48,0.88)', color: 'white', backdropFilter: 'blur(8px)', boxShadow: '0 0 10px rgba(255,59,48,0.5)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            {rank <= 3 && (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-heading font-black text-sm flex-shrink-0"
                style={{
                  background: rank === 1 ? 'linear-gradient(135deg,#FFD700,#FFA500)' : rank === 2 ? 'rgba(200,200,200,0.9)' : 'rgba(205,127,50,0.9)',
                  color: '#0d1517',
                  boxShadow: rank === 1 ? '0 0 14px rgba(255,215,0,0.55)' : 'none',
                }}
              >
                #{rank}
              </div>
            )}
          </div>

          {/* Bottom overlay text */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(253,89,30,0.2)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.35)' }}
              >
                🔥 TRENDING
              </span>
              <span className="text-[9px] font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {truck.cuisine_type?.replace('_', ' ')?.toUpperCase()}
              </span>
            </div>
            <p className="font-heading font-black text-xl text-white leading-tight" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}>
              {truck.name}
            </p>
            {/* Tagline */}
            {truck.description && (
              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {truck.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-black font-heading" style={{ color: '#dff0e8' }}>{truck.rating?.toFixed(1) || '4.8'}</span>
              <span className="text-[10px]" style={{ color: 'rgba(186,203,192,0.45)' }}>({truck.review_count || 500}+)</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" style={{ color: '#bacbc0' }} />
              <span className="text-[11px]" style={{ color: '#bacbc0' }}>15–20 min</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" style={{ color: '#bacbc0' }} />
              <span className="text-[11px]" style={{ color: '#bacbc0' }}>{distance}</span>
            </div>
          </div>
          {/* Sleek compact CTA */}
          <div
            className="px-3 py-1.5 rounded-full text-[11px] font-black"
            style={{
              background: 'linear-gradient(135deg, #77ffc8 0%, #00e6a7 100%)',
              color: '#003826',
              boxShadow: '0 0 10px rgba(119,255,200,0.28)',
            }}
          >
            Order →
          </div>
        </div>
      </div>
    </Link>
  );
}