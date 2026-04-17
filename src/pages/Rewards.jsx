import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Star, Lock, Trash2 } from 'lucide-react';
import RewardsCoach from '@/components/rewards/RewardsCoach';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const TIERS = [
  { key: 'starter', label: 'Starter', min: 0 },
  { key: 'regular', label: 'Regular', min: 500 },
  { key: 'vip', label: 'Night Owl', min: 1000 },
  { key: 'legend', label: 'Legend', min: 2500 },
];

const REWARDS = [
  { id: 1, label: 'Free Al Pastor Taco', sub: 'Valid at any participating truck tonight.', cost: 1500, hot: true, img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300' },
  { id: 2, label: '$5 Off Next Order', sub: 'Minimum spend $15. No expiration.', cost: 1000, icon: '💵' },
  { id: 3, label: 'Artisan Soda', sub: 'Choice of any house-made beverage.', cost: 500, icon: '🥤', level: 'Level 5 required', locked: true },
];

export default function Rewards() {
  const [deleting, setDeleting] = useState(false);
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const handleDeleteAccount = async () => {
    setDeleting(true);
    base44.auth.logout('/');
  };

  const { data: rewards = [] } = useQuery({
    queryKey: ['my-rewards'],
    queryFn: () => base44.entities.Reward.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const reward = rewards[0] || { points: 0, tier: 'starter', orders_count: 0 };
  const nextTier = TIERS.find(t => t.min > reward.points) || TIERS[TIERS.length - 1];
  const currentTier = TIERS.find(t => t.key === reward.tier) || TIERS[0];
  const progress = Math.min((reward.points / nextTier.min) * 100, 100);

  return (
    <div className="min-h-screen dot-bg" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 flex items-center justify-between">
        <span className="font-heading font-black text-lg" style={{ color: '#77ffc8' }}>CurbChef</span>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <Star className="w-4 h-4" style={{ color: '#77ffc8' }} />
        </button>
      </div>

      <div className="px-5 pb-32">
        {/* Balance card */}
        <div
          className="p-6 rounded-3xl mb-5"
          style={{
            background: 'linear-gradient(135deg, #192123 0%, #0f1a1c 100%)',
            border: '1px solid rgba(119,255,200,0.15)',
            boxShadow: '0 0 30px rgba(119,255,200,0.07)',
          }}
        >
          <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: '#bacbc0' }}>CURRENT BALANCE</p>
          <p
            className="font-heading font-black text-5xl mb-1"
            style={{ color: '#77ffc8', textShadow: '0 0 20px rgba(119,255,200,0.3)' }}
          >
            {reward.points.toLocaleString()} pts
          </p>
          <p className="text-xs font-semibold" style={{ color: '#bacbc0' }}>
            ↑ Level: {currentTier.label}
          </p>
        </div>

        {/* Progress */}
        <div
          className="p-5 rounded-3xl mb-6"
          style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold" style={{ color: '#dff0e8' }}>CurbChef Points</span>
            <span className="text-sm font-bold" style={{ color: '#77ffc8' }}>{nextTier.min}</span>
          </div>
          <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: '#2e3638' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #77ffc8, #00e6a7)',
                boxShadow: '0 0 8px rgba(119,255,200,0.5)',
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px]" style={{ color: '#bacbc0' }}>0 PTS</span>
            <span className="text-[10px]" style={{ color: '#bacbc0' }}>FREE TACO ({nextTier.min})</span>
          </div>
          <p className="text-xs mt-2 font-semibold" style={{ color: '#77ffc8' }}>
            {nextTier.min - reward.points} pts to your next reward
          </p>
        </div>

        {/* Redeemable Rewards */}
        <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2" style={{ color: '#dff0e8' }}>
          Redeemable Rewards
          <span style={{ color: '#77ffc8' }}>★</span>
        </h2>

        <div className="flex flex-col gap-3">
          {REWARDS.map(r => (
            <div
              key={r.id}
              className="rounded-3xl overflow-hidden"
              style={{
                background: '#192123',
                border: r.locked ? '1px solid rgba(59,74,66,0.15)' : '1px solid rgba(119,255,200,0.1)',
                opacity: r.locked ? 0.6 : 1,
              }}
            >
              {r.img ? (
                <div className="relative">
                  <img src={r.img} alt={r.label} className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: '#fd591e', color: 'white' }}>
                      LIMITED TIME
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-heading font-black text-lg text-white leading-tight">{r.label}</p>
                    <p className="text-white/60 text-xs mt-0.5">{r.sub}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: '#2e3638' }}
                  >
                    {r.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>{r.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>{r.sub}</p>
                    {r.locked && (
                      <div className="flex items-center gap-1 mt-1">
                        <Lock className="w-3 h-3" style={{ color: '#fd591e' }} />
                        <span className="text-[10px] font-bold" style={{ color: '#fd591e' }}>{r.level}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-bold tracking-wide" style={{ color: '#bacbc0' }}>COST</p>
                    <p className="font-heading font-bold text-sm" style={{ color: '#77ffc8' }}>{r.cost.toLocaleString()} pts</p>
                  </div>
                </div>
              )}

              {!r.locked && (
                <div className="px-4 pb-4">
                  <button
                    className="w-full py-3 rounded-full font-heading font-black text-sm flex items-center justify-center gap-2"
                    style={{
                      background: reward.points >= r.cost
                        ? 'linear-gradient(135deg,#77ffc8,#00e6a7)'
                        : '#2e3638',
                      color: reward.points >= r.cost ? '#003826' : '#bacbc0',
                      boxShadow: reward.points >= r.cost ? '0 0 12px rgba(119,255,200,0.3)' : 'none',
                    }}
                  >
                    <span>■</span> Redeem for {r.cost.toLocaleString()} pts
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rewards Coach AI */}
        <div className="mt-8 mb-6">
          <h2 className="font-heading font-bold text-base mb-4" style={{ color: '#dff0e8' }}>Your Rewards Coach 🏅</h2>
          <RewardsCoach user={user} reward={reward} />
        </div>

        {/* Tier list */}
        <h2 className="font-heading font-bold text-base mt-8 mb-4" style={{ color: '#dff0e8' }}>All Tiers</h2>
        <div className="grid grid-cols-2 gap-3 mb-10">
          {TIERS.map(tier => (
            <div
              key={tier.key}
              className="p-4 rounded-2xl text-center"
              style={{
                background: reward.tier === tier.key ? 'rgba(119,255,200,0.08)' : '#192123',
                border: reward.tier === tier.key ? '1px solid rgba(119,255,200,0.3)' : '1px solid transparent',
              }}
            >
              <p className="font-heading font-bold text-sm" style={{ color: reward.tier === tier.key ? '#77ffc8' : '#dff0e8' }}>
                {tier.label}
              </p>
              <p className="text-xs mt-1" style={{ color: '#bacbc0' }}>{tier.min.toLocaleString()}+ pts</p>
            </div>
          ))}
        </div>

        {/* Account — danger zone */}
        {user && (
          <div className="pt-6" style={{ borderTop: '1px solid rgba(59,74,66,0.25)' }}>
            <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#bacbc0' }}>ACCOUNT</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm min-h-[44px]"
                  style={{ background: 'rgba(239,68,68,0.07)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete My Account
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent style={{ background: '#192123', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertDialogHeader>
                  <AlertDialogTitle style={{ color: '#dff0e8' }}>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription style={{ color: '#bacbc0' }}>
                    This permanently removes your account, points, and order history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel style={{ background: '#2e3638', color: '#bacbc0', border: 'none' }}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    style={{ background: '#ef4444', color: 'white' }}
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
}