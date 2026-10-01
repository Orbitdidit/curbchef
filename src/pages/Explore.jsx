import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Star, MapPin, Clock, LayoutGrid, List, AlignJustify, SlidersHorizontal, SearchX } from 'lucide-react';
import { useUserLocation, distanceMiles, formatDist } from '@/lib/geoUtils';
import AssistantFAB from '@/components/assistant/AssistantFAB';
import TruckCard from '@/components/truck/BrowseTruckCard';

const FILTERS = [
  { id:'all', label:'All'},
  { id:'live', label:'Live'},
  { id:'open', label:'Open Now'},
  { id:'near', label:'Near Me'},
  { id:'by_park', label:'By Park'},
  { id:'tacos', label:'Tacos'},
  { id:'bbq', label:'BBQ'},
  { id:'burgers', label:'Burgers'},
  { id:'seafood', label:'Seafood'},
  { id:'vegan', label:'Vegan'},
];

const SORTS = [
  { id:'default', label:'Default'},
  { id:'nearest', label:'Nearest'},
  { id:'top_rated', label:'Top Rated'},
  { id:'live', label:'Live Now'},
  { id:'open', label:'Open Now'},
];

function SectionHeader({ title, emoji }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span>{emoji}</span>
      <h2 className="font-heading font-extrabold text-xl" style={{ color:'var(--cc-ink)'}}>{title}</h2>
    </div>
  );
}

export default function Explore() {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('park') ?'by_park':'all';
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(initialFilter);
  const [sort, setSort] = useState('default');
  const [view, setView] = useState('list'); // list | grid | compact
  const [showSort, setShowSort] = useState(false);
  const { lat, lng } = useUserLocation();

  const { data: trucks = [], isLoading } = useQuery({
    queryKey: ['trucks-explore'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }),
    select: (data) => data.filter(t => t.status ==='open'|| t.is_sample),
  });

  const { data: parks = [] } = useQuery({
    queryKey: ['explore-parks'],
    queryFn: () => base44.entities.TruckPark.filter({ is_active: true },'-featured_order', 20),
    enabled: filter ==='by_park',
  });

  const filtered = useMemo(() => {
    let result = [...trucks];
    if (query) result = result.filter(t =>
      t.name?.toLowerCase().includes(query.toLowerCase()) ||
      t.cuisine_type?.toLowerCase().includes(query.toLowerCase())
    );
    if (filter ==='live') result = result.filter(t => t.is_live);
    else if (filter ==='open') result = result.filter(t => t.status ==='open');
    else if (filter ==='near') { /* handled by sort below */ }
    else if (filter !=='all') result = result.filter(t => t.cuisine_type === filter);

    // Sort
    if (sort ==='nearest'|| filter ==='near') {
      if (lat) result.sort((a, b) =>
        distanceMiles(lat, lng, a.latitude || 0, a.longitude || 0) -
        distanceMiles(lat, lng, b.latitude || 0, b.longitude || 0)
      );
    } else if (sort ==='top_rated') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort ==='live') {
      result.sort((a, b) => (b.is_live ? 1 : 0) - (a.is_live ? 1 : 0));
    } else if (sort ==='open') {
      result.sort((a, b) => (b.status ==='open'? 1 : 0) - (a.status ==='open'? 1 : 0));
    }
    return result;
  }, [trucks, query, filter, sort, lat, lng]);

  const isSearching = query || filter !=='all'|| sort !=='default';
  const liveTrucks = trucks.filter(t => t.is_live);
  const topRated = [...trucks].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
  const nearby = lat
    ? [...trucks].sort((a, b) => distanceMiles(lat, lng, a.latitude || 0, a.longitude || 0) - distanceMiles(lat, lng, b.latitude || 0, b.longitude || 0)).slice(0, 6)
    : trucks.slice(0, 6);
  const newTrucks = [...trucks].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 6);

  const viewIcons = [
    { id:'list', Icon: List },
    { id:'grid', Icon: LayoutGrid },
    { id:'compact', Icon: AlignJustify },
  ];

  return (
    <div className="cc-discovery min-h-screen pb-32 bg-discovery-bg">
      <AssistantFAB />
      {/* Sticky header */}
      <div className="cc-paper px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-5 sticky top-0 z-20 rounded-b-3xl">
        <div className="flex items-center justify-between mb-5 pr-14">
          <h1 className="font-display text-xl" style={{ color:'var(--cc-ink)'}}>Explore</h1>
          <div className="flex items-center gap-2">
            {/* Map button */}
            <Link to="/map">
              <div className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold" style={{ background:'var(--cc-bg-2)', color:'var(--cc-ink-dim)', border:'1px solid rgba(var(--cc-line-rgb),0.25)'}}>
                <MapPin className="w-3.5 h-3.5"/>Map
              </div>
            </Link>
            {/* Sort */}
            <div className="relative">
              <button onClick={() => setShowSort(s => !s)}
                className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold" style={{ background: sort !=='default'?'rgba(var(--cc-accent-rgb),0.12)':'var(--cc-bg-2)', color: sort !=='default'?'var(--cc-accent)':'var(--cc-ink-dim)', border:'1px solid rgba(var(--cc-line-rgb),0.25)'}}>
                <SlidersHorizontal className="w-3.5 h-3.5"/>Sort
              </button>
              {showSort && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 rounded-2xl overflow-hidden shadow-xl" style={{ background:'var(--cc-bg-2)', border:'1px solid rgba(var(--cc-line-rgb),0.3)', minWidth:'140px'}}>
                    {SORTS.map(s => (
                      <button key={s.id} onClick={() => { setSort(s.id); setShowSort(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold" style={{ color: sort === s.id ?'var(--cc-accent)':'var(--cc-ink)', background: sort === s.id ?'rgba(var(--cc-accent-rgb),0.07)':'transparent'}}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl mb-3" style={{ background:'var(--cc-bg-2)', border:'1px solid rgba(var(--cc-line-rgb),0.25)'}}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color:'var(--cc-ink-dim)'}} />
          <input aria-label="Search trucks by name or cuisine" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Tacos, brisket, ramen..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" style={{ color:'var(--cc-ink)'}} />
          {query && <button aria-label="Clear search" onClick={() => setQuery('')} className="text-xs font-bold min-h-11" style={{ color:'var(--cc-ink-dim)'}}>Clear</button>}
        </div>

        {/* Filter pills + view toggle row */}
        <div className="flex items-center gap-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1 pb-1">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id}
                className="px-3.5 min-h-11 rounded-xl text-xs font-bold flex-shrink-0 transition-all" style={filter === f.id
                  ? { background:'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color:'var(--cc-accent-deep)'}
                  : { background:'var(--cc-bg-2)', color:'var(--cc-ink-dim)', border:'1px solid rgba(var(--cc-line-rgb),0.25)'}
                }>
                {f.label}
              </button>
            ))}
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-1 flex-shrink-0 p-1 rounded-xl" style={{ background:'var(--cc-bg-2)'}}>
            {viewIcons.map(({ id, Icon }) => (
              <button key={id} onClick={() => setView(id)} aria-label={`${id} view`} aria-pressed={view === id}
                className="w-11 h-11 rounded-lg flex items-center justify-center transition-all" style={{ background: view === id ?'rgba(var(--cc-accent-rgb),0.15)':'transparent'}}>
                <Icon className="w-3.5 h-3.5" style={{ color: view === id ?'var(--cc-accent)':'var(--cc-ink-dim)'}} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        {/* By Park view */}
        {filter ==='by_park'&& (
          <div className="flex flex-col gap-6 mb-6">
            {parks.map(park => {
              const parkTrucks = trucks.filter(t => t.truck_park_id === park.id);
              return (
                <div key={park.id}>
                  <Link to={`/parks/${park.slug}`} className="flex items-center gap-3 mb-2.5">
                    <img src={park.hero_image_url ||'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200'}
                      alt={park.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm" style={{ color:'var(--cc-ink)'}}>{park.name}</p>
                      <p className="text-xs" style={{ color:'var(--cc-ink-dim)'}}>{parkTrucks.length} trucks · {park.address?.split(',')[0]}</p>
                    </div>
                    <span className="text-xs font-bold" style={{ color:'var(--cc-accent-2)'}}>View →</span>
                  </Link>
                  {parkTrucks.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {parkTrucks.map(t => <TruckCard key={t.id} truck={t} view="list"/>)}
                    </div>
                  ) : (
                    <p className="text-xs py-3 px-4 rounded-xl" style={{ color:'var(--cc-ink-faint)', background:'var(--cc-bg-0)'}}>
                      No trucks currently listed at this park.
                    </p>
                  )}
                </div>
              );
            })}
            {/* Trucks not in a park */}
            {(() => {
              const parkIds = new Set(parks.map(p => p.id));
              const unparked = trucks.filter(t => !t.truck_park_id || !parkIds.has(t.truck_park_id));
              if (!unparked.length) return null;
              return (
                <div>
                  <p className="font-display text-sm mb-2.5" style={{ color:'var(--cc-ink)'}}> Independent Trucks</p>
                  <div className="flex flex-col gap-2">
                    {unparked.map(t => <TruckCard key={t.id} truck={t} view="list"/>)}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {filter !=='by_park'&& isLoading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background:'var(--cc-bg-2)'}} />)}
          </div>
        ) : filter !=='by_park'&& isSearching ? (
          <div>
            <p className="text-xs mb-3" style={{ color:'var(--cc-ink-dim)'}}>{filtered.length} trucks</p>
            {view ==='grid'? (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map(t => <TruckCard key={t.id} truck={t} view="grid"/>)}
              </div>
            ) : view ==='compact'? (
              <div>{filtered.map(t => <TruckCard key={t.id} truck={t} view="compact"/>)}</div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map(t => <TruckCard key={t.id} truck={t} view="list"/>)}
              </div>
            )}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <SearchX className="w-10 h-10 mb-3 mx-auto" style={{ color: 'var(--cc-ink-faint)' }} />
                <p className="font-display" style={{ color:'var(--cc-ink)'}}>No trucks found</p>
                <p className="text-sm mt-1" style={{ color:'var(--cc-ink-dim)'}}>Try a different search</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {liveTrucks.length > 0 && (
              <div>
                <SectionHeader title="Live Right Now" emoji=""/>
                <div className="flex flex-col gap-3">
                  {liveTrucks.map(t => <TruckCard key={t.id} truck={t} view={view} />)}
                </div>
              </div>
            )}
            <div>
              <SectionHeader title="Trending" emoji=""/>
              <div className={view ==='grid'?'grid grid-cols-2 gap-3': view ==='compact'?'':'flex flex-col gap-3'}>
                {trucks.slice(0, 5).map(t => <TruckCard key={t.id} truck={t} view={view} />)}
              </div>
            </div>
            <div>
              <SectionHeader title="Near Me" emoji=""/>
              <div className={view ==='grid'?'grid grid-cols-2 gap-3': view ==='compact'?'':'flex flex-col gap-3'}>
                {nearby.map(t => <TruckCard key={t.id} truck={t} view={view} />)}
              </div>
            </div>
            <div>
              <SectionHeader title="Top Rated" emoji=""/>
              <div className={view ==='grid'?'grid grid-cols-2 gap-3': view ==='compact'?'':'flex flex-col gap-3'}>
                {topRated.map(t => <TruckCard key={t.id} truck={t} view={view} />)}
              </div>
            </div>
            <div>
              <SectionHeader title="New on CurbChef" emoji=""/>
              <div className={view ==='grid'?'grid grid-cols-2 gap-3': view ==='compact'?'':'flex flex-col gap-3'}>
                {newTrucks.map(t => <TruckCard key={t.id} truck={t} view={view} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}