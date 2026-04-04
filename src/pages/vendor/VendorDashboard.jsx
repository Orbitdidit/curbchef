import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Settings, Video, ShoppingBag, Map, BarChart3, Users, DollarSign } from 'lucide-react';

export default function VendorDashboard() {
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: trucks = [] } = useQuery({
    queryKey: ['vendor-truck'],
    queryFn: () => base44.entities.FoodTruck.filter({ owner_email: user?.email }),
    enabled: !!user?.email,
  });
  const truck = trucks[0];

  const { data: orders = [] } = useQuery({
    queryKey: ['vendor-orders', truck?.id],
    queryFn: () => base44.entities.Order.filter({ truck_id: truck.id }),
    enabled: !!truck?.id,
    refetchInterval: 15000,
  });

  const activeOrders = orders.filter(o => ['placed', 'preparing'].includes(o.status));

  const updateTruck = useMutation({
    mutationFn: (data) => base44.entities.FoodTruck.update(truck.id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-truck'] }),
  });

  if (!truck) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1517' }}>
        <div className="text-center px-8">
          <p className="text-5xl mb-4">🚛</p>
          <p className="font-heading font-bold text-lg mb-2" style={{ color: '#dff0e8' }}>No truck found</p>
          <p className="text-sm" style={{ color: '#bacbc0' }}>Your account isn't linked to a food truck yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dot-bg pb-10" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4"
        style={{ background: '#151d1f' }}
      >
        <div>
          <p className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>COMMAND CENTER</p>
          <p className="text-xs" style={{ color: '#bacbc0' }}>Operator #{user?.id?.slice(-4).toUpperCase()}</p>
        </div>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <Settings className="w-4 h-4" style={{ color: '#bacbc0' }} />
        </button>
      </div>

      <div className="px-5 pt-5">
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

        {/* Stats */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>TODAY'S STATS</p>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8' }}
            >
              + REAL-TIME
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
              onClick={() => updateTruck.mutate({ status: s })}
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
              { label: 'Update Menu', icon: ShoppingBag, to: '/vendor/menu' },
              { label: 'Post Clip', icon: Video, to: '/live' },
              { label: 'View Map', icon: Map, to: '/map' },
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

        {/* Active Orders */}
        <div>
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
    </div>
  );
}