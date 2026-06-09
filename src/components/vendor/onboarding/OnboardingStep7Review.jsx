import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function OnboardingStep7Review({ truck, menuItems, onComplete }) {
  const checks = [
    { label: 'Truck name', done: !!truck?.name },
    { label: 'Cuisine type', done: !!truck?.cuisine_type },
    { label: 'Description', done: !!truck?.description },
    { label: 'Logo photo', done: !!truck?.image_url },
    { label: 'Cover photo', done: !!truck?.cover_image_url },
    { label: 'Address / location', done: !!truck?.address },
    { label: 'Menu (5+ items)', done: menuItems.length >= 5 },
    { label: 'Bank account connected', done: ['charges_enabled', 'payouts_enabled'].includes(truck?.stripe_onboarding_status) },
  ];

  const passed = checks.filter(c => c.done).length;
  const pct = Math.round((passed / checks.length) * 100);
  const requiredDone = checks.slice(0, 7).every(c => c.done);

  return (
    <div className="flex flex-col gap-6 pb-4">
      <div>
        <h2 className="font-heading font-black text-2xl mb-1" style={{ color: '#dff0e8' }}>Ready to go live? 🚀</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#bacbc0' }}>
          Here's a quick checklist before your truck goes live on CurbChef.
        </p>
      </div>

      {/* Score */}
      <div className="p-5 rounded-2xl text-center"
        style={{ background: pct >= 80 ? 'rgba(119,255,200,0.07)' : 'rgba(251,191,36,0.07)', border: `1px solid ${pct >= 80 ? 'rgba(119,255,200,0.2)' : 'rgba(251,191,36,0.2)'}` }}>
        <p className="font-heading font-black text-5xl mb-1" style={{ color: pct >= 80 ? '#77ffc8' : '#fbbf24' }}>{pct}%</p>
        <p className="text-sm font-semibold" style={{ color: '#bacbc0' }}>
          {pct === 100 ? "Perfect — fully ready to launch!" : pct >= 80 ? "Almost there! Fill in the rest after launch." : "Finish the required steps to go live."}
        </p>
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-2">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: '#192123' }}>
            {c.done
              ? <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#77ffc8' }} />
              : <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#fd591e' }} />
            }
            <p className="text-sm font-semibold" style={{ color: c.done ? '#dff0e8' : '#bacbc0' }}>{c.label}</p>
            {!c.done && <span className="ml-auto text-xs" style={{ color: '#fd591e' }}>Missing</span>}
          </div>
        ))}
      </div>

      {!requiredDone && (
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(253,89,30,0.06)', border: '1px solid rgba(253,89,30,0.2)' }}>
          <p className="text-sm font-bold mb-1" style={{ color: '#fd591e' }}>Almost there!</p>
          <p className="text-xs" style={{ color: '#bacbc0' }}>
            Go back and fill in the missing required items. You can still launch and add your bank info later — but you won't be able to accept payments until it's set up.
          </p>
        </div>
      )}

      <button onClick={onComplete}
        className="w-full py-4 rounded-full font-heading font-black text-lg transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 24px rgba(119,255,200,0.4)' }}>
        {requiredDone ? '🚀 Launch My Truck!' : '✅ Save & Go to Dashboard'}
      </button>
      <p className="text-xs text-center" style={{ color: '#6B665C' }}>
        You can always come back and edit everything from your dashboard.
      </p>
    </div>
  );
}