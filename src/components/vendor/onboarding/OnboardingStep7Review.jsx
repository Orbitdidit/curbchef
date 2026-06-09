import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function OnboardingStep7Review({ truck, menuItems, onComplete }) {
  const checks = [
    { label: 'Truck name set', pass: !!truck?.name },
    { label: 'Cuisine type selected', pass: !!truck?.cuisine_type },
    { label: 'Logo uploaded', pass: !!truck?.image_url },
    { label: 'Cover photo uploaded', pass: !!truck?.cover_image_url },
    { label: 'Address / city set', pass: !!truck?.address || !!truck?.city },
    { label: 'At least 3 menu items', pass: menuItems?.length >= 3 },
  ];

  const passed = checks.filter(c => c.pass).length;
  const pct = Math.round((passed / checks.length) * 100);
  const allRequired = checks.every(c => c.pass);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>Ready to launch? 🎉</h2>
        <p className="text-sm" style={{ color: '#bacbc0' }}>Review your setup before going live.</p>
      </div>

      {/* Score */}
      <div className="p-5 rounded-2xl text-center" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.4)' }}>
        <p className="font-heading font-black text-4xl mb-1" style={{ color: pct === 100 ? '#77ffc8' : '#FFD60A' }}>{pct}%</p>
        <p className="text-sm" style={{ color: '#bacbc0' }}>Profile complete — {passed}/{checks.length} items done</p>
        <div className="w-full h-2 rounded-full mt-3 overflow-hidden" style={{ background: '#0d1517' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg,#77ffc8,#00e6a7)' : '#FFD60A' }} />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: c.pass ? 'rgba(119,255,200,0.05)' : 'rgba(255,59,48,0.05)', border: `1px solid ${c.pass ? 'rgba(119,255,200,0.2)' : 'rgba(255,59,48,0.2)'}` }}>
            {c.pass
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#77ffc8' }} />
              : <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#FF3B30' }} />}
            <span className="text-sm" style={{ color: c.pass ? '#dff0e8' : '#bacbc0' }}>{c.label}</span>
          </div>
        ))}
      </div>

      {!allRequired && (
        <p className="text-xs text-center px-2" style={{ color: '#bacbc0' }}>
          Complete the required items above, then come back to launch.
        </p>
      )}

      <button onClick={onComplete}
        className="w-full py-4 rounded-full font-heading font-black text-base transition-all active:scale-95"
        style={{
          background: allRequired ? 'linear-gradient(135deg,#77ffc8,#00e6a7)' : '#192123',
          color: allRequired ? '#003826' : '#6B665C',
          boxShadow: allRequired ? '0 0 24px rgba(119,255,200,0.35)' : 'none',
        }}>
        {allRequired ? '🚀 Launch My Truck!' : 'Go to Dashboard →'}
      </button>
    </div>
  );
}