import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Zap, Star, Crown, Rocket } from 'lucide-react';
import VendorGate from '@/components/vendor/VendorGate';
import { useToast } from '@/components/ui/use-toast';

const PLANS = [
  {
    id: 'free',
    label: 'Free',
    price: '$0',
    period: '/mo',
    icon: '🚚',
    color: '#bacbc0',
    bg: 'rgba(186,203,192,0.08)',
    border: 'rgba(186,203,192,0.2)',
    credits: 0,
    features: [
      'Basic truck listing',
      'Accept orders (12% commission)',
      'Menu management',
      'Order queue',
      'Stripe payouts',
    ],
  },
  {
    id: 'standard',
    label: 'Standard',
    price: '$29',
    period: '/mo',
    icon: '⭐',
    color: '#77ffc8',
    bg: 'rgba(119,255,200,0.08)',
    border: 'rgba(119,255,200,0.25)',
    credits: 5,
    features: [
      'Everything in Free',
      'Sales analytics dashboard',
      'Menu item highlights',
      'Customer insights',
      '5 boost credits / month',
    ],
  },
  {
    id: 'plus',
    label: 'Plus',
    price: '$59',
    period: '/mo',
    icon: '🔥',
    color: '#fd591e',
    bg: 'rgba(253,89,30,0.08)',
    border: 'rgba(253,89,30,0.3)',
    credits: 15,
    badge: 'POPULAR',
    features: [
      'Everything in Standard',
      'Featured in Explore results',
      'Priority in search',
      'Upload promo clips',
      '15 boost credits / month',
      'Priority support',
    ],
  },
  {
    id: 'premium',
    label: 'Premium',
    price: '$99',
    period: '/mo',
    icon: '👑',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.3)',
    credits: 30,
    features: [
      'Everything in Plus',
      'Homepage featured placement',
      'Guaranteed Live top slot',
      'Featured Deals placement',
      '30 boost credits / month',
      'Dedicated account manager',
    ],
  },
];

const BOOSTS = [
  { id: 'homepage_featured', label: 'Homepage Featured', desc: 'Appear in the Hero section on the homepage', credits: 5, emoji: '🏠' },
  { id: 'explore_top', label: 'Top Explore Placement', desc: 'Pin to top of the Explore page for 24h', credits: 3, emoji: '🔍' },
  { id: 'live_top', label: 'Live Section Top', desc: 'Featured first in the Live Now carousel', credits: 3, emoji: '🔴' },
  { id: 'deals_featured', label: 'Featured Deal', desc: 'Appear in the Deals section for 48h', credits: 2, emoji: '💰' },
  { id: 'promo_boost', label: 'Promo Boost', desc: 'Boosted visibility across all feed sections for 12h', credits: 1, emoji: '⚡' },
];

function VendorPlansInner({ truck, user }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('plans');

  const updateTruck = useMutation({
    mutationFn: (data) => base44.entities.FoodTruck.update(truck.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-truck'] });
      toast({ title: 'Plan updated!', duration: 2000 });
    },
  });

  const applyBoost = useMutation({
    mutationFn: async (boost) => {
      if ((truck.boost_credits || 0) < boost.credits) {
        throw new Error('Not enough credits');
      }
      await base44.entities.VendorBoost.create({
        truck_id: truck.id,
        truck_name: truck.name,
        boost_type: boost.id,
        credits_used: boost.credits,
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 48 * 3600000).toISOString(),
        is_active: true,
      });
      await base44.entities.FoodTruck.update(truck.id, {
        boost_credits: (truck.boost_credits || 0) - boost.credits,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-truck'] });
      toast({ title: 'Boost activated! 🚀', duration: 2000 });
    },
    onError: (err) => toast({ title: err.message, variant: 'destructive', duration: 2000 }),
  });

  const currentPlan = PLANS.find(p => p.id === (truck.vendor_plan || 'free'));

  return (
    <div className="min-h-screen pb-16" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-20"
        style={{ background: 'rgba(13,21,23,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.12)' }}>
        <button onClick={() => navigate('/vendor')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
        </button>
        <div className="flex-1">
          <p className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>Plans & Boosts</p>
          <p className="text-xs" style={{ color: '#bacbc0' }}>Current: <span style={{ color: currentPlan.color }}>{currentPlan.label}</span> · {truck.boost_credits || 0} credits available</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 pt-5 mb-5">
        {[{ id: 'plans', label: 'Monthly Plans' }, { id: 'boosts', label: 'Boost Credits' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={activeTab === tab.id
              ? { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }
              : { background: '#192123', color: '#bacbc0' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-5">
        {activeTab === 'plans' && (
          <div className="flex flex-col gap-4">
            <p className="text-xs" style={{ color: '#bacbc0' }}>
              All plans include 12% commission on orders. Plans unlock tools and visibility.
            </p>
            {PLANS.map(plan => {
              const isActive = (truck.vendor_plan || 'free') === plan.id;
              return (
                <div key={plan.id} className="rounded-2xl p-5 relative"
                  style={{ background: plan.bg, border: `1px solid ${plan.border}` }}>
                  {plan.badge && (
                    <div className="absolute top-4 right-4 text-[10px] font-black px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(253,89,30,0.2)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.4)' }}>
                      {plan.badge}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{plan.icon}</span>
                    <div>
                      <p className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>{plan.label}</p>
                      <div className="flex items-baseline gap-0.5">
                        <span className="font-heading font-black text-2xl" style={{ color: plan.color }}>{plan.price}</span>
                        <span className="text-xs" style={{ color: '#bacbc0' }}>{plan.period}</span>
                      </div>
                    </div>
                  </div>
                  {plan.credits > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
                      style={{ background: 'rgba(119,255,200,0.08)', border: '1px solid rgba(119,255,200,0.15)' }}>
                      <Zap className="w-3.5 h-3.5" style={{ color: '#77ffc8' }} />
                      <span className="text-xs font-bold" style={{ color: '#77ffc8' }}>{plan.credits} boost credits / month</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 mb-5">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: plan.color }} />
                        <span className="text-sm" style={{ color: '#dff0e8' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  {isActive ? (
                    <div className="w-full py-3 rounded-full text-center font-heading font-black text-sm"
                      style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.3)' }}>
                      ✓ Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => updateTruck.mutate({ vendor_plan: plan.id })}
                      disabled={updateTruck.isPending}
                      className="w-full py-3 rounded-full font-heading font-black text-sm transition-all active:scale-95"
                      style={{ background: `${plan.color}`, color: plan.id === 'standard' ? '#003826' : '#000' }}>
                      {updateTruck.isPending ? 'Updating...' : `Switch to ${plan.label}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'boosts' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(119,255,200,0.08)', border: '1px solid rgba(119,255,200,0.2)' }}>
              <div>
                <p className="text-xs font-bold" style={{ color: '#bacbc0' }}>AVAILABLE CREDITS</p>
                <p className="font-heading font-black text-3xl" style={{ color: '#77ffc8' }}>{truck.boost_credits || 0}</p>
              </div>
              <Zap className="w-8 h-8" style={{ color: '#77ffc8', opacity: 0.4 }} />
            </div>
            <p className="text-xs" style={{ color: '#bacbc0' }}>Credits are included monthly with paid plans, or can be purchased separately.</p>
            {BOOSTS.map(boost => {
              const canAfford = (truck.boost_credits || 0) >= boost.credits;
              return (
                <div key={boost.id} className="p-4 rounded-2xl flex items-center gap-4"
                  style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
                  <span className="text-2xl flex-shrink-0">{boost.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>{boost.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>{boost.desc}</p>
                  </div>
                  <button
                    onClick={() => applyBoost.mutate(boost)}
                    disabled={!canAfford || applyBoost.isPending}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all"
                    style={canAfford
                      ? { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }
                      : { background: '#2e3638', color: '#bacbc0', opacity: 0.5 }}>
                    <Zap className="w-3 h-3" />{boost.credits}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VendorPlans() {
  return (
    <VendorGate>
      {({ truck, user }) => <VendorPlansInner truck={truck} user={user} />}
    </VendorGate>
  );
}