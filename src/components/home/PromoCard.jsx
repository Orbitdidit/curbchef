import React from 'react';
import { Link } from 'react-router-dom';

const PROMOS = [
  {
    id: 'rewards',
    emoji: '⭐',
    tag: 'REWARDS',
    headline: 'Earn Points Every Order',
    sub: 'Level up from Starter to Legend — unlock free food.',
    cta: 'Start Earning',
    href: '/rewards',
    grad: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(253,89,30,0.08) 100%)',
    border: 'rgba(255,215,0,0.25)',
    tagColor: '#FFD700',
    ctaStyle: { background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.35)' },
  },
  {
    id: 'vendor',
    emoji: '🚚',
    tag: 'FOR VENDORS',
    headline: 'Drive More Revenue',
    sub: 'Join CurbChef — go live, get discovered, get paid.',
    cta: 'Apply Now',
    href: '/vendor',
    grad: 'linear-gradient(135deg, rgba(119,255,200,0.12) 0%, rgba(0,230,167,0.06) 100%)',
    border: 'rgba(119,255,200,0.25)',
    tagColor: '#77ffc8',
    ctaStyle: { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.3)' },
  },
];

export default function PromoCard({ variant = 0 }) {
  const p = PROMOS[variant % PROMOS.length];

  return (
    <div className="px-5">
      <Link to={p.href}>
        <div
          className="rounded-3xl p-5 flex items-center gap-4 group"
          style={{
            background: p.grad,
            border: `1px solid ${p.border}`,
            backdropFilter: 'blur(12px)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${p.border}`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${p.border}` }}
          >
            {p.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <span
              className="text-[9px] font-black tracking-widest"
              style={{ color: p.tagColor }}
            >
              {p.tag}
            </span>
            <p className="font-heading font-black text-base leading-tight mt-0.5" style={{ color: '#dff0e8' }}>
              {p.headline}
            </p>
            <p className="text-xs mt-1 leading-snug" style={{ color: '#bacbc0' }}>{p.sub}</p>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
            style={p.ctaStyle}
          >
            {p.cta} →
          </div>
        </div>
      </Link>
    </div>
  );
}