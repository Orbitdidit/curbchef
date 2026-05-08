import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import confetti from 'canvas-confetti';

export default function WaitlistModal({ source, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Email is required.'); return; }
    setLoading(true);

    const existing = await base44.entities.WaitlistEntry.filter({ email });
    if (existing.length > 0) {
      setError("You're already on the waitlist! 🎉");
      setLoading(false);
      return;
    }

    const all = await base44.entities.WaitlistEntry.list();
    const position = all.length + 1;

    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref') || null;

    await base44.entities.WaitlistEntry.create({
      email,
      phone: phone || undefined,
      position,
      referred_by: refCode || undefined,
      referral_count: 0,
      signup_date: new Date().toISOString(),
      signup_source: source || 'hero',
      notified_launch: false,
    });

    if (refCode) {
      const referrers = await base44.entities.WaitlistEntry.filter({ email: refCode });
      if (referrers.length > 0) {
        const r = referrers[0];
        await base44.entities.WaitlistEntry.update(r.id, {
          referral_count: (r.referral_count || 0) + 1,
          position: Math.max(1, (r.position || 1) - 10),
        });
      }
    }

    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#77ffc8', '#00e6a7', '#fd591e', '#ffffff'] });
    setLoading(false);
    onSuccess({ email, position });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl p-6 pb-8"
        style={{ background: '#151d1f', border: '1px solid rgba(119,255,200,0.25)' }}
        onClick={e => e.stopPropagation()}>
        <h3 className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>Get early access 🚀</h3>
        <p className="text-xs mb-5" style={{ color: '#bacbc0' }}>
          Founding members get lifetime perks — limited spots.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
            style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
          <input type="tel" placeholder="Phone (optional — for launch alerts)" value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
            style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
          {error && <p className="text-xs px-1" style={{ color: '#fd591e' }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-full font-heading font-black text-base transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 24px rgba(119,255,200,0.3)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Joining...' : '🚀 Join the Waitlist'}
          </button>
        </form>
        <button onClick={onClose} className="w-full mt-3 py-2 text-sm font-semibold" style={{ color: '#bacbc0' }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}