import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Clock, ChefHat } from 'lucide-react';

export default function VendorOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['vendor-orders'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const trucks = await base44.entities.FoodTruck.filter({ owner_email: user.email });
      if (!trucks[0]) return [];
      return base44.entities.Order.filter({ truck_id: trucks[0].id }, '-created_date');
    },
    refetchInterval: 10000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.Order.update(id, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendor-orders'] }),
  });

  const activeOrders = orders.filter(o => ['placed', 'preparing'].includes(o.status));
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/vendor')} className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading font-bold text-lg">Order Queue</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {activeOrders.length > 0 && (
            <div className="mb-5">
              <h2 className="font-heading font-bold text-sm text-accent uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Active ({activeOrders.length})
              </h2>
              <div className="space-y-3">
                {activeOrders.map(order => (
                  <div key={order.id} className="bg-card rounded-3xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-heading font-bold text-sm">{order.customer_name || 'Customer'}</p>
                        <p className="text-[10px] text-muted-foreground">Code: {order.pickup_code}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        order.status === 'placed' ? 'bg-chart-4/15 text-chart-4' : 'bg-accent/15 text-accent'
                      }`}>
                        {order.status === 'placed' ? 'NEW' : 'PREPARING'}
                      </span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items?.map((item, i) => (
                        <p key={i} className="text-xs text-muted-foreground">{item.quantity}x {item.name}</p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-primary">${order.total?.toFixed(2)}</span>
                      <div className="flex gap-2">
                        {order.status === 'placed' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: order.id, status: 'preparing' })}
                            className="flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-xl text-xs font-bold"
                          >
                            <ChefHat className="w-3.5 h-3.5" /> Start Preparing
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateStatus.mutate({ id: order.id, status: 'ready' })}
                            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Mark Ready
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {readyOrders.length > 0 && (
            <div className="mb-5">
              <h2 className="font-heading font-bold text-sm text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Ready ({readyOrders.length})
              </h2>
              <div className="space-y-2">
                {readyOrders.map(order => (
                  <div key={order.id} className="bg-primary/5 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{order.customer_name || 'Customer'}</p>
                      <p className="text-xs text-primary font-bold">Code: {order.pickup_code}</p>
                    </div>
                    <button
                      onClick={() => updateStatus.mutate({ id: order.id, status: 'picked_up' })}
                      className="text-xs font-bold text-muted-foreground bg-secondary px-3 py-2 rounded-xl"
                    >
                      Picked Up
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orders.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-muted-foreground text-sm">No orders yet</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}