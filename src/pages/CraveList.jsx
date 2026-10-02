import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Dices, X, ArrowUpRight, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/** Your shortlist from Crave, plus a "Decide for me" pick when you can't choose. */
export default function CraveList() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: swipes = [], isLoading } = useQuery({
    queryKey: ['crave-list', me?.id],
    queryFn: async () => {
      const page = await base44.entities.CraveSwipe.filter({ created_by_id: me.id, action: 'crave' }, { sort: '-created_date', limit: 200 });
      return page.items || page;
    },
    enabled: Boolean(me?.id),
  });

  // One row per dish, newest crave wins.
  const items = useMemo(() => {
    const seen = new Set();
    return swipes.filter(s => (seen.has(s.menu_item_id) ? false : seen.add(s.menu_item_id)));
  }, [swipes]);

  const [pick, setPick] = useState(null);
  const [rolling, setRolling] = useState(false);

  const decide = () => {
    if (!items.length) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setPick(items[Math.floor(Math.random() * items.length)]); return; }
    setRolling(true);
    let n = 0;
    const spin = () => {
      setPick(items[Math.floor(Math.random() * items.length)]);
      n += 1;
      if (n < 12) setTimeout(spin, 60 + n * 18); else setRolling(false);
    };
    spin();
  };

  const remove = async s => {
    const dupes = swipes.filter(x => x.menu_item_id === s.menu_item_id);
    qc.setQueryData(['crave-list', me?.id], prev => (prev || []).filter(x => x.menu_item_id !== s.menu_item_id));
    if (pick?.menu_item_id === s.menu_item_id) setPick(null);
    await Promise.all(dupes.map(d => base44.entities.CraveSwipe.delete(d.id).catch(() => null)));
  };

  return (
    <div className="cc-discovery min-h-[100dvh] bg-discovery-bg pb-10">
      <header className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
        <button onClick={() => navigate(-1)} aria-label="Back" className="w-11 h-11 rounded-full flex items-center justify-center bg-discovery-surface border border-discovery-line">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="font-display text-2xl leading-none">CRAVE <span className="cc-glow">LIST</span></p>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-discovery-muted mt-1">{items.length} dish{items.length === 1 ? '' : 'es'} saved</p>
        </div>
        <Link to="/crave" aria-label="Keep swiping" className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--cc-d-mint)', color: '#0C0D0E' }}>
          <Heart className="w-5 h-5" fill="currentColor" />
        </Link>
      </header>

      {items.length > 1 && (
        <section className="mx-4 mb-5 rounded-xl overflow-hidden border border-discovery-line bg-discovery-surface">
          {pick ? (
            <div className="relative h-56">
              <img src={pick.image_url} alt={pick.item_name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(12,13,14,.1) 30%, rgba(12,13,14,.92) 100%)' }} />
              <div className="absolute left-0 right-0 bottom-0 p-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(244,243,239,.75)' }}>{rolling ? 'Deciding…' : 'Tonight you eat'}</p>
                  <p className="font-display text-3xl mt-1 truncate">{pick.item_name}</p>
                  <p className="text-xs text-discovery-muted truncate">{pick.truck_name}</p>
                </div>
                {!rolling && (
                  <Link to={`/truck/${pick.truck_id}/item/${pick.menu_item_id}`} className="cc-action px-5 inline-flex items-center gap-1.5 shrink-0">
                    Order it <ArrowUpRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5">
              <p className="font-display text-2xl">Can't choose?</p>
              <p className="text-sm text-discovery-muted mt-1">Let CurbChef pick one from your list.</p>
            </div>
          )}
          <button onClick={decide} disabled={rolling} className="w-full flex items-center justify-center gap-2 min-h-12 font-bold text-sm border-t border-discovery-line" style={{ color: 'var(--cc-d-mint)' }}>
            <Dices className="w-4 h-4" /> {pick ? 'Roll again' : 'Decide for me'}
          </button>
        </section>
      )}

      {isLoading ? (
        <div className="mx-4 h-40 rounded-xl bg-discovery-surface motion-safe:animate-pulse" />
      ) : !items.length ? (
        <div className="mx-4 mt-10 text-center">
          <p className="font-display text-3xl">Nothing saved yet</p>
          <p className="text-sm text-discovery-muted mt-2">Swipe right on anything that looks good and it lands here.</p>
          <Link to="/crave" className="cc-action px-6 mt-6 inline-flex items-center">Start swiping</Link>
        </div>
      ) : (
        <ul className="mx-4 grid grid-cols-2 gap-3">
          {items.map(s => (
            <li key={s.menu_item_id} className="relative rounded-xl overflow-hidden border border-discovery-line bg-discovery-surface">
              <Link to={`/truck/${s.truck_id}/item/${s.menu_item_id}`} className="block">
                <img src={s.image_url} alt={s.item_name} loading="lazy" className="w-full aspect-square object-cover" />
                <div className="p-3">
                  <p className="font-display text-lg leading-tight line-clamp-2">{s.item_name}</p>
                  <div className="flex items-center justify-between mt-1 gap-2">
                    <p className="text-[11px] text-discovery-muted truncate">{s.truck_name}</p>
                    {s.price ? <p className="font-display text-lg" style={{ color: 'var(--cc-d-orange)' }}>${Number(s.price).toFixed(s.price % 1 ? 2 : 0)}</p> : null}
                  </div>
                </div>
              </Link>
              <button onClick={() => remove(s)} aria-label={`Remove ${s.item_name}`}
                className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(12,13,14,.75)' }}>
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
