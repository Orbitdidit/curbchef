import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Radio } from 'lucide-react';
import DiscoveryFeature from '@/components/home/DiscoveryFeature';
import CarouselSection from '@/components/home/CarouselSection';
import LiveCarousel from '@/components/home/LiveCarousel';
import QuickReorder from '@/components/home/QuickReorder';
import FollowedTrucksRail from '@/components/home/FollowedTrucksRail';
import CurbDropsBand from '@/components/home/CurbDropsBand';
import FiveDollarSpecials from '@/components/home/FiveDollarSpecials';
import FoodMoodRail from '@/components/home/FoodMoodRail';
import AssistantHomeCard from '@/components/assistant/AssistantHomeCard';
import HomeRewardsStrip from '@/components/home/HomeRewardsStrip';
import TruckParksRail from '@/components/home/TruckParksRail';
import DiscoveryExtras from '@/components/home/DiscoveryExtras';

export default function DiscoveryFeed({ user, trucks, filteredTrucks, liveTrucks }) {
  return (
    <>
      <DiscoveryFeature trucks={filteredTrucks} />
      <section className="cc-paper rounded-[2rem] mt-7 pt-2 pb-7" aria-label="Find your next meal">
        {filteredTrucks.length ? <CarouselSection title="Find your next bite" trucks={filteredTrucks.slice(0, 10)} seeAllHref="/explore" /> : <div className="px-5 py-6"><h2 className="font-heading font-bold text-xl">Nothing on this menu yet.</h2><p className="text-sm mt-2 text-discovery-subtle">Try another cuisine or explore all trucks.</p><Link to="/explore" className="inline-flex items-center min-h-11 gap-2 text-sm font-bold text-discovery-rust mt-2">Explore trucks <ArrowUpRight className="w-4 h-4" /></Link></div>}
        <QuickReorder user={user} />
      </section>
      <section className="py-7" aria-label="Live and featured clips">
        <div className="flex items-center justify-between px-5 mb-4"><div><p className="text-[10px] font-mono text-discovery-amber uppercase tracking-widest mb-1">Behind the window</p><h2 className="font-heading text-xl font-extrabold tracking-tight flex gap-2 items-center"><Radio className="w-4 h-4 text-discovery-orange" />Live & featured</h2></div><Link to="/live" className="text-xs font-bold text-discovery-muted min-h-11 flex items-center gap-1">Watch all <ArrowUpRight className="w-4 h-4" /></Link></div>
        <LiveCarousel trucks={liveTrucks} />
      </section>
      <CurbDropsBand />
      <FiveDollarSpecials trucks={trucks} />
      <FoodMoodRail />
      <FollowedTrucksRail user={user} trucks={trucks} />
      <div className="px-4 my-7"><AssistantHomeCard /></div>
      <HomeRewardsStrip user={user} />
      <TruckParksRail discovery />
      <DiscoveryExtras trucks={trucks} />
    </>
  );
}