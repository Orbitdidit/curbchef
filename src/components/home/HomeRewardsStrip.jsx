import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Gift } from 'lucide-react';

export default function HomeRewardsStrip({ user }) {
  const { data: rewards = [] } = useQuery({
    queryKey: ['rewards-me', user?.email],
    queryFn: () => base44.entities.Reward.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });
  if (!user) return null;
  return (
    <Link to="/rewards" className="mx-4 mt-6 p-5 rounded-2xl bg-discovery-amber text-discovery-dark flex items-center gap-3">
      <Gift className="w-6 h-6" /><div className="flex-1"><p className="font-heading font-extrabold">Good taste pays off.</p><p className="text-xs mt-1">{(rewards[0]?.points || 0).toLocaleString()} pts · <span className="capitalize">{rewards[0]?.tier || 'starter'} tier</span></p></div><ArrowUpRight className="w-5 h-5" />
    </Link>
  );
}