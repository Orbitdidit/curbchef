import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Zap, TrendingUp, Tag, ChevronRight, Star, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

function getVisibilityScore(truck, menuItems) {
  let score = 0;
  const breakdown = [];

  if (truck.image_url) { score += 20; breakdown.push({ label: 'Logo photo', done: true }); }
  else breakdown.push({ label: 'Add a logo photo', done: false, tip: 'Trucks with photos get 3x more clicks' });

  if (truck.cover_image_url) { score += 15; breakdown.push({ label: 'Cover photo', done: true }); }
  else breakdown.push({ label: 'Add a cover photo', done: false });

  if (truck.description && truck.description.length > 30) { score += 15; breakdown.push({ label: 'Description', done: true }); }
  else breakdown.push({ label: 'Write a description', done: false });

  const itemsWithPhotos = menuItems.filter(i => i.image_url).length;
  if (itemsWithPhotos >= 3) { score += 20; breakdown.push({ label: 'Menu photos (3+)', done: true }); }
  else breakdown.push({ label: `Add menu photos (${itemsWithPhotos}/3)`, done: false, tip: 'Photos increase orders by 70%' });

  if (menuItems.length >= 5) { score += 15; breakdown.push({ label: 'Menu items (5+)', done: true }); }
  else breakdown.push({ label: `Add menu items (${menuItems.length}/5)`, done: false });

  const hasAffordable = menuItems.some(i => i.price <= 8);
  if (hasAffordable) { score += 15; breakdown.push({ label: 'Budget-friendly items', done: true }); }
  else breakdown.push({ label: 'Add a $5–$8 item', done: false, tip: 'Budget items appear in "Cheap Eats"' });

  return { score, breakdown };
}

const CATEGORIES = [
  { id: 'cheap_eats', label: 'Cheap Eats', emoji: '💰', desc: 'Has items under $8', condition: (truck, items) => items.some(i => i.price <= 8) },
  { id: 'late_night', label: 'Late Night', emoji: '🌙', desc: 'Open after 9pm', condition: (truck) => truck.operating_hours?.toLowerCase().includes('pm') },
  { id: 'healthy', label: 'Healthy', emoji: '🥗', desc: 'Tagged as vegan/healthy', condition: (truck) => ['vegan','asian','seafood'].includes(truck.cuisine_type) },
  { id: 'trending', label: 'Trending', emoji: '🔥', desc: 'Is live or has high activity', condition: (truck) => truck.is_live || (truck.total_orders || 0) > 10 },
];

const DEAL_IDEAS = [
  { emoji: '💥', title: '$5 Street Special', desc: 'Add a $5 single-item deal to attract budget hunters' },
  { emoji: '🎁', title: 'Combo Deal', desc: 'Pair your best seller with a drink for $12' },
  { emoji: '⏰', title: 'Flash Offer', desc: 'Today only — 20% off your most popular item' },
  { emoji: '🌮', title: 'Lunch Rush Deal', desc: '2 items + drink for $10 between 11am–2pm' },
];

export default function DashboardDave({ truck, menuItems = [] }) {
  const { toast } = useToast();
  const [boosting, setBoosting] = useState(false);
  const [boostResult, setBoostResult] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const { score, breakdown } = getVisibilityScore(truck, menuItems);
  const unmetCategories = CATEGORIES.filter(c => !c.condition(truck, menuItems));
  const metCategories = CATEGORIES.filter(c => c.condition(truck, menuItems));

  const getSuggestion = () => {
    if (!truck.image_url) return "📸 Add a logo photo to get 3× more profile clicks.";
    if (menuItems.length < 5) return "🍽️ Add more menu items — trucks with 5+ items get discovered more.";
    if (!menuItems.some(i => i.price <= 8)) return "💰 Add a $5–$8 item to appear in Cheap Eats listings.";
    if (!truck.cover_image_url) return "🖼️ A cover photo makes your truck page look pro and trustworthy.";
    return "🔥 You're looking good! Go live today to boost visibility.";
  };

  const handleBoost = async () => {
    setBoosting(true);
    setBoostResult(null);
    const deal = DEAL_IDEAS[Math.floor(Math.random() * DEAL_IDEAS.length)];
    const category = unmetCategories[0] || CATEGORIES[0];
    await new Promise(r => setTimeout(r, 1200));
    setBoostResult({ deal, category });
    setBoosting(false);
    toast({ title: '🚀 Boost plan ready!', description: 'Check your suggestions below.', duration: 2500 });
  };

  const scoreColor = score >= 75 ? '#77ffc8' : score >= 50 ? '#fbbf24' : '#fd591e';
  const scoreLabel = score >= 75 ? 'Strong' : score >= 50 ? 'Getting There' : 'Needs Work';

  return (
    <div className="rounded-2xl overflow-hidden mb-5" style={{ background: '#151d1f', border: '1px solid rgba(119,255,200,0.15)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(59,74,66,0.2)' }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(119,255,200,0.1)', border: '1px solid rgba(119,255,200,0.2)' }}>
          🤖
        </div>
        <div className="flex-1">
          <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>Dashboard Dave</p>
          <p className="text-[11px]" style={{ color: '#bacbc0' }}>Your personal visibility coach</p>
        </div>
        <button onClick={() => setExpanded(e => !e)}
          className="text-[10px] font-bold px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(119,255,200,0.08)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.2)' }}>
          {expanded ? 'Less' : 'Details'}
        </button>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Visibility Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: '#bacbc0' }}>VISIBILITY SCORE</p>
            <span className="text-[11px] font-black" style={{ color: scoreColor }}>{scoreLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: '#0d1517' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${score}%`, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}aa)` }} />
            </div>
            <span className="font-heading font-black text-lg flex-shrink-0" style={{ color: scoreColor }}>{score}</span>
          </div>
        </div>

        {/* Dave's Tip */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: '#0d1517' }}>
          <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#77ffc8' }} />
          <p className="text-sm leading-relaxed" style={{ color: '#dff0e8' }}>{getSuggestion()}</p>
        </div>

        {/* Expanded breakdown + categories */}
        {expanded && (
          <>
            {/* Checklist */}
            <div className="flex flex-col gap-1.5">
              {breakdown.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ color: item.done ? '#77ffc8' : 'rgba(186,203,192,0.3)' }} />
                  <span className="text-xs" style={{ color: item.done ? '#dff0e8' : '#bacbc0' }}>{item.label}</span>
                  {item.tip && !item.done && (
                    <span className="text-[10px] ml-auto" style={{ color: 'rgba(186,203,192,0.4)' }}>{item.tip}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Categories */}
            <div>
              <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: '#bacbc0' }}>CATEGORY PLACEMENT</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => {
                  const active = cat.condition(truck, menuItems);
                  return (
                    <div key={cat.id} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{
                        background: active ? 'rgba(119,255,200,0.07)' : '#0d1517',
                        border: `1px solid ${active ? 'rgba(119,255,200,0.2)' : 'rgba(59,74,66,0.2)'}`,
                        opacity: active ? 1 : 0.6,
                      }}>
                      <span className="text-base">{cat.emoji}</span>
                      <div>
                        <p className="text-[11px] font-black" style={{ color: active ? '#77ffc8' : '#bacbc0' }}>{cat.label}</p>
                        <p className="text-[9px]" style={{ color: 'rgba(186,203,192,0.5)' }}>{active ? '✓ Eligible' : cat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Boost Result */}
        {boostResult && (
          <div className="p-3 rounded-xl flex flex-col gap-2"
            style={{ background: 'rgba(119,255,200,0.06)', border: '1px solid rgba(119,255,200,0.2)' }}>
            <p className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>🚀 YOUR BOOST PLAN</p>
            <div className="flex items-start gap-2">
              <span className="text-xl">{boostResult.deal.emoji}</span>
              <div>
                <p className="text-sm font-black" style={{ color: '#dff0e8' }}>{boostResult.deal.title}</p>
                <p className="text-xs" style={{ color: '#bacbc0' }}>{boostResult.deal.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: '#0d1517' }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />
              <p className="text-xs" style={{ color: '#bacbc0' }}>
                Add to <span style={{ color: '#fbbf24' }}>{boostResult.category.emoji} {boostResult.category.label}</span> by: {boostResult.category.desc.toLowerCase()}
              </p>
            </div>
          </div>
        )}

        {/* Boost Button */}
        <button
          onClick={handleBoost}
          disabled={boosting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-heading font-black text-sm transition-all"
          style={{
            background: boosting ? '#2e3638' : 'linear-gradient(135deg,#77ffc8,#00e6a7)',
            color: boosting ? '#bacbc0' : '#003826',
            boxShadow: boosting ? 'none' : '0 0 16px rgba(119,255,200,0.25)',
          }}>
          {boosting
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Cooking up ideas...</>
            : <><Zap className="w-4 h-4" /> Boost My Truck</>
          }
        </button>
      </div>
    </div>
  );
}