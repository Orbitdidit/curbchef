import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Star } from 'lucide-react';
import { useUserLocation, distanceMiles, formatDist } from '@/lib/geoUtils';
import DemoBadge from '@/components/shared/DemoBadge';

export default function BrowseTruckCard({ truck, view }) {
  const { lat, lng } = useUserLocation();
  const distance = lat && truck.latitude ? formatDist(distanceMiles(lat, lng, truck.latitude, truck.longitude)) : null;
  const grid = view === 'grid';
  const compact = view === 'compact';
  return (
    <Link to={`/truck/${truck.id}`} className={`group overflow-hidden rounded-2xl border border-discovery-line bg-discovery-surface ${grid ? 'block' : 'flex gap-4 items-center p-3'}`}>
      <div className={`relative shrink-0 overflow-hidden ${grid ? 'h-40' : compact ? 'w-14 h-14 rounded-xl' : 'w-24 h-28 rounded-xl'}`}>
        <img src={truck.image_url || truck.cover_image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=400'} alt={truck.name} loading="lazy" className="w-full h-full object-cover" />
        {truck.is_live && <span className="absolute top-2 left-2 bg-discovery-orange text-discovery-dark text-[9px] font-black px-1.5 py-1 rounded-md">LIVE</span>}
      </div>
      <div className={`min-w-0 flex-1 ${grid ? 'p-3.5' : 'py-1'}`}>
        <p className="text-[10px] text-discovery-amber uppercase tracking-wider font-mono mb-1.5">{truck.cuisine_type?.replace(/_/g, ' ')}</p>
        <h3 className="font-heading font-extrabold text-base leading-snug text-discovery-ink line-clamp-2">{truck.name}{truck.is_sample && <DemoBadge />}</h3>
        {!compact && <p className="text-xs text-discovery-muted mt-1.5 line-clamp-1">{truck.description || truck.city || 'Houston'}</p>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-discovery-muted">
          {truck.rating != null && <span className="inline-flex items-center gap-1"><Star className="w-3 h-3 text-discovery-amber" />{truck.rating.toFixed(1)}</span>}
          {distance && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{distance}</span>}
          <span className={truck.is_sample ? 'text-discovery-amber' : 'text-discovery-status'}>{truck.is_sample ? 'Demo truck' : truck.status === 'open' ? 'Open now' : truck.status === 'sold_out' ? 'Sold out' : 'Closed'}</span>
        </div>
      </div>
      {!grid && <ArrowUpRight className="w-4 h-4 text-discovery-orange shrink-0" aria-hidden="true" />}
    </Link>
  );
}