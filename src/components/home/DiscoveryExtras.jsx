import React from 'react';
import MidVideoBlock from '@/components/home/MidVideoBlock';
import CookinSection from '@/components/home/CookinSection';
import PromoCard from '@/components/home/PromoCard';
import ExperiencesTeaser from '@/components/home/ExperiencesTeaser';
import ActivityFeed from '@/components/home/ActivityFeed';

/**
 * DiscoveryExtras — the brand/story sections at the bottom of the feed.
 * These used to sit inside a collapsed <details> accordion, where nobody
 * would ever open them. They render inline now as part of the main scroll.
 */
export default function DiscoveryExtras({ trucks }) {
  return (
    <div className="mt-7 space-y-8">
      <MidVideoBlock />
      <CookinSection />
      <div className="flex flex-col gap-3">
        <PromoCard variant={0} />
        <PromoCard variant={1} />
      </div>
      <ExperiencesTeaser />
      <section className="cc-paper py-6" aria-label="What's happening">
        <ActivityFeed trucks={trucks} />
      </section>
    </div>
  );
}
