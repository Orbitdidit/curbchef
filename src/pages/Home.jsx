import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import CategoryRow from '@/components/home/CategoryRow';
import DiscoveryHeader from '@/components/home/DiscoveryHeader';
import DiscoveryFeed from '@/components/home/DiscoveryFeed';
import useDiscoveryTrucks from '@/components/home/useDiscoveryTrucks';

export default function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { trucks: visibleTrucks, filteredTrucks, liveTrucks, isLoading, isError, refetch } = useDiscoveryTrucks(selectedCategory);
  const handleSearch = e => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery.trim())}` : '/search');
  };
  return (
    <div className="cc-discovery min-h-screen bg-discovery-bg pb-16">
      <DiscoveryHeader query={searchQuery} setQuery={setSearchQuery} onSearch={handleSearch} />
      <div className="mt-5"><CategoryRow selected={selectedCategory} onChange={setSelectedCategory} /></div>
      {isLoading ? <div role="status" className="mx-4 mt-5 h-72 rounded-3xl bg-discovery-surface motion-safe:animate-pulse"><span className="sr-only">Finding food trucks…</span></div> : isError ? <div role="alert" className="p-6 text-center"><p>We couldn’t load the trucks.</p><button onClick={() => refetch()} className="cc-action px-5 mt-4">Try again</button></div> : <DiscoveryFeed user={user} trucks={visibleTrucks} filteredTrucks={filteredTrucks} liveTrucks={liveTrucks} />}
    </div>
  );
}