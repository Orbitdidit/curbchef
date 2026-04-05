import React from 'react';
import { Link } from 'react-router-dom';

const PROMOS = [
  {
    id: 'rewards',
    icon: '⭐',
    tag: 'REWARDS',
    headline: 'Earn points on every pickup',
    sub: 'Unlock discounts, freebies, and VIP drops',
    cta: 'Start Earning',
    href: '/rewards',
    grad: 'linear-gradient(135deg, rgba(20,16,4,0.95) 0%, rgba(30,20,5,0.92) 100%)',
    glow: '0 0 32px rgba(255,215,0,0.12), 0 2px 16px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,215,0,0.2)',
    tagColor: '#FFD700',
    ctaBg: 'rgba(255,215,0,0.12)',
    ctaColor: '#FFD700',
    ctaBorder: '1px solid rgba(255,215,0,0.3)',
  },
  {
    id: 'vendor',
    icon: '🚚',
    tag: 'FOR VENDORS',
    headline: 'Get discovered. Get paid.',
    sub: 'Go live and reach hungry customers nearby',
    cta: 'Apply Now',
    href: '/vendor',
    grad: 'linear-gradient(135deg, rgba(4,18,14,0.95) 0%, rgba(4,22,16,0.92) 100%)',
    glow: '0 0 32px rgba(119,255,200,0.1), 0 2px 16px rgba(0,0,0,0.5)',
    border: '1px solid rgba(119,255,200,0.18)',
    tagColor: '#77ffc8',
    ctaBg: 'rgba(119,255,200,0.12)',
    ctaColor: '#77ffc8',
    ctaBorder: '1px solid rgba(119,255,200,0.3)',
  },
];

export default function PromoCard({ variant = 0 }) {
  const p = PROMOS[variant % PROMOS.length];

  return (
    <div className="px-5">
      <Link to={p.href}>
        <div
          className="rounded-2xl flex items-center gap-4 px-4 py-4"
          style={{
            background: p.grad,
            border: p.border,
            boxShadow: p.glow,
            backdropFilter: 'blur(16px)',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.05)', border: p.border }}
          >
            {p.icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black tracking-widest mb-0.5" style={{ color: p.tagColor }}>{p.tag}</p>
            <p className="font-heading font-black text-sm leading-snug" style={{ color: '#dff0e8' }}>{p.headline}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(186,203,192,0.65)' }}>{p.sub}</p>
          </div>

          {/* CTA */}
          <div
            className="px-3 py-1.5 rounded-full text-[11px] font-black flex-shrink-0 whitespace-nowrap"
            style={{ background: p.ctaBg, color: p.ctaColor, border: p.ctaBorder }}
          >
            {p.cta} →
          </div>
        </div>
      </Link>
    </div>
  );
}