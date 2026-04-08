import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Truck, CreditCard, ShoppingBag, BarChart3, ChevronRight, Check, Clock, AlertCircle } from 'lucide-react';

const FEATURES = [
  { icon: '🍽️', title: 'Menu Management', sub: 'Add items, pricing, and food photos' },
  { icon: '📦', title: 'Order Queue', sub: 'Accept & track orders in real-time' },
  { icon: '💳', title: 'Stripe Payments', sub: 'Receive payouts directly to your bank' },
  { icon: '📊', title: 'Earnings Dashboard', sub: 'Revenue, fees, and performance metrics' },
  { icon: '🔴', title: 'Go Live', sub: 'Broadcast your location & today\'s specials' },
];

export default function VendorPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [truck, setTruck] = useState(null);
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      if (u) {
        const [trucks, applications] = await Promise.all([
          base44.entities.FoodTruck.filter({ owner_email: u.email }),
          base44.entities.TruckOnboarding.filter({ email: u.email }, '-created_date', 1),
        ]);
        if (trucks?.length) setTruck(trucks[0]);
        if (applications?.length) setOnboarding(applications[0].data || applications[0]);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1517' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-20"
        style={{ background: 'rgba(13,21,23,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.12)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
        </button>
        <div>
          <p className="font-heading font-black text-base" style={{ color: '#77ffc8' }}>Vendor Portal</p>
          <p className="text-xs" style={{ color: '#bacbc0' }}>Manage your food truck on CurbChef</p>
        </div>
      </div>

      <div className="px-5 pb-16 pt-6">

        {/* === CASE 1: Has active truck → go to dashboard === */}
        {truck && (
          <div className="mb-6">
            <div className="p-5 rounded-3xl mb-4"
              style={{ background: 'linear-gradient(135deg,rgba(119,255,200,0.08),rgba(119,255,200,0.03))', border: '1px solid rgba(119,255,200,0.2)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: '#192123' }}>🚚</div>
                <div>
                  <p className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>{truck.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {truck.is_approved ? (
                      <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(119,255,200,0.15)', color: '#77ffc8' }}>
                        <Check className="w-3 h-3" /> APPROVED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                        <Clock className="w-3 h-3" /> PENDING APPROVAL
                      </span>
                    )}
                    <span className="text-[10px] font-bold capitalize" style={{ color: '#bacbc0' }}>{truck.cuisine_type?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Stripe status indicator */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
                style={{ background: '#0d1517' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: truck.stripe_onboarding_status === 'payouts_enabled' ? '#77ffc8' : truck.stripe_onboarding_status === 'not_connected' ? '#bacbc0' : '#fbbf24' }} />
                <p className="text-xs font-semibold" style={{ color: '#bacbc0' }}>
                  Stripe: {truck.stripe_onboarding_status === 'payouts_enabled' ? 'Fully Connected' :
                    truck.stripe_onboarding_status === 'charges_enabled' ? 'Payments Active' :
                    truck.stripe_onboarding_status === 'onboarding_started' ? 'Setup Incomplete' :
                    'Not Connected'}
                </p>
              </div>

              <Link to="/vendor">
                <button className="w-full py-3.5 rounded-full font-heading font-black text-sm"
                  style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 20px rgba(119,255,200,0.3)' }}>
                  Go to Vendor Dashboard →
                </button>
              </Link>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Menu', icon: ShoppingBag, to: '/vendor/menu' },
                { label: 'Orders', icon: ShoppingBag, to: '/vendor/orders' },
                { label: 'Payments', icon: CreditCard, to: '/vendor' },
                { label: 'Analytics', icon: BarChart3, to: '/vendor' },
              ].map(({ label, icon: Icon, to }) => (
                <Link key={label} to={to}>
                  <div className="p-4 rounded-2xl flex items-center gap-2.5"
                    style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.15)' }}>
                    <Icon className="w-4 h-4" style={{ color: '#77ffc8' }} />
                    <span className="font-semibold text-sm" style={{ color: '#dff0e8' }}>{label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* === CASE 2: Applied but no approved truck yet === */}
        {!truck && onboarding && onboarding.status !== 'rejected' && (
          <div className="p-5 rounded-3xl mb-6"
            style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: '#fbbf24' }} />
              <div>
                <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>Application Under Review</p>
                <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>Submitted for {onboarding.truck_name}</p>
              </div>
            </div>
            <p className="text-xs mb-4" style={{ color: '#bacbc0' }}>
              Our team reviews applications within 24 hours. Once approved, your truck will go live and you'll receive full dashboard access.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#192123' }}>
                <div className="h-full rounded-full" style={{ width: '66%', background: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
              </div>
              <span className="text-[10px] font-bold" style={{ color: '#fbbf24' }}>REVIEWING</span>
            </div>
          </div>
        )}

        {/* === CASE 2b: Application rejected === */}
        {!truck && onboarding && onboarding.status === 'rejected' && (
          <div className="p-5 rounded-3xl mb-6"
            style={{ background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.2)' }}>
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: '#ff3b30' }} />
              <div>
                <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>Application Not Approved</p>
                <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>For {onboarding.truck_name}</p>
              </div>
            </div>
            <p className="text-xs mb-4" style={{ color: '#bacbc0' }}>
              Unfortunately your application wasn't approved this time. Please contact support or re-apply with updated information.
            </p>
            <Link to="/onboard-truck">
              <button className="w-full py-3 rounded-full font-heading font-black text-sm"
                style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.25)' }}>
                Re-apply
              </button>
            </Link>
          </div>
        )}

        {/* === CASE 3: No truck, no application — show apply CTA === */}
        {!truck && !onboarding && (
          <>
            {/* Hero */}
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🚚</div>
              <h1 className="font-heading font-black text-2xl mb-2" style={{ color: '#dff0e8' }}>
                {user ? `Hey ${user.full_name?.split(' ')[0]}!` : 'Own a Food Truck?'}
              </h1>
              <p className="text-sm" style={{ color: '#bacbc0' }}>
                Join Houston's fastest-growing food truck platform. Free to apply. Payments via Stripe.
              </p>
            </div>

            {/* Sign-in prompt if not logged in */}
            {!user && (
              <div className="p-4 rounded-2xl mb-5"
                style={{ background: 'rgba(119,255,200,0.06)', border: '1px solid rgba(119,255,200,0.2)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#dff0e8' }}>Create your vendor account first</p>
                <p className="text-xs mb-3" style={{ color: '#bacbc0' }}>You'll need an account so we can link your truck to your profile and enable payments.</p>
                <button
                  onClick={() => base44.auth.redirectToLogin('/vendor-portal')}
                  className="w-full py-3 rounded-full font-heading font-black text-sm"
                  style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
                  Sign In / Create Account
                </button>
              </div>
            )}

            {/* Features */}
            <div className="mb-6">
              <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#77ffc8' }}>WHAT YOU GET</p>
              <div className="flex flex-col gap-2">
                {FEATURES.map(({ icon, title, sub }) => (
                  <div key={title} className="flex items-center gap-3 p-3.5 rounded-2xl" style={{ background: '#192123' }}>
                    <span className="text-xl flex-shrink-0">{icon}</span>
                    <div>
                      <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>{title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform fee note */}
            <div className="p-4 rounded-2xl mb-6"
              style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
              <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: '#bacbc0' }}>PRICING</p>
              <p className="font-heading font-black text-2xl mb-1" style={{ color: '#77ffc8' }}>Free to list</p>
              <p className="text-xs" style={{ color: '#bacbc0' }}>CurbChef takes a 12% platform fee per order. No monthly fees, no setup costs.</p>
            </div>

            {/* Apply CTA */}
            {user ? (
              <Link to="/onboard-truck">
                <button className="w-full py-4 rounded-full font-heading font-black text-base"
                  style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 24px rgba(119,255,200,0.4)' }}>
                  🚀 Start Truck Application
                </button>
              </Link>
            ) : (
              <button
                onClick={() => base44.auth.redirectToLogin('/onboard-truck')}
                className="w-full py-4 rounded-full font-heading font-black text-base"
                style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 24px rgba(119,255,200,0.4)' }}>
                🚀 Create Account & Apply
              </button>
            )}

            <p className="text-center text-xs mt-4" style={{ color: '#bacbc0' }}>
              Already applied? Check your email for status updates.
            </p>
          </>
        )}
      </div>
    </div>
  );
}