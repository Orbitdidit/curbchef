import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronLeft, Bell, Search, Clock, DollarSign, Plus, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import OrderEtaBadge from '@/components/vendor/OrderEtaBadge';

function etaMinsLeft(order) {
  if (!order.customer_eta_set_at || order.customer_eta_minutes == null) return null;
  const setAt = new Date(order.customer_eta_set_at).getTime();
  const arrivalMs = setAt + order.customer_eta_minutes * 60 * 1000;
  return Math.max(0, Math.round((arrivalMs - Date.now()) / 60000));
}

function OrderCard({ order, advance }) {
  const [, tick] = React.useState(0);
  useEffect(() => {
    const id = setInterval(() => tick(t => t + 1), 15000);
    return () => clearInterval(id);
  }, []);

  const arrived = order.customer_eta_type === 'arrived';
  const minsLeft = etaMinsLeft(order);
  let borderColor = 'rgba(59,74,66,0.2)';
  let bg = '#192123';
  if (arrived) { borderColor = 'rgba(119,255,200,0.5)'; bg = 'rgba(119,255,200,0.04)'; }
  else if (minsLeft !== null && minsLeft <= 5) { borderColor = 'rgba(253,89,30,0.6)'; bg = 'rgba(253,89,30,0.04)'; }
  else if (minsLeft !== null && minsLeft <= 10) { borderColor = 'rgba(251,191,36,0.5)'; bg = 'rgba(251,191,36,0.03)'; }

  return (
    <div className="p-4 rounded-3xl" style={{ background: bg, border: `1px solid ${borderColor}` }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-bold tracking-wide" style={{ color: '#bacbc0' }}>ORDER ID</p>
          <p className="font-heading font-black text-xl" style={{ color: '#77ffc8' }}>
            #{order.pickup_code || order.id.slice(-4).toUpperCase()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold" style={{ color: '#bacbc0' }}>RECEIVED</p>
          <p className="text-xs font-semibold" style={{ color: '#dff0e8' }}>
            {new Date(order.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {order.customer_eta_type && (
        <div className="mb-3">
          <OrderEtaBadge order={order} />
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: 'rgba(119,255,200,0.12)', color: '#77ffc8' }}>
          {order.customer_name?.charAt(0) || 'C'}
        </div>
        <p className="text-sm font-semibold" style={{ color: '#dff0e8' }}>{order.customer_name || order.customer_email}</p>
      </div>

      <div className="mb-4">
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-bold" style={{ color: '#dff0e8' }}>{item.quantity}x {item.name}</span>
            {item.add_ons?.map(a => (
              <span key={a.name} className="text-xs italic" style={{ color: '#77ffc8' }}>{a.name}</span>
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => advance.mutate(order)}
          className="flex-1 py-3 rounded-2xl font-heading font-black text-sm"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 14px rgba(119,255,200,0.3)' }}
        >
          {BTN_LABEL[order.status]}
        </button>
        <button className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#2e3638' }}>
          <Phone className="w-4 h-4" style={{ color: '#bacbc0' }} />
        </button>
      </div>
    </div>
  );
}

const STATUS_TABS = [
  { key: 'placed', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
];

const NEXT = { placed: 'preparing', preparing: 'ready', ready: 'picked_up' };
const BTN_LABEL = { placed: 'Prepare Order', preparing: 'Mark as Ready', ready: 'Picked Up' };

export default function VendorOrders() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('placed');

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: trucks = [] } = useQuery({
    queryKey: ['vendor-truck'],
    queryFn: () => base44.entities.FoodTruck.filter({ owner_email: user?.email }),
    enabled: !!user?.email,
  });
  const truck = trucks[0];

  const { data: orders = [] } = useQuery({
    queryKey: ['vendor-orders', truck?.id],
    queryFn: () => base44.entities.Order.filter({ truck_id: truck.id }, '-created_date'),
    enabled: !!truck?.id,
    refetchInterval: 8000,
  });

  const advance = useMutation({
    mutationFn: (order) => base44.entities.Order.update(order.id, { status: NEXT[order.status] }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-orders'] }),
  });

  const tabOrders = orders.filter(o => o.status === activeTab);
  const newCount = orders.filter(o => o.status === 'placed').length;
  const prepCount = orders.filter(o => o.status === 'preparing').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;
  const countMap = { placed: newCount, preparing: prepCount, ready: readyCount };

  const totalRevToday = orders.reduce((s, o) => s + (o.total || 0), 0);

  // 🔔 New order notification — sound + browser alert
  const { toast } = useToast();
  const prevNewCount = useRef(newCount);

  // 🔔 Customer arrived notification
  const prevArrivedIds = useRef(new Set());
  useEffect(() => {
    const arrivedOrders = orders.filter(o => o.customer_eta_type === 'arrived');
    arrivedOrders.forEach(o => {
      if (!prevArrivedIds.current.has(o.id)) {
        const code = o.pickup_code || o.id.slice(-4).toUpperCase();
        toast({ title: `👋 Customer ${code} has arrived!`, description: 'Their order should be ready for pickup.', duration: 8000 });
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`CurbChef — Customer Arrived 👋`, { body: `Customer #${code} has arrived for pickup` });
        }
      }
    });
    prevArrivedIds.current = new Set(arrivedOrders.map(o => o.id));
  }, [orders]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (newCount > prevNewCount.current && prevNewCount.current >= 0) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } catch (e) {}
      toast({ title: '🔔 New order!', description: `${newCount} order(s) waiting to be accepted`, duration: 5000 });
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('CurbChef — New Order! 🚐', { body: `You have ${newCount} new order(s) waiting` });
      }
    }
    prevNewCount.current = newCount;
  }, [newCount]);
  return (
    <div className="min-h-screen dot-bg" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4" style={{ background: '#151d1f' }}>
        <div className="flex items-center gap-3">
          <Link to="/vendor" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
            <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-base" style={{ color: '#dff0e8' }}>Order Queue</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
            <Search className="w-4 h-4" style={{ color: '#bacbc0' }} />
          </button>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ background: '#192123' }}>
            <Bell className="w-4 h-4" style={{ color: '#bacbc0' }} />
            {newCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white" style={{ background: '#fd591e' }}>
                {newCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Pills */}
      <div className="flex gap-2 px-5 py-4">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all"
            style={activeTab === tab.key
              ? { background: tab.key === 'placed' ? '#fd591e' : 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: tab.key === 'placed' ? 'white' : '#003826', boxShadow: tab.key === 'placed' ? '0 0 12px rgba(253,89,30,0.4)' : '0 0 12px rgba(119,255,200,0.3)' }
              : { background: '#192123', color: '#bacbc0' }
            }
          >
            {tab.label}
            {countMap[tab.key] > 0 && (
              <span
                className="text-[10px] font-black px-1.5 rounded-full"
                style={{ background: activeTab === tab.key ? 'rgba(0,0,0,0.2)' : '#2e3638', color: activeTab === tab.key ? 'currentColor' : '#bacbc0' }}
              >
                {countMap[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="px-5 flex flex-col gap-4 pb-10">
        {tabOrders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-2">✅</p>
            <p className="text-sm" style={{ color: '#bacbc0' }}>No {activeTab} orders</p>
          </div>
        ) : (
          tabOrders.map(order => (
            <OrderCard key={order.id} order={order} advance={advance} />
          ))
        )}
      </div>

      {/* Footer stats */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center px-5 pb-4 pt-3 z-50"
        style={{ background: 'rgba(13,21,23,0.95)', backdropFilter: 'blur(16px)' }}
      >
        <div className="w-full max-w-lg grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-2xl" style={{ background: '#192123' }}>
            <p className="text-[10px] font-bold tracking-wide" style={{ color: '#bacbc0' }}>QUEUE TIME</p>
            <p className="font-heading font-black text-2xl" style={{ color: '#dff0e8' }}>18 min</p>
          </div>
          <div className="text-center p-3 rounded-2xl flex items-center justify-between px-4" style={{ background: '#192123' }}>
            <div>
              <p className="text-[10px] font-bold tracking-wide" style={{ color: '#bacbc0' }}>HOURLY REVENUE</p>
              <p className="font-heading font-black text-2xl" style={{ color: '#77ffc8' }}>${Math.round(totalRevToday)}</p>
            </div>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: '#fd591e', boxShadow: '0 0 12px rgba(253,89,30,0.4)' }}
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}