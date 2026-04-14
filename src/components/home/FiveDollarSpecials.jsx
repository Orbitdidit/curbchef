import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Tag, ChevronRight } from 'lucide-react';

export default function FiveDollarSpecials({ trucks }) {
  const { data: specials = [] } = useQuery({
    queryKey: ['five-dollar-specials'],
    queryFn: () => base44.entities.MenuItem.filter({ is_available: true }),
    select: (items) => items.filter(i => i.price <= 5 && i.price > 0).slice(0, 12),
  });

  if (specials.length === 0) return null;

  // Build a map of truck_id -> truck for quick lookup
  const truckMap = Object.fromEntries((trucks || []).map(t => [t.id, t]));

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', boxShadow: '0 0 10px rgba(251,191,36,0.4)' }}>
            <Tag className="w-3 h-3" style={{ color: '#0d1517' }} />
          </div>
          <h2 className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>$5 Specials Nearby</h2>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
            🔥 HOT DEALS
          </span>
        </div>
        <Link to="/deals" className="flex items-center gap-0.5 text-xs font-bold" style={{ color: '#77ffc8' }}>
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-5">
        {specials.map(item => {
          const truck = truckMap[item.truck_id];
          return (
            <Link
              key={item.id}
              to={truck ? `/truck/${item.truck_id}/item/${item.id}` : `/truck/${item.truck_id}`}
              className="flex-shrink-0 rounded-2xl overflow-hidden flex flex-col"
              style={{ width: 148, background: '#151d1f', border: '1px solid rgba(251,191,36,0.15)' }}
            >
              {/* Image */}
              <div className="relative" style={{ height: 110 }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl"
                    style={{ background: '#192123' }}>🍽️</div>
                )}
                {/* Price badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full font-heading font-black text-xs"
                  style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#0d1517' }}>
                  ${item.price.toFixed(2)}
                </div>
                {item.is_special && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-black"
                    style={{ background: '#fd591e', color: 'white' }}>HOT</div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col gap-0.5 flex-1">
                <p className="font-heading font-black text-xs leading-tight line-clamp-2" style={{ color: '#dff0e8' }}>
                  {item.name}
                </p>
                {truck && (
                  <p className="text-[10px] truncate mt-0.5" style={{ color: '#bacbc0' }}>
                    {truck.name}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}