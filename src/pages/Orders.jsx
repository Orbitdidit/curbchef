import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ChefHat, CheckCircle, QrCode } from 'lucide-react';

const statusConfig = {
  placed: { icon: Package, label: 'Order Placed', color: 'text-chart-4', step: 1 },
  preparing: { icon: ChefHat, label: 'Preparing', color: 'text-accent', step: 2 },
  ready: { icon: CheckCircle, label: 'Ready for Pickup', color: 'text-primary', step: 3 },
  picked_up: { icon: CheckCircle, label: 'Picked Up', color: 'text-muted-foreground', step: 4 },
  cancelled: { icon: Package, label: 'Cancelled', color: 'text-destructive', step: 0 },
};

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Order.filter({ customer_email: user.email }, '-created_date');
    },
  });

  const activeOrders = orders.filter(o => ['placed', 'preparing', 'ready'].includes(o.status));
  const pastOrders = orders.filter(o => ['picked_up', 'cancelled'].includes(o.status));

  return (
    <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
      <h1 className="font-heading text-2xl font-bold mb-5">My Orders</h1>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-muted-foreground text-sm">No orders yet</p>
          <Link to="/" className="inline-block mt-4 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl text-sm font-semibold">
            Start Ordering
          </Link>
        </div>
      ) : (
        <>
          {activeOrders.length > 0 && (
            <div className="mb-6">
              <h2 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Active</h2>
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
              <h2 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">Past Orders</h2>
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
  );
}