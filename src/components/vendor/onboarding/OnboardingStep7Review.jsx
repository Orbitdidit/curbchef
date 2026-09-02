import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function OnboardingStep7Review({ truck, menuItems, onComplete }) {
  const checks = [
    { label: 'Truck name', done: !!truck?.name },
    { label: 'Cuisine type', done: !!truck?.cuisine_type },
    { label: 'Logo / photo', done: !!truck?.image_url },
    { label: 'Location', done: !!truck?.address || !!truck?.city },
    { label: 'Menu (3+ items)', done: (menuItems?.length || 0) >= 3 },
    { label: 'Stripe connected', done: truck?.stripe_onboarding_status === 'charges_enabled' || truck?.stripe_onboarding_status === 'payouts_enabled', optional: true },
  ];

  const required = checks.filter(c => !c.optional);
  const allRequiredDone = required.every(c => c.done);
  const pct = Math.round((checks.filter(c => c.done).length / checks.length) * 100);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-heading font-black text-xl mb-1" style={{ color: 'var(--cc-ink)' }}>Ready to launch? 🚀</p>
        <p className="text-sm" style={{ color: 'var(--cc-ink-dim)' }}>Review your setup before going live.</p>
      </div>

      {/* Score */}
      <div className="p-5 rounded-2xl text-center"
        style={{ background: 'var(--cc-bg-2)', border: '1px solid rgba(var(--cc-line-rgb),0.3)' }}>
        <p className="font-heading font-black text-5xl mb-1" style={{ color: 'var(--cc-accent)' }}>{pct}%</p>
        <p className="text-sm" style={{ color: 'var(--cc-ink-dim)' }}>Profile Complete</p>
        <div className="w-full h-2 rounded-full mt-3 overflow-hidden" style={{ background: 'var(--cc-bg-0)' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--cc-accent),var(--cc-accent-3))' }} />
        </div>
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-2">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'var(--cc-bg-2)' }}>
            {c.done
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cc-accent)' }} />
              : <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: c.optional ? 'var(--cc-ink-faint)' : 'var(--cc-warm-2)' }} />}
            <span className="text-sm flex-1" style={{ color: c.done ? 'var(--cc-ink)' : c.optional ? 'var(--cc-ink-faint)' : 'var(--cc-ink-dim)' }}>
              {c.label}
            </span>
            {c.optional && !c.done && (
              <span className="text-[10px] font-bold" style={{ color: 'var(--cc-ink-faint)' }}>Optional</span>
            )}
          </div>
        ))}
      </div>

      {!allRequiredDone && (
        <div className="px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(255,107,26,0.07)', border: '1px solid rgba(255,107,26,0.2)' }}>
          <p className="text-xs" style={{ color: 'var(--cc-warm-2)' }}>
            Complete the required fields above before launching.
          </p>
        </div>
      )}

      <button
        onClick={onComplete}
        disabled={!allRequiredDone}
        className="w-full py-4 rounded-full font-heading font-black text-base transition-all"
        style={{
          background: allRequiredDone ? 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))' : 'var(--cc-bg-2)',
          color: allRequiredDone ? 'var(--cc-accent-deep)' : 'var(--cc-ink-faint)',
          boxShadow: allRequiredDone ? '0 0 20px rgba(var(--cc-accent-rgb),0.3)' : 'none',
        }}>
        {allRequiredDone ? '🚀 Launch My Truck!' : 'Complete required fields first'}
      </button>
    </div>
  );
}