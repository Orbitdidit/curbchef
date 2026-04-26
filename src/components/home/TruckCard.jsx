import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock } from 'lucide-react';
import { useUserLocation, distanceMiles, formatDist } from '@/lib/geoUtils';
import { useCloseCountdown } from '@/hooks/useCloseCountdown';
import VendorTrustBadge from '@/components/shared/VendorTrustBadge.jsx';

export default function TruckCard({ truck, rank }) {
  const { lat, lng } = useUserLocation();
  const distVal = (lat && truck.latitude) ? distanceMiles(lat, lng, truck.latitude, truck.longitude) : null;
  const distance = distVal != null ? formatDist(distVal) : '—';
  const { label: closeLabel, variant: closeVariant } = useCloseCountdown(truck);

  return (
    <Link to={`/truck/${truck.id}`} aria-label={`${truck.name} — ${truck.cuisine_type?.replace('_',' ')} · ${truck.status === 'open' ? 'Open now' : 'Closed'}`} className="block group">
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
        <div className="relative overflow-hidden" style={{ height: '200px' }}>
          <img
            src={truck.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=600'}
            alt={truck.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(10,10,10,0) 40%, rgba(10,10,10,0.97) 100%)' }}
          />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              {truck.status === 'open' && (
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full self-start font-mono"
                  style={{ background: 'rgba(0,245,212,0.15)', color: '#00F5D4', border: '1px solid rgba(0,245,212,0.3)', backdropFilter: 'blur(8px)' }}
                >
                  ● OPEN
                </span>
              )}
              {truck.is_live && (
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 self-start"
                  style={{ background: 'rgba(255,59,48,0.9)', color: 'white', backdropFilter: 'blur(8px)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            {rank && rank <= 3 && (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-heading font-black text-xs flex-shrink-0"
                style={{
                  background: rank === 1 ? '#FFD60A' : rank === 2 ? 'rgba(200,200,200,0.9)' : 'rgba(205,127,50,0.9)',
                  color: '#0A0A0A',
                }}
              >
                #{rank}
              </div>
            )}
          </div>

          {/* Bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full font-mono"
                style={{ background: 'rgba(255,59,48,0.2)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.3)' }}
              >
                {truck.cuisine_type?.replace('_', ' ')?.toUpperCase()}
              </span>
            </div>
            <p className="font-heading font-bold text-xl text-white leading-tight" style={{ letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>
              {truck.name}
            </p>
            {truck.description && (
              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'rgba(245,240,232,0.5)' }}>
                {truck.description}
              </p>
            )}
          </div>
        </div>

        {/* Trust badge row */}
        {truck.vendor_type && (
          <div className="px-4 pt-2">
            <VendorTrustBadge truck={truck} size="sm" />
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" style={{ fill: '#FFD60A', color: '#FFD60A' }} />
              <span className="text-xs font-bold font-mono" style={{ color: '#F5F0E8' }}>{truck.rating?.toFixed(1) || '4.8'}</span>
              <span className="text-[10px] font-mono" style={{ color: '#6B665C' }}>({truck.review_count || 500}+)</span>
            </div>
            <div className="flex items-center gap-1">
              {closeVariant === 'last_call' && (
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: '#FF3B30' }} />
              )}
              <span
                className="text-[11px] font-mono"
                style={{
                  color: closeVariant === 'last_call' ? '#FF3B30'
                    : closeVariant === 'soon' ? '#FF6B1A'
                    : '#6B665C'
                }}
              >
                {closeLabel || <><Clock className="w-3 h-3 inline mr-0.5" />15–20 min</>}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" style={{ color: '#6B665C' }} />
              <span className="text-[11px] font-mono" style={{ color: '#6B665C' }}>{distance}</span>
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-[11px] font-bold"
            style={{
              background: '#00F5D4',
              color: '#0A0A0A',
            }}
          >
            Order →
          </div>
        </div>
      </div>
    </Link>
  );
}