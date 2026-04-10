import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Star, UserPlus, ShoppingBag } from 'lucide-react';

// Generates a contextual activity feed from real app data
export default function ActivityFeed({ trucks, orders = [] }) {
  const liveTrucks = trucks.filter(t => t.is_live);
  const openTrucks = trucks.filter(t => t.status === 'open');

  const events = [];

  liveTrucks.slice(0, 2).forEach(t => {
    events.push({
      id: `live-${t.id}`,
      icon: Flame,
      iconColor: '#ff3b30',
      iconBg: 'rgba(255,59,48,0.12)',
      text: <><span style={{ color: '#dff0e8', fontWeight: 700 }}>{t.name}</span> just went <span style={{ color: '#ff3b30', fontWeight: 700 }}>LIVE 🔴</span></>,
      sub: t.live_description || 'Streaming now — tap to watch',
      href: '/live',
      time: 'Just now',
    });
  });

  openTrucks.slice(0, 2).forEach((t, i) => {
    events.push({
      id: `open-${t.id}`,
      icon: ShoppingBag,
      iconColor: '#77ffc8',
      iconBg: 'rgba(119,255,200,0.1)',
      text: <><span style={{ color: '#dff0e8', fontWeight: 700 }}>{t.name}</span> is <span style={{ color: '#77ffc8', fontWeight: 700 }}>Open Now</span></>,
      sub: `${t.cuisine_type?.replace('_', ' ')} · Accepting orders`,
      href: `/truck/${t.id}`,
      time: `${5 + i * 3}m ago`,
    });
  });

  if (trucks.length > 0) {
    const top = [...trucks].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
    if (top) events.push({
      id: `top-${top.id}`,
      icon: Star,
      iconColor: '#fbbf24',
      iconBg: 'rgba(251,191,36,0.1)',
      text: <><span style={{ color: '#dff0e8', fontWeight: 700 }}>{top.name}</span> is trending 🌟</>,
      sub: `Rated ${top.rating?.toFixed(1) || '5.0'} · ${top.total_orders || 0}+ orders`,
      href: `/truck/${top.id}`,
      time: '1h ago',
    });
  }

  if (events.length === 0) return null;

  return (
    <div className="px-5 mt-6">
      <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: 'rgba(186,203,192,0.5)' }}>WHAT'S HAPPENING</p>
      <div className="flex flex-col gap-0 rounded-2xl overflow-hidden" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
        {events.slice(0, 4).map((ev, i) => {
          const Icon = ev.icon;
          return (
            <Link key={ev.id} to={ev.href}>
              <div className="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-white/5"
                style={{ borderBottom: i < events.slice(0, 4).length - 1 ? '1px solid rgba(59,74,66,0.12)' : 'none' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: ev.iconBg }}>
                  <Icon className="w-4 h-4" style={{ color: ev.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug" style={{ color: '#bacbc0' }}>{ev.text}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(186,203,192,0.5)' }}>{ev.sub}</p>
                </div>
                <span className="text-[10px] font-bold flex-shrink-0" style={{ color: 'rgba(186,203,192,0.35)' }}>{ev.time}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}