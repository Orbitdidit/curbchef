import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, ExternalLink } from 'lucide-react';

export default function OnboardingStep5Payments({ truck }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isConnected = truck?.stripe_onboarding_status === 'payouts_enabled' ||
                      truck?.stripe_onboarding_status === 'charges_enabled';

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    const res = await base44.functions.invoke('stripeConnect', { truck_id: truck.id });
    if (res.data?.url) {
      window.open(res.data.url, '_blank');
    } else {
      setError('Could not start bank setup. Please try again or contact support.');
    }
    setLoading(false);
  };

  if (isConnected) {
    return (
      <div className="flex flex-col gap-6 pb-4">
        <div>
          <h2 className="font-heading font-black text-2xl mb-1" style={{ color: '#dff0e8' }}>Add your bank info 💳</h2>
        </div>
        <div className="flex flex-col items-center gap-4 py-10 px-6 rounded-3xl text-center"
          style={{ background: 'rgba(119,255,200,0.06)', border: '1px solid rgba(119,255,200,0.2)' }}>
          <CheckCircle className="w-14 h-14" style={{ color: '#77ffc8' }} />
          <p className="font-heading font-black text-xl" style={{ color: '#77ffc8' }}>You're all set!</p>
          <p className="text-sm" style={{ color: '#bacbc0' }}>
            Your bank account is connected. Money from orders goes straight to you — CurbChef takes a 12% fee and passes the rest through.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <div>
        <h2 className="font-heading font-black text-2xl mb-1" style={{ color: '#dff0e8' }}>Add your bank info 💳</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#bacbc0' }}>
          This is how you get paid. Connect your bank account so money from orders lands in your pocket automatically.
        </p>
      </div>

      <div className="p-4 rounded-2xl" style={{ background: 'rgba(119,255,200,0.04)', border: '1px solid rgba(119,255,200,0.1)' }}>
        <p className="text-xs font-bold mb-2" style={{ color: '#77ffc8' }}>How it works:</p>
        <ul className="text-xs space-y-1.5" style={{ color: '#bacbc0' }}>
          <li>✓ Customer pays → money goes to your bank in 2 business days</li>
          <li>✓ CurbChef takes 12% — that covers the app, payment processing, and marketing</li>
          <li>✓ You keep 88% of every order</li>
          <li>✓ Your banking info is secured by Stripe — the same company used by Amazon</li>
        </ul>
      </div>

      <div className="p-4 rounded-2xl" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <p className="text-xs font-bold mb-1" style={{ color: '#fbbf24' }}>📋 You'll need:</p>
        <p className="text-xs" style={{ color: '#bacbc0' }}>
          Your Social Security Number (or EIN for a business), your bank account and routing number, and a phone number to verify your identity.
        </p>
      </div>

      {error && <p className="text-sm text-center" style={{ color: '#fd591e' }}>{error}</p>}

      <button onClick={handleConnect} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-heading font-black text-base transition-all"
        style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 20px rgba(119,255,200,0.3)', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Opening setup...' : '🏦 Set Up My Bank Account'}
        {!loading && <ExternalLink className="w-4 h-4" />}
      </button>
      <p className="text-xs text-center" style={{ color: '#6B665C' }}>
        Opens in a new tab. Come back here when you're done.
      </p>
    </div>
  );
}