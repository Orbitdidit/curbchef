import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Settings, Bell, Users, Radio, AlertTriangle, Layout, ChevronLeft, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminQuickAddTruck from '@/components/admin/AdminQuickAddTruck';
import ApplicationsPanel from '@/components/admin/ApplicationsPanel';
import { useToast } from '@/components/ui/use-toast';

// 🔒 ADD YOUR ADMIN EMAIL(S) HERE
const ADMIN_EMAILS = ['orbitdidit@gmail.com'];

export default function AdminDashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [timedOut, setTimedOut] = useState(false);

  const { data: adminUser, isLoading: adminLoading, isError: adminError } = useQuery({
    queryKey: ['admin-me'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const isAdmin = !!adminUser && ADMIN_EMAILS.includes(adminUser.email);

  // 5-second timeout if auth never resolves
  useEffect(() => {
    const t = setTimeout(() => {
      if (!adminUser) {
        setTimedOut(true);
        base44.auth.redirectToLogin(window.location.pathname);
      }
    }, 5000);
    return () => clearTimeout(t);
  }, [adminUser]);

  const { data: trucks = [] } = useQuery({
    queryKey: ['admin-trucks'],
    queryFn: () => base44.entities.FoodTruck.list(),
    enabled: isAdmin,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 20),
    enabled: isAdmin,
  });

  const approveTruck = useMutation({
    mutationFn: (id) => base44.entities.FoodTruck.update(id, { is_approved: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-trucks'] }),
  });

  const toggleLaunchOverride = useMutation({
    mutationFn: ({ id, override }) => base44.entities.FoodTruck.update(id, { launch_ready_override: override, launch_ready: override }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-trucks'] }),
  });

  const { data: pendingApplications = [] } = useQuery({
    queryKey: ['pending-applications-count'],
    queryFn: () => base44.entities.TruckOnboarding.filter({ status: 'submitted' }),
    enabled: isAdmin,
  });

  // Not authorized (user loaded but not in ADMIN_EMAILS)
  if (!adminLoading && adminUser && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-8 text-center" style={{ background: '#0d1517' }}>
        <p className="text-4xl">🔒</p>
        <p className="font-heading font-bold text-lg" style={{ color: '#dff0e8' }}>Not Authorized</p>
        <p className="text-sm" style={{ color: '#bacbc0' }}>You don't have admin access.</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 rounded-full font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
          Back to Home
        </button>
      </div>
    );
  }

  // Auth error
  if (adminError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-8 text-center" style={{ background: '#0d1517' }}>
        <p className="text-4xl">⚠️</p>
        <p className="font-heading font-bold text-lg" style={{ color: '#dff0e8' }}>Authentication Error</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 rounded-full font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
          Back to Home
        </button>
      </div>
    );
  }

  // Still loading
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1517' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
      </div>
    );
  }

  const pendingTrucks = trucks.filter(t => !t.is_approved);
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const liveTrucks = trucks.filter(t => t.is_live).length;

  return (
    <div className="min-h-screen dot-bg" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-0 lg:max-w-5xl lg:mx-auto" style={{ background: '#151d1f' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#192123' }}>
              <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
            </button>
            <div>
              <p className="font-heading font-bold text-base" style={{ color: '#dff0e8' }}>Admin</p>
              <p className="text-xs" style={{ color: '#bacbc0' }}>Platform Overview</p>
            </div>
          </div>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
            <Bell className="w-4 h-4" style={{ color: '#bacbc0' }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 pb-0">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'applications', label: 'Applications', badge: pendingApplications.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all"
              style={activeTab === tab.id
                ? { background: '#0d1517', color: '#77ffc8', borderTop: '2px solid #77ffc8' }
                : { background: 'transparent', color: '#bacbc0' }
              }
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: '#fbbf24', color: '#0d1517' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="px-5 pt-5 pb-16 lg:max-w-5xl lg:mx-auto">
          <ApplicationsPanel />
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && <div className="px-5 pt-5 pb-16 lg:max-w-5xl lg:mx-auto lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* CMS Quick Access */}
        <Link to="/admin/launch">
          <div className="flex items-center gap-3 p-4 rounded-2xl mb-3"
            style={{ background: 'rgba(253,89,30,0.06)', border: '1px solid rgba(253,89,30,0.2)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(253,89,30,0.12)' }}>
              <Rocket className="w-4 h-4" style={{ color: '#fd591e' }} />
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>Launch Command Center</p>
              <p className="text-xs" style={{ color: '#bacbc0' }}>Track launch readiness & blockers</p>
            </div>
            <span className="text-xs font-bold" style={{ color: '#fd591e' }}>Open →</span>
          </div>
        </Link>
        <Link to="/admin/homepage">
          <div
            className="flex items-center gap-3 p-4 rounded-2xl mb-5"
            style={{ background: 'rgba(119,255,200,0.06)', border: '1px solid rgba(119,255,200,0.2)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(119,255,200,0.12)' }}>
              <Layout className="w-4 h-4" style={{ color: '#77ffc8' }} />
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>Homepage CMS</p>
              <p className="text-xs" style={{ color: '#bacbc0' }}>Edit videos, promo cards & copy</p>
            </div>
            <span className="text-xs font-bold" style={{ color: '#77ffc8' }}>Edit →</span>
          </div>
        </Link>

        {/* Platform Stats */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>PLATFORM STATS</p>
          <span
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8' }}
          >
            Live Data
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Active Vendors', value: trucks.filter(t => t.is_approved).length, icon: Users, trend: '+12%' },
            { label: 'Live Streams', value: liveTrucks, icon: Radio, hot: true },
          ].map(({ label, value, icon: Icon, trend, hot }) => (
            <div key={label} className="p-4 rounded-3xl" style={{ background: '#192123' }}>
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(119,255,200,0.1)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: '#77ffc8' }} />
                </div>
                {trend && <span className="text-[10px] font-bold" style={{ color: '#77ffc8' }}>{trend}</span>}
                {hot && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />}
              </div>
              <p className="font-heading font-black text-3xl" style={{ color: '#dff0e8' }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: '#bacbc0' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Total Orders */}
        <div
          className="p-5 rounded-3xl mb-5 flex items-center justify-between"
          style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}
        >
          <div>
            <p className="text-[10px] font-bold tracking-widest" style={{ color: '#bacbc0' }}>TOTAL ORDERS (TODAY)</p>
            <p className="font-heading font-black text-4xl mt-1" style={{ color: '#dff0e8' }}>
              {orders.length.toLocaleString()}
            </p>
          </div>
          <div className="flex gap-1 items-end h-10">
            {[3, 5, 4, 7, 6, 8, 9].map((h, i) => (
              <div
                key={i}
                className="w-3 rounded-sm"
                style={{
                  height: `${h * 10}%`,
                  background: i === 6 ? '#77ffc8' : 'rgba(119,255,200,0.2)',
                  minHeight: '6px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Admin Quick Add */}
        {pendingTrucks.length === 0 && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>ONBOARD A VENDOR</p>
            <AdminQuickAddTruck />
          </div>
        )}

        {/* Pending Approvals */}
        {pendingTrucks.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>PENDING APPROVALS</p>
              <AdminQuickAddTruck />
            </div>
            <div className="flex flex-col gap-3">
              {pendingTrucks.slice(0, 3).map(truck => (
                <div
                  key={truck.id}
                  className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: '#2e3638', color: '#77ffc8' }}
                  >
                    {truck.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-sm truncate" style={{ color: '#dff0e8' }}>{truck.name}</p>
                    <p className="text-xs" style={{ color: '#bacbc0' }}>New Vendor Application</p>
                  </div>
                  <button
                    onClick={() => approveTruck.mutate(truck.id)}
                    className="px-4 py-2 rounded-full text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flagged Content */}
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#77ffc8' }}>FLAGGED CONTENT</p>
          <div className="flex flex-col gap-3">
            {[
              { type: 'report', title: 'Inappropriate Content Report', sub: 'Comment on "Spicy Wings" — User reported this review for hate speech...', time: '2m ago', actions: ['Ignore', 'Moderate'], actionColor: ['#2e3638', '#fd591e'] },
              { type: 'live', title: 'Late Night Grill Stream', sub: '"Potential copyright music violation detected..."', time: '30m ago', actions: ['Ignore', 'Shutdown'], actionColor: ['#2e3638', '#fd591e'] },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl"
                style={{ background: '#192123', border: '1px solid rgba(253,89,30,0.15)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#fd591e' }} />
                  <span className="text-xs font-bold" style={{ color: '#fd591e' }}>
                    {item.type === 'live' ? '● LIVE' : '⚑'}
                  </span>
                  <span className="font-semibold text-xs flex-1" style={{ color: '#dff0e8' }}>{item.title}</span>
                  <span className="text-[10px]" style={{ color: '#bacbc0' }}>{item.time}</span>
                </div>
                <p className="text-xs mb-3" style={{ color: '#bacbc0' }}>{item.sub}</p>
                <div className="flex gap-2">
                  {item.actions.map((action, j) => (
                    <button
                      key={action}
                      className="flex-1 py-2 rounded-xl text-xs font-bold"
                      style={{ background: item.actionColor[j], color: j === 0 ? '#bacbc0' : 'white' }}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment mode indicator */}
        {orders.some(o => o.is_test_payment) && (
          <div className="mt-5 p-3 rounded-2xl flex items-center gap-3"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
            <span className="text-[10px] font-black px-2 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>TEST MODE</span>
            <p className="text-xs" style={{ color: '#fbbf24' }}>App is running Stripe in test mode. Switch to live keys when ready.</p>
          </div>
        )}

        {/* Payment stats */}
        <div className="mt-5">
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#77ffc8' }}>PLATFORM FEES COLLECTED</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Total Platform Revenue', value: `$${orders.reduce((s, o) => s + (o.platform_fee_amount || 0), 0).toFixed(2)}` },
              { label: 'Paid via Stripe', value: orders.filter(o => o.stripe_payment_intent_id || o.stripe_checkout_session_id).length },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 rounded-2xl" style={{ background: '#192123' }}>
                <p className="text-[10px] font-bold tracking-wide mb-1" style={{ color: '#bacbc0' }}>{label}</p>
                <p className="font-heading font-black text-2xl" style={{ color: '#77ffc8' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor payment status */}
        <div className="mt-2">
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#77ffc8' }}>VENDOR PAYMENT STATUS</p>
          <div className="flex flex-col gap-2 mb-5">
            {trucks.filter(t => t.is_approved).slice(0, 6).map(truck => {
              const statusColors = {
                payouts_enabled: '#77ffc8',
                charges_enabled: '#fbbf24',
                onboarding_started: '#fd591e',
                not_connected: '#bacbc0',
              };
              const s = truck.stripe_onboarding_status || 'not_connected';
              return (
                <div key={truck.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#192123' }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColors[s] }} />
                  <p className="flex-1 text-sm font-semibold truncate" style={{ color: '#dff0e8' }}>{truck.name}</p>
                  <span className="text-[10px] font-bold" style={{ color: statusColors[s] }}>
                    {s.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Admin: Launch Ready Override */}
        <div className="mt-2">
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#fbbf24' }}>LAUNCH READY OVERRIDE</p>
          <p className="text-xs mb-3" style={{ color: '#bacbc0' }}>Manually mark trucks as launch-ready (bypasses the 8-step checklist).</p>
          <div className="flex flex-col gap-2 mb-5">
            {trucks.filter(t => t.is_approved).map(truck => (
              <div key={truck.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: '#192123', border: truck.launch_ready_override ? '1px solid rgba(251,191,36,0.3)' : '1px solid transparent' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#dff0e8' }}>{truck.name}</p>
                  <p className="text-[10px]" style={{ color: truck.launch_ready ? '#77ffc8' : '#bacbc0' }}>
                    {truck.launch_ready ? '✓ Launch Ready' : '○ Not Ready'}
                    {truck.launch_ready_override ? ' (admin override)' : ''}
                  </p>
                </div>
                <button
                  onClick={() => toggleLaunchOverride.mutate({ id: truck.id, override: !truck.launch_ready_override })}
                  className="relative w-12 h-6 rounded-full flex-shrink-0 transition-all"
                  style={{
                    background: truck.launch_ready_override ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : '#2e3638',
                    boxShadow: truck.launch_ready_override ? '0 0 10px rgba(251,191,36,0.35)' : 'none',
                  }}
                >
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                    style={{ left: truck.launch_ready_override ? 'calc(100% - 22px)' : '2px' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="mt-2">
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#77ffc8' }}>RECENT PAID ORDERS</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: '#192123' }}>
            {orders.slice(0, 5).map((order, i) => (
              <div key={order.id} className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < 4 ? '1px solid rgba(59,74,66,0.15)' : 'none' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm truncate" style={{ color: '#dff0e8' }}>{order.truck_name}</p>
                    {order.is_test_payment && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>TEST</span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: '#bacbc0' }}>{order.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading font-bold text-sm" style={{ color: '#77ffc8' }}>${order.total?.toFixed(2)}</p>
                  {order.platform_fee_amount > 0 && (
                    <p className="text-[10px]" style={{ color: '#bacbc0' }}>fee: ${order.platform_fee_amount?.toFixed(2)}</p>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: order.stripe_payment_intent_id ? 'rgba(119,255,200,0.1)' : '#2e3638', color: order.stripe_payment_intent_id ? '#77ffc8' : '#bacbc0' }}>
                    {order.stripe_payment_intent_id ? 'PAID' : order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>}
    </div>
  );
}