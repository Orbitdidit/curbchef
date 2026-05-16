import React, { useState } from 'react';
import { Check } from 'lucide-react';

const SIZES = {
  sm: { circle: 16, icon: 10 },
  md: { circle: 20, icon: 13 },
  lg: { circle: 24, icon: 15 },
};

export default function VerifiedBadge({ size = 'md', showLabel = false, className = '' }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { circle, icon } = SIZES[size] || SIZES.md;

  return (
    <div
      className={`relative inline-flex items-center gap-1 ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{
          width: circle,
          height: circle,
          background: '#22C55E',
          boxShadow: '0 0 6px rgba(34,197,94,0.4)',
        }}
      >
        <Check strokeWidth={3} style={{ width: icon, height: icon, color: '#fff' }} />
      </div>

      {showLabel && (
        <span className="text-xs font-bold" style={{ color: '#22C55E' }}>Verified</span>
      )}

      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap z-50 pointer-events-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(34,197,94,0.3)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
        >
          This truck has been verified by CurbChef
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
            style={{ background: '#192123', borderRight: '1px solid rgba(34,197,94,0.3)', borderBottom: '1px solid rgba(34,197,94,0.3)', marginTop: -5 }} />
        </div>
      )}
    </div>
  );
}