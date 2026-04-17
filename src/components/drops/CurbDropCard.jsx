import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt) - Date.now();
      if (diff <= 0) { setRemaining('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return remaining;
}

export default function CurbDropCard({ drop }) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const qc = useQueryClient();
  const countdown = useCountdown(drop.expires_at);
  const isSoldOut = drop.current_claims >= drop.max_claims;
  const claimsLeft = drop.max_claims - drop.current_claims;
  const pctFull = Math.min((drop.current_claims / drop.max_claims) * 100, 100);

  const handleClaim = async () => {
    if (claiming || claimed || isSoldOut) return;
    setClaiming(true);
    const user = await base44.auth.me().catch(() => null);
    if (!user) { base44.auth.redirectToLogin(); return; }

    // Increment claims
    await base44.entities.CurbDrop.update(drop.id, {
      current_claims: (drop.current_claims || 0) + 1,
    });

    // Create a pre-filled order for the drop
    await base44.entities.Order.create({
      truck_id: drop.truck_id,
      truck_name: drop.truck_name,
      customer_email: user.email,
      customer_name: user.full_name,
      items: [{ name: drop.title, price: drop.deal_price, quantity: 1 }],
      subtotal: drop.deal_price,
      total: drop.deal_price,
      status: 'placed',
      pickup_code: Math.random().toString(36).slice(2, 6).toUpperCase(),
    });

    qc.invalidateQueries({ queryKey: ['curb-drops'] });
    qc.invalidateQueries({ queryKey: ['curb-drops-home'] });
    setClaiming(false);
    setClaimed(true);
  };

  return (
    <div className="rounded-3xl overflow-hidden flex-shrink-0"
      style={{
        width: '280px',
        background: '#192123',
        border: isSoldOut ? '1px solid rgba(59,74,66,0.2)' : '1px solid rgba(253,89,30,0.25)',
        boxShadow: isSoldOut ? 'none' : '0 0 20px rgba(253,89,30,0.1)',
      }}>
      {/* Image */}
      <div className="relative" style={{ height: '160px' }}>
        {drop.image_url ? (
          <img src={drop.image_url} alt={drop.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl" style={{ background: '#0d1517' }}>🔥</div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(13,21,23,0) 40%,rgba(13,21,23,0.95) 100%)' }} />

        {/* Countdown badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
          style={{ background: 'rgba(253,89,30,0.92)', backdropFilter: 'blur(8px)' }}>
          <Clock className="w-3 h-3 text-white" />
          <span className="text-[10px] font-black text-white">{countdown}</span>
        </div>

        {/* Truck name */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-heading font-black text-sm text-white leading-tight">{drop.title}</p>
          <p className="text-white/60 text-xs mt-0.5">{drop.truck_name}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Price row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-heading font-black text-2xl" style={{ color: '#fd591e' }}>
            ${drop.deal_price?.toFixed(2)}
          </span>
          {drop.original_price > 0 && (
            <span className="text-sm line-through" style={{ color: '#bacbc0' }}>
              ${drop.original_price?.toFixed(2)}
            </span>
          )}
          {drop.original_price > 0 && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full ml-auto"
              style={{ background: 'rgba(253,89,30,0.15)', color: '#fd591e' }}>
              {Math.round((1 - drop.deal_price / drop.original_price) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Claims progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" style={{ color: '#bacbc0' }} />
              <span className="text-xs font-bold" style={{ color: isSoldOut ? '#fd591e' : '#bacbc0' }}>
                {isSoldOut ? 'SOLD OUT' : `${drop.current_claims} / ${drop.max_claims} claimed`}
              </span>
            </div>
            {!isSoldOut && (
              <span className="text-[10px] font-black" style={{ color: '#77ffc8' }}>{claimsLeft} left</span>
            )}
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(59,74,66,0.4)' }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${pctFull}%`,
                background: isSoldOut ? '#fd591e' : 'linear-gradient(90deg,#fd591e,#ff8c00)',
              }} />
          </div>
        </div>

        {/* Claim button */}
        <button
          onClick={handleClaim}
          disabled={claiming || claimed || isSoldOut}
          className="w-full py-3 rounded-2xl font-heading font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          style={
            claimed
              ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.3)' }
              : isSoldOut
              ? { background: '#2e3638', color: '#bacbc0', opacity: 0.5 }
              : { background: 'linear-gradient(135deg,#fd591e,#ff8c00)', color: '#fff', boxShadow: '0 0 14px rgba(253,89,30,0.35)' }
          }
        >
          {claimed ? '✓ Claimed! Check Orders' : isSoldOut ? 'Sold Out' : claiming ? 'Claiming...' : (
            <><Zap className="w-4 h-4" /> Claim Drop</>
          )}
        </button>
      </div>
    </div>
  );
}