import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, MapPin } from 'lucide-react';

function SmallTruckCard({ truck }) {
  const dist = truck.latitude
    ? `${(Math.random() * 3 + 0.3).toFixed(1)} mi`
    : '0.8 mi';

  return (
    <Link to={`/truck/${truck.id}`} className="flex-shrink-0 group" style={{ width: '160px' }}>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#192123',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)'; }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: '110px' }}>
          <img
            src={truck.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=400'}
            alt={truck.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(13,21,23,0.9) 100%)' }}
          />
          {truck.is_live && (
            <div
              className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,59,48,0.9)', backdropFilter: 'blur(6px)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[9px] font-black">LIVE</span>
            </div>
          )}
          {truck.status === 'open' && !truck.is_live && (
            <div
              className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black"
              style={{ background: 'rgba(119,255,200,0.2)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.4)', backdropFilter: 'blur(6px)' }}
            >
              OPEN
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-3 pt-2 pb-3">
          <p className="font-heading font-black text-sm leading-tight truncate" style={{ color: '#dff0e8' }}>{truck.name}</p>
          {truck.description && (
            <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'rgba(186,203,192,0.65)' }}>
              {truck.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold" style={{ color: '#dff0e8' }}>{truck.rating?.toFixed(1) || '4.8'}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" style={{ color: '#bacbc0' }} />
              <span className="text-[10px]" style={{ color: '#bacbc0' }}>{dist}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CarouselSection({ title, emoji, badge, trucks, seeAllHref = '/' }) {
  if (!trucks || trucks.length === 0) return null;

  return (
    <div className="mt-7">
      <div className="flex items-center justify-between px-5 mb-3">
        <div className="flex items-center gap-2">
          {badge === 'live' && (
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: '#ff3b30', boxShadow: '0 0 8px #ff3b30', animation: 'pulse 1.5s ease-in-out infinite' }}
            />
          )}
          <span className="text-base mr-0.5">{emoji}</span>
          <h2 className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>{title}</h2>
          {badge && badge !== 'live' && (
            <span
              className="text-[9px] font-black px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(253,89,30,0.15)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.3)' }}
            >
              {badge}
            </span>
          )}
        </div>
        <Link to={seeAllHref} className="flex items-center gap-0.5 text-xs font-bold" style={{ color: '#77ffc8' }}>
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar pb-1">
        {trucks.map(truck => <SmallTruckCard key={truck.id} truck={truck} />)}
      </div>
    </div>
  );
}