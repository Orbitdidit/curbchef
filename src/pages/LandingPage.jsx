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
        <span className="text-sm font-bold" style={{ color: 'var(--cc-ink-dim)' }}>
          <span className="font-black text-lg" style={{ color: 'var(--cc-accent)'}}>{count}</span>
          <span style={{ color:'var(--cc-ink-dim)' }}> / 1,000 founding members</span>
        </span>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(var(--cc-accent-rgb),0.12)', color:'var(--cc-accent)', border:'1px solid rgba(var(--cc-accent-rgb),0.25)' }}>
          {pct}% FULL
        </span>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--cc-bg-2)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--cc-accent),var(--cc-accent-3))', boxShadow:'0 0 8px rgba(var(--cc-accent-rgb),0.4)' }} />
      </div>
    </div>
  );
}

function ReferralSuccess({ email }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://curbchef.app?ref=${encodeURIComponent(email)}`;
  const copy = () => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const shareText = encodeURIComponent("I just joined the CurbChef waitlist — Houston's best food trucks, discovered & ordered from your phone  Join me:");

  return (
    <div className="mt-6 p-5 rounded-3xl" style={{ background: 'rgba(var(--cc-accent-rgb),0.07)', border:'1px solid rgba(var(--cc-accent-rgb),0.25)' }}>
      <p className="font-display text-base mb-1" style={{ color: 'var(--cc-accent)' }}> Skip 10 spots by inviting 3 friends!</p>
      <p className="text-xs mb-4" style={{ color: 'var(--cc-ink-dim)' }}>Each friend who joins with your link moves you up 10 positions.</p>
      <div className="flex items-center gap-2 mb-3 p-3 rounded-2xl" style={{ background: 'var(--cc-bg-0)', border:'1px solid rgba(var(--cc-line-rgb),0.3)' }}>
        <span className="flex-1 text-xs font-mono truncate" style={{ color: 'var(--cc-ink)' }}>{shareUrl}</span>
        <button onClick={copy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all"
          style={{ background: copied ? 'rgba(var(--cc-accent-rgb),0.2)':'var(--cc-bg-2)', color:'var(--cc-accent)' }}>
          {copied ? <Check className="w-3.5 h-3.5"/> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!':'Copy'}
        </button>
      </div>
      <div className="flex gap-2">
        <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center"
          style={{ background: '#1d9bf0', color:'white' }}>𝕏 Tweet</a>
        <a href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center"
          style={{ background: '#25D366', color:'white' }}>WhatsApp</a>
        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center"
          style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color:'white'}}>Instagram</a>
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

    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['var(--cc-accent)','var(--cc-accent-3)','var(--cc-warm)','#ffffff'] });
    setLoading(false);
    onSuccess({ email, position });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required
        className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
        style={{ background: 'var(--cc-bg-2)', color:'var(--cc-ink)', border:'1px solid rgba(var(--cc-line-rgb),0.5)' }} />
      <input type="tel" placeholder="Phone number (optional — for launch alerts)" value={phone} onChange={e => setPhone(e.target.value)}
        className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
        style={{ background: 'var(--cc-bg-2)', color:'var(--cc-ink)', border:'1px solid rgba(var(--cc-line-rgb),0.5)' }} />
      {error && <p className="text-xs px-1" style={{ color: 'var(--cc-warm)' }}>{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full py-4 rounded-full font-display text-base transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color:'var(--cc-accent-deep)', boxShadow:'0 0 28px rgba(var(--cc-accent-rgb),0.35)', opacity: loading ? 0.7 : 1 }}>
        {loading ?'Joining...':' Join the Waitlist'}
      </button>
      {refCode && <p className="text-xs text-center" style={{ color: 'var(--cc-accent)'}}> Referred by {refCode} — you'll be bumped up!</p>}
    </form>
  );
}

export default function LandingPage() {
  const formRef = useRef(null);
  const [heroResult, setHeroResult] = useState(null);
  const [modalSource, setModalSource] = useState(null); // null = closed, string = open with source
  const [modalResult, setModalResult] = useState(null);

  const handleSignIn = () => base44.auth.redirectToLogin(window.location.pathname);

  const { data: configs = [] } = useQuery({
    queryKey: ['homepage_config'],
    queryFn: () => base44.entities.HomepageConfig.list(),
  });
  const heroConfig = configs.find(c => c.key ==='hero_video');

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior:'smooth', block:'center' });

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
    <div className="min-h-screen pb-24" style={{ background: 'var(--cc-bg-0)' }}>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ position: 'relative' }}>
        {heroConfig?.video_url ? (
          <video className="absolute inset-0 w-full h-full object-cover" src={heroConfig.video_url} autoPlay loop muted playsInline
            poster={heroConfig.poster_url || undefined} />
        ) : (
          <div className="absolute inset-0 dot-bg" style={{ background: '#080f11' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,21,23,0.55) 0%, rgba(13,21,23,0.82) 60%, rgba(13,21,23,1) 100%)' }} />

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16 w-full max-w-lg mx-auto">
          {/* Sign In button — top right for approved users */}
          <div className="absolute top-4 right-5 z-20">
            <button
              onClick={handleSignIn}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.08)', color:'var(--cc-ink)', border:'1px solid rgba(255,255,255,0.15)', backdropFilter:'blur(10px)' }}>
              Sign In
            </button>
          </div>

          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', boxShadow:'0 0 24px rgba(var(--cc-accent-rgb),0.5)' }}>
              <Flame className="w-5 h-5" style={{ color: 'var(--cc-accent-deep)' }} />
            </div>
            <span className="font-display text-3xl tracking-tight" style={{ color: 'var(--cc-accent)' }}>CurbChef</span>
          </div>

          <h1 className="font-display leading-none mb-4" style={{ fontSize: 'clamp(2.8rem,12vw,5rem)', color:'var(--cc-ink)'}}>
            The curb is<br /><span style={{ color:'var(--cc-accent)' }}>the kitchen.</span>
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: 'var(--cc-ink-dim)', maxWidth: 340 }}>
            Houston's best food trucks — discovered, ordered, claimed.
          </p>

          <WaitlistCounter />

          <div ref={formRef} className="w-full">
            {heroResult ? (
              <div className="p-6 rounded-3xl text-center" style={{ background: 'rgba(var(--cc-accent-rgb),0.08)', border:'1px solid rgba(var(--cc-accent-rgb),0.3)' }}>
                <div className="text-5xl mb-3"></div>
                <p className="font-display text-2xl mb-1" style={{ color: 'var(--cc-accent)'}}>You're #{heroResult.position} in line!</p>
                <p className="text-sm" style={{ color: 'var(--cc-ink-dim)'}}>We'll text & email you the moment CurbChef goes live.</p>
                <ReferralSuccess email={heroResult.email} />
              </div>
            ) : (
              <div className="p-6 rounded-3xl" style={{ background: 'rgba(21,29,31,0.95)', border:'1px solid rgba(var(--cc-line-rgb),0.4)', backdropFilter:'blur(20px)' }}>
                <p className="font-display text-lg mb-1" style={{ color: 'var(--cc-ink)' }}>Get early access</p>
                <p className="text-xs mb-5" style={{ color: 'var(--cc-ink-dim)' }}>Founding members get lifetime perks — limited to 1,000 spots.</p>
                <HeroForm onSuccess={setHeroResult} />
              </div>
            )}
          </div>
        </div>

        {!heroResult && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 opacity-50">
            <div className="w-px h-8 rounded-full" style={{ background: 'linear-gradient(180deg,transparent,var(--cc-accent))' }} />
            <span className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--cc-accent)' }}>SCROLL</span>
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
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)' }}
          onClick={() => setModalResult(null)}>
          <div className="w-full max-w-md p-8 rounded-3xl text-center"
            style={{ background: 'var(--cc-bg-1)', border:'1px solid rgba(var(--cc-accent-rgb),0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-3"></div>
            <p className="font-display text-2xl mb-2" style={{ color: 'var(--cc-accent)'}}>You're #{modalResult.position} in line!</p>
            <p className="text-sm mb-6" style={{ color: 'var(--cc-ink-dim)'}}>We'll notify you the moment CurbChef goes live.</p>
            <button onClick={() => setModalResult(null)}
              className="w-full py-3.5 rounded-full font-display text-sm"
              style={{ background: 'rgba(var(--cc-accent-rgb),0.1)', color:'var(--cc-accent)', border:'1px solid rgba(var(--cc-accent-rgb),0.3)' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}