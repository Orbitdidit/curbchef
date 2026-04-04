import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Award, Star, Zap, Crown, Gift } from 'lucide-react';

const tiers = [
  { id: 'starter', label: 'Starter', icon: Star, minPoints: 0, color: 'text-muted-foreground' },
  { id: 'regular', label: 'Regular', icon: Zap, minPoints: 200, color: 'text-chart-4' },
  { id: 'vip', label: 'VIP', icon: Award, minPoints: 500, color: 'text-primary' },
  { id: 'legend', label: 'Legend', icon: Crown, minPoints: 1000, color: 'text-chart-3' },
];

const rewards = [
  { name: 'Free Side', points: 100, emoji: '🍟' },
  { name: '$5 Off', points: 200, emoji: '💰' },
  { name: 'Free Drink', points: 150, emoji: '🥤' },
  { name: 'BOGO Entree', points: 350, emoji: '🔥' },
  { name: 'Free Entree', points: 500, emoji: '🌮' },
];

export default function Rewards() {
  const { data: rewardData } = useQuery({
    queryKey: ['my-rewards'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const rewards = await base44.entities.Reward.filter({ user_email: user.email });
      return rewards[0] || { points: 75, tier: 'starter', orders_count: 3 };
    },
  });

  const points = rewardData?.points || 75;
  const tier = rewardData?.tier || 'starter';
  const currentTier = tiers.find(t => t.id === tier) || tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const TierIcon = currentTier.icon;

  const progressToNext = nextTier ? Math.min((points / nextTier.minPoints) * 100, 100) : 100;

  return (
    <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
      <h1 className="font-heading text-2xl font-bold mb-5">Rewards</h1>

      {/* Points card */}
      <div className="bg-gradient-to-br from-card to-secondary rounded-3xl p-6 mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center ${currentTier.color}`}>
            <TierIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Tier</p>
            <p className="font-heading font-bold text-lg">{currentTier.label}</p>
          </div>
        </div>
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-heading font-bold text-2xl text-primary">{points}</span>
            {nextTier && <span className="text-muted-foreground text-xs">{nextTier.minPoints - points} pts to {nextTier.label}</span>}
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressToNext}%` }} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">{rewardData?.orders_count || 3} orders completed</p>
      </div>

      {/* Available rewards */}
      <h2 className="font-heading font-bold text-base mb-3 flex items-center gap-2">
        <Gift className="w-4 h-4 text-primary" />
        Redeem Rewards
      </h2>
      <div className="space-y-2.5">
        {rewards.map(reward => {
          const canRedeem = points >= reward.points;
          return (
            <div
              key={reward.name}
              className={`flex items-center justify-between bg-card rounded-2xl p-4 transition-all ${canRedeem ? '' : 'opacity-50'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{reward.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{reward.name}</p>
                  <p className="text-xs text-muted-foreground">{reward.points} points</p>
                </div>
              </div>
              <button
                disabled={!canRedeem}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  canRedeem
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                Redeem
              </button>
            </div>
          );
        })}
      </div>

      {/* Tier breakdown */}
      <h2 className="font-heading font-bold text-base mb-3 mt-6">Tier Levels</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {tiers.map(t => {
          const Icon = t.icon;
          const isActive = t.id === tier;
          return (
            <div key={t.id} className={`rounded-2xl p-4 ${isActive ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-card'}`}>
              <Icon className={`w-5 h-5 mb-2 ${t.color}`} />
              <p className="font-heading font-bold text-sm">{t.label}</p>
              <p className="text-[10px] text-muted-foreground">{t.minPoints}+ pts</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}