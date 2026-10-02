import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/** Home-screen door into Crave: a tilted stack of real dishes, splash-page style. */
export default function CraveTeaser({ trucks = [] }) {
  const { data: items = [] } = useQuery({
    queryKey: ['crave-teaser-items'],
    queryFn: async () => {
      const page = await base44.entities.MenuItem.filter({ is_available: true }, { limit: 120 });
      return page.items || page;
    },
    staleTime: 300000,
  });

  const stack = useMemo(() => {
    const byId = new Map(trucks.map(t => [t.id, t]));
    const seen = new Set();
    const ok = items.filter(i => i.image_url && byId.has(i.truck_id) && !seen.has(i.image_url) && seen.add(i.image_url));
    const real = ok.filter(i => !byId.get(i.truck_id).is_sample);
    return [...real, ...ok.filter(i => byId.get(i.truck_id).is_sample)].slice(0, 3);
  }, [items, trucks]);

  if (stack.length < 2) return null;
  const tilt = ['-8deg', '4deg', '-2deg'];

  return (
    <Link to="/crave" className="block mx-4 mt-7 rounded-xl overflow-hidden border border-discovery-line bg-discovery-surface"
      aria-label="Open Crave, swipe through Houston's food">
      <div className="flex items-center gap-4 p-5">
        <div className="relative w-28 h-32 shrink-0" aria-hidden="true">
          {stack.map((i, n) => (
            <img key={i.id} src={i.image_url} alt="" loading="lazy"
              className="absolute w-20 h-24 object-cover rounded-md border-2"
              style={{ left: n * 14, top: n * 6, transform: `rotate(${tilt[n]})`, borderColor: '#F4F3EF', boxShadow: '0 8px 20px rgba(0,0,0,.45)', zIndex: n }} />
          ))}
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--cc-d-mint)' }}>New · Crave</p>
          <p className="font-display text-[2rem] mt-1">Swipe the<br /><span className="cc-glow">whole city</span></p>
          <p className="text-xs text-discovery-muted mt-1">Right to save, left to pass. Find food you'd never search for.</p>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 min-h-12 border-t border-discovery-line">
        <span className="flex items-center gap-2 text-sm font-bold"><Heart className="w-4 h-4" style={{ color: 'var(--cc-d-mint)' }} fill="currentColor" /> Start swiping</span>
        <ArrowUpRight className="w-4 h-4 text-discovery-muted" />
      </div>
    </Link>
  );
}
