import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Settings, Video, ShoppingBag, Map, BarChart3, Users, DollarSign, ChevronLeft, Pencil, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import DashboardDave from '@/components/vendor/DashboardDave';
import StripeConnectButton from '@/components/vendor/StripeConnectButton';
import VendorGate from '@/components/vendor/VendorGate';
import DropTokenCounter from '@/components/vendor/DropTokenCounter';
import CreateCurbDropModal from '@/components/drops/CreateCurbDropModal';
import TodaysHours from '@/components/vendor/TodaysHours';
import ReliabilityCard from '@/components/vendor/ReliabilityCard';

function VendorDashboardInner({ truck: initialTruck, user }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showDropModal, setShowDropModal] = useState(false);

  const { data: trucks = [initialTruck] } = useQuery({
    queryKey: ['vendor-truck'],
    queryFn: () => base44.entities.FoodTruck.filter({ owner_email: user?.email }),
    enabled: !!user?.email,
    initialData: [initialTruck],
  });
  const truck = trucks[0] || initialTruck;

  const { data: orders = [] } = useQuery({
    queryKey: ['vendor-orders', truck?.id],
    queryFn: () => base44.entities.Order.filter({ truck_id: truck.id }),
    enabled: !!truck?.id,
    refetchInterval: 15000,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['vendor-menu', truck?.id],
    queryFn: () => base44.entities.MenuItem.filter({ truck_id: truck.id }),
    enabled: !!truck?.id,
  });

  const activeOrders = orders.filter(o => ['placed', 'preparing'].includes(o.status));

  // Show success toast if returning from token pack purchase
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token_pack') === 'success') {
      toast({ title: '🎟️ Token Pack added! +3 drops this week.', duration: 4000 });
      window.history.replaceState({}, '', '/vendor');
      qc.invalidateQueries({ queryKey: ['vendor-truck'] });
    }
  }, []);

  const updateTruck = useMutation({
    mutationFn: (data) => base44.entities.FoodTruck.update(truck.id, data),
    onMutate: async (newData) => {
      await qc.cancelQueries({ queryKey: ['vendor-truck'] });
      const prev = qc.getQueryData(['vendor-truck']);
      qc.setQueryData(['vendor-truck'], (old = []) =>
        old.map(t => t.id === truck.id ? { ...t, ...newData } : t)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(['vendor-truck'], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['vendor-truck'] }),
  });

  return (
    <div className="min-h-screen dot-bg pb-10" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4"
        style={{ background: '#151d1f' }}
      >
        <Link to="/vendor-portal" className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#192123' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
        </Link>
        <div className="flex-1">
          <p className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>COMMAND CENTER</p>
          <p className="text-xs" style={{ color: '#bacbc0' }}>Operator #{user?.id?.slice(-4).toUpperCase()}</p>
        </div>
        <Link to="/vendor/profile" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <Pencil className="w-4 h-4" style={{ color: '#bacbc0' }} />
        </Link>
      </div>

      {/* Desktop: 2-col grid; mobile: single column */}
      <div className="px-5 pt-5 lg:max-w-5xl lg:mx-auto lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:items-start">
        {/* Truck identity */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-heading font-black text-xl" style={{ color: '#dff0e8' }}>{truck.name}</h1>
            <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>
              @{truck.slug || truck.name.toLowerCase().replace(/\s/g, '')} • {truck.cuisine_type?.replace('_', ' ')}
            </p>
          </div>
          {/* Go Live toggle */}
          <div className="flex flex-col items-end gap-1">
            <p className="text-[10px] font-bold" style={{ color: truck.is_live ? '#77ffc8' : '#bacbc0' }}>
              {truck.is_live ? 'LIVE NOW' : 'GO LIVE'}
            </p>
            <button
              onClick={() => updateTruck.mutate({ is_live: !truck.is_live })}
              className="relative w-14 h-7 rounded-full transition-all"
              style={{
                background: truck.is_live ? 'linear-gradient(135deg,#77ffc8,#00e6a7)' : '#192123',
                boxShadow: truck.is_live ? '0 0 12px rgba(119,255,200,0.4)' : 'none',
              }}
            >
              <div
                className="absolute top-0.5 w-6 h-6 rounded-full transition-all"
                style={{
                  background: '#fff',
                  left: truck.is_live ? 'calc(100% - 26px)' : '2px',
                }}
              />
            </button>
          </div>
        </div>

        {/* Go Live CTA */}
        {!truck.is_live && (
          <button
            onClick={() => updateTruck.mutate({ is_live: true, status: 'open' })}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl mb-5 font-heading font-black text-base"
            style={{
              background: 'linear-gradient(135deg, #77ffc8 0%, #00e6a7 100%)',
              color: '#003826',
              boxShadow: '0 0 24px rgba(119,255,200,0.35)',
            }}
          >
            <Video className="w-5 h-5" />
            GO LIVE
            <span className="text-xs font-semibold opacity-70 ml-1">Connect with 1.2K nearby foodies</span>
          </button>
        )}

        {/* Plan badge + Drop Tokens */}
        <div className="flex gap-2 mb-3">
          <Link to="/vendor/plans" className="flex-1 flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(119,255,200,0.06)', border: '1px solid rgba(119,255,200,0.15)' }}>
            <div>
              <p className="text-[10px] font-bold tracking-widest" style={{ color: '#bacbc0' }}>YOUR PLAN</p>
              <p className="font-heading font-black text-sm capitalize" style={{ color: '#77ffc8' }}>{truck.vendor_plan || 'Free'}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" style={{ color: '#77ffc8' }} />
              <span className="font-bold text-sm" style={{ color: '#77ffc8' }}>{truck.boost_credits || 0} credits</span>
            </div>
          </Link>
        </div>

        {/* Curb Drop Token Counter + Create Drop */}
        <DropTokenCounter truck={truck} />
        <button
          onClick={() => setShowDropModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl mb-5 font-heading font-black text-sm transition-all active:scale-95"
          style={{
            background: (truck.drop_tokens ?? 0) > 0
              ? 'linear-gradient(135deg,rgba(253,89,30,0.15),rgba(253,89,30,0.08))'
              : '#192123',
            color: (truck.drop_tokens ?? 0) > 0 ? '#fd591e' : '#bacbc0',
            border: `1px solid ${(truck.drop_tokens ?? 0) > 0 ? 'rgba(253,89,30,0.35)' : 'rgba(59,74,66,0.2)'}`,
          }}>
          🪂 Create Curb Drop
          {(truck.drop_tokens ?? 0) > 0
            ? <span className="text-xs font-semibold opacity-70 ml-1">— 1 token</span>
            : <span className="text-xs opacity-50 ml-1">— no tokens</span>
          }
        </button>

        {/* Reliability Score Card */}
        <ReliabilityCard truck={truck} />

        {/* Today's Hours */}
        <TodaysHours
          truck={truck}
          onUpdate={async (data) => {
            // If vendor is closing early before scheduled close, track it
            if (data.status === 'closed' && truck.scheduled_close_time) {
              const [h, m] = truck.scheduled_close_time.split(':').map(Number);
              const closeDate = new Date();
              closeDate.setHours(h, m, 0, 0);
              if (new Date() < closeDate) {
                data.early_close_count = (truck.early_close_count || 0) + 1;
              }
            }
            return updateTruck.mutate(data);
          }}
        />

        {/* Stripe Connect */}
        <div className="mb-5">
          <StripeConnectButton
            truck={truck}
            onStatusUpdate={(status) => qc.invalidateQueries({ queryKey: ['vendor-truck'] })}
          />
        </div>

        {/* Earnings breakdown — only shown if Stripe connected */}
        {truck.stripe_onboarding_status === 'payouts_enabled' && (
          <div className="mb-5 p-4 rounded-2xl" style={{ background: '#192123', border: '1px solid rgba(119,255,200,0.1)' }}>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>EARNINGS BREAKDOWN</p>
              {orders.some(o => o.is_test_payment) && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>TEST MODE</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'GROSS SALES', value: `$${orders.reduce((s, o) => s + (o.gross_amount || o.total || 0), 0).toFixed(2)}` },
                { label: 'NET EARNINGS', value: `$${orders.reduce((s, o) => s + (o.vendor_net_amount || o.total || 0), 0).toFixed(2)}`, highlight: true },
                { label: 'PLATFORM FEES', value: `$${orders.reduce((s, o) => s + (o.platform_fee_amount || 0), 0).toFixed(2)}` },
                { label: 'PAID ORDERS', value: orders.filter(o => o.stripe_payment_intent_id).length },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="p-3 rounded-xl" style={{ background: '#0d1517' }}>
                  <p className="text-[10px] font-bold tracking-wide mb-1" style={{ color: '#bacbc0' }}>{label}</p>
                  <p className="font-heading font-black text-base" style={{ color: highlight ? '#77ffc8' : '#dff0e8' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>TODAY'S STATS</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8' }}>
              REAL-TIME
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'REVENUE', value: `$${(truck.total_revenue || 0).toLocaleString()}`, icon: DollarSign },
              { label: 'ORDERS', value: truck.total_orders || 0, icon: ShoppingBag },
              { label: 'FOLLOWERS', value: `+${truck.followers_count || 0}`, icon: Users },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="p-3 rounded-2xl text-center" style={{ background: '#192123' }}>
                <p className="text-[10px] font-bold tracking-wide mb-1" style={{ color: '#bacbc0' }}>{label}</p>
                <p className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Status toggle */}
        <div className="flex gap-2 mb-5">
          {['open', 'closed', 'sold_out'].map(s => (
            <button
              key={s}
              onClick={() => {
                const data = { status: s };
                if (s === 'closed' && truck.scheduled_close_time) {
                  const [h, m] = truck.scheduled_close_time.split(':').map(Number);
                  const closeDate = new Date();
                  closeDate.setHours(h, m, 0, 0);
                  if (new Date() < closeDate) {
                    data.early_close_count = (truck.early_close_count || 0) + 1;
                  }
                }
                updateTruck.mutate(data);
              }}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase transition-all"
              style={truck.status === s
                ? {
                  background: s === 'open'
                    ? 'linear-gradient(135deg,#77ffc8,#00e6a7)'
                    : s === 'sold_out'
                    ? 'rgba(253,89,30,0.2)'
                    : '#2e3638',
                  color: s === 'open' ? '#003826' : s === 'sold_out' ? '#fd591e' : '#bacbc0',
                  boxShadow: s === 'open' ? '0 0 12px rgba(119,255,200,0.25)' : 'none',
                }
                : { background: '#192123', color: '#bacbc0' }
              }
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-5">
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#77ffc8' }}>QUICK ACTIONS</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Edit Menu', icon: ShoppingBag, to: '/vendor/menu' },
              { label: 'Edit Profile', icon: Pencil, to: '/vendor/profile' },
              { label: 'Plans & Boosts', icon: Zap, to: '/vendor/plans' },
            ].map(({ label, icon: Icon, to }) => (
              <Link
                key={label}
                to={to}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl"
                style={{ background: '#192123' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(119,255,200,0.1)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#77ffc8' }} />
                </div>
                <span className="text-[10px] font-semibold text-center" style={{ color: '#bacbc0' }}>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Dashboard Dave */}
        <DashboardDave truck={truck} menuItems={menuItems} />

        {/* Right column on desktop — Active Orders */}
        <div className="lg:pt-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>
              ACTIVE ORDERS ({activeOrders.length})
            </p>
            <Link to="/vendor/orders" className="text-xs font-semibold" style={{ color: '#77ffc8' }}>View history</Link>
          </div>
          {activeOrders.length === 0 ? (
            <div className="py-8 text-center" style={{ background: '#192123', borderRadius: '1rem' }}>
              <p className="text-sm" style={{ color: '#bacbc0' }}>No active orders</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeOrders.slice(0, 3).map(order => (
                <div key={order.id} className="p-4 rounded-2xl" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>
                        #{order.pickup_code || order.id.slice(-4).toUpperCase()}
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: order.status === 'placed' ? 'rgba(119,255,200,0.15)' : 'rgba(253,89,30,0.15)',
                          color: order.status === 'placed' ? '#77ffc8' : '#fd591e',
                        }}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <Link
                      to="/vendor/orders"
                      className="py-1.5 px-4 rounded-full text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}
                    >
                      {order.status === 'placed' ? 'ACCEPT' : 'READY'}
                    </Link>
                  </div>
                  <p className="text-xs" style={{ color: '#bacbc0' }}>
                    {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Drop Modal */}
      {showDropModal && (
        <CreateCurbDropModal truck={truck} onClose={() => setShowDropModal(false)} />
      )}
    </div>
  );
}

export default function VendorDashboard() {
  return (
    <VendorGate>
      {({ truck, user }) => <VendorDashboardInner truck={truck} user={user} />}
    </VendorGate>
  );
}