import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';

export default function TruckCard({ truck, rank }) {
  return (
    <Link to={`/truck/${truck.id}`} className="block group">
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{
          background: '#192123',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Image — taller, more cinematic */}
        <div className="relative overflow-hidden" style={{ height: '220px' }}>
          <img
            src={truck.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=600'}
            alt={truck.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Stronger cinematic gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 50%, rgba(13,21,23,0.97) 100%)',
            }}
          />

          {/* Top row badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              {truck.status === 'open' && (
                <span
                  className="text-[10px] font-black px-2.5 py-1 rounded-full self-start"
                  style={{
                    background: 'rgba(119,255,200,0.18)',
                    color: '#77ffc8',
                    border: '1px solid rgba(119,255,200,0.4)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  ● OPEN NOW
                </span>
              )}
              {truck.is_live && (
                <span
                  className="text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 self-start"
                  style={{
                    background: 'rgba(255,59,48,0.85)',
                    color: 'white',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 0 10px rgba(255,59,48,0.5)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              )}
            </div>

            {/* Trending rank badge */}
            {rank <= 3 && (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-heading font-black text-sm flex-shrink-0"
                style={{
                  background: rank === 1 ? 'linear-gradient(135deg,#FFD700,#FFA500)' : rank === 2 ? 'rgba(192,192,192,0.9)' : 'rgba(205,127,50,0.9)',
                  color: '#0d1517',
                  boxShadow: rank === 1 ? '0 0 12px rgba(255,215,0,0.5)' : 'none',
                }}
              >
                #{rank}
              </div>
            )}
          </div>

          {/* Bottom text overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
            {/* Trending badge */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(253,89,30,0.2)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.35)' }}
              >
                🔥 TRENDING
              </span>
              <span className="text-[9px] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {truck.cuisine_type?.replace('_', ' ')?.toUpperCase()} · {truck.city || 'HOUSTON'}
              </span>
            </div>

            <p
              className="font-heading font-black text-xl text-white leading-tight"
              style={{ textShadow: '0 2px 16px rgba(0,0,0,0.9)' }}
            >
              {truck.name}
            </p>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-black font-heading" style={{ color: '#dff0e8' }}>
                {truck.rating?.toFixed(1) || '4.8'}
              </span>
              <span className="text-xs" style={{ color: 'rgba(186,203,192,0.5)' }}>({truck.review_count || 500}+)</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" style={{ color: '#bacbc0' }} />
              <span className="text-xs font-semibold" style={{ color: '#bacbc0' }}>15–20 min</span>
            </div>
          </div>
          <div
            className="px-4 py-2 rounded-full text-xs font-black"
            style={{
              background: 'linear-gradient(135deg, #77ffc8 0%, #00e6a7 100%)',
              color: '#003826',
              boxShadow: '0 0 12px rgba(119,255,200,0.3)',
              fontSize: '11px',
            }}
          >
            Order Now →
          </div>
        </div>
      </div>
    </Link>
  );
}