import React from 'react';
import { base44 } from '@/api/base44Client';
import { Clock } from 'lucide-react';

export default function NotApproved() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center" style={{ background: 'var(--cc-bg-0)' }}>
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(var(--cc-accent-rgb),0.08)', border: '1px solid rgba(var(--cc-accent-rgb),0.2)' }}>
        <Clock className="w-7 h-7" style={{ color: 'var(--cc-accent)' }} />
      </div>
      <h2 className="font-heading font-black text-2xl mb-2" style={{ color: 'var(--cc-ink)' }}>You're on the list!</h2>
      <p className="text-sm mb-8 max-w-xs leading-relaxed" style={{ color: 'var(--cc-ink-dim)' }}>
        CurbChef is currently in early access. We'll notify you the moment your spot opens up.
      </p>
      <a
        href="https://curbchef.app"
        className="px-8 py-3.5 rounded-full font-heading font-black text-sm mb-4"
        style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color: 'var(--cc-accent-deep)', boxShadow: '0 0 20px rgba(var(--cc-accent-rgb),0.3)' }}
      >
        Back to curbchef.app
      </a>
      <button
        onClick={() => base44.auth.logout('https://curbchef.app')}
        className="px-6 py-2 rounded-full text-sm font-semibold"
        style={{ color: 'var(--cc-ink-faint)' }}
      >
        Sign out
      </button>
    </div>
  );
}