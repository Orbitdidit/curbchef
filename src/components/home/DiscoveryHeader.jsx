import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, MapPin, Search, Radio } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SLIDE_MS = 6000;

/** Brand reel (HomepageConfig hero_video) first, then every active vendor clip. */
function useHeroClips() {
  const { data: cfg = [] } = useQuery({
    queryKey: ['homepage-config-hero'],
    queryFn: () => base44.entities.HomepageConfig.filter({ key: { $in: ['hero_video', 'hero_reel'] }, is_active: true }),
    staleTime: 300000,
  });
  const { data: clips = [] } = useQuery({
    queryKey: ['hero-live-clips'],
    queryFn: () => base44.entities.LiveClipVideo.filter({ is_active: true }, 'sort_order', 8),
    staleTime: 60000,
  });
  return useMemo(() => {
    const list = Array.isArray(cfg) ? cfg : (cfg.items || []);
    const brand = list.filter(c => c.key === 'hero_video' && c.video_url)
      .map(c => ({ id: c.id, video: c.video_url, poster: c.poster_url, kind: 'brand' }));
    const reels = list.filter(c => c.key === 'hero_reel' && c.video_url)
      .map(c => ({ id: c.id, video: c.video_url, poster: c.poster_url, kind: 'brand' }));
    const vendor = (Array.isArray(clips) ? clips : (clips.items || [])).filter(c => c.video_url).map(c => ({
      id: c.id, video: c.video_url, poster: c.poster_url, kind: 'clip',
      truck: c.truck_name, title: c.title, truckId: c.truck_id,
    }));
    // Brand reel first, then alternate studio reels with real vendor clips.
    const out = [...brand.slice(0, 1)];
    for (let n = 0; n < Math.max(reels.length, vendor.length); n++) {
      if (reels[n]) out.push(reels[n]);
      if (vendor[n]) out.push(vendor[n]);
    }
    return out;
  }, [cfg, clips]);
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const m = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!m) return;
    setReduce(m.matches);
    const on = e => setReduce(e.matches);
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);
  return reduce;
}

/**
 * DiscoveryHeader — the first screen of the app.
 * Motion is the hook: real truck footage plays behind the headline, cycling
 * like stories, with a LIVE strip naming who's cooking. Tap the strip to watch.
 */
export default function DiscoveryHeader({ query, setQuery, onSearch }) {
  const clips = useHeroClips();
  const reduceMotion = usePrefersReducedMotion();
  const [i, setI] = useState(0);
  const videoRef = useRef(null);
  const current = clips[i % Math.max(clips.length, 1)];

  useEffect(() => {
    if (clips.length < 2 || reduceMotion) return;
    const t = setTimeout(() => setI(n => (n + 1) % clips.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, clips.length, reduceMotion]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduceMotion) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, [current?.id, reduceMotion]);

  const liveClip = current?.kind === 'clip' ? current : clips.find(c => c.kind === 'clip');
  const upNext = clips.length > 1 ? clips[(i + 1) % clips.length] : null;

  return (
    <header>
      <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 pr-20">
        <Link to="/" className="font-display text-2xl leading-none">
          CURB<span className="cc-glow">CHEF</span>
        </Link>
        <Link to="/map" className="flex items-center gap-1.5 text-xs text-discovery-muted mt-1.5 w-fit min-h-6">
          <MapPin className="w-3 h-3" />Houston, TX <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="relative mx-3 rounded-xl overflow-hidden border border-discovery-line" style={{ minHeight: 360, background: 'var(--cc-d-surface)' }}>
        {/* Motion layer */}
        {current && (
          reduceMotion || !current.video ? (
            current.poster && <img src={current.poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <video
              key={current.id}
              ref={videoRef}
              src={current.video}
              poster={current.poster || undefined}
              autoPlay muted loop playsInline preload="metadata"
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )
        )}
        {/* Legibility scrim: dark at top for the headline, dark at bottom for search */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(12,13,14,.82) 0%, rgba(12,13,14,.35) 38%, rgba(12,13,14,.45) 62%, rgba(12,13,14,.92) 100%)' }} />

        <div className="relative px-5 pt-4 pb-5 flex flex-col" style={{ minHeight: 360 }}>
          {/* Story progress */}
          {clips.length > 1 && (
            <div className="flex gap-1 mb-4" aria-hidden="true">
              {clips.map((c, n) => (
                <button key={c.id} onClick={() => setI(n)} tabIndex={-1}
                  className="h-[3px] flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(244,243,239,.22)' }}>
                  <span className="block h-full rounded-full"
                    style={{
                      background: '#F4F3EF',
                      width: n < i ? '100%' : n === i ? '100%' : '0%',
                      transformOrigin: 'left',
                      animation: n === i && !reduceMotion ? `ccStory ${SLIDE_MS}ms linear forwards` : 'none',
                    }} />
                </button>
              ))}
            </div>
          )}

          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(244,243,239,.82)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cc-d-mint)', boxShadow: '0 0 8px var(--cc-d-mint)' }} />
            Houston street food · no boring bites
          </p>

          <div className="flex items-end justify-between gap-4 mt-3">
            <h1 className="font-display text-[3.1rem]" style={{ textShadow: '0 2px 18px rgba(0,0,0,.55)' }}>
              Follow your<br />
              <span className="cc-glow">appetite</span><span className="inline-block w-3 h-3 ml-1 align-baseline" style={{ background: 'var(--cc-d-orange)' }} />
            </h1>
            <Link to="/explore" aria-label="Explore food trucks"
              className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 mb-1"
              style={{ background: 'var(--cc-d-orange)', color: '#0C0D0E' }}>
              <ArrowUpRight className="w-7 h-7" />
            </Link>
          </div>

          <div className="flex-1" />

          {/* Live strip */}
          {liveClip && (
            <Link to="/live" className="flex items-center gap-2.5 mb-3 w-fit max-w-full rounded-full pl-1.5 pr-3 py-1.5"
              style={{ background: 'rgba(12,13,14,.62)', border: '1px solid rgba(244,243,239,.14)', backdropFilter: 'blur(8px)' }}>
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] tracking-[0.14em]"
                style={{ background: 'var(--cc-d-orange)', color: '#0C0D0E' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0C0D0E] motion-safe:animate-pulse" />LIVE
              </span>
              <span className="text-xs font-bold truncate text-discovery-ink">{liveClip.truck}</span>
              <span className="text-xs truncate text-discovery-muted hidden min-[380px]:inline">· {liveClip.title}</span>
              <Radio className="w-3.5 h-3.5 shrink-0 text-discovery-muted" />
            </Link>
          )}

          <form onSubmit={onSearch}
            className="flex items-center gap-3 rounded-full pl-4 pr-1.5 py-1.5 border border-discovery-line"
            style={{ background: 'rgba(12,13,14,.85)', backdropFilter: 'blur(8px)' }}>
            <Search className="w-5 h-5 shrink-0 text-discovery-muted" aria-hidden="true" />
            <input aria-label="Search food and trucks" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Tacos, brisket, your next favorite…"
              className="bg-transparent min-w-0 flex-1 text-sm py-3 text-discovery-ink placeholder:text-discovery-muted" />
            <button type="submit" aria-label="Search"
              className="min-w-11 min-h-11 rounded-full flex items-center justify-center"
              style={{ background: 'var(--cc-d-mint)', color: '#0C0D0E' }}>
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
      {upNext?.video && !reduceMotion && <link rel="preload" as="video" href={upNext.video} />}
      <style>{'@keyframes ccStory{from{transform:scaleX(0)}to{transform:scaleX(1)}}'}</style>
    </header>
  );
}
