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
      <button
        onClick={() => base44.auth.logout('/')}
        className="px-6 py-3 rounded-full text-sm font-bold"
        style={{ background: 'rgba(255,255,255,0.06)', color: '#bacbc0', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        Sign Out
      </button>
    </div>
  );
}