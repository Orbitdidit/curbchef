import React from 'react';

export default function SignIn({ navigateToLogin }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#17191C' }}>
      <h1 className="font-display text-3xl tracking-[0.2em]" style={{ color: '#F7F2E7' }}>CURBCHEF</h1>
      <p className="text-xs tracking-widest mt-2 mb-10" style={{ color: '#8A857C' }}>Houston street food. Live.</p>
      <button
        onClick={() => navigateToLogin()}
        className="w-full py-3.5 rounded-full font-heading font-bold text-sm"
        style={{ maxWidth: 280, background: '#E8442A', color: '#FFF3EF' }}
      >
        Sign in
      </button>
      <a href="https://curbchef.app" className="text-xs mt-6" style={{ color: '#8A857C' }}>Back to curbchef.app</a>
    </div>
  );
}