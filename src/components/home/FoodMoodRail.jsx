import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, UtensilsCrossed, ScanLine, Play, MapPin, Gift, Zap } from 'lucide-react';
const ICONS = [UtensilsCrossed, ScanLine, Play, MapPin, Gift, Zap];

const MOODS = [
  { label:'Order Now', emoji:'', href:'/explore', color:'rgba(var(--cc-accent-rgb),0.12)', border:'rgba(var(--cc-accent-rgb),0.25)', textColor:'var(--cc-accent)'},
  { label:'Food Scan', emoji:'', href:'/scan', color:'rgba(var(--cc-accent-rgb),0.08)', border:'rgba(var(--cc-accent-rgb),0.2)', textColor:'var(--cc-accent)'},
  { label:'Watch Live', emoji:'', href:'/live', color:'rgba(var(--cc-warm-red-rgb),0.1)', border:'rgba(var(--cc-warm-red-rgb),0.25)', textColor:'var(--cc-warm-red)'},
  { label:'Find on Map', emoji:'', href:'/map', color:'rgba(var(--cc-warm-rgb),0.1)', border:'rgba(var(--cc-warm-rgb),0.25)', textColor:'var(--cc-warm)'},
  { label:'My Rewards', emoji:'', href:'/rewards', color:'rgba(251,191,36,0.1)', border:'rgba(251,191,36,0.25)', textColor:'var(--cc-amber)'},
  { label:'Hot Deals', emoji:'', href:'/deals', color:'rgba(var(--cc-warm-rgb),0.1)', border:'rgba(var(--cc-warm-rgb),0.2)', textColor:'var(--cc-warm)'},
];

export default function FoodMoodRail() {
  return (
    <section className="mx-4 my-7 p-5 rounded-3xl bg-discovery-amber text-discovery-dark">
      <p className="text-[10px] font-mono uppercase tracking-[0.16em] mb-2">Pick your next move</p>
      <h2 className="font-heading text-2xl font-black tracking-tight mb-5">More than a menu.</h2>
      <div className="grid grid-cols-2 gap-2">
        {MOODS.map((m, index) => {
          const Icon = ICONS[index];
          return <Link key={m.label} to={m.href} className="bg-discovery-dark text-discovery-ink flex items-center gap-2.5 p-3.5 rounded-xl min-h-14 text-xs font-bold"><Icon className="w-4 h-4 text-discovery-amber shrink-0" /><span className="flex-1">{m.label}</span><ArrowUpRight className="w-3 h-3 shrink-0" /></Link>;
        })}
      </div>
    </section>
  );
}