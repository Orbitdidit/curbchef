import React from 'react';
import { Link } from 'react-router-dom';

export default function StickyBottomCTA({ onEatClick }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
      style={{ background: 'rgba(13,21,23,0.96)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(59,74,66,0.25)' }}>
      <div className="flex gap-3 max-w-lg mx-auto">
        <button onClick={() => onEatClick('sticky_cta')}
          className="flex-1 py-3.5 rounded-full font-heading font-black text-sm transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 16px rgba(119,255,200,0.3)' }}>
          🍴 I want to EAT
        </button>
        <Link to="/onboard-truck" className="flex-1">
          <button className="w-full py-3.5 rounded-full font-heading font-black text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#fd591e,#e84c14)', color: '#fff', boxShadow: '0 0 16px rgba(253,89,30,0.3)' }}>
            🚐 I run a TRUCK
          </button>
        </Link>
      </div>
    </div>
  );
}