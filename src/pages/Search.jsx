import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import TruckCard from '../components/home/TruckCard';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const { data: trucks = [] } = useQuery({
    queryKey: ['trucks'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }),
  });

  const filtered = useMemo(() => {
    if (!query.trim()) return trucks;
    const q = query.toLowerCase();
    return trucks.filter(t =>
      t.name?.toLowerCase().includes(q) ||
      t.cuisine_type?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  }, [trucks, query]);

  return (
    <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-24">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search trucks, cuisines..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10 bg-secondary border-0 rounded-xl h-10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-2">🔍</p>
          <p className="text-muted-foreground text-sm">No trucks found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(truck => (
            <TruckCard key={truck.id} truck={truck} />
          ))}
        </div>
      )}
    </div>
  );
}