import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, Truck, ShoppingBag, Users, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const { data: trucks = [] } = useQuery({
    queryKey: ['all-trucks'],
    queryFn: () => base44.entities.FoodTruck.list('-created_date'),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 50),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approved }) => {
      await base44.entities.FoodTruck.update(id, { is_approved: approved });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-trucks'] }),
  });

  const pendingTrucks = trucks.filter(t => !t.is_approved);
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-heading font-bold text-lg">Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {[
          { icon: Truck, label: 'Trucks', value: trucks.length, color: 'text-primary' },
          { icon: ShoppingBag, label: 'Orders', value: orders.length, color: 'text-accent' },
          { icon: DollarSign, label: 'Revenue', value: `$${totalRevenue.toFixed(0)}`, color: 'text-chart-3' },
          { icon: Users, label: 'Pending', value: pendingTrucks.length, color: 'text-chart-4' },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-2xl p-4">
            <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
            <p className="font-heading font-bold text-xl">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pending approvals */}
      <h2 className="font-heading font-bold text-base mb-3">Pending Approvals</h2>
      {pendingTrucks.length === 0 ? (
        <p className="text-muted-foreground text-sm bg-card rounded-2xl p-4 text-center">No pending approvals</p>
      ) : (
        <div className="space-y-2.5 mb-5">
          {pendingTrucks.map(truck => (
            <div key={truck.id} className="bg-card rounded-2xl p-4 flex items-center gap-3">
              {truck.image_url && <img src={truck.image_url} alt="" className="w-12 h-12 rounded-xl object-cover" />}
              <div className="flex-1">
                <p className="font-semibold text-sm">{truck.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{truck.cuisine_type?.replace('_', ' ')}</p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => approveMutation.mutate({ id: truck.id, approved: true })}
                  className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 text-primary" />
                </button>
                <button
                  onClick={() => approveMutation.mutate({ id: truck.id, approved: false })}
                  className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center"
                >
                  <XCircle className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent orders */}
      <h2 className="font-heading font-bold text-base mb-3">Recent Orders</h2>
      <div className="space-y-2">
        {orders.slice(0, 10).map(order => (
          <div key={order.id} className="bg-card rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">{order.truck_name}</p>
              <p className="text-xs text-muted-foreground">{order.customer_name} · {order.items?.length} items</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-primary">${order.total?.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{order.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}