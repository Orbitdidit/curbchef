import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Search } from 'lucide-react';

/**
 * DiscoveryHeader — splash-page DNA on the app home screen.
 * Charcoal panel one step above the page, heavy condensed caps with the
 * mint glow word, orange "period" block, mono fine print. Containers are
 * hard-edged; the search control stays a pill.
 */
export default function DiscoveryHeader({ query, setQuery, onSearch }) {
  return (
    <header>
      <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4 pr-20">
        <Link to="/" className="font-display text-2xl leading-none">
          CURB<span className="cc-glow">CHEF</span>
        </Link>
        <Link to="/map" className="flex items-center gap-1.5 text-xs text-discovery-muted mt-1.5 w-fit min-h-6">
          <MapPin className="w-3 h-3" />Houston, TX <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="mx-3 rounded-xl border border-discovery-line bg-discovery-surface px-5 pt-6 pb-6">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-discovery-muted">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cc-d-mint)', boxShadow: '0 0 8px var(--cc-d-mint)' }} />
          Houston street food · no boring bites
        </p>

        <div className="flex items-end justify-between gap-4 mt-3 mb-5">
          <h1 className="font-display text-[3.1rem]">
            Follow your<br />
            <span className="cc-glow">appetite</span><span className="inline-block w-3 h-3 ml-1 align-baseline" style={{ background: 'var(--cc-d-orange)' }} />
          </h1>
          <Link to="/explore" aria-label="Explore food trucks"
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 mb-1"
            style={{ background: 'var(--cc-d-orange)', color: '#0C0D0E' }}>
            <ArrowUpRight className="w-7 h-7" />
          </Link>
        </div>

        <form onSubmit={onSearch}
          className="flex items-center gap-3 rounded-full pl-4 pr-1.5 py-1.5 border border-discovery-line"
          style={{ background: 'var(--cc-d-bg)' }}>
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
    </header>
  );
}
