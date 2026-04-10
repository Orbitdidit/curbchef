import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import PullIndicator from '@/components/layout/PullIndicator';
import { MapPin, Search, Flame, ChevronRight } from 'lucide-react';
import TruckCard from '../components/home/TruckCard';
import DailyPulse from '../components/home/DailyPulse';
import FollowedTrucksRail from '../components/home/FollowedTrucksRail';
import QuickReorder from '../components/home/QuickReorder';
import FoodMoodRail from '../components/home/FoodMoodRail';
import ActivityFeed from '../components/home/ActivityFeed';
import LiveCarousel from '../components/home/LiveCarousel';
import HeroStrip from '../components/home/HeroStrip';
import CategoryRow from '../components/home/CategoryRow';
import HeroPromo from '../components/home/HeroPromo';
import PromoCard from '../components/home/PromoCard';
import MidVideoBlock from '../components/home/MidVideoBlock';
import CarouselSection from '../components/home/CarouselSection';
import CookinSection from '../components/home/CookinSection';
import AssistantHomeCard from '../components/assistant/AssistantHomeCard';

export default function Home() {
  const [category, setCategory] = useState('all');
  const [user, setUser] = React.useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const { data: trucks = [], isLoading } = useQuery({
    queryKey: ['trucks'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }),
  });

  const onRefresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['trucks'] }),
    [queryClient]
  );
  const { pulling, pullDist, refreshing } = usePullToRefresh({ onRefresh });

  const filtered = useMemo(() =>
    category === 'all' ? trucks : trucks.filter(t => t.cuisine_type === category),
    [trucks, category]
  );

  const liveTrucks = trucks.filter(t => t.is_live);
  const openTrucks = trucks.filter(t => t.status === 'open');
  const topRated = [...trucks].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
  const newTrucks = [...trucks].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 8);
  // Late night: simulate with is_live or just show first 8 for now
  const lateNight = trucks.filter(t => t.status === 'open').slice(0, 8);

  const firstName = user?.full_name?.split(' ')[0] || null;

  return (
    <div className="min-h-screen" style={{ background: '#0d1517' }}>
      <PullIndicator pullDist={pullDist} refreshing={refreshing} />

      {/* ── Sticky Header ── */}
      <div
        className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3 sticky top-0 z-20"
        style={{ background: 'rgba(13,21,23,0.93)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.12)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #77ffc8, #00e6a7)', boxShadow: '0 0 14px rgba(119,255,200,0.4)' }}
            >
              <Flame className="w-4 h-4" style={{ color: '#003826' }} />
            </div>
            <span className="font-heading font-black text-xl tracking-tight" style={{ color: '#77ffc8' }}>CurbChef</span>
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
      </div>

      {/* ── Daily Pulse (greeting, streak, points, vibe) ── */}
      <DailyPulse user={user} trucks={trucks} />

      {/* ── Quick Access Grid ── */}
      <FoodMoodRail />

      {/* ── Followed Trucks Rail ── */}
      <FollowedTrucksRail user={user} trucks={trucks} />

      {/* ── Quick Reorder ── */}
      <QuickReorder user={user} />

      {/* ── Activity Feed ── */}
      <ActivityFeed trucks={trucks} />

      {/* ── Hero Stats Strip ── */}
      <HeroStrip liveTrucks={liveTrucks} openTrucks={openTrucks} trucks={trucks} />

      {/* ── Hero Promo / Video ── */}
      <HeroPromo />

      {/* ── Assistant Card ── */}
      <div className="px-5 mt-6">
        <AssistantHomeCard />
      </div>

      {/* ── Live Now Carousel ── */}
      <div className="mt-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <div className="flex items-center gap-2">
            <span className="live-dot w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#ff3b30' }} />
            <h2 className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>Live Now</h2>
            {liveTrucks.length > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,59,48,0.15)', color: '#ff3b30', border: '1px solid rgba(255,59,48,0.3)' }}>
                {liveTrucks.length} STREAMING
              </span>
            )}
          </div>
          <Link to="/live" className="flex items-center gap-0.5 text-xs font-bold" style={{ color: '#77ffc8' }}>
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <LiveCarousel trucks={liveTrucks} />
      </div>

      {/* ── Promo Card #1 — Rewards ── */}
      <div className="mt-6">
        <PromoCard variant={0} />
      </div>

      {/* ── Trending Near You Carousel ── */}
      <CarouselSection
        title="Trending Near You"
        emoji="🔥"
        badge="HOT"
        trucks={trucks.slice(0, 8)}
        seeAllHref="/"
      />

      {/* ── Cookin' on CurbChef — Flame Ads ── */}
      <CookinSection />

      {/* ── Open Now Carousel ── */}
      <CarouselSection
        title="Open Now"
        emoji="🟢"
        trucks={openTrucks}
        seeAllHref="/"
      />

      {/* ── Mid-page Video Block ── */}
      <MidVideoBlock />

      {/* ── Top Rated Carousel ── */}
      <CarouselSection
        title="Top Rated"
        emoji="⭐"
        badge="BEST"
        trucks={topRated}
        seeAllHref="/"
      />

      {/* ── Promo Card #2 — Vendor ── */}
      <div className="mt-6">
        <PromoCard variant={1} />
      </div>

      {/* ── Onboard Truck CTA ── */}
      <div className="px-5 mt-6">
        <Link to="/onboard-truck">
          <div className="p-5 rounded-3xl flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg,rgba(253,89,30,0.12),rgba(253,89,30,0.06))', border: '1px solid rgba(253,89,30,0.25)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
              style={{ background: 'rgba(253,89,30,0.15)' }}>🚚</div>
            <div className="flex-1">
              <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>Own a Food Truck?</p>
              <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>Join CurbChef in 10 minutes. Free to list.</p>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: '#fd591e' }} />
          </div>
        </Link>
      </div>

      {/* ── Late Night Eats Carousel ── */}
      {lateNight.length > 0 && (
        <CarouselSection
          title="Late Night Eats"
          emoji="🌙"
          badge="OPEN LATE"
          trucks={lateNight}
          seeAllHref="/"
        />
      )}

      {/* ── New on CurbChef Carousel ── */}
      {newTrucks.length > 0 && (
        <CarouselSection
          title="New on CurbChef"
          emoji="✨"
          badge="NEW"
          trucks={newTrucks}
          seeAllHref="/"
        />
      )}

      {/* ── Category Filter Row ── */}
      <div className="mt-8">
        <div className="px-5 mb-3">
          <h2 className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>Browse by Category</h2>
        </div>
        <CategoryRow selected={category} onChange={setCategory} />
      </div>

      {/* ── Full Truck List (filtered) ── */}
      <div className="px-5 mt-6 pb-32">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>
              {category === 'all' ? 'All Trucks' : `${category.charAt(0).toUpperCase() + category.slice(1)} Trucks`}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>Houston, TX · Updated just now</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 rounded-3xl animate-pulse" style={{ background: '#192123' }} />
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