import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Truck, LogIn } from 'lucide-react';

/**
 * VendorGate — wraps vendor pages to enforce:
 * 1. User must be authenticated
 * 2. User's account must be linked to a truck (owner_email match)
 *
 * If not authenticated → show login prompt
 * If authenticated but no truck → show "apply" state
 * If truck found → render children with truck passed as prop
 */
export default function VendorGate({ children }) {
  const [state, setState] = useState('loading'); // loading | no_auth | no_truck | ready
  const [user, setUser] = useState(null);
  const [truck, setTruck] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      if (!u) { setState('no_auth'); return; }
      setUser(u);
      const trucks = await base44.entities.FoodTruck.filter({ owner_email: u.email });
      if (!trucks?.length) { setState('no_truck'); return; }
      setTruck(trucks[0]);
      setState('ready');
    })();
  }, []);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1517' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
      </div>
    );
  }

  if (state === 'no_auth') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center" style={{ background: '#0d1517' }}>
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(119,255,200,0.08)', border: '1px solid rgba(119,255,200,0.2)' }}>
          <LogIn className="w-7 h-7" style={{ color: '#77ffc8' }} />
        </div>
        <h2 className="font-heading font-black text-xl mb-2" style={{ color: '#dff0e8' }}>Sign in to access your Vendor Dashboard</h2>
        <p className="text-sm mb-8" style={{ color: '#bacbc0' }}>Your vendor account, truck management, and earnings are waiting.</p>
        <button
          onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
          className="px-8 py-3.5 rounded-full font-heading font-black text-sm"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 20px rgba(119,255,200,0.3)' }}
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  if (state === 'no_truck') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center" style={{ background: '#0d1517' }}>
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
          style={{ background: 'rgba(253,89,30,0.08)', border: '1px solid rgba(253,89,30,0.2)' }}>
          <Truck className="w-7 h-7" style={{ color: '#fd591e' }} />
        </div>
        <h2 className="font-heading font-black text-xl mb-2" style={{ color: '#dff0e8' }}>No truck linked to your account</h2>
        <p className="text-sm mb-2" style={{ color: '#bacbc0' }}>
          Signed in as <span style={{ color: '#77ffc8' }}>{user?.email}</span>
        </p>
        <p className="text-sm mb-8" style={{ color: '#bacbc0' }}>Apply to list your food truck on CurbChef and start accepting orders.</p>
        <a href="/vendor-portal"
          className="px-8 py-3.5 rounded-full font-heading font-black text-sm"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 20px rgba(119,255,200,0.3)' }}>
          Apply as a Vendor
        </a>
        <p className="text-xs mt-4" style={{ color: '#bacbc0' }}>Already applied? Our team reviews within 24 hrs. Check your email for updates.</p>
      </div>
    );
  }

  // Inject truck + user into children
  return <>{typeof children === 'function' ? children({ truck, user }) : children}</>;
}