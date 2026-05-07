import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Star, Truck, Music, Dog, Baby, Wine, ChevronRight } from 'lucide-react';
import { useUserLocation, distanceMiles, formatDist } from '@/lib/geoUtils';

const AMENITY_FILTERS = [
  { id: 'all', label: 'All Parks' },
  { id: 'live music', label: '🎵 Live Music' },
  { id: 'family friendly', label: '👨‍👩‍👧 Family' },
  { id: 'dog friendly', label: '🐕 Dog Friendly' },
  { id: 'alcohol', label: '🍺 Bar' },
  { id: 'covered seating', label: '⛱️ Covered' },
];

function ParkCard({ park, featured = false }) {
  const { lat, lng } = useUserLocation();
  const dist = lat && park.latitude ? formatDist(distanceMiles(lat, lng, park.latitude, park.longitude)) : null;

  if (featured) {
    return (
      <Link to={`/parks/${park.slug}`} className="block flex-shrink-0 w-72 rounded-3xl overflow-hidden active:scale-[0.98] transition-transform"
        style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.25)' }}>
        <div className="relative" style={{ height: '180px' }}>
          <img src={park.hero_image_url || 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600'}
            alt={park.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.85) 100%)' }} />
          {park.is_featured && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black"
              style={{ background: 'rgba(0,245,212,0.9)', color: '#0A0A0A' }}>⭐ FEATURED</div>
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="font-heading font-black text-white text-lg leading-tight">{park.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3 h-3 text-white/60" />
              <span className="text-xs text-white/70">{park.address?.split(',')[0]}</span>
              {dist && <span className="text-xs text-white/50">· {dist}</span>}
            </div>
          </div>
        </div>
        <div className="p-3.5">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" style={{ color: '#00F5D4' }} />
              <span className="text-xs font-bold" style={{ color: '#dff0e8' }}>{park.total_trucks || 0} trucks</span>
            </div>
            {park.avg_rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-bold" style={{ color: '#dff0e8' }}>{park.avg_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          {park.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {park.amenities.slice(0, 3).map(a => (
                <span key={a} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(0,245,212,0.08)', color: '#00F5D4', border: '1px solid rgba(0,245,212,0.15)' }}>
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/parks/${park.slug}`} className="flex gap-3 p-3.5 rounded-2xl active:scale-[0.99] transition-transform"
      style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
      <img src={park.hero_image_url || 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300'}
        alt={park.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>{park.name}</p>
          {park.avg_rating && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold" style={{ color: '#dff0e8' }}>{park.avg_rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5 mb-1.5">
          <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: '#bacbc0' }} />
          <span className="text-xs truncate" style={{ color: '#bacbc0' }}>{park.address?.split(',')[0]}</span>
          {dist && <span className="text-xs flex-shrink-0" style={{ color: '#6B665C' }}>· {dist}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold" style={{ color: '#00F5D4' }}>{park.total_trucks || 0} trucks</span>
          {park.amenities?.slice(0, 2).map(a => (
            <span key={a} className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(0,245,212,0.07)', color: '#00F5D4' }}>{a}</span>
          ))}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 self-center flex-shrink-0" style={{ color: '#6B665C' }} />
    </Link>
  );
}

export default function Parks() {
  const [filter, setFilter] = useState('all');

  const { data: parks = [], isLoading } = useQuery({
    queryKey: ['truck-parks'],
    queryFn: () => base44.entities.TruckPark.filter({ is_active: true }, '-featured_order', 50),
  });

  const featured = parks.filter(p => p.is_featured).sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0));
  const rest = parks.filter(p => !p.is_featured);

  const filtered = useMemo(() => {
    if (filter === 'all') return rest;
    return rest.filter(p => p.amenities?.some(a => a.toLowerCase().includes(filter.toLowerCase())));
  }, [rest, filter]);

  return (
    <div className="min-h-screen pb-28" style={{ background: '#0A0A0A' }}>
      {/* Hero Header */}
      <div className="px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-5"
        style={{ background: 'linear-gradient(180deg,#0d1a0f 0%,#0A0A0A 100%)' }}>
        <p className="font-heading font-black text-2xl" style={{ color: '#F5F0E8' }}>
          Houston's Best <span style={{ color: '#00F5D4' }}>Truck Parks</span> 🏛️
        </p>
        <p className="text-sm mt-1" style={{ color: '#A39E94' }}>
          Where the trucks gather. Where the magic happens.
        </p>
      </div>

      {/* Featured Parks Carousel */}
      {featured.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="font-heading font-black text-sm" style={{ color: '#00F5D4' }}>⭐ FEATURED PARKS</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
            {featured.map(p => <ParkCard key={p.id} park={p} featured />)}
          </div>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 mb-5 pb-1">
        {AMENITY_FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all"
            style={filter === f.id
              ? { background: 'linear-gradient(135deg,#00F5D4,#00e6a7)', color: '#0A0A0A' }
              : { background: '#141414', color: '#A39E94', border: '1px solid rgba(255,255,255,0.06)' }
            }>
            {f.label}
          </button>
        ))}
      </div>

      {/* All Parks */}
      <div className="px-4">
        <p className="text-xs font-bold mb-3" style={{ color: '#6B665C' }}>
          {filtered.length} {filter === 'all' ? 'parks' : 'parks with this vibe'}
        </p>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#141414' }} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(p => <ParkCard key={p.id} park={p} />)}
          </div>
        )}

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🏛️</p>
            <p className="font-heading font-bold" style={{ color: '#dff0e8' }}>No parks match this filter</p>
            <button onClick={() => setFilter('all')} className="mt-3 text-sm font-semibold" style={{ color: '#00F5D4' }}>
              Show all parks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}