import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HomeHeader from '../components/home/HomeHeader';
import CategoryPills from '../components/home/CategoryPills';
import LiveNowSection from '../components/home/LiveNowSection';
import TrendingSection from '../components/home/TrendingSection';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: trucks = [], isLoading } = useQuery({
    queryKey: ['trucks'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }),
  });

  const filteredTrucks = activeCategory === 'all'
    ? trucks
    : trucks.filter(t => t.cuisine_type === activeCategory);

  return (
    <div className="pb-4">
      <HomeHeader />
      <CategoryPills active={activeCategory} onSelect={setActiveCategory} />
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <LiveNowSection trucks={trucks} />
          <TrendingSection trucks={filteredTrucks} />
        </>
      )}
    </div>
  );
}