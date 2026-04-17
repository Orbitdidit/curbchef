import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

/**
 * Vendor-facing reliability score card shown on the dashboard.
 * Shows score, ring, violation breakdown, and low-score warning.
 */
export default function ReliabilityCard({ truck }) {
  const score = truck.reliability_score ?? 100;
  const lateOpens = truck.late_opens_count || 0;
  const earlyCloses = truck.early_closes_count || 0;
  const noShows = truck.no_show_days || 0;
  const isLow = score < 50;
  const isWarning = score < 75;

  // Ring color
  const ringColor = score >= 95 ? '#77ffc8' : score >= 75 ? '#fbbf24' : score >= 50 ? '#fd591e' : '#ff3b30';

  // SVG ring
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="mb-5 rounded-2xl overflow-hidden" style={{ background: '#192123', border: `1px solid ${isLow ? 'rgba(255,59,48,0.3)' : 'rgba(119,255,200,0.1)'}` }}>
      {/* Low score warning banner */}
      {isLow && (
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'rgba(255,59,48,0.12)', borderBottom: '1px solid rgba(255,59,48,0.2)' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#ff3b30' }} />
          <p className="text-xs font-bold" style={{ color: '#ff3b30' }}>
            ⚠️ Reliability score low — maintain schedule to regain visibility
          </p>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4" style={{ color: ringColor }} />
          <p className="text-[10px] font-bold tracking-widest" style={{ color: ringColor }}>RELIABILITY SCORE</p>
        </div>

        <div className="flex items-center gap-5 mb-4">
          {/* Score ring */}
          <div className="flex-shrink-0 relative">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(59,74,66,0.4)" strokeWidth="6" />
              <circle
                cx="36" cy="36" r={r}
                fill="none"
                stroke={ringColor}
                strokeWidth="6"
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
                style={{ filter: `drop-shadow(0 0 6px ${ringColor}60)` }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading font-black text-lg" style={{ color: ringColor }}>{score}</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="flex-1 flex flex-col gap-2">
            {[
              { label: 'Late opens', count: lateOpens, penalty: lateOpens * 3, color: '#fbbf24' },
              { label: 'Early closes', count: earlyCloses, penalty: earlyCloses * 2, color: '#fd591e' },
              { label: 'No-show days', count: noShows, penalty: noShows * 10, color: '#ff3b30' },
            ].map(({ label, count, penalty, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#bacbc0' }}>{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black" style={{ color: count > 0 ? color : '#bacbc0' }}>{count}×</span>
                  {count > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
                      −{penalty} pts
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status message */}
        <div className="text-center py-2 rounded-xl" style={{ background: '#0d1517' }}>
          <p className="text-xs font-semibold" style={{ color: isLow ? '#ff3b30' : isWarning ? '#fbbf24' : '#77ffc8' }}>
            {score >= 95 ? '🟢 Excellent — keep it up!'
              : score >= 75 ? '🟡 Good — stay consistent to reach On Time status'
              : score >= 50 ? '🟠 At risk — improve punctuality to stay visible'
              : '🔴 Hidden from Open Now filters'}
          </p>
        </div>
      </div>
    </div>
  );
}