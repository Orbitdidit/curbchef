import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

// Layout / nav
import HomeHeader from '@/components/home/HomeHeader';

// Hero & banners
import LiveHeroBanner from '@/components/home/LiveHeroBanner';
import HeroStrip from '@/components/home/HeroStrip';
import CookinSection from '@/components/home/CookinSection';
import MidVideoBlock from '@/components/home/MidVideoBlock';

// User personalization
import DailyPulse from '@/components/home/DailyPulse';
import FoodMoodRail from '@/components/home/FoodMoodRail';
import QuickReorder from '@/components/home/QuickReorder';
import FollowedTrucksRail from '@/components/home/FollowedTrucksRail';

// Truck sections
import LiveNowSection from '@/components/home/LiveNowSection';
import TrendingSection from '@/components/home/TrendingSection';
import CarouselSection from '@/components/home/CarouselSection';
import CategoryRow from '@/components/home/CategoryRow';

// Deals & drops
import DropsNearYou from '@/components/home/DropsNearYou';
import FiveDollarSpecials from '@/components/home/FiveDollarSpecials';

// Promo cards
import PromoCard from '@/components/home/PromoCard';

// Activity
import ActivityFeed from '@/components/home/ActivityFeed';

// Live carousel
import LiveCarousel from '@/components/home/LiveCarousel';

// Refer a friend banner
function ReferBanner({ user }) {
  if (!user) return null;
  const referralCode = user.referral_code || user.email?.split('@')[0]?.toUpperCase() + '5';
  return (
    <div className="mx-5 mt-6">
      <div className="rounded-2xl px-4 py-4 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(10,20,15,0.97) 0%, rgba(6,26,16,0.95) 100%)', border: '1px solid rgba(119,255,200,0.22)', boxShadow: '0 0 28px rgba(119,255,200,0.08)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(119,255,200,0.1)', border: '1px solid rgba(119,255,200,0.2)' }}>
          💸
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black tracking-widest mb-0.5" style={{ color: '#77ffc8' }}>REFER A FRIEND</p>
          <p className="font-heading font-black text-sm leading-snug" style={{ color: '#dff0e8' }}>Get $5 for every friend you bring</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(186,203,192,0.65)' }}>They order, you earn 500 pts instantly</p>
        </div>
        <Link to="/profile">
          <div className="px-3 py-1.5 rounded-full text-[11px] font-black flex-shrink-0 whitespace-nowrap"
            style={{ background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.3)' }}>
            Share →
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

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
  const trendingTrucks = filteredTrucks.slice(0, 8);

  return (
    <div className="min-h-screen pb-28" style={{ background: '#0A0A0A' }}>
      {/* Sticky header */}
      <HomeHeader />

      {/* Daily pulse — greeting, streak, points, vibe picker */}
      <DailyPulse user={user} trucks={visibleTrucks} />

      {/* Quick action mood rail */}
      <FoodMoodRail />

      {/* Live hero banner — auto-rotating food photos */}
      <LiveHeroBanner liveTrucks={liveTrucks} openTrucks={openTrucks} />

      {/* Stats strip — live count, open count, trending */}
      <HeroStrip liveTrucks={liveTrucks} openTrucks={openTrucks} trucks={visibleTrucks} />

      {/* Live carousel / featured video clips */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-heading font-bold text-base" style={{ color: '#F5F0E8', letterSpacing: '-0.02em' }}>🔴 Live & Featured</h2>
          <Link to="/live" className="text-xs font-semibold" style={{ color: '#00F5D4' }}>Watch all →</Link>
        </div>
        <LiveCarousel trucks={liveTrucks} />
      </div>

      {/* Followed trucks rail */}
      <FollowedTrucksRail user={user} trucks={visibleTrucks} />

      {/* Quick reorder */}
      <QuickReorder user={user} />

      {/* CurbDrops Near You */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-heading font-bold text-base" style={{ color: '#F5F0E8', letterSpacing: '-0.02em' }}>⚡ CurbDrops Near You</h2>
          <Link to="/deals" className="text-xs font-semibold" style={{ color: '#00F5D4' }}>See all →</Link>
        </div>
        <DropsNearYou />
      </div>

      {/* Refer a Friend banner */}
      <ReferBanner user={user} />

      {/* Category filter pills */}
      <div className="mt-6 mb-2">
        <CategoryRow selected={selectedCategory} onChange={setSelectedCategory} />
      </div>

      {/* Live now strip */}
      <LiveNowSection trucks={liveTrucks} />

      {/* Open now carousel */}
      {openTrucks.length > 0 && (
        <CarouselSection
          title="Open Now"
          emoji="🟢"
          trucks={openTrucks}
          seeAllHref="/explore"
        />
      )}

      {/* $5 Specials */}
      <FiveDollarSpecials trucks={visibleTrucks} />

      {/* Promo card — Rewards */}
      <div className="mt-6">
        <PromoCard variant={0} />
      </div>

      {/* Trending */}
      {trendingTrucks.length > 0 && (
        <TrendingSection trucks={trendingTrucks} />
      )}

      {/* Cookin' section — animated brand card */}
      <CookinSection />

      {/* Mid video brand block */}
      <MidVideoBlock />

      {/* Promo card — Vendors */}
      <div className="mt-6 mb-2">
        <PromoCard variant={1} />
      </div>

      {/* Activity feed — what's happening */}
      <ActivityFeed trucks={visibleTrucks} />

      {/* Bottom spacer */}
      <div className="h-8" />
    </div>
  );
}