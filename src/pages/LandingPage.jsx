import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Copy, Check, Share2, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

const PERKS = [
  { emoji: '⚡', text: '2× rewards points — forever' },
  { emoji: '🪂', text: 'Priority access to Curb Drops' },
  { emoji: '📡', text: 'Early access to Truck Radar AR' },
  { emoji: '🏅', text: 'Exclusive "Founder" badge on your profile' },
];

const FEATURES = [
  { emoji: '📡', title: 'Truck Radar', desc: 'Point your phone at the street — see trucks in AR with live distance and wait times.' },
  { emoji: '🪂', title: 'Curb Drops', desc: 'Flash deals that expire in minutes. Be first. Claim before they\'re gone.' },
  { emoji: '🎬', title: 'Chef Stories', desc: 'Live video streams from the truck. Watch the cook, then order.' },
  { emoji: '🏆', title: 'Loyalty Tokens', desc: 'Earn tokens on every order. Redeem for free food, skips, and VIP drops.' },
];

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
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#77ffc8,#00e6a7)', boxShadow: '0 0 8px rgba(119,255,200,0.4)' }}
        />
      </div>
    </div>
  );
}

function ReferralSuccess({ email }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://curbchef.app?ref=${encodeURIComponent(email)}`;

  const copy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = encodeURIComponent("I just joined the CurbChef waitlist — Houston's best food trucks, discovered & ordered from your phone 🚚🔥 Join me:");

  return (
    <div className="mt-6 p-5 rounded-3xl" style={{ background: 'rgba(119,255,200,0.07)', border: '1px solid rgba(119,255,200,0.25)' }}>
      <p className="font-heading font-black text-base mb-1" style={{ color: '#77ffc8' }}>
        🚀 Skip 10 spots by inviting 3 friends!
      </p>
      <p className="text-xs mb-4" style={{ color: '#bacbc0' }}>
        Each friend who joins with your link moves you up 10 positions.
      </p>
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
        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center"
          style={{ background: '#1d9bf0', color: 'white' }}>
          𝕏 Tweet
        </a>
        <a
          href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(shareUrl)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center"
          style={{ background: '#25D366', color: 'white' }}>
          WhatsApp
        </a>
        <a
          href={`https://www.instagram.com/`}
          target="_blank" rel="noopener noreferrer"
          className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center"
          style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: 'white' }}>
          Instagram
        </a>
      </div>
    </div>
  );
}

function WaitlistForm({ onSuccess }) {
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

    // Check if already on waitlist
    const existing = await base44.entities.WaitlistEntry.filter({ email });
    if (existing.length > 0) {
      setError('You\'re already on the waitlist!');
      setLoading(false);
      return;
    }

    // Get count for position
    const all = await base44.entities.WaitlistEntry.list();
    const position = all.length + 1;

    // Create entry
    const entry = await base44.entities.WaitlistEntry.create({
      email,
      phone: phone || undefined,
      position,
      referred_by: refCode || undefined,
      referral_count: 0,
      signup_date: new Date().toISOString(),
      notified_launch: false,
    });

    // If referred, increment referrer's count
    if (refCode) {
      const referrers = await base44.entities.WaitlistEntry.filter({ email: refCode });
      if (referrers.length > 0) {
        const referrer = referrers[0];
        const newCount = (referrer.referral_count || 0) + 1;
        // Move referrer up 10 spots
        const newPos = Math.max(1, (referrer.position || 1) - 10);
        await base44.entities.WaitlistEntry.update(referrer.id, {
          referral_count: newCount,
          position: newPos,
        });
      }
    }

    // Confetti!
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#77ffc8', '#00e6a7', '#fd591e', '#ffffff'] });

    setLoading(false);
    onSuccess({ email, position, entry });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)', '::placeholder': { color: '#bacbc0' } }}
        />
      </div>
      <div>
        <input
          type="tel"
          placeholder="Phone number (optional — for launch alerts)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }}
        />
      </div>
      {error && (
        <p className="text-xs px-1" style={{ color: '#fd591e' }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-full font-heading font-black text-base transition-all active:scale-95"
        style={{
          background: 'linear-gradient(135deg,#77ffc8,#00e6a7)',
          color: '#003826',
          boxShadow: '0 0 28px rgba(119,255,200,0.35)',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Joining...' : '🚀 Join the Waitlist'}
      </button>
      {refCode && (
        <p className="text-xs text-center" style={{ color: '#77ffc8' }}>
          ✓ Referred by {refCode} — you'll be bumped up!
        </p>
      )}
    </form>
  );
}

export default function LandingPage() {
  const formRef = useRef(null);
  const [result, setResult] = useState(null); // { email, position }

  const { data: configs = [] } = useQuery({
    queryKey: ['homepage_config'],
    queryFn: () => base44.entities.HomepageConfig.list(),
  });
  const heroConfig = configs.find(c => c.key === 'hero_video');

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d1517' }}>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Video BG */}
        {heroConfig?.video_url ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={heroConfig.video_url}
            autoPlay loop muted playsInline
            poster={heroConfig.poster_url || undefined}
          />
        ) : (
          <div className="absolute inset-0 dot-bg" style={{ background: '#080f11' }} />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,21,23,0.55) 0%, rgba(13,21,23,0.82) 60%, rgba(13,21,23,1) 100%)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16 w-full max-w-lg mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', boxShadow: '0 0 24px rgba(119,255,200,0.5)' }}>
              <Flame className="w-5 h-5" style={{ color: '#003826' }} />
            </div>
            <span className="font-heading font-black text-3xl tracking-tight" style={{ color: '#77ffc8' }}>CurbChef</span>
          </div>

          <h1 className="font-heading font-black leading-none mb-4" style={{ fontSize: 'clamp(2.8rem,12vw,5rem)', color: '#dff0e8' }}>
            The curb is<br />
            <span style={{ color: '#77ffc8' }}>the kitchen.</span>
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: '#bacbc0', maxWidth: 340 }}>
            Houston's best food trucks — discovered, ordered, claimed.
          </p>

          {/* Waitlist counter */}
          <WaitlistCounter />

          {/* Form anchor */}
          <div ref={formRef} className="w-full">
            {result ? (
              <div className="p-6 rounded-3xl text-center" style={{ background: 'rgba(119,255,200,0.08)', border: '1px solid rgba(119,255,200,0.3)' }}>
                <div className="text-5xl mb-3">🎉</div>
                <p className="font-heading font-black text-2xl mb-1" style={{ color: '#77ffc8' }}>
                  You're #{result.position} in line!
                </p>
                <p className="text-sm" style={{ color: '#bacbc0' }}>
                  We'll text & email you the moment CurbChef goes live.
                </p>
                <ReferralSuccess email={result.email} />
              </div>
            ) : (
              <div className="p-6 rounded-3xl" style={{ background: 'rgba(21,29,31,0.95)', border: '1px solid rgba(59,74,66,0.4)', backdropFilter: 'blur(20px)' }}>
                <p className="font-heading font-black text-lg mb-1" style={{ color: '#dff0e8' }}>
                  Get early access
                </p>
                <p className="text-xs mb-5" style={{ color: '#bacbc0' }}>
                  Founding members get lifetime perks — limited to 1,000 spots.
                </p>
                <WaitlistForm onSuccess={setResult} />
              </div>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        {!result && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 opacity-50">
            <div className="w-px h-8 rounded-full" style={{ background: 'linear-gradient(180deg,transparent,#77ffc8)' }} />
            <span className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>SCROLL</span>
          </div>
        )}
      </section>

      {/* ── PERKS ── */}
      <section className="px-6 py-16 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1" style={{ background: 'rgba(59,74,66,0.4)' }} />
          <p className="font-heading font-black text-sm tracking-widest" style={{ color: '#77ffc8' }}>FOUNDING MEMBER PERKS</p>
          <div className="h-px flex-1" style={{ background: 'rgba(59,74,66,0.4)' }} />
        </div>
        <div className="flex flex-col gap-3">
          {PERKS.map(({ emoji, text }) => (
            <div key={text} className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: '#151d1f', border: '1px solid rgba(59,74,66,0.25)' }}>
              <span className="text-2xl flex-shrink-0">{emoji}</span>
              <p className="text-sm font-semibold" style={{ color: '#dff0e8' }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT'S COMING ── */}
      <section className="px-6 pb-16 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1" style={{ background: 'rgba(59,74,66,0.4)' }} />
          <p className="font-heading font-black text-sm tracking-widest" style={{ color: '#fd591e' }}>WHAT'S COMING</p>
          <div className="h-px flex-1" style={{ background: 'rgba(59,74,66,0.4)' }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(({ emoji, title, desc }) => (
            <div key={title} className="p-4 rounded-2xl flex flex-col gap-2"
              style={{ background: '#151d1f', border: '1px solid rgba(59,74,66,0.2)' }}>
              <span className="text-3xl">{emoji}</span>
              <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#bacbc0' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTAs ── */}
      <section className="px-6 pb-20 max-w-lg mx-auto flex flex-col gap-3">
        <div className="h-px mb-4" style={{ background: 'rgba(59,74,66,0.3)' }} />
        <Link to="/onboard-truck">
          <div className="flex items-center gap-4 p-5 rounded-3xl active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,rgba(253,89,30,0.12),rgba(253,89,30,0.06))', border: '1px solid rgba(253,89,30,0.3)' }}>
            <span className="text-3xl">🚐</span>
            <div className="flex-1">
              <p className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>I run a food truck</p>
              <p className="text-xs" style={{ color: '#bacbc0' }}>Apply now — free to join</p>
            </div>
            <span className="text-xs font-black px-3 py-1.5 rounded-full" style={{ background: 'rgba(253,89,30,0.2)', color: '#fd591e' }}>APPLY →</span>
          </div>
        </Link>

        <button onClick={scrollToForm}>
          <div className="flex items-center gap-4 p-5 rounded-3xl active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg,rgba(119,255,200,0.1),rgba(119,255,200,0.04))', border: '1px solid rgba(119,255,200,0.25)' }}>
            <span className="text-3xl">🍽️</span>
            <div className="flex-1 text-left">
              <p className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>I want to eat</p>
              <p className="text-xs" style={{ color: '#bacbc0' }}>Join the founding member waitlist</p>
            </div>
            <span className="text-xs font-black px-3 py-1.5 rounded-full" style={{ background: 'rgba(119,255,200,0.15)', color: '#77ffc8' }}>JOIN →</span>
          </div>
        </button>
      </section>

      {/* Footer */}
      <div className="text-center pb-10 px-6">
        <p className="text-xs" style={{ color: 'rgba(186,203,192,0.35)' }}>
          © 2026 CurbChef · Houston, TX · Privacy · Terms
        </p>
      </div>
    </div>
  );
}