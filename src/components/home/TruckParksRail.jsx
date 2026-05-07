import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Truck, Star } from 'lucide-react';

function ParkMiniCard({ park }) {
  return (
    <Link to={`/parks/${park.slug}`}
      className="flex-shrink-0 w-52 rounded-2xl overflow-hidden active:scale-[0.97] transition-transform"
      style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="relative" style={{ height: '110px' }}>
        <img src={park.hero_image_url || 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400'}
          alt={park.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,transparent 30%,rgba(0,0,0,0.8) 100%)' }} />
        <div className="absolute bottom-2.5 left-3 right-3">
          <p className="font-heading font-black text-white text-sm leading-tight truncate">{park.name}</p>
        </div>
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3 h-3" style={{ color: '#00F5D4' }} />
          <span className="text-xs font-bold" style={{ color: '#00F5D4' }}>{park.total_trucks || 0} trucks</span>
        </div>
        {park.avg_rating && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold" style={{ color: '#A39E94' }}>{park.avg_rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function TruckParksRail() {
  const { data: parks = [] } = useQuery({
    queryKey: ['truck-parks-home'],
    queryFn: () => base44.entities.TruckPark.filter({ is_active: true, is_featured: true }, '-featured_order', 5),
  });

  if (!parks.length) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-heading font-black text-lg" style={{ color: '#F5F0E8' }}>
          🏛️ Houston's Hottest Truck Parks
        </h2>
        <Link to="/parks" className="text-xs font-semibold" style={{ color: '#00F5D4' }}>
          Explore All →
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
        {parks.map(p => <ParkMiniCard key={p.id} park={p} />)}
      </div>
    </div>
  );
}