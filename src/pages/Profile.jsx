import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Star, Flame, Trophy, Bell, HelpCircle, Mail,
  Phone, LogOut, Shield, ChevronRight, Gift, Truck, Zap,
  Heart, MapPin, Radio, Users
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import ReferFriendModal from '@/components/profile/ReferFriendModal';

const TIERS = [
  { key: 'starter', label: 'Starter', min: 0, emoji: '🌱', color: '#A39E94' },
  { key: 'regular', label: 'Regular', min: 500, emoji: '🔥', color: '#FF6B1A' },
  { key: 'vip', label: 'Night Owl', min: 1000, emoji: '🦉', color: '#00F5D4' },
  { key: 'legend', label: 'Legend', min: 2500, emoji: '👑', color: '#FFD60A' },
];

const FOOD_LABELS = {
  tacos: 'Taco Loyalist',
  burgers: 'Burger Hunter',
  bbq: 'BBQ Pit Master',
  seafood: 'Gulf Coast Foodie',
  asian: 'Asian Fusion Head',
  vegan: 'Plant-Based Rider',
  desserts: 'Sweet Tooth',
  pizza: 'Pie Connoisseur',
  soul_food: 'Soul Food Senator',
};

function getPersonalityLabel(orders, follows) {
  if (!orders?.length) return 'CurbChef Starter';
  // Find most ordered cuisine
  const cuisineCounts = {};
  orders.forEach(o => {
    const t = follows?.find(f => f.truck_id === o.truck_id);
    if (t) cuisineCounts[t.cuisine_type] = (cuisineCounts[t.cuisine_type] || 0) + 1;
  });
  const top = Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1])[0];
  const h = new Date().getHours();
  if (h >= 22 || h < 4) return 'Night Owl 🦉';
  if (top) return FOOD_LABELS[top[0]] || 'Street Food Devotee';
  return 'Street Food Devotee';
}

function getStreak(orders) {
  if (!orders?.length) return 0;
  const days = new Set(orders.map(o => new Date(o.created_date).toDateString()));
  let s = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(d.toDateString())) s++;
    else if (i > 0) break;
  }
  return s;
}

export default function Profile() {
  const [showReferModal, setShowReferModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: rewards = [] } = useQuery({
    queryKey: ['my-rewards'],
    queryFn: () => base44.entities.Reward.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders-profile'],
    queryFn: () => base44.entities.Order.filter({ customer_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: follows = [] } = useQuery({
    queryKey: ['my-follows-profile'],
    queryFn: () => base44.entities.Follow.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: allTrucks = [] } = useQuery({
    queryKey: ['trucks-profile'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }, '-rating', 50),
    enabled: follows.length > 0,
  });

  const reward = rewards[0] || { points: 0, tier: 'starter', orders_count: 0 };
  const currentTier = TIERS.find(t => t.key === reward.tier) || TIERS[0];
  const nextTier = TIERS.find(t => t.min > reward.points) || TIERS[TIERS.length - 1];
  const progress = nextTier.min > 0 ? Math.min((reward.points / nextTier.min) * 100, 100) : 100;
  const streak = getStreak(orders);
  const personality = getPersonalityLabel(orders, follows);
  const isAdmin = user?.role === 'admin';

  const followedTrucks = follows
    .map(f => allTrucks.find(t => t.id === f.truck_id))
    .filter(Boolean);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 4);

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="min-h-screen pb-32" style={{ background: '#0A0A0A' }}>

      {/* ── IDENTITY HEADER ── */}
      <div className="relative pt-[max(1.5rem,env(safe-area-inset-top))] pb-6 px-5"
        style={{ background: 'linear-gradient(180deg, #141414 0%, #0A0A0A 100%)' }}>
        {/* Top row */}
        <div className="flex items-center justify-between mb-5">
          <p className="font-heading font-black text-xl" style={{ color: '#F5F0E8' }}>My CurbChef</p>
          {isAdmin && (
            <Link to="/admin">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
                style={{ background: 'rgba(255,59,48,0.12)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.25)' }}>
                <Shield className="w-3 h-3" /> Admin
              </div>
            </Link>
          )}
        </div>

        {/* Avatar + identity */}
        <div className="flex items-center gap-4">
          {/* Avatar ring */}
          <div className="relative flex-shrink-0"
            style={{ padding: 3, borderRadius: '50%', background: `linear-gradient(135deg, ${currentTier.color}, #0A0A0A)` }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center font-heading font-black text-3xl"
              style={{ background: '#1A1A1A', color: currentTier.color }}>
              {user?.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            {streak > 2 && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm"
                style={{ background: '#FF6B1A', border: '2px solid #0A0A0A' }}>🔥</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-heading font-black text-xl leading-tight" style={{ color: '#F5F0E8' }}>
              {user?.full_name || 'CurbChef Fan'}
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color: '#A39E94' }}>{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                style={{ background: `rgba(${currentTier.color === '#00F5D4' ? '0,245,212' : currentTier.color === '#FFD60A' ? '255,214,10' : currentTier.color === '#FF6B1A' ? '255,107,26' : '163,158,148'},0.12)`, color: currentTier.color, border: `1px solid ${currentTier.color}40` }}>
                {currentTier.emoji} {currentTier.label}
              </span>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: '#1A1A1A', color: '#A39E94' }}>
                {personality}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5">

        {/* ── HERO POINTS CARD ── */}
        <div className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0D2420 0%, #071A14 100%)', border: '1px solid rgba(0,245,212,0.2)', boxShadow: '0 0 40px rgba(0,245,212,0.07)' }}>
          {/* Glow orb */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0,245,212,0.12) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-black tracking-widest mb-1" style={{ color: 'rgba(0,245,212,0.6)' }}>CURBPOINTS BALANCE</p>
                <p className="font-heading font-black leading-none" style={{ color: '#00F5D4', fontSize: '3rem', textShadow: '0 0 30px rgba(0,245,212,0.4)' }}>
                  {reward.points.toLocaleString()}
                </p>
                <p className="text-xs mt-1 font-semibold" style={{ color: 'rgba(0,245,212,0.5)' }}>points</p>
              </div>
              <Link to="/rewards">
                <button className="px-4 py-2 rounded-full font-heading font-black text-xs mt-1"
                  style={{ background: 'linear-gradient(135deg, #00F5D4, #00d4b8)', color: '#0A0A0A', boxShadow: '0 0 16px rgba(0,245,212,0.3)' }}>
                  View Rewards
                </button>
              </Link>
            </div>
            {/* Progress bar */}
            <div className="mb-2">
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] font-bold" style={{ color: 'rgba(0,245,212,0.5)' }}>{currentTier.label}</span>
                <span className="text-[10px] font-bold" style={{ color: 'rgba(0,245,212,0.5)' }}>{nextTier.label} at {nextTier.min.toLocaleString()} pts</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,245,212,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00F5D4, #00e6a7)', boxShadow: '0 0 8px rgba(0,245,212,0.5)' }} />
              </div>
            </div>
            <p className="text-xs" style={{ color: 'rgba(0,245,212,0.45)' }}>
              {Math.max(0, nextTier.min - reward.points).toLocaleString()} pts to {nextTier.label} {nextTier.emoji}
            </p>
          </div>
        </div>

        {/* ── BENTO STATS GRID ── */}
        <div>
          <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: '#A39E94' }}>YOUR STATS</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Streak */}
            <div className="rounded-2xl p-4"
              style={{ background: streak > 0 ? 'rgba(255,107,26,0.08)' : '#141414', border: streak > 0 ? '1px solid rgba(255,107,26,0.25)' : '1px solid rgba(255,255,255,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: streak > 0 ? 'rgba(255,107,26,0.15)' : '#1A1A1A' }}>
                <Flame className="w-4 h-4" style={{ color: streak > 0 ? '#FF6B1A' : '#6B665C' }} />
              </div>
              <p className="font-heading font-black text-2xl leading-none" style={{ color: streak > 0 ? '#FF6B1A' : '#F5F0E8' }}>{streak}</p>
              <p className="text-[11px] mt-1 font-semibold" style={{ color: '#A39E94' }}>day streak</p>
            </div>

            {/* Orders */}
            <div className="rounded-2xl p-4" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(0,245,212,0.08)' }}>
                <ShoppingBag className="w-4 h-4" style={{ color: '#00F5D4' }} />
              </div>
              <p className="font-heading font-black text-2xl leading-none" style={{ color: '#F5F0E8' }}>{orders.length}</p>
              <p className="text-[11px] mt-1 font-semibold" style={{ color: '#A39E94' }}>orders placed</p>
            </div>

            {/* Following */}
            <div className="rounded-2xl p-4" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,59,48,0.08)' }}>
                <Heart className="w-4 h-4" style={{ color: '#FF3B30' }} />
              </div>
              <p className="font-heading font-black text-2xl leading-none" style={{ color: '#F5F0E8' }}>{follows.length}</p>
              <p className="text-[11px] mt-1 font-semibold" style={{ color: '#A39E94' }}>trucks followed</p>
            </div>

            {/* Total spent */}
            <div className="rounded-2xl p-4" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,214,10,0.08)' }}>
                <Star className="w-4 h-4" style={{ color: '#FFD60A' }} />
              </div>
              <p className="font-heading font-black text-2xl leading-none" style={{ color: '#F5F0E8' }}>${totalSpent.toFixed(0)}</p>
              <p className="text-[11px] mt-1 font-semibold" style={{ color: '#A39E94' }}>total spent</p>
            </div>
          </div>
        </div>

        {/* ── MY TRUCKS (FOLLOWING) ── */}
        {followedTrucks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black tracking-widest" style={{ color: '#A39E94' }}>MY TRUCKS</p>
              <span className="text-xs font-bold" style={{ color: '#00F5D4' }}>{followedTrucks.length} following</span>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {followedTrucks.map(truck => {
                const isLive = truck.is_live;
                const isOpen = truck.status === 'open';
                return (
                  <Link key={truck.id} to={`/truck/${truck.id}`} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className="relative"
                      style={{ padding: 2, borderRadius: '50%', background: isLive ? 'linear-gradient(135deg,#FF3B30,#ff6b60)' : isOpen ? 'linear-gradient(135deg,#00F5D4,#00d4b8)' : '#242424' }}>
                      <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-2xl" style={{ background: '#1A1A1A' }}>
                        {truck.image_url ? <img src={truck.image_url} alt={truck.name} className="w-full h-full object-cover" /> : '🚚'}
                      </div>
                      {isLive && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: '#FF3B30', border: '2px solid #0A0A0A' }}>
                          <Radio className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      {!isLive && isOpen && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full"
                          style={{ background: '#00F5D4', border: '2px solid #0A0A0A' }} />
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-center max-w-[64px] truncate" style={{ color: '#A39E94' }}>{truck.name}</p>
                    {isLive && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,59,48,0.15)', color: '#FF3B30' }}>LIVE</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CURB LIST / RECENT ORDERS ── */}
        {recentOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black tracking-widest" style={{ color: '#A39E94' }}>MY CURB LIST</p>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,107,26,0.12)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,0.2)' }}>
                  🔥 RECENT EATS
                </span>
              </div>
              <Link to="/orders" className="text-xs font-bold" style={{ color: '#00F5D4' }}>See all →</Link>
            </div>
            <div className="flex flex-col gap-2">
              {recentOrders.map((order, i) => (
                <Link key={order.id} to={`/order/${order.id}`}>
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl"
                    style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: '#1A1A1A' }}>
                      🚚
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-bold text-sm truncate" style={{ color: '#F5F0E8' }}>{order.truck_name}</p>
                      <p className="text-xs truncate" style={{ color: '#A39E94' }}>
                        {order.items?.slice(0, 2).map(i => i.name).join(', ')}{order.items?.length > 2 ? ` +${order.items.length - 2}` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-heading font-bold text-sm" style={{ color: '#00F5D4' }}>${order.total?.toFixed(2)}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: order.status === 'picked_up' ? 'rgba(0,245,212,0.1)' : 'rgba(255,214,10,0.1)', color: order.status === 'picked_up' ? '#00F5D4' : '#FFD60A' }}>
                        {order.status === 'picked_up' ? '✓ Done' : order.status === 'ready' ? '🎉 Ready' : '⏳'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── HUNGRY TIME / SUGGESTIONS ── */}
        <div className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1A0D00 0%, #140800 100%)', border: '1px solid rgba(255,107,26,0.2)' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,107,26,0.15) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4" style={{ color: '#FF6B1A' }} />
              <p className="text-[10px] font-black tracking-widest" style={{ color: '#FF6B1A' }}>HUNGRY TIME?</p>
            </div>
            <p className="font-heading font-black text-lg leading-tight mb-1" style={{ color: '#F5F0E8' }}>
              What should I eat next?
            </p>
            <p className="text-xs mb-4" style={{ color: 'rgba(245,240,232,0.5)' }}>
              Based on your taste profile & nearby trucks
            </p>
            <div className="flex gap-2">
              <Link to="/explore">
                <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-heading font-black text-xs"
                  style={{ background: 'linear-gradient(135deg, #FF6B1A, #FF3B30)', color: '#fff', boxShadow: '0 0 16px rgba(255,107,26,0.3)' }}>
                  🔥 Get Picks
                </button>
              </Link>
              <Link to="/quiz">
                <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-heading font-bold text-xs"
                  style={{ background: 'rgba(255,255,255,0.07)', color: '#F5F0E8', border: '1px solid rgba(255,255,255,0.12)' }}>
                  Update Taste
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── REFER A FRIEND ── */}
        <button onClick={() => setShowReferModal(true)} className="w-full text-left">
          <div className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, rgba(0,245,212,0.05) 0%, rgba(0,180,140,0.04) 100%)', border: '1px solid rgba(0,245,212,0.15)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(0,245,212,0.08)', border: '1px solid rgba(0,245,212,0.15)' }}>
              💸
            </div>
            <div className="flex-1">
              <p className="font-heading font-black text-sm" style={{ color: '#F5F0E8' }}>Bring a friend. Earn CurbPoints.</p>
              <p className="text-xs mt-0.5" style={{ color: '#A39E94' }}>500 pts per referral · instant reward</p>
            </div>
            <div className="px-3 py-1.5 rounded-full text-[11px] font-black flex-shrink-0"
              style={{ background: 'rgba(0,245,212,0.12)', color: '#00F5D4', border: '1px solid rgba(0,245,212,0.25)' }}>
              Invite →
            </div>
          </div>
        </button>

        {/* ── QUICK LINKS ── */}
        <div>
          <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: '#A39E94' }}>QUICK ACCESS</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '🏆', label: 'Rewards', sub: `${reward.points.toLocaleString()} pts`, to: '/rewards', color: '#FFD60A' },
              { icon: '🗺️', label: 'Find on Map', sub: 'Trucks near you', to: '/map', color: '#00F5D4' },
              { icon: '⚡', label: 'Hot Deals', sub: 'CurbDrops live', to: '/deals', color: '#FF6B1A' },
              { icon: '🚚', label: 'Vendor Portal', sub: 'Own a truck?', to: '/vendor-portal', color: '#A39E94' },
            ].map(item => (
              <Link key={item.label} to={item.to}>
                <div className="flex items-center gap-3 p-3.5 rounded-2xl"
                  style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="text-xl">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="font-heading font-bold text-xs" style={{ color: '#F5F0E8' }}>{item.label}</p>
                    <p className="text-[10px]" style={{ color: '#6B665C' }}>{item.sub}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── SETTINGS (bottom) ── */}
        <div>
          <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: '#6B665C' }}>SETTINGS</p>
          <div className="flex flex-col gap-2">
            {[
              { icon: Bell, label: 'Notifications', sub: 'Alerts & live pings', onClick: () => setShowNotifications(true) },
              { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs, contact, report', onClick: () => setShowHelp(true) },
            ].map(({ icon: Icon, label, sub, onClick }) => (
              <button key={label} onClick={onClick} className="w-full text-left">
                <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#1A1A1A' }}>
                    <Icon className="w-4 h-4" style={{ color: '#6B665C' }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: '#F5F0E8' }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B665C' }}>{sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: '#6B665C' }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div className="flex items-center justify-center gap-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <Link to="/privacy" className="text-xs font-semibold" style={{ color: '#6B665C' }}>Privacy</Link>
          <Link to="/terms" className="text-xs font-semibold" style={{ color: '#6B665C' }}>Terms</Link>
          <Link to="/support" className="text-xs font-semibold" style={{ color: '#6B665C' }}>Support</Link>
        </div>

        {/* Sign out + delete */}
        <div className="flex flex-col gap-3 pb-4">
          <button onClick={() => base44.auth.logout('/')}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm"
            style={{ background: '#141414', color: '#A39E94', border: '1px solid rgba(255,255,255,0.06)' }}>
            <LogOut className="w-4 h-4" /> Sign Out
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm"
                style={{ background: 'rgba(239,68,68,0.06)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>
                Delete My Account
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent style={{ background: '#1A1A1A', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertDialogHeader>
                <AlertDialogTitle style={{ color: '#F5F0E8' }}>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription style={{ color: '#A39E94' }}>
                  Your account will be signed out and flagged for deletion. Our team will remove your data within 30 days per our privacy policy. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel style={{ background: '#242424', color: '#A39E94', border: 'none' }}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => base44.auth.logout('/')} style={{ background: '#ef4444', color: 'white' }}>
                  Yes, delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* ── MODALS ── */}
      {showReferModal && <ReferFriendModal user={user} onClose={() => setShowReferModal(false)} />}

      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowNotifications(false)}>
          <div className="w-full max-w-lg rounded-t-3xl p-6 pb-10" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={e => e.stopPropagation()}>
            <h2 className="font-heading font-black text-lg mb-4" style={{ color: '#F5F0E8' }}>🔔 Notifications</h2>
            <p className="text-sm mb-5" style={{ color: '#A39E94' }}>Push notifications are available in the mobile app.</p>
            <div className="p-4 rounded-2xl mb-4" style={{ background: '#1A1A1A' }}>
              <p className="text-sm font-bold mb-2" style={{ color: '#F5F0E8' }}>Coming in v1.1:</p>
              <ul className="text-xs space-y-1.5" style={{ color: '#A39E94' }}>
                <li>• Live alerts when your fave truck goes LIVE</li>
                <li>• Order ready notifications</li>
                <li>• New CurbDrop deals near you</li>
              </ul>
            </div>
            <button onClick={() => setShowNotifications(false)} className="w-full py-3.5 rounded-full font-heading font-black text-sm"
              style={{ background: '#242424', color: '#A39E94' }}>Got it</button>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowHelp(false)}>
          <div className="w-full max-w-lg rounded-t-3xl p-6 pb-10" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={e => e.stopPropagation()}>
            <h2 className="font-heading font-black text-lg mb-4" style={{ color: '#F5F0E8' }}>Help & Support</h2>
            <div className="flex flex-col gap-3 mb-5">
              <a href="mailto:support@curbchef.com" className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: '#1A1A1A' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,245,212,0.08)' }}>
                  <Mail className="w-5 h-5" style={{ color: '#00F5D4' }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#F5F0E8' }}>Email Support</p>
                  <p className="text-xs" style={{ color: '#A39E94' }}>support@curbchef.com</p>
                </div>
              </a>
              <a href="tel:+18005550100" className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: '#1A1A1A' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,245,212,0.08)' }}>
                  <Phone className="w-5 h-5" style={{ color: '#00F5D4' }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#F5F0E8' }}>Call Us</p>
                  <p className="text-xs" style={{ color: '#A39E94' }}>Mon–Fri, 9am–6pm CST</p>
                </div>
              </a>
            </div>
            <button onClick={() => setShowHelp(false)} className="w-full py-3.5 rounded-full font-heading font-black text-sm"
              style={{ background: '#242424', color: '#A39E94' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}