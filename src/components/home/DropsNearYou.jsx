import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CurbDropCard from '@/components/drops/CurbDropCard';

export default function DropsNearYou() {
  const { data: drops = [] } = useQuery({
    queryKey: ['curb-drops-home'],
    queryFn: () => base44.entities.CurbDrop.filter({ is_active: true }, '-created_date', 10),
    refetchInterval: 30000,
  });

  // Filter to only active/non-expired drops
  const activeDrops = drops.filter(d => new Date(d.expires_at) > new Date() && d.current_claims < d.max_claims);

  if (activeDrops.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between px-5 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🪂</span>
          <h2 className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>Drops Near You</h2>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(253,89,30,0.15)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.3)' }}>
            {activeDrops.length} LIVE
          </span>
        </div>
        <Link to="/deals" className="flex items-center gap-0.5 text-xs font-bold" style={{ color: '#77ffc8' }}>
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar"
        style={{ paddingLeft: '20px', paddingRight: '20px' }}>
        {activeDrops.map(drop => (
          <CurbDropCard key={drop.id} drop={drop} />
        ))}
      </div>
    </div>
  );
}