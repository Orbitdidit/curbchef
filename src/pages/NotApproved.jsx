import React from 'react';
import { base44 } from '@/api/base44Client';
import { Clock } from 'lucide-react';

export default function NotApproved() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center" style={{ background: '#0d1517' }}>
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(119,255,200,0.08)', border: '1px solid rgba(119,255,200,0.2)' }}>
        <Clock className="w-7 h-7" style={{ color: '#77ffc8' }} />
      </div>
      <h2 className="font-heading font-black text-2xl mb-2" style={{ color: '#dff0e8' }}>You're on the list!</h2>
      <p className="text-sm mb-8 max-w-xs leading-relaxed" style={{ color: '#bacbc0' }}>
        CurbChef is currently in early access. We'll notify you the moment your spot opens up.
      </p>
      <a
        href="https://curbchef.app"
        className="px-8 py-3.5 rounded-full font-heading font-black text-sm mb-4"
        style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 20px rgba(119,255,200,0.3)' }}
      >
        Back to curbchef.app
      </a>
      <button
        onClick={() => base44.auth.logout('https://curbchef.app')}
        className="px-6 py-2 rounded-full text-sm font-semibold"
        style={{ color: '#6B665C' }}
      >
        Sign out
      </button>
    </div>
  );
}