import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { DollarSign, CheckCircle2, ExternalLink } from 'lucide-react';

export default function OnboardingStep5Payments({ truck }) {
  const [loading, setLoading] = useState(false);

  const isConnected = truck?.stripe_onboarding_status === 'charges_enabled'
    || truck?.stripe_onboarding_status === 'payouts_enabled';

  const handleConnect = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('stripeConnect', {
      action: 'create_account_link',
      truck_id: truck.id,
      return_url: `${window.location.origin}/vendor/onboarding`,
      refresh_url: `${window.location.origin}/vendor/onboarding`,
    });
    if (res.data?.url) window.open(res.data.url, '_blank');
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>Get paid</p>
        <p className="text-sm" style={{ color: '#bacbc0' }}>Connect your bank account through Stripe to receive payments.</p>
      </div>

      <div className="p-4 rounded-2xl flex flex-col gap-3"
        style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(119,255,200,0.1)' }}>
            <DollarSign className="w-5 h-5" style={{ color: '#77ffc8' }} />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: '#dff0e8' }}>CurbChef takes 12%</p>
            <p className="text-xs" style={{ color: '#bacbc0' }}>You keep 88% of every order.</p>
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl"
          style={{ background: 'rgba(119,255,200,0.07)', border: '1px solid rgba(119,255,200,0.25)' }}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#77ffc8' }} />
          <div>
            <p className="font-bold text-sm" style={{ color: '#77ffc8' }}>Stripe connected!</p>
            <p className="text-xs" style={{ color: '#bacbc0' }}>You're all set to receive payments.</p>
          </div>
        </div>
      ) : (
        <button onClick={handleConnect} disabled={loading}
          className="flex items-center justify-center gap-2 py-4 rounded-2xl font-heading font-black text-sm"
          style={{ background: 'linear-gradient(135deg,#635BFF,#7B73FF)', color: 'white', opacity: loading ? 0.7 : 1 }}>
          <ExternalLink className="w-4 h-4" />
          {loading ? 'Opening Stripe…' : 'Connect Bank Account via Stripe'}
        </button>
      )}

      <p className="text-xs text-center" style={{ color: '#6B665C' }}>
        You can skip this and set it up later from your dashboard.
      </p>
    </div>
  );
}