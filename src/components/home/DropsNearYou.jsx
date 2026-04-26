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
    <div className="px-4">
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {activeDrops.map(drop => (
          <CurbDropCard key={drop.id} drop={drop} />
        ))}
      </div>
    </div>
  );
}