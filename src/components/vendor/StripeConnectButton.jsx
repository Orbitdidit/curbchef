import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

const STATUS_CONFIG = {
  not_connected: {
    label: 'Connect Stripe',
    sub: 'Accept card payments from customers',
    color: '#77ffc8',
    bg: 'linear-gradient(135deg,#77ffc8,#00e6a7)',
    textColor: '#003826',
    icon: CreditCard,
  },
  onboarding_started: {
    label: 'Complete Stripe Setup',
    sub: 'Finish your payment account setup',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.12)',
    textColor: '#fbbf24',
    icon: AlertCircle,
  },
  charges_enabled: {
    label: 'Payments Active',
    sub: 'Accepting payments — payouts setup needed',
    color: '#77ffc8',
    bg: 'rgba(119,255,200,0.08)',
    textColor: '#77ffc8',
    icon: CheckCircle,
  },
  payouts_enabled: {
    label: 'Fully Connected',
    sub: 'Payments & payouts active',
    color: '#77ffc8',
    bg: 'rgba(119,255,200,0.08)',
    textColor: '#77ffc8',
    icon: CheckCircle,
  },
};

export default function StripeConnectButton({ truck, onStatusUpdate }) {
  const [loading, setLoading] = useState(false);

  const status = truck?.stripe_onboarding_status || 'not_connected';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_connected;
  const Icon = config.icon;
  const isFullyConnected = status === 'payouts_enabled';

  const handleConnect = async () => {
    setLoading(true);
    const origin = window.location.origin;
    const res = await base44.functions.invoke('stripeConnect', {
      action: 'create_account_link',
      return_url: `${origin}/vendor`,
      refresh_url: `${origin}/vendor`,
    });
    if (res.data?.url) {
      window.location.href = res.data.url;
    }
    setLoading(false);
  };

  const handleCheckStatus = async () => {
    if (!truck?.stripe_account_id) return;
    setLoading(true);
    const res = await base44.functions.invoke('stripeConnect', {
      action: 'check_status',
      stripe_account_id: truck.stripe_account_id,
    });
    if (res.data && onStatusUpdate) onStatusUpdate(res.data.status);
    setLoading(false);
  };

  return (
    <div className="p-4 rounded-2xl" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[10px] font-bold tracking-widest" style={{ color: '#bacbc0' }}>STRIPE PAYMENTS</p>
        {truck?.is_test_payment !== false && (
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
            TEST MODE
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: isFullyConnected ? 'rgba(119,255,200,0.1)' : 'rgba(253,89,30,0.08)' }}>
          <Icon className="w-5 h-5" style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-sm" style={{ color: config.textColor }}>{config.label}</p>
          <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>{config.sub}</p>
        </div>
      </div>

      {!isFullyConnected && (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-full font-heading font-black text-sm"
          style={{
            background: status === 'not_connected' ? 'linear-gradient(135deg,#77ffc8,#00e6a7)' : 'rgba(119,255,200,0.1)',
            color: status === 'not_connected' ? '#003826' : '#77ffc8',
            border: status !== 'not_connected' ? '1px solid rgba(119,255,200,0.3)' : 'none',
          }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          {loading ? 'Redirecting...' : status === 'not_connected' ? 'Connect Stripe Account' : 'Continue Stripe Setup'}
        </button>
      )}

      {status !== 'not_connected' && (
        <button onClick={handleCheckStatus} disabled={loading}
          className="w-full mt-2 py-2 rounded-full text-xs font-semibold"
          style={{ color: '#bacbc0', background: 'transparent' }}>
          {loading ? 'Checking...' : 'Refresh status'}
        </button>
      )}
    </div>
  );
}