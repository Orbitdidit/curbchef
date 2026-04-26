import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HomeHeader from '@/components/home/HomeHeader';
import CategoryRow from '@/components/home/CategoryRow';
import LiveNowSection from '@/components/home/LiveNowSection';
import TrendingSection from '@/components/home/TrendingSection';
import CarouselSection from '@/components/home/CarouselSection';
import DropsNearYou from '@/components/home/DropsNearYou';
import LiveCarousel from '@/components/home/LiveCarousel';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: trucks = [] } = useQuery({
    queryKey: ['trucks-home'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }, '-rating', 50),
    refetchInterval: 60000,
  });

  const visibleTrucks = trucks.filter(t => !t.is_sample);

  const filteredTrucks = selectedCategory === 'all'
    ? visibleTrucks
    : visibleTrucks.filter(t => t.cuisine_type === selectedCategory);

  const openTrucks = filteredTrucks.filter(t => t.status === 'open');
  const liveTrucks = filteredTrucks.filter(t => t.is_live);
  const trendingTrucks = filteredTrucks.slice(0, 6);

  return (
    <div className="min-h-screen pb-28" style={{ background: '#0A0A0A' }}>
      <HomeHeader />

      {/* Category pills */}
      <div className="mb-4 mt-1">
        <CategoryRow selected={selectedCategory} onChange={setSelectedCategory} />
      </div>

      {/* Live carousel / clips */}
      <LiveCarousel />

      {/* Live now strip */}
      <LiveNowSection trucks={liveTrucks} />

      {/* Curb Drops */}
      <div className="mt-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-heading font-bold text-base" style={{ color: '#F5F0E8', letterSpacing: '-0.02em' }}>
            ⚡ CurbDrops Near You
          </h2>
        </div>
        <DropsNearYou />
      </div>

      {/* Open now carousel */}
      {openTrucks.length > 0 && (
        <CarouselSection
          title="Open Now"
          emoji="🟢"
          trucks={openTrucks}
          seeAllHref="/explore"
        />
      )}

      {/* Trending full list */}
      {trendingTrucks.length > 0 && (
        <TrendingSection trucks={trendingTrucks} />
      )}
    </div>
  );
}