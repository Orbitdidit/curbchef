import React, { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ChefHat, CheckCircle, QrCode, ChevronRight, Star } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import PullIndicator from '@/components/layout/PullIndicator';
import AssistantNudge from '@/components/assistant/AssistantNudge';

const statusConfig = {
  placed: { icon: Package, label: 'Order Placed', color: 'text-chart-4', step: 1 },
  preparing: { icon: ChefHat, label: 'Preparing', color: 'text-accent', step: 2 },
  ready: { icon: CheckCircle, label: 'Ready for Pickup', color: 'text-primary', step: 3 },
  picked_up: { icon: CheckCircle, label: 'Picked Up', color: 'text-muted-foreground', step: 4 },
  cancelled: { icon: Package, label: 'Cancelled', color: 'text-destructive', step: 0 },
};

export default function Orders() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Order.filter({ customer_email: user.email }, '-created_date');
    },
  });

  const { data: nearbyTrucks = [] } = useQuery({
    queryKey: ['trucks-nearby'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }, '-rating', 6),
  });

  const onRefresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['my-orders'] }),
    [queryClient]
  );
  const { pullDist, refreshing } = usePullToRefresh({ onRefresh });

  const activeOrders = orders.filter(o => ['placed', 'preparing', 'ready'].includes(o.status));
  const pastOrders = orders.filter(o => ['picked_up', 'cancelled'].includes(o.status));

  return (
    <div className="min-h-screen pb-32" style={{ background: '#0d1517' }}>
      <PullIndicator pullDist={pullDist} refreshing={refreshing} />

      {/* Header */}
      <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-10"
        style={{ background: 'rgba(13,21,23,0.93)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.12)' }}>
        <h1 className="font-heading font-black text-xl" style={{ color: '#dff0e8' }}>Orders</h1>
      </div>

      <div className="px-5 pt-5">
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
        </div>
      ) : orders.length === 0 ? (
        <div>
          {/* Empty hero */}
          <div className="text-center py-10">
            <div className="text-5xl mb-3">🍽️</div>
            <h2 className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>No orders yet</h2>
            <p className="text-sm mb-5" style={{ color: '#bacbc0' }}>Find a truck and start your first order</p>
            <Link to="/">
              <button className="px-8 py-3.5 rounded-full font-heading font-black text-sm"
                style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 20px rgba(119,255,200,0.3)' }}>
                Browse Trucks Near You
              </button>
            </Link>
            <div className="mt-4">
              <AssistantNudge />
            </div>
          </div>

          {/* Nearby truck suggestions */}
          {nearbyTrucks.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#77ffc8' }}>TRUCKS NEAR YOU</p>
              <div className="flex flex-col gap-3">
                {nearbyTrucks.map(truck => (
                  <Link key={truck.id} to={`/truck/${truck.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: '#192123' }}>
                      <img src={truck.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=200'}
                        alt={truck.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-sm truncate" style={{ color: '#dff0e8' }}>{truck.name}</p>
                        <p className="text-xs capitalize" style={{ color: '#bacbc0' }}>{truck.cuisine_type?.replace('_', ' ')} • 15–20 min</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold" style={{ color: '#dff0e8' }}>{truck.rating?.toFixed(1) || '4.8'}</span>
                          {truck.status === 'open' && <span className="ml-1 text-[10px] font-bold" style={{ color: '#77ffc8' }}>● OPEN</span>}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}>
                        <ChevronRight className="w-4 h-4" style={{ color: '#003826' }} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {activeOrders.length > 0 && (
            <div className="mb-6">
              <h2 className="font-heading font-bold text-xs tracking-widest mb-3" style={{ color: '#77ffc8' }}>ACTIVE ORDERS</h2>
              <div className="space-y-3">
                {activeOrders.map(order => {
                  const config = statusConfig[order.status];
                  const StatusIcon = config.icon;
                  return (
                    <Link key={order.id} to={`/order/${order.id}`} className="block bg-card rounded-3xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-heading font-bold text-sm">{order.truck_name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {order.items?.length} item{order.items?.length > 1 ? 's' : ''} · ${order.total?.toFixed(2)}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1.5 ${config.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-xs font-bold">{config.label}</span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="flex gap-1">
                        {[1, 2, 3].map(step => (
                          <div
                            key={step}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              step <= config.step ? 'bg-primary' : 'bg-secondary'
                            }`}
                          />
                        ))}
                      </div>
                      {order.status === 'ready' && (
                        <div className="mt-3 flex items-center gap-2 bg-primary/10 rounded-xl px-3 py-2">
                          <QrCode className="w-4 h-4 text-primary" />
                          <span className="text-xs font-bold text-primary">Pickup Code: {order.pickup_code}</span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {pastOrders.length > 0 && (
            <div>
              <h2 className="font-heading font-bold text-xs tracking-widest mb-3 mt-6" style={{ color: '#bacbc0' }}>PAST ORDERS</h2>
              <div className="space-y-2">
                {pastOrders.map(order => (
                  <div key={order.id} className="bg-secondary/50 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{order.truck_name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">${order.total?.toFixed(2)} · {order.items?.length} items</p>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{order.status?.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}