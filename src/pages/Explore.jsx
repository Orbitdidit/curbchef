import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, Clock, Zap, Radio } from 'lucide-react';
import { useUserLocation, distanceMiles, formatDist } from '@/lib/geoUtils';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'live', label: '🔴 Live' },
  { id: 'open', label: '🟢 Open Now' },
  { id: 'near', label: '📍 Near Me' },
  { id: 'tacos', label: '🌮 Tacos' },
  { id: 'bbq', label: '🔥 BBQ' },
  { id: 'burgers', label: '🍔 Burgers' },
  { id: 'seafood', label: '🦐 Seafood' },
  { id: 'vegan', label: '🌱 Vegan' },
];

function TruckRow({ truck }) {
  const { lat, lng } = useUserLocation();
  const dist = lat && truck.latitude ? formatDist(distanceMiles(lat, lng, truck.latitude, truck.longitude)) : null;

  return (
    <Link to={`/truck/${truck.id}`} className="flex items-center gap-3 p-3 rounded-2xl active:opacity-80 transition-opacity"
      style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.15)' }}>
      <div className="relative flex-shrink-0">
        <img
          src={truck.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=200'}
          alt={truck.name}
          className="w-16 h-16 rounded-xl object-cover"
        />
        {truck.is_live && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: '#ff3b30' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="font-heading font-bold text-sm truncate" style={{ color: '#dff0e8' }}>{truck.name}</p>
          {truck.status === 'open' && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(119,255,200,0.15)', color: '#77ffc8' }}>OPEN</span>
          )}
        </div>
        <p className="text-xs capitalize mb-1" style={{ color: '#bacbc0' }}>{truck.cuisine_type?.replace('_', ' ')}</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold" style={{ color: '#dff0e8' }}>{truck.rating?.toFixed(1) || '4.8'}</span>
          </div>
          {dist && (
            <div className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3" style={{ color: '#bacbc0' }} />
              <span className="text-xs" style={{ color: '#bacbc0' }}>{dist}</span>
            </div>
          )}
          <div className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" style={{ color: '#bacbc0' }} />
            <span className="text-xs" style={{ color: '#bacbc0' }}>15–20 min</span>
          </div>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}>
        <span className="text-xs font-black" style={{ color: '#003826' }}>→</span>
      </div>
    </Link>
  );
}

function SectionHeader({ title, emoji }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span>{emoji}</span>
      <h2 className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>{title}</h2>
    </div>
  );
}

export default function Explore() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const { lat, lng } = useUserLocation();

  const { data: trucks = [], isLoading } = useQuery({
    queryKey: ['trucks-explore'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }),
  });

  const filtered = useMemo(() => {
    let result = trucks;
    if (query) result = result.filter(t =>
      t.name?.toLowerCase().includes(query.toLowerCase()) ||
      t.cuisine_type?.toLowerCase().includes(query.toLowerCase())
    );
    if (filter === 'live') result = result.filter(t => t.is_live);
    else if (filter === 'open') result = result.filter(t => t.status === 'open');
    else if (filter === 'near') result = lat
      ? [...result].sort((a, b) => distanceMiles(lat, lng, a.latitude, a.longitude) - distanceMiles(lat, lng, b.latitude, b.longitude))
      : result;
    else if (filter !== 'all') result = result.filter(t => t.cuisine_type === filter);
    return result;
  }, [trucks, query, filter, lat, lng]);

  const liveTrucks = trucks.filter(t => t.is_live);
  const topRated = [...trucks].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
  const nearby = lat ? [...trucks].sort((a, b) =>
    distanceMiles(lat, lng, a.latitude || 0, a.longitude || 0) -
    distanceMiles(lat, lng, b.latitude || 0, b.longitude || 0)
  ).slice(0, 6) : trucks.slice(0, 6);
  const newTrucks = [...trucks].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 6);

  const isSearching = query || filter !== 'all';

  return (
    <div className="min-h-screen pb-32" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3 sticky top-0 z-20"
        style={{ background: 'rgba(13,21,23,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.12)' }}>
        <h1 className="font-heading font-black text-xl mb-3" style={{ color: '#dff0e8' }}>Explore</h1>

        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl mb-3"
          style={{ background: '#080f11', border: '1px solid rgba(59,74,66,0.25)' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#bacbc0' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tacos, brisket, ramen..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#dff0e8' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-xs" style={{ color: '#bacbc0' }}>✕</button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all"
              style={filter === f.id
                ? { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }
                : { background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.25)' }
              }>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: '#192123' }} />)}
          </div>
        ) : isSearching ? (
          /* Search / Filter results */
          <div>
            <p className="text-xs mb-3" style={{ color: '#bacbc0' }}>{filtered.length} results</p>
            <div className="flex flex-col gap-3">
              {filtered.map(t => <TruckRow key={t.id} truck={t} />)}
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-heading font-bold" style={{ color: '#dff0e8' }}>No trucks found</p>
                  <p className="text-sm mt-1" style={{ color: '#bacbc0' }}>Try a different search</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Discovery sections */
          <div className="flex flex-col gap-8">
            {liveTrucks.length > 0 && (
              <div>
                <SectionHeader title="Live Right Now" emoji="🔴" />
                <div className="flex flex-col gap-3">
                  {liveTrucks.map(t => <TruckRow key={t.id} truck={t} />)}
                </div>
              </div>
            )}

            <div>
              <SectionHeader title="Trending" emoji="🔥" />
              <div className="flex flex-col gap-3">
                {trucks.slice(0, 5).map(t => <TruckRow key={t.id} truck={t} />)}
              </div>
            </div>

            <div>
              <SectionHeader title="Near Me" emoji="📍" />
              <div className="flex flex-col gap-3">
                {nearby.map(t => <TruckRow key={t.id} truck={t} />)}
              </div>
            </div>

            <div>
              <SectionHeader title="Top Rated" emoji="⭐" />
              <div className="flex flex-col gap-3">
                {topRated.map(t => <TruckRow key={t.id} truck={t} />)}
              </div>
            </div>

            <div>
              <SectionHeader title="New on CurbChef" emoji="✨" />
              <div className="flex flex-col gap-3">
                {newTrucks.map(t => <TruckRow key={t.id} truck={t} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}