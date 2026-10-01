import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Search } from 'lucide-react';

export default function DiscoveryHeader({ query, setQuery, onSearch }) {
  return (
    <header>
      <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-5 pr-20">
        <Link to="/" className="font-heading font-black text-xl tracking-tight">CURB<span className="text-discovery-orange">CHEF</span></Link>
        <Link to="/map" className="flex items-center gap-1.5 text-xs text-discovery-muted mt-1.5 w-fit min-h-6"><MapPin className="w-3 h-3" />Houston, TX <ArrowUpRight className="w-3 h-3" /></Link>
      </div>
      <div className="bg-discovery-orange text-discovery-dark px-5 pt-6 pb-7 rounded-b-[2rem]">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] font-bold">Houston street food. No boring bites.</p>
        <div className="flex items-end justify-between gap-4 mt-3 mb-5">
          <h1 className="font-heading font-black text-[2.6rem] leading-[1.02] tracking-[-0.06em]">Follow<br />your appetite.</h1>
          <Link to="/explore" aria-label="Explore food trucks" className="w-14 h-14 border border-discovery-dark rounded-full flex items-center justify-center shrink-0 mb-1"><ArrowUpRight className="w-7 h-7" /></Link>
        </div>
        <form onSubmit={onSearch} className="flex items-center gap-3 bg-discovery-card text-discovery-dark rounded-2xl pl-4 pr-1.5 py-1.5">
          <Search className="w-5 h-5 shrink-0" aria-hidden="true" />
          <input aria-label="Search food and trucks" value={query} onChange={e => setQuery(e.target.value)} placeholder="Tacos, brisket, your next favorite…" className="bg-transparent min-w-0 flex-1 text-sm py-3 placeholder:text-discovery-subtle" />
          <button type="submit" aria-label="Search" className="min-w-11 min-h-11 rounded-xl bg-discovery-dark text-discovery-ink flex items-center justify-center"><ArrowUpRight className="w-5 h-5" /></button>
        </form>
      </div>
    </header>
  );
}