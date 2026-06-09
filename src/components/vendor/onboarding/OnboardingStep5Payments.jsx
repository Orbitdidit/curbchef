import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, ExternalLink } from 'lucide-react';

export default function OnboardingStep5Payments({ truck }) {
  const [loading, setLoading] = useState(false);
  const isConnected = truck?.stripe_onboarding_status === 'charges_enabled' || truck?.stripe_onboarding_status === 'payouts_enabled';

  const handleConnect = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('stripeConnect', { truck_id: truck?.id });
    if (res.data?.url) window.open(res.data.url, '_blank');
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>Get paid 💸</h2>
        <p className="text-sm" style={{ color: '#bacbc0' }}>Connect your bank account via Stripe to receive payouts after every order.</p>
      </div>

      <div className="p-4 rounded-2xl space-y-2" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.4)' }}>
        <p className="text-xs font-bold" style={{ color: '#77ffc8' }}>Fee structure</p>
        <p className="text-sm" style={{ color: '#bacbc0' }}>CurbChef takes a <strong style={{ color: '#dff0e8' }}>12% platform fee</strong> per order. You keep 88%.</p>
        <p className="text-xs" style={{ color: '#6B665C' }}>Stripe processing fees (~2.9% + 30¢) are separate.</p>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'rgba(119,255,200,0.08)', border: '1px solid rgba(119,255,200,0.25)' }}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#77ffc8' }} />
          <div>
            <p className="font-bold text-sm" style={{ color: '#77ffc8' }}>Stripe connected!</p>
            <p className="text-xs" style={{ color: '#bacbc0' }}>You're ready to accept payments.</p>
          </div>
        </div>
      ) : (
        <button onClick={handleConnect} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-heading font-black text-sm transition-all"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', opacity: loading ? 0.7 : 1 }}>
          <ExternalLink className="w-4 h-4" />
          {loading ? 'Opening Stripe…' : 'Connect Bank Account (Stripe)'}
        </button>
      )}

      <p className="text-xs text-center" style={{ color: '#6B665C' }}>
        You can skip this for now and connect later from your dashboard.
      </p>
    </div>
  );
}