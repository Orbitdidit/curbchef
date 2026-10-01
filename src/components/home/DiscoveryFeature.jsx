import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DiscoveryFeature({ trucks }) {
  const [index, setIndex] = useState(0);
  const candidates = trucks.slice(0, 5);
  if (!candidates.length) return null;
  const truck = candidates[index % candidates.length];
  return (
    <section className="mx-4 mt-5 overflow-hidden rounded-3xl border border-discovery-line bg-discovery-surface" aria-label="Featured trucks">
      <div className="relative h-60">
        <Link to={`/truck/${truck.id}`} aria-label={`View ${truck.name}`}>
          <img src={truck.image_url || truck.cover_image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=900&q=80'} alt={truck.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 cc-feature-image" />
          <span className="absolute top-4 left-4 bg-discovery-paper text-discovery-dark rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider">{truck.is_sample ? 'Demo truck' : truck.is_live ? 'Live now' : truck.status === 'open' ? 'Open now' : 'Featured truck'}</span>
          <div className="absolute bottom-4 left-5 right-5">
            <p className="text-discovery-amber uppercase text-[10px] tracking-widest font-mono mb-2">{truck.cuisine_type?.replace(/_/g, ' ')} / Houston</p>
            <h2 className="font-heading font-extrabold text-2xl leading-tight tracking-tight text-discovery-ink">{truck.name}</h2>
          </div>
        </Link>
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <Link to={`/truck/${truck.id}`} className="cc-action px-5 inline-flex items-center gap-3 text-sm">Explore menu <ArrowUpRight className="w-4 h-4" /></Link>
        {candidates.length > 1 && <div className="flex items-center gap-1">
          <button aria-label="Previous featured truck" onClick={() => setIndex(i => (i - 1 + candidates.length) % candidates.length)} className="w-11 h-11 rounded-full border border-discovery-line flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs text-discovery-muted tabular-nums px-1">{index % candidates.length + 1}/{candidates.length}</span>
          <button aria-label="Next featured truck" onClick={() => setIndex(i => (i + 1) % candidates.length)} className="w-11 h-11 rounded-full border border-discovery-line flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
        </div>}
      </div>
    </section>
  );
}