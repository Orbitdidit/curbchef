import React from 'react';

/**
 * Public-facing reliability badge shown on truck cards and profiles.
 * 95-100 → green "On Time"
 * 75-94  → yellow "Usually On Time"
 * <75    → no badge
 */
export default function ReliabilityBadge({ score, size = 'sm' }) {
  if (score == null || score < 75) return null;

  const isGreen = score >= 95;
  const label = isGreen ? '🟢 On Time' : '🟡 Usually On Time';
  const style = isGreen
    ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.3)' }
    : { background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' };

  return (
    <span
      className={`font-bold rounded-full ${size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-xs px-3 py-1'}`}
      style={style}
    >
      {label}
    </span>
  );
}