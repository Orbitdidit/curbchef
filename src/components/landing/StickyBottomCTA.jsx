import React from 'react';
import { Link } from 'react-router-dom';

export default function StickyBottomCTA({ onEatClick }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
      style={{ background: 'rgba(13,21,23,0.96)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(var(--cc-line-rgb),0.25)' }}>
      <div className="flex gap-3 max-w-lg mx-auto">
        <button onClick={() => onEatClick('sticky_cta')}
          className="flex-1 py-3.5 rounded-full font-display text-sm transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color: 'var(--cc-accent-deep)', boxShadow: '0 0 16px rgba(var(--cc-accent-rgb),0.3)' }}>
          🍴 I want to EAT
        </button>
        <Link to="/onboard-truck" className="flex-1">
          <button className="w-full py-3.5 rounded-full font-display text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,var(--cc-warm),#e84c14)', color: '#fff', boxShadow: '0 0 16px rgba(var(--cc-warm-rgb),0.3)' }}>
            🚐 I run a TRUCK
          </button>
        </Link>
      </div>
    </div>
  );
}