import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, MapPin } from 'lucide-react';
import { useUserLocation, distanceMiles, formatDist } from '@/lib/geoUtils';

function SmallTruckCard({ truck, userLat, userLng }) {
  const distVal = (userLat && truck.latitude) ? distanceMiles(userLat, userLng, truck.latitude, truck.longitude) : null;
  const dist = distVal != null ? formatDist(distVal) : null;

  const isHot = truck.status === 'open' && (truck.rating || 0) >= 4.5;

  return (
    <Link to={`/truck/${truck.id}`} className="flex-shrink-0 group" style={{ width: '160px' }}>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.04)',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
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
            style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(10,10,10,0.92) 100%)' }}
          />
          {/* Thermal badge */}
          <div className="absolute top-2 right-2">
            {truck.is_live ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono"
                style={{ background: 'rgba(255,59,48,0.9)', color: 'white' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
              </span>
            ) : isHot ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono"
                style={{ background: 'rgba(255,107,26,0.85)', color: 'white' }}>HOT</span>
            ) : truck.status === 'open' ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono"
                style={{ background: 'rgba(0,245,212,0.15)', color: '#00F5D4', border: '1px solid rgba(0,245,212,0.3)' }}>WARM</span>
            ) : null}
          </div>
        </div>

        {/* Info */}
        <div className="px-3 pt-2 pb-3">
          <p className="font-heading font-bold text-sm leading-tight truncate" style={{ color: '#F5F0E8', letterSpacing: '-0.01em' }}>{truck.name}</p>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3" style={{ fill: '#FFD60A', color: '#FFD60A' }} />
              <span className="text-[11px] font-bold font-mono" style={{ color: '#F5F0E8' }}>{truck.rating?.toFixed(1) || '4.8'}</span>
            </div>
            {dist && (
              <div className="flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5" style={{ color: '#6B665C' }} />
                <span className="text-[10px] font-mono" style={{ color: '#6B665C' }}>{dist}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CarouselSection({ title, emoji, badge, trucks, seeAllHref = '/' }) {
  const { lat: userLat, lng: userLng } = useUserLocation();
  if (!trucks || trucks.length === 0) return null;

  return (
    <div className="mt-6 mb-2">
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          {emoji && <span className="text-base">{emoji}</span>}
          <h2 className="font-heading font-bold text-base" style={{ color: '#F5F0E8', letterSpacing: '-0.02em' }}>{title}</h2>
          {badge && badge !== 'live' && (
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full font-mono"
              style={{ background: 'rgba(255,59,48,0.12)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.2)' }}
            >
              {badge}
            </span>
          )}
        </div>
        <Link to={seeAllHref} className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: '#00F5D4' }}>
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-1">
        {trucks.map(truck => <SmallTruckCard key={truck.id} truck={truck} userLat={userLat} userLng={userLng} />)}
      </div>
    </div>
  );
}