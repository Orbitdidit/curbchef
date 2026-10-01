import React from 'react';
import { ChevronDown } from 'lucide-react';
import MidVideoBlock from '@/components/home/MidVideoBlock';
import CookinSection from '@/components/home/CookinSection';
import PromoCard from '@/components/home/PromoCard';
import ExperiencesTeaser from '@/components/home/ExperiencesTeaser';
import ActivityFeed from '@/components/home/ActivityFeed';

export default function DiscoveryExtras({ trucks }) {
  return (
    <details className="mx-4 my-7 rounded-2xl border border-discovery-line bg-discovery-surface">
      <summary className="p-5 flex items-center gap-4 cursor-pointer">
        <div className="flex-1"><h2 className="font-heading font-bold text-lg">More from the curb</h2><p className="text-xs text-discovery-muted mt-1">Stories, chef experiences & community</p></div>
        <ChevronDown className="cc-details-chevron w-5 h-5" />
      </summary>
      <div className="pb-6 space-y-7">
        <MidVideoBlock />
        <CookinSection />
        <PromoCard variant={0} />
        <PromoCard variant={1} />
        <ExperiencesTeaser />
        <div className="cc-paper py-5"><ActivityFeed trucks={trucks} /></div>
      </div>
    </details>
  );
}