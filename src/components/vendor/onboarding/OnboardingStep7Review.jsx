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
        <p className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>Ready to launch? 🚀</p>
        <p className="text-sm" style={{ color: '#bacbc0' }}>Review your setup before going live.</p>
      </div>

      {/* Score */}
      <div className="p-5 rounded-2xl text-center"
        style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}>
        <p className="font-heading font-black text-5xl mb-1" style={{ color: '#77ffc8' }}>{pct}%</p>
        <p className="text-sm" style={{ color: '#bacbc0' }}>Profile Complete</p>
        <div className="w-full h-2 rounded-full mt-3 overflow-hidden" style={{ background: '#0d1517' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#77ffc8,#00e6a7)' }} />
        </div>
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-2">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: '#192123' }}>
            {c.done
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#77ffc8' }} />
              : <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: c.optional ? '#6B665C' : '#FF6B1A' }} />}
            <span className="text-sm flex-1" style={{ color: c.done ? '#dff0e8' : c.optional ? '#6B665C' : '#bacbc0' }}>
              {c.label}
            </span>
            {c.optional && !c.done && (
              <span className="text-[10px] font-bold" style={{ color: '#6B665C' }}>Optional</span>
            )}
          </div>
        ))}
      </div>

      {!allRequiredDone && (
        <div className="px-4 py-3 rounded-2xl"
          style={{ background: 'rgba(255,107,26,0.07)', border: '1px solid rgba(255,107,26,0.2)' }}>
          <p className="text-xs" style={{ color: '#FF6B1A' }}>
            Complete the required fields above before launching.
          </p>
        </div>
      )}

      <button
        onClick={onComplete}
        disabled={!allRequiredDone}
        className="w-full py-4 rounded-full font-heading font-black text-base transition-all"
        style={{
          background: allRequiredDone ? 'linear-gradient(135deg,#77ffc8,#00e6a7)' : '#192123',
          color: allRequiredDone ? '#003826' : '#6B665C',
          boxShadow: allRequiredDone ? '0 0 20px rgba(119,255,200,0.3)' : 'none',
        }}>
        {allRequiredDone ? '🚀 Launch My Truck!' : 'Complete required fields first'}
      </button>
    </div>
  );
}