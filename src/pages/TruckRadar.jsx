import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Radio } from 'lucide-react';
import { distanceMiles } from '@/lib/geoUtils';

// ── Bearing calculation (degrees 0-360) ──────────────────────────────────────
function bearingTo(fromLat, fromLng, toLat, toLng) {
  const toRad = d => (d * Math.PI) / 180;
  const toDeg = r => (r * 180) / Math.PI;
  const dLng = toRad(toLng - fromLng);
  const lat1 = toRad(fromLat);
  const lat2 = toRad(toLat);
  const x = Math.sin(dLng) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(x, y)) + 360) % 360;
}

// Normalize angle to -180…+180
function angleDiff(a, b) {
  let d = ((a - b + 540) % 360) - 180;
  return d;
}

// ── Truck AR Label ────────────────────────────────────────────────────────────
function TruckLabel({ truck, userLat, userLng, heading, screenW }) {
  const dist = distanceMiles(userLat, userLng, truck.latitude, truck.longitude);
  const bearing = bearingTo(userLat, userLng, truck.latitude, truck.longitude);
  const diff = angleDiff(bearing, heading);

  if (Math.abs(diff) > 60) return null;

  // Map -60..+60 → 10%..90% of screen width
  const xPct = 50 + (diff / 60) * 40;
  const opacity = Math.max(0.3, 1 - dist * 1.5);

  return (
    <Link to={`/truck/${truck.id}`}>
      <div
        className="absolute flex flex-col items-center gap-1.5 cursor-pointer"
        style={{
          left: `${xPct}%`,
          top: '38%',
          transform: 'translateX(-50%)',
          opacity,
          transition: 'left 0.25s ease, opacity 0.3s ease',
          zIndex: 30,
        }}
      >
        {/* Label card */}
        <div
          className="px-3 py-2 rounded-2xl flex flex-col items-center gap-1 active:scale-95 transition-transform"
          style={{
            background: 'rgba(13,21,23,0.85)',
            border: `1px solid ${truck.is_live ? 'rgba(255,59,48,0.6)' : 'rgba(119,255,200,0.35)'}`,
            backdropFilter: 'blur(14px)',
            boxShadow: truck.is_live
              ? '0 0 20px rgba(255,59,48,0.3)'
              : '0 4px 24px rgba(0,0,0,0.6)',
            minWidth: 100,
          }}
        >
          {truck.is_live && (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" />
              <span className="text-[9px] font-black text-red-400 tracking-widest">LIVE</span>
            </div>
          )}
          <p className="font-heading font-black text-sm text-center leading-tight" style={{ color: '#dff0e8', maxWidth: 120 }}>
            {truck.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold" style={{ color: '#77ffc8' }}>{dist.toFixed(2)} mi</span>
            <span style={{ color: 'rgba(186,203,192,0.4)' }}>·</span>
            <span className="text-[10px]" style={{ color: '#bacbc0' }}>~12 min</span>
          </div>
        </div>

        {/* Connector line */}
        <div className="w-px h-6" style={{ background: 'linear-gradient(180deg,rgba(119,255,200,0.6),transparent)' }} />

        {/* Pulsing dot */}
        <div className="relative w-3 h-3">
          <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(119,255,200,0.4)' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#77ffc8', boxShadow: '0 0 8px #77ffc8' }} />
        </div>
      </div>
    </Link>
  );
}

// ── Compass Indicator ─────────────────────────────────────────────────────────
function Compass({ heading }) {
  // North arrow rotates opposite to heading so N always points north
  const rotation = -heading;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center relative"
        style={{ background: 'rgba(13,21,23,0.85)', border: '1px solid rgba(119,255,200,0.3)', backdropFilter: 'blur(12px)' }}
      >
        <div
          style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.15s ease', fontSize: 20, lineHeight: 1 }}
        >
          🧭
        </div>
      </div>
      <span className="text-[9px] font-bold tracking-widest" style={{ color: '#bacbc0' }}>
        {Math.round(heading)}°
      </span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TruckRadar() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState('idle'); // idle | requesting | active | unsupported | error
  const [errorMsg, setErrorMsg] = useState('');
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [heading, setHeading] = useState(0);
  const [calibrateHint, setCalibrateHint] = useState(false);

  const { data: trucks = [] } = useQuery({
    queryKey: ['trucks'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }),
  });

  // Nearby trucks (within 0.5 mi with GPS coords)
  const nearbyTrucks = trucks.filter(t => {
    if (!t.latitude || !t.longitude || !userLat) return false;
    return distanceMiles(userLat, userLng, t.latitude, t.longitude) <= 0.5;
  });

  const liveCount = nearbyTrucks.filter(t => t.is_live).length;
  const openCount = nearbyTrucks.filter(t => t.status === 'open').length;

  // Check basic capability
  const isSupported = !!(navigator.mediaDevices?.getUserMedia && window.DeviceOrientationEvent);

  const startRadar = useCallback(async () => {
    if (!isSupported) { setStatus('unsupported'); return; }
    setStatus('requesting');

    try {
      // 1. Geolocation
      await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(
          pos => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); res(); },
          () => rej(new Error('Location denied')),
          { enableHighAccuracy: true }
        );
      });

      // 2. Camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // 3. iOS orientation permission
      if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm !== 'granted') throw new Error('Compass permission denied');
      }

      setStatus('active');

      // 4. Watch geolocation
      navigator.geolocation.watchPosition(
        pos => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
        () => {},
        { enableHighAccuracy: true }
      );

    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Could not start Truck Radar');
    }
  }, [isSupported]);

  // Device orientation listener
  useEffect(() => {
    if (status !== 'active') return;
    let lastAlpha = null;
    const handler = (e) => {
      // alpha = compass heading on some devices; webkitCompassHeading on iOS
      const alpha = e.webkitCompassHeading != null
        ? e.webkitCompassHeading
        : e.alpha != null ? (360 - e.alpha) % 360 : null;
      if (alpha == null) return;

      // Calibration hint: if alpha barely changes after 3s, suggest figure-8
      if (lastAlpha !== null && Math.abs(alpha - lastAlpha) < 0.5) {
        setCalibrateHint(true);
      } else {
        setCalibrateHint(false);
      }
      lastAlpha = alpha;
      setHeading(alpha);
    };
    window.addEventListener('deviceorientationabsolute', handler, true);
    window.addEventListener('deviceorientation', handler, true);
    return () => {
      window.removeEventListener('deviceorientationabsolute', handler, true);
      window.removeEventListener('deviceorientation', handler, true);
    };
  }, [status]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  // Desktop / unsupported fallback
  if (!isSupported || status === 'unsupported') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center" style={{ background: '#0d1517' }}>
        <div className="text-6xl mb-6">📡</div>
        <h1 className="font-heading font-black text-2xl mb-3" style={{ color: '#dff0e8' }}>Truck Radar</h1>
        <p className="text-base leading-relaxed mb-8" style={{ color: '#bacbc0' }}>
          Truck Radar works best on your phone — camera and compass required.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-full font-bold"
          style={{ background: '#192123', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.3)' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center" style={{ background: '#0d1517' }}>
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="font-heading font-black text-xl mb-3" style={{ color: '#dff0e8' }}>Couldn't Start Radar</h1>
        <p className="text-sm mb-8" style={{ color: '#bacbc0' }}>{errorMsg}</p>
        <button onClick={startRadar} className="px-6 py-3 rounded-full font-bold"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
          Try Again
        </button>
      </div>
    );
  }

  // Idle / splash screen
  if (status === 'idle') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#0d1517' }}>
        <div className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4" style={{ background: '#151d1f' }}>
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
            <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
          </button>
          <p className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>Truck Radar</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(119,255,200,0.08)', border: '2px solid rgba(119,255,200,0.25)' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(119,255,200,0.12)', border: '2px solid rgba(119,255,200,0.35)' }}>
                <span className="text-4xl">📡</span>
              </div>
            </div>
            {/* pulsing ring */}
            <div className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ background: 'rgba(119,255,200,0.3)' }} />
          </div>
          <h1 className="font-heading font-black text-3xl mb-3" style={{ color: '#dff0e8' }}>Truck Radar</h1>
          <p className="text-sm leading-relaxed mb-10" style={{ color: '#bacbc0' }}>
            Point your phone at the street to see nearby food trucks in augmented reality. We'll need access to your camera, compass, and location.
          </p>
          <button
            onClick={startRadar}
            className="w-full py-4 rounded-full font-heading font-black text-base neon-glow"
            style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}
          >
            Start Radar
          </button>
          <p className="text-xs mt-4" style={{ color: 'rgba(186,203,192,0.5)' }}>
            Camera, location &amp; compass permissions required
          </p>
        </div>
      </div>
    );
  }

  // Requesting state
  if (status === 'requesting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0d1517' }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
        <p className="text-sm font-semibold" style={{ color: '#bacbc0' }}>Requesting permissions…</p>
      </div>
    );
  }

  // ── Active AR View ────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#000', zIndex: 50 }}>

      {/* Camera feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />

      {/* Dark vignette overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />

      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 z-40"
        style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.6) 0%,transparent 100%)' }}>
        <button
          onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); navigate(-1); }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(13,21,23,0.8)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Compass */}
        <Compass heading={heading} />

        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-full"
          style={{ background: 'rgba(13,21,23,0.8)', border: '1px solid rgba(119,255,200,0.25)', backdropFilter: 'blur(12px)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#77ffc8' }} />
          <span className="text-xs font-black" style={{ color: '#77ffc8' }}>RADAR ON</span>
        </div>
      </div>

      {/* Calibration hint */}
      {calibrateHint && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full"
          style={{ background: 'rgba(253,89,30,0.85)', backdropFilter: 'blur(10px)' }}>
          <p className="text-xs font-bold text-white">Move phone in figure-8 to calibrate compass</p>
        </div>
      )}

      {/* Center crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="w-8 h-8 relative opacity-50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3" style={{ background: '#77ffc8' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-3" style={{ background: '#77ffc8' }} />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-3" style={{ background: '#77ffc8' }} />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-px w-3" style={{ background: '#77ffc8' }} />
          <div className="absolute inset-2 rounded-full border" style={{ borderColor: 'rgba(119,255,200,0.5)' }} />
        </div>
      </div>

      {/* Truck Labels */}
      {userLat && nearbyTrucks.map(truck => (
        <TruckLabel
          key={truck.id}
          truck={truck}
          userLat={userLat}
          userLng={userLng}
          heading={heading}
          screenW={window.innerWidth}
        />
      ))}

      {/* ── Bottom info card ── */}
      <div className="absolute bottom-0 left-0 right-0 z-40 px-4 pb-8 pt-4"
        style={{ background: 'linear-gradient(0deg,rgba(0,0,0,0.75) 0%,transparent 100%)' }}>
        <div className="rounded-3xl p-4"
          style={{ background: 'rgba(13,21,23,0.88)', border: '1px solid rgba(119,255,200,0.2)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4" style={{ color: '#77ffc8' }} />
              <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>
                {nearbyTrucks.length} truck{nearbyTrucks.length !== 1 ? 's' : ''} within 0.5 mi
              </p>
            </div>
            {nearbyTrucks.length === 0 && (
              <span className="text-xs" style={{ color: '#bacbc0' }}>Try moving closer</span>
            )}
          </div>

          <div className="flex gap-3">
            {[
              { label: 'LIVE', value: liveCount, color: '#ff3b30', bg: 'rgba(255,59,48,0.15)' },
              { label: 'OPEN', value: openCount, color: '#77ffc8', bg: 'rgba(119,255,200,0.1)' },
              { label: 'TOTAL', value: nearbyTrucks.length, color: '#bacbc0', bg: 'rgba(186,203,192,0.08)' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className="flex-1 py-2.5 px-2 rounded-2xl text-center" style={{ background: bg }}>
                <p className="text-[9px] font-bold tracking-widest mb-0.5" style={{ color: 'rgba(186,203,192,0.6)' }}>{label}</p>
                <p className="font-heading font-black text-xl" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {nearbyTrucks.length === 0 && userLat && (
            <p className="text-xs text-center mt-3" style={{ color: 'rgba(186,203,192,0.5)' }}>
              Point your phone around — labels appear when facing a truck
            </p>
          )}
        </div>
      </div>
    </div>
  );
}