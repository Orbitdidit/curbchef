import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Heart } from 'lucide-react';

export default function TruckCard({ truck }) {
  return (
    <Link to={`/truck/${truck.id}`} className="block group">
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{ background: '#192123' }}
      >
        {/* Image */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={truck.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=600'}
            alt={truck.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {truck.status === 'open' && (
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(119,255,200,0.15)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.3)' }}
              >
                OPEN NOW
              </span>
            )}
            {truck.is_live && (
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                style={{ background: 'rgba(253,89,30,0.2)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.3)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                LIVE
              </span>
            )}
          </div>

          {/* Heart */}
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(13,21,23,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={e => e.preventDefault()}
          >
            <Heart className="w-4 h-4 text-white/70" />
          </button>

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="font-heading font-bold text-white text-base leading-tight">{truck.name}</p>
            <p className="text-white/60 text-xs mt-0.5">
              {truck.cuisine_type?.replace('_', ' ')} • {truck.city || 'Houston'}
            </p>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold font-heading" style={{ color: '#dff0e8' }}>
                {truck.rating?.toFixed(1) || '4.8'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" style={{ color: '#bacbc0' }} />
              <span className="text-xs" style={{ color: '#bacbc0' }}>15–20 min</span>
            </div>
          </div>
          <div
            className="btn-neon text-xs px-4 py-1.5 font-bold rounded-full"
            style={{
              background: 'linear-gradient(135deg, #77ffc8 0%, #00e6a7 100%)',
              color: '#003826',
              fontSize: '11px',
            }}
          >
            View Menu
          </div>
        </div>
      </div>
    </Link>
  );
}