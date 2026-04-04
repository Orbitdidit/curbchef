import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Bell, Search, Radio, Flame } from 'lucide-react';
import TruckCard from '../components/home/TruckCard';

const CATEGORIES = [
  { id: 'all', label: 'All Eats', emoji: '🔥' },
  { id: 'tacos', label: 'Tacos', emoji: '🌮' },
  { id: 'burgers', label: 'Burgers', emoji: '🍔' },
  { id: 'bbq', label: 'BBQ', emoji: '🍖' },
  { id: 'seafood', label: 'Seafood', emoji: '🦐' },
  { id: 'asian', label: 'Asian', emoji: '🍜' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'desserts', label: 'Sweets', emoji: '🍩' },
  { id: 'vegan', label: 'Vegan', emoji: '🥗' },
];

export default function Home() {
  const [category, setCategory] = useState('all');

  const { data: trucks = [], isLoading } = useQuery({
    queryKey: ['trucks'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }),
  });

  const filtered = useMemo(() =>
    category === 'all' ? trucks : trucks.filter(t => t.cuisine_type === category),
    [trucks, category]
  );

  const liveTrucks = trucks.filter(t => t.is_live);

  return (
    <div className="min-h-screen dot-bg" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #77ffc8, #00e6a7)' }}
            >
              <Flame className="w-4 h-4" style={{ color: '#003826' }} />
            </div>
            <span className="font-heading font-black text-lg tracking-tight" style={{ color: '#77ffc8' }}>
              CurbChef
            </span>
            <div className="flex items-center gap-1 ml-1">
              <MapPin className="w-3 h-3" style={{ color: '#bacbc0' }} />
              <span className="text-xs" style={{ color: '#bacbc0' }}>Houston, TX</span>
            </div>
          </div>
          <Link to="/search">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: '#192123' }}
            >
              <Search className="w-4 h-4" style={{ color: '#bacbc0' }} />
            </div>
          </Link>
        </div>

        {/* Search bar */}
        <Link to="/search">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
            style={{ background: '#080f11', border: '1px solid rgba(59,74,66,0.2)' }}
          >
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#bacbc0' }} />
            <span className="text-sm" style={{ color: '#bacbc0' }}>Find food trucks, dishes...</span>
          </div>
        </Link>

        {/* Filter pills */}
        <div className="flex gap-2">
          <button
            className="px-4 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #77ffc8, #00e6a7)',
              color: '#003826',
              boxShadow: '0 0 12px rgba(119,255,200,0.3)',
            }}
          >
            Open Now
          </button>
          <button
            className="px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.3)' }}
          >
            Trending
          </button>
          <button
            className="px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.3)' }}
          >
            BBQ
          </button>
          <button
            className="px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.3)' }}
          >
            Tacos
          </button>
        </div>
      </div>

      {/* Category icons */}
      <div className="flex gap-5 px-5 py-3 overflow-x-auto no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all"
              style={{
                background: category === cat.id ? 'rgba(119,255,200,0.12)' : '#192123',
                border: category === cat.id ? '1px solid rgba(119,255,200,0.4)' : '1px solid transparent',
                boxShadow: category === cat.id ? '0 0 12px rgba(119,255,200,0.15)' : 'none',
              }}
            >
              {cat.emoji}
            </div>
            <span
              className="text-[10px] font-semibold whitespace-nowrap"
              style={{ color: category === cat.id ? '#77ffc8' : '#bacbc0' }}
            >
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      {/* Live Now */}
      {liveTrucks.length > 0 && (
        <div className="px-5 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="font-heading font-bold text-base" style={{ color: '#dff0e8' }}>Live Now</h2>
            </div>
            <Link to="/live" className="text-xs font-semibold" style={{ color: '#77ffc8' }}>See all</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {liveTrucks.map(truck => (
              <Link key={truck.id} to="/live" className="flex-shrink-0 w-36 group">
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <img
                    src={truck.image_url}
                    alt={truck.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div
                    className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black"
                    style={{ background: 'rgba(253,89,30,0.9)', color: 'white' }}
                  >
                    <Radio className="w-2.5 h-2.5" />
                    LIVE
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-white font-bold text-xs truncate">{truck.name}</p>
                    <p className="text-white/60 text-[10px] truncate">{truck.live_description}</p>
                    <div
                      className="mt-2 w-full py-1.5 rounded-full text-center text-[10px] font-bold"
                      style={{ background: 'linear-gradient(135deg, #77ffc8, #00e6a7)', color: '#003826' }}
                    >
                      Watch
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending Near You */}
      <div className="px-5 mt-6 pb-32">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-base" style={{ color: '#dff0e8' }}>Trending Near You</h2>
          <span className="text-xs" style={{ color: '#bacbc0' }}>Houston, TX</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 rounded-3xl animate-pulse" style={{ background: '#192123' }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(truck => <TruckCard key={truck.id} truck={truck} />)}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-2">🌮</p>
                <p className="text-sm" style={{ color: '#bacbc0' }}>No trucks in this category</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}