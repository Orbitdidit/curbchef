import React from 'react';

/**
 * DemoBadge — marks sample trucks (FoodTruck.is_sample === true) so nobody
 * mistakes them for real vendors. Sample trucks exist to show new operators
 * what a finished page looks like. Remove them at public launch by setting
 * is_sample trucks to is_approved:false (or deleting them).
 */
export default function DemoBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center align-middle ml-1.5 px-1.5 py-0.5 rounded-[3px] ${className}`}
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '8px',
        letterSpacing: '0.14em',
        fontWeight: 500,
        lineHeight: 1.2,
        textTransform: 'uppercase',
        color: '#0C0D0E',
        background: '#F2BA62',
        verticalAlign: 'middle',
      }}
      title="Demo truck: example page, not a real vendor yet"
    >
      Demo
    </span>
  );
}
