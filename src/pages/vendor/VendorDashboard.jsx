import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Radio, DollarSign, ShoppingBag, Users, ChevronRight, Power } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function VendorDashboard() {
  const queryClient = useQueryClient();

  const { data: truck, isLoading } = useQuery({
    queryKey: ['my-truck'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const trucks = await base44.entities.FoodTruck.filter({ owner_email: user.email });
      return trucks[0];
    },
  });

  const toggleLive = useMutation({
    mutationFn: async () => {
      await base44.entities.FoodTruck.update(truck.id, { is_live: !truck.is_live });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-truck'] }),
  });

  const toggleStatus = useMutation({
    mutationFn: async (newStatus) => {
      await base44.entities.FoodTruck.update(truck.id, { status: newStatus });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-truck'] }),
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-5 text-center">
        <div className="text-5xl mb-3">🚚</div>
        <h2 className="font-heading font-bold text-xl mb-2">No Truck Found</h2>
        <p className="text-muted-foreground text-sm">You don't have a food truck registered yet.</p>
      </div>
    );
  }

  const statuses = ['open', 'closed', 'sold_out'];

  return (
    <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-xl font-bold">{truck.name}</h1>
          <p className="text-xs text-muted-foreground capitalize">{truck.cuisine_type?.replace('_', ' ')}</p>
        </div>
        <Link to="/" className="text-xs text-primary font-semibold">Customer View →</Link>
      </div>

      {/* Go Live */}
      <div className="bg-card rounded-3xl p-5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${truck.is_live ? 'bg-accent/15' : 'bg-secondary'}`}>
              <Radio className={`w-6 h-6 ${truck.is_live ? 'text-accent' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="font-heading font-bold text-sm">Go Live</p>
              <p className="text-xs text-muted-foreground">{truck.is_live ? 'Broadcasting to customers' : 'Start streaming'}</p>
            </div>
          </div>
          <Switch checked={truck.is_live} onCheckedChange={() => toggleLive.mutate()} />
        </div>
      </div>

      {/* Status */}
      <div className="bg-card rounded-3xl p-5 mb-4">
        <p className="font-heading font-bold text-sm mb-3 flex items-center gap-2">
          <Power className="w-4 h-4 text-primary" /> Truck Status
        </p>
        <div className="flex gap-2">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => toggleStatus.mutate(s)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                truck.status === s
                  ? s === 'open' ? 'bg-primary text-primary-foreground' :
                    s === 'sold_out' ? 'bg-accent text-accent-foreground' :
                    'bg-secondary text-secondary-foreground ring-1 ring-foreground/20'
                  : 'bg-secondary/50 text-muted-foreground'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {[
          { icon: DollarSign, label: 'Revenue', value: `$${(truck.total_revenue || 0).toLocaleString()}`, color: 'text-primary' },
          { icon: ShoppingBag, label: 'Orders', value: truck.total_orders || 0, color: 'text-accent' },
          { icon: Users, label: 'Followers', value: truck.followers_count || 0, color: 'text-chart-4' },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-2xl p-4 text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-1.5 ${stat.color}`} />
            <p className="font-heading font-bold text-lg">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        {[
          { label: 'Order Queue', path: '/vendor/orders', desc: 'Manage incoming orders' },
          { label: 'Menu', path: '/vendor/menu', desc: 'Edit your menu items' },
        ].map(link => (
          <Link key={link.path} to={link.path} className="flex items-center justify-between bg-card rounded-2xl p-4">
            <div>
              <p className="font-semibold text-sm">{link.label}</p>
              <p className="text-xs text-muted-foreground">{link.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}