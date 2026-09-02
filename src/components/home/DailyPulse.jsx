import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Flame, Star, Zap, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const VIBES = [
  { id:'quick', label:'Quick Bite', emoji:''},
  { id:'spicy', label:'Spicy', emoji:''},
  { id:'healthy', label:'Healthy', emoji:''},
  { id:'comfort', label:'Comfort', emoji:''},
  { id:'late_night', label:'Late Night', emoji:''},
];

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return { text:'Still up?', emoji:'', sub:'Night owls eat too.'};
  if (h < 12) return { text:'Good morning', emoji:'', sub:"Let's fuel your day."};
  if (h < 17) return { text:'Good afternoon', emoji:'', sub:"Lunch break? We got you."};
  if (h < 21) return { text:'Good evening', emoji:'', sub:"Dinner time."};
  return { text:'Late night craving?', emoji:'', sub:"Best trucks are heating up."};
}

export default function DailyPulse({ user, trucks }) {
  const [selectedVibe, setSelectedVibe] = useState(() => localStorage.getItem('cc_vibe') || null);
  const [streak, setStreak] = useState(0);

  const { data: rewards } = useQuery({
    queryKey: ['rewards-me', user?.email],
    queryFn: () => user?.email ? base44.entities.Reward.filter({ user_email: user.email }) : [],
    enabled: !!user?.email,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders', user?.email],
    queryFn: () => user?.email ? base44.entities.Order.filter({ customer_email: user.email }) : [],
    enabled: !!user?.email,
  });

  useEffect(() => {
    // Compute streak from orders
    if (!orders.length) return;
    const days = new Set(orders.map(o => new Date(o.created_date).toDateString()));
    let s = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (days.has(d.toDateString())) s++;
      else if (i > 0) break;
    }
    setStreak(s);
  }, [orders]);

  const handleVibe = (id) => {
    setSelectedVibe(id);
    localStorage.setItem('cc_vibe', id);
  };

  const points = rewards?.[0]?.points || 0;
  const tier = rewards?.[0]?.tier ||'starter';
  const tierColors = { starter:'var(--cc-ink-dim)', regular:'var(--cc-accent)', vip:'var(--cc-amber)', legend:'var(--cc-warm)'};
  const greeting = getTimeGreeting();
  const firstName = user?.full_name?.split('')[0];

  // Vibe-filtered trucks (for downstream use via localStorage — Home reads it)
  const vibeMap = { quick: null, spicy:'tacos', healthy:'vegan', comfort:'bbq', late_night: null };

  return (
    <div className="px-5 pt-2 pb-1">
      {/* Greeting */}
      <div className="mb-4">
        <p className="font-display text-2xl leading-tight" style={{ color:'var(--cc-ink)'}}>
          {greeting.text}{firstName ? `, ${firstName}` :''} {greeting.emoji}
        </p>
        <p className="text-xs mt-0.5" style={{ color:'var(--cc-ink-dim)'}}>{greeting.sub}</p>
      </div>

      {/* Stats strip */}
      <div className="flex gap-2 mb-5">
        {/* Streak */}
        <div className="flex-1 flex items-center gap-2.5 p-3 rounded-2xl" style={{ background: streak > 0 ?'rgba(var(--cc-warm-rgb),0.1)':'var(--cc-bg-2)', border: streak > 0 ?'1px solid rgba(var(--cc-warm-rgb),0.25)':'1px solid rgba(var(--cc-line-rgb),0.2)'}}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: streak > 0 ?'rgba(var(--cc-warm-rgb),0.15)':'var(--cc-bg-3)'}}>
            <Flame className="w-4 h-4" style={{ color: streak > 0 ?'var(--cc-warm)':'var(--cc-ink-dim)'}} />
          </div>
          <div>
            <p className="font-display text-lg leading-none" style={{ color: streak > 0 ?'var(--cc-warm)':'var(--cc-ink-dim)'}}>{streak}</p>
            <p className="text-[10px] font-bold" style={{ color:'rgba(186,203,192,0.6)'}}>day streak</p>
          </div>
        </div>

        {/* Points */}
        <Link to="/rewards" className="flex-1">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl h-full" style={{ background:'rgba(var(--cc-accent-rgb),0.07)', border:'1px solid rgba(var(--cc-accent-rgb),0.15)'}}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'rgba(var(--cc-accent-rgb),0.12)'}}>
              <Star className="w-4 h-4" style={{ color:'var(--cc-accent)'}} />
            </div>
            <div>
              <p className="font-display text-lg leading-none" style={{ color:'var(--cc-accent)'}}>{points.toLocaleString()}</p>
              <p className="text-[10px] font-bold" style={{ color:'rgba(186,203,192,0.6)'}}>pts earned</p>
            </div>
          </div>
        </Link>

        {/* Tier */}
        <Link to="/rewards" className="flex-1">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl h-full" style={{ background:'var(--cc-bg-2)', border:'1px solid rgba(var(--cc-line-rgb),0.2)'}}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'var(--cc-bg-3)'}}>
              <Trophy className="w-4 h-4" style={{ color: tierColors[tier] }} />
            </div>
            <div>
              <p className="font-display text-sm leading-none capitalize" style={{ color: tierColors[tier] }}>{tier}</p>
              <p className="text-[10px] font-bold" style={{ color:'rgba(186,203,192,0.6)'}}>status</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Today's Vibe picker */}
      <div className="mb-1">
        <p className="text-[10px] font-black tracking-widest mb-2.5" style={{ color:'rgba(186,203,192,0.5)'}}>
          WHAT'S YOUR VIBE TODAY?
        </p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {VIBES.map(v => {
            const active = selectedVibe === v.id;
            return (
              <button key={v.id} onClick={() => handleVibe(active ? null : v.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black transition-all" style={active
                  ? { background:'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color:'var(--cc-accent-deep)', boxShadow:'0 0 12px rgba(var(--cc-accent-rgb),0.3)'}
                  : { background:'var(--cc-bg-2)', color:'var(--cc-ink-dim)', border:'1px solid rgba(var(--cc-line-rgb),0.25)'}
                }>
                {v.emoji} {v.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}