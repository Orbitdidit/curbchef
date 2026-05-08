import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Copy, Check, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

import TruckPeekSection from '@/components/landing/TruckPeekSection';
import DropsPreviewSection from '@/components/landing/DropsPreviewSection';
import PerksSection from '@/components/landing/PerksSection';
import VendorSection from '@/components/landing/VendorSection';
import ParkPartnershipsSection from '@/components/landing/ParkPartnershipsSection';
import StickyBottomCTA from '@/components/landing/StickyBottomCTA';
import WaitlistModal from '@/components/landing/WaitlistModal';

function getReferralCode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('ref') || null;
}

function WaitlistCounter() {
  const { data: entries = [] } = useQuery({
    queryKey: ['waitlist-count'],
    queryFn: () => base44.entities.WaitlistEntry.list(),
    refetchInterval: 15000,
  });
  const count = entries.length;
  const max = 1000;
  const pct = Math.min(100, Math.round((count / max) * 100));

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold" style={{ color: '#bacbc0' }}>
          <span className="font-black text-lg" style={{ color: '#77ffc8' }}>{count}</span>
          <span style={{ color: '#bacbc0' }}> / 1,000 founding members</span>
        </span>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.25)' }}>
          {pct}% FULL
        </span>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: '#192123' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#77ffc8,#00e6a7)', boxShadow: '0 0 8px rgba(119,255,200,0.4)' }} />
      </div>
    </div>
  );
}

function ReferralSuccess({ email }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://curbchef.app?ref=${encodeURIComponent(email)}`;
  const copy = () => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const shareText = encodeURIComponent("I just joined the CurbChef waitlist — Houston's best food trucks, discovered & ordered from your phone 🚚🔥 Join me:");

  return (
    <div className="mt-6 p-5 rounded-3xl" style={{ background: 'rgba(119,255,200,0.07)', border: '1px solid rgba(119,255,200,0.25)' }}>
      <p className="font-heading font-black text-base mb-1" style={{ color: '#77ffc8' }}>🚀 Skip 10 spots by inviting 3 friends!</p>
      <p className="text-xs mb-4" style={{ color: '#bacbc0' }}>Each friend who joins with your link moves you up 10 positions.</p>
      <div className="flex items-center gap-2 mb-3 p-3 rounded-2xl" style={{ background: '#0d1517', border: '1px solid rgba(59,74,66,0.3)' }}>
        <span className="flex-1 text-xs font-mono truncate" style={{ color: '#dff0e8' }}>{shareUrl}</span>
        <button onClick={copy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all"
          style={{ background: copied ? 'rgba(119,255,200,0.2)' : '#192123', color: '#77ffc8' }}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="flex gap-2">
        <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center"
          style={{ background: '#1d9bf0', color: 'white' }}>𝕏 Tweet</a>
        <a href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center"
          style={{ background: '#25D366', color: 'white' }}>WhatsApp</a>
        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"
          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center"
          style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: 'white' }}>Instagram</a>
      </div>
    </div>
  );
}

function HeroForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const refCode = getReferralCode();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Email is required.'); return; }
    setLoading(true);

    const existing = await base44.entities.WaitlistEntry.filter({ email });
    if (existing.length > 0) { setError("You're already on the waitlist!"); setLoading(false); return; }

    const all = await base44.entities.WaitlistEntry.list();
    const position = all.length + 1;

    await base44.entities.WaitlistEntry.create({
      email, phone: phone || undefined, position,
      referred_by: refCode || undefined, referral_count: 0,
      signup_date: new Date().toISOString(), signup_source: 'hero', notified_launch: false,
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required
        className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
        style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
      <input type="tel" placeholder="Phone number (optional — for launch alerts)" value={phone} onChange={e => setPhone(e.target.value)}
        className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
        style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
      {error && <p className="text-xs px-1" style={{ color: '#fd591e' }}>{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full py-4 rounded-full font-heading font-black text-base transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 28px rgba(119,255,200,0.35)', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Joining...' : '🚀 Join the Waitlist'}
      </button>
      {refCode && <p className="text-xs text-center" style={{ color: '#77ffc8' }}>✓ Referred by {refCode} — you'll be bumped up!</p>}
    </form>
  );
}

export default function LandingPage() {
  const formRef = useRef(null);
  const [heroResult, setHeroResult] = useState(null);
  const [modalSource, setModalSource] = useState(null); // null = closed, string = open with source
  const [modalResult, setModalResult] = useState(null);

  const { data: configs = [] } = useQuery({
    queryKey: ['homepage_config'],
    queryFn: () => base44.entities.HomepageConfig.list(),
  });
  const heroConfig = configs.find(c => c.key === 'hero_video');

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const openWaitlist = (source) => {
    // If hero form already shown, just scroll to it
    if (!heroResult) { scrollToForm(); return; }
    // Otherwise open modal
    setModalSource(source);
  };

  const handleModalSuccess = (result) => {
    setModalResult(result);
    setModalSource(null);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0d1517' }}>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {heroConfig?.video_url ? (
          <video className="absolute inset-0 w-full h-full object-cover"
            src={heroConfig.video_url} autoPlay loop muted playsInline
            poster={heroConfig.poster_url || undefined} />
        ) : (
          <div className="absolute inset-0 dot-bg" style={{ background: '#080f11' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,21,23,0.55) 0%, rgba(13,21,23,0.82) 60%, rgba(13,21,23,1) 100%)' }} />

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16 w-full max-w-lg mx-auto">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', boxShadow: '0 0 24px rgba(119,255,200,0.5)' }}>
              <Flame className="w-5 h-5" style={{ color: '#003826' }} />
            </div>
            <span className="font-heading font-black text-3xl tracking-tight" style={{ color: '#77ffc8' }}>CurbChef</span>
          </div>

          <h1 className="font-heading font-black leading-none mb-4" style={{ fontSize: 'clamp(2.8rem,12vw,5rem)', color: '#dff0e8' }}>
            The curb is<br /><span style={{ color: '#77ffc8' }}>the kitchen.</span>
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: '#bacbc0', maxWidth: 340 }}>
            Houston's best food trucks — discovered, ordered, claimed.
          </p>

          <WaitlistCounter />

          <div ref={formRef} className="w-full">
            {heroResult ? (
              <div className="p-6 rounded-3xl text-center" style={{ background: 'rgba(119,255,200,0.08)', border: '1px solid rgba(119,255,200,0.3)' }}>
                <div className="text-5xl mb-3">🎉</div>
                <p className="font-heading font-black text-2xl mb-1" style={{ color: '#77ffc8' }}>You're #{heroResult.position} in line!</p>
                <p className="text-sm" style={{ color: '#bacbc0' }}>We'll text & email you the moment CurbChef goes live.</p>
                <ReferralSuccess email={heroResult.email} />
              </div>
            ) : (
              <div className="p-6 rounded-3xl" style={{ background: 'rgba(21,29,31,0.95)', border: '1px solid rgba(59,74,66,0.4)', backdropFilter: 'blur(20px)' }}>
                <p className="font-heading font-black text-lg mb-1" style={{ color: '#dff0e8' }}>Get early access</p>
                <p className="text-xs mb-5" style={{ color: '#bacbc0' }}>Founding members get lifetime perks — limited to 1,000 spots.</p>
                <HeroForm onSuccess={setHeroResult} />
              </div>
            )}
          </div>
        </div>

        {!heroResult && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 opacity-50">
            <div className="w-px h-8 rounded-full" style={{ background: 'linear-gradient(180deg,transparent,#77ffc8)' }} />
            <span className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>SCROLL</span>
          </div>
        )}
      </section>

      {/* ── TRUCK PEEK ── */}
      <TruckPeekSection onJoinWaitlist={openWaitlist} />

      {/* ── CURB DROPS PREVIEW ── */}
      <DropsPreviewSection onJoinWaitlist={openWaitlist} />

      {/* ── PERKS ── */}
      <PerksSection onJoinWaitlist={openWaitlist} />

      {/* ── VENDOR SECTION ── */}
      <VendorSection />

      {/* ── PARK PARTNERSHIPS ── */}
      <ParkPartnershipsSection />

      {/* ── FOOTER ── */}
      <div className="text-center py-10 px-6">
        <p className="text-xs" style={{ color: 'rgba(186,203,192,0.35)' }}>
          © 2026 CurbChef · Houston, TX · Privacy · Terms
        </p>
      </div>

      {/* ── STICKY BOTTOM CTA ── */}
      <StickyBottomCTA onEatClick={openWaitlist} />

      {/* ── WAITLIST MODAL (for non-hero CTAs after hero is filled) ── */}
      {modalSource && !modalResult && (
        <WaitlistModal
          source={modalSource}
          onClose={() => setModalSource(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Modal success state */}
      {modalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => setModalResult(null)}>
          <div className="w-full max-w-md p-8 rounded-3xl text-center"
            style={{ background: '#151d1f', border: '1px solid rgba(119,255,200,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-heading font-black text-2xl mb-2" style={{ color: '#77ffc8' }}>You're #{modalResult.position} in line!</p>
            <p className="text-sm mb-6" style={{ color: '#bacbc0' }}>We'll notify you the moment CurbChef goes live.</p>
            <button onClick={() => setModalResult(null)}
              className="w-full py-3.5 rounded-full font-heading font-black text-sm"
              style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.3)' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}