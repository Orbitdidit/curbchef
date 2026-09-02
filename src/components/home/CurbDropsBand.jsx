import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import CurbDropCard from '@/components/drops/CurbDropCard';

/** Splits ms into padded hr/min/sec parts for the countdown chips. */
function parts(ms) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  return {
    hr: String(Math.floor(s / 3600)).padStart(2, '0'),
    min: String(Math.floor((s % 3600) / 60)).padStart(2, '0'),
    sec: String(s % 60).padStart(2, '0'),
  };
}

function Chip({ value, unit }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg px-2.5 py-1.5"
      style={{ background: 'var(--cc-bg-0)', minWidth: '42px' }}>
      <span className="font-display text-lg leading-none" style={{ color: 'var(--cc-cream)' }}>{value}</span>
      <span className="cc-eyebrow" style={{ fontSize: '7px', color: 'var(--cc-ink-muted)' }}>{unit}</span>
    </div>
  );
}

/**
 * CurbDropsBand — the full-bleed warm section that breaks up the dark scroll.
 * This is the 30% accent block in the 50/30/20 rhythm.
 */
export default function CurbDropsBand() {
  const { data: drops = [] } = useQuery({
    queryKey: ['curb-drops-home'],
    queryFn: () => base44.entities.CurbDrop.filter({ is_active: true }, '-created_date', 10),
    refetchInterval: 30000,
  });

  const activeDrops = drops.filter(
    d => new Date(d.expires_at) > new Date() && d.current_claims < d.max_claims
  );

  // Countdown to whichever active drop expires first.
  const soonest = activeDrops.reduce(
    (min, d) => (!min || new Date(d.expires_at) < new Date(min.expires_at) ? d : min),
    null
  );
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!soonest) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [soonest]);

  if (activeDrops.length === 0) return null;

  const t = parts(new Date(soonest.expires_at).getTime() - now);

  return (
    <section className="mt-8 py-5" style={{ background: 'var(--cc-cta)' }} aria-label="Curb Drops">
      <div className="flex items-start justify-between px-4 mb-4">
        <div>
          <p className="cc-eyebrow" style={{ color: 'var(--cc-accent-deep)', opacity: 0.8 }}>
            Flash deals · tonight only
          </p>
          <h2 className="font-display text-3xl leading-none mt-1" style={{ color: 'var(--cc-accent-deep)' }}>
            Curb Drops
          </h2>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <Chip value={t.hr} unit="HR" />
          <Chip value={t.min} unit="MIN" />
          <Chip value={t.sec} unit="SEC" />
        </div>
      </div>

      <div className="px-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {activeDrops.map(drop => (
            <CurbDropCard key={drop.id} drop={drop} />
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        <Link to="/deals" className="cc-cta cc-cta-sm w-full"
          style={{ background: 'var(--cc-accent-deep)', color: 'var(--cc-cream)' }}>
          See all drops
        </Link>
      </div>
    </section>
  );
}
