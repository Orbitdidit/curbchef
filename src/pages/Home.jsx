import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, Search, ChevronDown, Bell } from 'lucide-react';
import CategoryRow from '@/components/home/CategoryRow';
import DropsNearYou from '@/components/home/DropsNearYou';
import LiveCarousel from '@/components/home/LiveCarousel';
import CarouselSection from '@/components/home/CarouselSection';
import ActivityFeed from '@/components/home/ActivityFeed';
import ExperiencesTeaser from '@/components/home/ExperiencesTeaser';
import { addToCart } from '@/lib/cartStore';
import { useToast } from '@/components/ui/use-toast';

// ── Quick AI prompt chips ─────────────────────────────────────────────────────
const AI_CHIPS = [
  { label: 'What should I eat?', emoji: '🤔' },
  { label: 'Vegan options near me', emoji: '🥗' },
  { label: 'Best tacos nearby', emoji: '🌮' },
  { label: 'Open right now', emoji: '🟢' },
];

// ── Featured hero card for the top truck ─────────────────────────────────────
function HeroFoodCard({ trucks }) {
  const [idx, setIdx] = useState(0);
  const candidates = trucks.filter(t => t.status === 'open' || t.is_live).slice(0, 5);
  if (!candidates.length) candidates.push(...trucks.slice(0, 3));
  if (!candidates.length) return null;

  const truck = candidates[idx % candidates.length];
  const img = truck.cover_image_url || truck.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=900&q=80';

  return (
    <div className="mx-4 mt-4">
      <Link to={`/truck/${truck.id}`}>
        <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <img src={img} alt={truck.name} className="absolute inset-0 w-full h-full object-cover" />

          {/* gradient */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.0) 30%, rgba(10,10,10,0.88) 100%)' }} />

          {/* badges top-left */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {truck.is_live && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,59,48,0.9)', backdropFilter: 'blur(8px)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white" style={{ animation: 'livePulse 1.4s ease-in-out infinite' }} />
                <span className="text-white text-[10px] font-black tracking-widest">LIVE</span>
              </div>
            )}
            {truck.status === 'open' && !truck.is_live && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,245,212,0.3)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00F5D4' }} />
                <span className="text-[10px] font-black" style={{ color: '#00F5D4' }}>OPEN</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
              <span className="text-[10px] font-bold text-white">~{truck.delivery_eta || '15 min'}</span>
            </div>
          </div>

          {/* multi-dot indicator */}
          {candidates.length > 1 && (
            <div className="absolute top-4 right-4 flex gap-1">
              {candidates.map((_, i) => (
                <button key={i} onClick={e => { e.preventDefault(); setIdx(i); }}
                  className="rounded-full transition-all"
                  style={{ width: i === idx % candidates.length ? 16 : 5, height: 5, background: i === idx % candidates.length ? '#00F5D4' : 'rgba(255,255,255,0.3)' }} />
              ))}
            </div>
          )}

          {/* bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="font-heading font-black text-2xl text-white leading-tight mb-1"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}>
              {truck.name}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,245,212,0.18)', color: '#00F5D4', border: '1px solid rgba(0,245,212,0.2)' }}>
                {truck.cuisine_type?.replace('_', ' ')}
              </span>
              {truck.rating && (
                <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  ★ {truck.rating.toFixed(1)} · {truck.city || 'Houston'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/truck/${truck.id}`}
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-heading font-black text-sm"
                style={{ background: '#00F5D4', color: '#0A0A0A' }}>
                Order Ahead →
              </Link>
              {truck.is_live && (
                <Link to="/live"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-heading font-bold text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                  ▶ Watch
                </Link>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ── Compact stats strip (moved lower on page) ─────────────────────────────────
function CompactStatsStrip({ user }) {
  const { data: rewards } = useQuery({
    queryKey: ['rewards-me', user?.email],
    queryFn: () => user?.email ? base44.entities.Reward.filter({ user_email: user.email }) : [],
    enabled: !!user?.email,
  });
  const points = rewards?.[0]?.points || 0;
  const tier = rewards?.[0]?.tier || 'starter';
  if (!user) return null;
  return (
    <Link to="/rewards">
      <div className="mx-4 mt-6 px-4 py-3 rounded-2xl flex items-center gap-3"
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="text-lg">🏆</span>
        <div className="flex-1">
          <span className="text-xs font-black" style={{ color: '#00F5D4' }}>{points.toLocaleString()} pts</span>
          <span className="text-xs mx-2" style={{ color: '#6B665C' }}>·</span>
          <span className="text-xs font-semibold capitalize" style={{ color: '#A39E94' }}>{tier} tier</span>
        </div>
        <span className="text-xs font-semibold" style={{ color: '#6B665C' }}>View rewards →</span>
      </div>
    </Link>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
  const nearbyTrucks = filteredTrucks.slice(0, 10);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const h = new Date().getHours();
  const greeting = h < 5 ? 'Still up?' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Late night craving?';
  const firstName = user?.full_name?.split(' ')[0];

  return (
    <div className="min-h-screen pb-28" style={{ background: '#0A0A0A' }}>

      {/* ── 1. TOP BAR ── */}
      <div className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <div className="flex items-center justify-between">
          {/* Logo + location */}
          <div>
            <p className="font-heading font-black text-xl" style={{ color: '#F5F0E8' }}>
              Curb<span style={{ color: '#00F5D4' }}>Chef</span>
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs" style={{ color: '#6B665C' }}>📍</span>
              <span className="text-xs font-semibold" style={{ color: '#A39E94' }}>Houston, TX</span>
              <ChevronDown className="w-3 h-3" style={{ color: '#6B665C' }} />
            </div>
          </div>
          {/* Right icons */}
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center relative"
              style={{ background: '#141414' }}>
              <Bell className="w-4.5 h-4.5" style={{ color: '#A39E94' }} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: '#FF3B30' }} />
            </button>
            <Link to="/search" className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: '#141414' }}>
              <Search className="w-4 h-4" style={{ color: '#A39E94' }} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. AI SEARCH BAR ── */}
      <div className="px-4 mt-1">
        <form onSubmit={handleSearch}>
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
            style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#6B665C' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="What's Cookin', chef?"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#F5F0E8' }}
            />
            <button type="button" className="flex-shrink-0">
              <Mic className="w-4 h-4" style={{ color: '#6B665C' }} />
            </button>
          </div>
        </form>
      </div>

      {/* ── 3. AI PROMPT CHIPS ── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 mt-3 pb-0.5">
        {AI_CHIPS.map(chip => (
          <button key={chip.label}
            onClick={() => navigate(`/search?q=${encodeURIComponent(chip.label)}`)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: '#141414', color: '#A39E94', border: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}>
            <span>{chip.emoji}</span> {chip.label}
          </button>
        ))}
      </div>

      {/* ── 4. CATEGORY CHIPS ── */}
      <div className="mt-3">
        <CategoryRow selected={selectedCategory} onChange={setSelectedCategory} />
      </div>

      {/* ── 5. FEATURED HERO CARD ── */}
      <HeroFoodCard trucks={visibleTrucks} />

      {/* ── 6. CURB DROPS ── */}
      <div className="mt-8">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-heading font-black text-lg flex items-center gap-2" style={{ color: '#F5F0E8' }}>
            ⚡ Curb Drops
          </h2>
          <Link to="/deals" className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#6B665C' }}>Flash Deals</Link>
        </div>
        <DropsNearYou />
      </div>

      {/* ── 7. NEARBY NOW ── */}
      {nearbyTrucks.length > 0 && (
        <div className="mt-8">
          <CarouselSection title="Nearby Now" emoji="📍" trucks={nearbyTrucks} seeAllHref="/explore" />
        </div>
      )}

      {/* ── 8. LIVE & FEATURED ── */}
      <div className="mt-8">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-heading font-black text-lg flex items-center gap-2" style={{ color: '#F5F0E8' }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#FF3B30', animation: 'livePulse 1.4s ease-in-out infinite' }} />
            Live & Featured
          </h2>
          <Link to="/live" className="text-xs font-semibold" style={{ color: '#00F5D4' }}>Watch all →</Link>
        </div>
        <LiveCarousel trucks={liveTrucks} />
      </div>

      {/* ── 9. COMPACT STATS (not at top) ── */}
      <CompactStatsStrip user={user} />

      {/* ── EXPERIENCES ── */}
      <div className="mt-8">
        <ExperiencesTeaser />
      </div>

      {/* ── ACTIVITY ── */}
      <div className="mt-8">
        <ActivityFeed trucks={visibleTrucks} />
      </div>

      <div className="h-8" />
    </div>
  );
}