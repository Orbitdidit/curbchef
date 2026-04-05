import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Search, Flame, ChevronRight } from 'lucide-react';
import TruckCard from '../components/home/TruckCard';
import LiveCarousel from '../components/home/LiveCarousel';
import HeroStrip from '../components/home/HeroStrip';
import CategoryRow from '../components/home/CategoryRow';

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
  const openTrucks = trucks.filter(t => t.status === 'open');

  return (
    <div className="min-h-screen" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div
        className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-20"
        style={{ background: 'rgba(13,21,23,0.92)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #77ffc8, #00e6a7)', boxShadow: '0 0 14px rgba(119,255,200,0.4)' }}
            >
              <Flame className="w-4 h-4" style={{ color: '#003826' }} />
            </div>
            <span className="font-heading font-black text-xl tracking-tight" style={{ color: '#77ffc8' }}>
              CurbChef
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" style={{ color: '#77ffc8' }} />
              <span className="text-xs font-semibold" style={{ color: '#bacbc0' }}>Houston, TX</span>
            </div>
            <Link to="/search">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}
              >
                <Search className="w-4 h-4" style={{ color: '#bacbc0' }} />
              </div>
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <Link to="/search">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: '#080f11', border: '1px solid rgba(59,74,66,0.25)' }}
          >
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#bacbc0' }} />
            <span className="text-sm" style={{ color: 'rgba(186,203,192,0.6)' }}>Tacos, brisket, ramen...</span>
          </div>
        </Link>
      </div>

      {/* Hero Stats Strip */}
      <HeroStrip liveTrucks={liveTrucks} openTrucks={openTrucks} trucks={trucks} />

      {/* LIVE NOW — Cinematic Carousel */}
      {liveTrucks.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between px-5 mb-3">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: '#ff3b30', boxShadow: '0 0 8px #ff3b30', animation: 'pulse 1.5s infinite' }}
              />
              <h2 className="font-heading font-black text-lg tracking-tight" style={{ color: '#dff0e8' }}>
                Live Now
              </h2>
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,59,48,0.15)', color: '#ff3b30', border: '1px solid rgba(255,59,48,0.3)' }}
              >
                {liveTrucks.length} STREAMING
              </span>
            </div>
            <Link to="/live" className="flex items-center gap-0.5 text-xs font-bold" style={{ color: '#77ffc8' }}>
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <LiveCarousel trucks={liveTrucks} />
        </div>
      )}

      {/* Category Row */}
      <div className="mt-6">
        <CategoryRow selected={category} onChange={setCategory} />
      </div>

      {/* Trending Near You */}
      <div className="px-5 mt-6 pb-32">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>Trending Near You</h2>
            <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>Houston, TX • Updated just now</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-3xl animate-pulse" style={{ background: '#192123' }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filtered.map((truck, index) => <TruckCard key={truck.id} truck={truck} rank={index + 1} />)}
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-5xl mb-3">🌮</p>
                <p className="font-heading font-bold text-base mb-1" style={{ color: '#dff0e8' }}>Nothing here yet</p>
                <p className="text-sm" style={{ color: '#bacbc0' }}>No trucks in this category</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}