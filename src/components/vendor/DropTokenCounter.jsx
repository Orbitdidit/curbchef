import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const PLAN_MAX = { free: 2, standard: 10, plus: 25, premium: 60 };

export default function DropTokenCounter({ truck }) {
  const [buying, setBuying] = useState(false);

  const tokens = truck.drop_tokens ?? 2;
  const maxTokens = PLAN_MAX[truck.vendor_plan || 'free'] ?? 2;
  const pct = maxTokens > 0 ? Math.min(tokens / maxTokens, 1) : 0;
  const isEmpty = tokens === 0;

  // SVG ring
  const R = 30;
  const CIRC = 2 * Math.PI * R;
  const dash = pct * CIRC;
  const gap = CIRC - dash;

  const ringColor = isEmpty ? '#fd591e' : tokens <= Math.ceil(maxTokens * 0.25) ? '#fbbf24' : '#77ffc8';
  const bgColor = isEmpty ? 'rgba(253,89,30,0.08)' : 'rgba(119,255,200,0.06)';
  const borderColor = isEmpty ? 'rgba(253,89,30,0.3)' : 'rgba(119,255,200,0.18)';

  const handleBuyPack = async () => {
    setBuying(true);
    const res = await base44.functions.invoke('buyTokenPack', {
      truck_id: truck.id,
      success_url: `${window.location.origin}/vendor?token_pack=success`,
      cancel_url: `${window.location.origin}/vendor`,
    });
    if (res.data?.checkout_url) {
      window.location.href = res.data.checkout_url;
    }
    setBuying(false);
  };

  return (
    <div className="mb-5 p-4 rounded-2xl" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
      <div className="flex items-center gap-4">
        {/* SVG ring */}
        <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
          <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx="36" cy="36" r={R} fill="none" stroke="rgba(186,203,192,0.1)" strokeWidth="6" />
            {/* Fill */}
            {pct > 0 && (
              <circle
                cx="36" cy="36" r={R}
                fill="none"
                stroke={ringColor}
                strokeWidth="6"
                strokeDasharray={`${dash} ${gap}`}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${ringColor}66)` }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading font-black text-xl leading-none" style={{ color: ringColor }}>{tokens}</span>
            <span className="text-[9px] font-bold" style={{ color: '#bacbc0' }}>drops</span>
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          {isEmpty ? (
            <>
              <p className="font-heading font-black text-sm leading-tight mb-0.5" style={{ color: '#fd591e' }}>
                Out of drops
              </p>
              <p className="text-xs" style={{ color: '#bacbc0' }}>
                Upgrade your plan or wait until Monday
              </p>
            </>
          ) : (
            <>
              <p className="font-heading font-black text-sm leading-tight mb-0.5" style={{ color: '#dff0e8' }}>
                🎟️ {tokens} Drop{tokens !== 1 ? 's' : ''} left this week
              </p>
              <p className="text-xs" style={{ color: '#bacbc0' }}>
                {tokens}/{maxTokens} · Resets every Monday
              </p>
            </>
          )}

          {/* Actions row */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleBuyPack}
              disabled={buying}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
            >
              <ShoppingBag className="w-3 h-3" />
              {buying ? 'Loading...' : '+3 for $5'}
            </button>
            {isEmpty && (
              <Link to="/vendor/plans"
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.25)' }}>
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}