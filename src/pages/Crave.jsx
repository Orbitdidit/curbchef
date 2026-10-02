import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Heart, X, ChevronUp, ChevronDown, Undo2, ListChecks } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import DemoBadge from '@/components/shared/DemoBadge';

const H_THRESH = 110;   // px sideways to commit crave / pass
const V_THRESH = 120;   // px up / down to commit details / hide truck
const HINT_KEY = 'cc_crave_hint_seen';

const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/** Every swipeable dish: has a photo, is available, and its truck is visible in the app. */
function useDeck(userId) {
  const trucksQ = useQuery({
    queryKey: ['crave-trucks'],
    queryFn: async () => {
      const page = await base44.entities.FoodTruck.filter({ is_approved: true }, { sort: '-rating', limit: 100 });
      return page.items || page;
    },
    staleTime: 120000,
  });
  const itemsQ = useQuery({
    queryKey: ['crave-items'],
    queryFn: async () => {
      const page = await base44.entities.MenuItem.filter({ is_available: true }, { limit: 400 });
      return page.items || page;
    },
    staleTime: 120000,
  });
  const swipesQ = useQuery({
    queryKey: ['crave-swipes', userId],
    queryFn: async () => {
      const page = await base44.entities.CraveSwipe.filter({ created_by_id: userId }, { sort: '-created_date', limit: 500 });
      return page.items || page;
    },
    enabled: Boolean(userId),
    staleTime: 30000,
  });

  const deck = useMemo(() => {
    const trucks = new Map((trucksQ.data || []).map(t => [t.id, t]));
    const swipes = swipesQ.data || [];
    const seen = new Set(swipes.filter(s => s.action !== 'hide_truck').map(s => s.menu_item_id));
    const hiddenTrucks = new Set(swipes.filter(s => s.action === 'hide_truck').map(s => s.truck_id));
    const usable = (itemsQ.data || [])
      .filter(i => i.image_url && trucks.has(i.truck_id) && !hiddenTrucks.has(i.truck_id))
      .map(i => ({ ...i, truck: trucks.get(i.truck_id) }));
    const fresh = usable.filter(i => !seen.has(i.id));
    // Real trucks first, then demos, each shuffled so every visit feels new.
    const real = shuffle(fresh.filter(i => !i.truck.is_sample));
    const demo = shuffle(fresh.filter(i => i.truck.is_sample));
    // Avoid the same photo twice in a row (seed data reuses images).
    const out = [];
    for (const card of [...real, ...demo]) {
      if (out.length && out[out.length - 1].image_url === card.image_url) out.splice(Math.max(0, out.length - 2), 0, card);
      else out.push(card);
    }
    return out;
  }, [trucksQ.data, itemsQ.data, swipesQ.data]);

  return { deck, isLoading: trucksQ.isLoading || itemsQ.isLoading || (Boolean(userId) && swipesQ.isLoading), refetchSwipes: swipesQ.refetch };
}

function Stamp({ label, color, show, rotate = 0, className = '' }) {
  return (
    <span className={`absolute font-display text-4xl px-3 py-1 border-4 rounded-md pointer-events-none ${className}`}
      style={{ color, borderColor: color, opacity: show, transform: `rotate(${rotate}deg)`, transition: 'opacity .08s' }}>
      {label}
    </span>
  );
}

function Card({ card, top, offset, dragging, exitDir }) {
  const { x, y } = offset;
  const rot = x / 14;
  let transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
  if (exitDir === 'right') transform = 'translate(140%, 40px) rotate(24deg)';
  if (exitDir === 'left') transform = 'translate(-140%, 40px) rotate(-24deg)';
  if (exitDir === 'down') transform = 'translate(0, 130%) rotate(0deg)';
  if (exitDir === 'up') transform = 'translate(0, -130%) rotate(0deg)';
  const t = card.truck;

  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden select-none"
      style={{
        transform: top ? transform : 'scale(.95) translateY(14px)',
        transition: dragging ? 'none' : 'transform .32s cubic-bezier(.2,.8,.2,1)',
        background: 'var(--cc-d-surface)',
        border: '1px solid var(--cc-d-line)',
        touchAction: 'none',
        zIndex: top ? 2 : 1,
      }}>
      <img src={card.image_url} alt={card.name} draggable={false} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(12,13,14,0) 45%, rgba(12,13,14,.92) 100%)' }} />

      {top && (
        <>
          <Stamp label="CRAVE" color="#78FFC9" show={Math.min(1, Math.max(0, x / H_THRESH))} rotate={-12} className="top-8 left-6" />
          <Stamp label="PASS" color="#FF5B1F" show={Math.min(1, Math.max(0, -x / H_THRESH))} rotate={12} className="top-8 right-6" />
          <Stamp label="SKIP TRUCK" color="#F2BA62" show={Math.min(1, Math.max(0, y / V_THRESH))} className="top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-2xl" />
        </>
      )}

      <div className="absolute left-0 right-0 bottom-0 p-5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(244,243,239,.75)' }}>
              {t.name}{t.is_sample && <DemoBadge />}
            </p>
            <h2 className="font-display text-[2.2rem] mt-1 text-discovery-ink">{card.name}</h2>
          </div>
          <span className="font-display text-4xl shrink-0" style={{ color: 'var(--cc-d-orange)' }}>
            ${Number(card.price || 0).toFixed(card.price % 1 ? 2 : 0)}
          </span>
        </div>
        {card.description && (
          <p className="text-sm mt-2 leading-snug line-clamp-2" style={{ color: 'rgba(244,243,239,.82)' }}>{card.description}</p>
        )}
      </div>
    </div>
  );
}

export default function Crave() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { deck, isLoading } = useDeck(me?.id);

  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [exitDir, setExitDir] = useState(null);
  const [history, setHistory] = useState([]);       // [{ card, swipeId, action }]
  const [cravedCount, setCravedCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const start = useRef(null);

  useEffect(() => {
    try { if (!localStorage.getItem(HINT_KEY)) setShowHint(true); } catch { setShowHint(true); }
  }, []);
  const dismissHint = () => { setShowHint(false); try { localStorage.setItem(HINT_KEY, '1'); } catch { /* private mode */ } };

  // Deck snapshot for this session, so background refetches don't reshuffle under your thumb.
  const [session, setSession] = useState(null);
  useEffect(() => { if (!session && deck.length) setSession(deck); }, [deck, session]);
  const cards = session || [];
  const current = cards[index];
  const next = cards[index + 1];

  const record = useCallback(async (card, action) => {
    try {
      const rec = await base44.entities.CraveSwipe.create({
        menu_item_id: card.id, truck_id: card.truck_id, action,
        item_name: card.name, truck_name: card.truck?.name, image_url: card.image_url,
        price: Number(card.price) || 0, cuisine_type: card.truck?.cuisine_type,
      });
      return rec?.id;
    } catch { return null; }
  }, []);

  const commit = useCallback(async (dir) => {
    if (!current || exitDir) return;
    dismissHint();
    if (dir === 'up') {
      setOffset({ x: 0, y: 0 });
      navigate(`/truck/${current.truck_id}/item/${current.id}`);
      return;
    }
    const action = dir === 'right' ? 'crave' : dir === 'left' ? 'pass' : 'hide_truck';
    setExitDir(dir);
    const card = current;
    setTimeout(() => {
      setExitDir(null);
      setOffset({ x: 0, y: 0 });
      if (action === 'hide_truck') {
        // Drop only the cards still ahead of you; what you already swiped stays put.
        setSession(prev => [...prev.slice(0, index), ...prev.slice(index).filter(c => c.truck_id !== card.truck_id)]);
      } else {
        setIndex(i => i + 1);
      }
      if (action === 'crave') setCravedCount(c => c + 1);
    }, 260);
    if (navigator.vibrate) { try { navigator.vibrate(action === 'crave' ? 18 : 8); } catch { /* unsupported */ } }
    const snapshot = session;
    const swipeId = await record(card, action);
    setHistory(h => [...h.slice(-19), { card, swipeId, action, snapshot }]);
    if (action === 'crave') qc.invalidateQueries({ queryKey: ['crave-list'] });
  }, [current, exitDir, navigate, record, qc, index, session]);

  const undo = async () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory(h => h.slice(0, -1));
    if (last.action === 'hide_truck') {
      if (last.snapshot) setSession(last.snapshot);
    } else {
      setIndex(i => Math.max(0, i - 1));
    }
    if (last.action === 'crave') setCravedCount(c => Math.max(0, c - 1));
    if (last.swipeId) { try { await base44.entities.CraveSwipe.delete(last.swipeId); } catch { /* keep going */ } }
    qc.invalidateQueries({ queryKey: ['crave-list'] });
  };

  // Pointer drag
  const onDown = e => {
    if (!current || exitDir) return;
    start.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = e => {
    if (!start.current) return;
    setOffset({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  };
  const onUp = () => {
    if (!start.current) return;
    const { x, y } = offset;
    const tap = Math.abs(x) < 6 && Math.abs(y) < 6 && Date.now() - start.current.t < 300;
    start.current = null;
    setDragging(false);
    if (tap) return commit('up');
    if (x > H_THRESH) return commit('right');
    if (x < -H_THRESH) return commit('left');
    if (y < -V_THRESH && Math.abs(x) < H_THRESH) return commit('up');
    if (y > V_THRESH && Math.abs(x) < H_THRESH) return commit('down');
    setOffset({ x: 0, y: 0 });
  };

  // Keyboard: ← pass, → crave, ↑ details, ↓ skip truck, Backspace undo
  useEffect(() => {
    const onKey = e => {
      if (e.target.closest?.('input, textarea')) return;
      const map = { ArrowRight: 'right', ArrowLeft: 'left', ArrowUp: 'up', ArrowDown: 'down' };
      if (map[e.key]) { e.preventDefault(); commit(map[e.key]); }
      if (e.key === 'Backspace') { e.preventDefault(); undo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const done = !isLoading && session && !current;

  return (
    <div className="cc-discovery min-h-[100dvh] flex flex-col bg-discovery-bg">
      <header className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <button onClick={() => navigate(-1)} aria-label="Back" className="w-11 h-11 rounded-full flex items-center justify-center bg-discovery-surface border border-discovery-line">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="font-display text-2xl leading-none">CR<span className="cc-glow">AVE</span></p>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-discovery-muted mt-1">Swipe Houston's menu</p>
        </div>
        <Link to="/crave/list" aria-label="Your Crave List" className="relative w-11 h-11 rounded-full flex items-center justify-center bg-discovery-surface border border-discovery-line">
          <ListChecks className="w-5 h-5" />
          {cravedCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: 'var(--cc-d-mint)', color: '#0C0D0E' }}>{cravedCount}</span>
          )}
        </Link>
      </header>

      <main className="flex-1 flex flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="relative flex-1 min-h-[420px]"
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          role="region" aria-label="Food card. Swipe right to crave, left to pass, up for details, down to skip this truck.">
          {isLoading && <div className="absolute inset-0 rounded-xl bg-discovery-surface motion-safe:animate-pulse" />}
          {next && <Card key={next.id + '-n'} card={next} top={false} offset={{ x: 0, y: 0 }} />}
          {current && <Card key={current.id} card={current} top offset={offset} dragging={dragging} exitDir={exitDir} />}

          {done && (
            <div className="absolute inset-0 rounded-xl border border-discovery-line bg-discovery-surface flex flex-col items-center justify-center text-center px-8">
              <p className="font-display text-4xl">You've seen<br /><span className="cc-glow">the whole menu</span></p>
              <p className="text-sm text-discovery-muted mt-3">New dishes drop as trucks add them. Check back tonight.</p>
              <Link to="/crave/list" className="cc-action px-6 mt-6 inline-flex items-center">Open your Crave List</Link>
            </div>
          )}

          {showHint && current && (
            <button onClick={dismissHint} className="absolute inset-0 z-10 rounded-xl flex flex-col items-center justify-center gap-4 text-left px-8"
              style={{ background: 'rgba(12,13,14,.82)' }}>
              <p className="font-display text-3xl text-center">How Crave works</p>
              {[
                ['→', 'Swipe right', 'Add to your Crave List', '#78FFC9'],
                ['←', 'Swipe left', 'Not feeling it', '#FF5B1F'],
                ['↑', 'Swipe up or tap', 'See it and order', '#F4F3EF'],
                ['↓', 'Swipe down', 'Skip this whole truck', '#F2BA62'],
              ].map(([k, a, b, c]) => (
                <span key={a} className="flex items-center gap-3 w-full max-w-[260px]">
                  <span className="font-display text-3xl w-8 text-center" style={{ color: c }}>{k}</span>
                  <span><span className="block text-sm font-bold">{a}</span><span className="block text-xs text-discovery-muted">{b}</span></span>
                </span>
              ))}
              <span className="cc-action px-6 inline-flex items-center mt-2">Let's eat</span>
            </button>
          )}
        </div>

        {/* Controls (also the accessible way in) */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <button onClick={undo} disabled={!history.length} aria-label="Undo last swipe"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-discovery-surface border border-discovery-line disabled:opacity-35">
            <Undo2 className="w-4 h-4" />
          </button>
          <button onClick={() => commit('left')} disabled={!current} aria-label="Pass"
            className="w-16 h-16 rounded-full flex items-center justify-center border-2" style={{ borderColor: 'var(--cc-d-orange)', color: 'var(--cc-d-orange)' }}>
            <X className="w-7 h-7" />
          </button>
          <button onClick={() => commit('down')} disabled={!current} aria-label="Skip this truck"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-discovery-surface border border-discovery-line" style={{ color: '#F2BA62' }}>
            <ChevronDown className="w-5 h-5" />
          </button>
          <button onClick={() => commit('up')} disabled={!current} aria-label="See details"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-discovery-surface border border-discovery-line">
            <ChevronUp className="w-5 h-5" />
          </button>
          <button onClick={() => commit('right')} disabled={!current} aria-label="Crave it"
            className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--cc-d-mint)', color: '#0C0D0E', boxShadow: '0 0 24px rgba(120,255,201,.35)' }}>
            <Heart className="w-7 h-7" fill="currentColor" />
          </button>
        </div>
      </main>
    </div>
  );
}
