import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { X, RefreshCw, Square } from 'lucide-react';
import VendorGate from '@/components/vendor/VendorGate';

// ── helpers ──────────────────────────────────────────────────────────────────
function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function getSupportedMimeType() {
  const types = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

const CAPTION_CHIPS = [
  'Slicing brisket 🔥',
  'Just opened ☀️',
  'Hot off the grill 🌶️',
  'Last call! ⏰',
];

const MAX_DURATION = 60;

// ── screens ──────────────────────────────────────────────────────────────────
// SCREEN: permission / error
function ErrorScreen({ message, onClose }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center z-50"
      style={{ background: '#0d1517' }}>
      <span className="text-5xl mb-4">📵</span>
      <p className="font-heading font-black text-xl text-white mb-3">{message}</p>
      <button onClick={onClose}
        className="mt-6 px-8 py-3 rounded-full font-heading font-black text-sm"
        style={{ background: '#192123', color: '#bacbc0' }}>
        Go Back
      </button>
    </div>
  );
}

// SCREEN: caption
function CaptionScreen({ videoBlob, caption, setCaption, onPost, onRetry, isPosting }) {
  const videoUrl = useRef(URL.createObjectURL(videoBlob)).current;

  return (
    <div className="fixed inset-0 flex flex-col z-50 overflow-y-auto" style={{ background: '#0d1517' }}>
      {/* video preview */}
      <div className="relative w-full flex-shrink-0" style={{ aspectRatio: '9/16', maxHeight: '45vh' }}>
        <video src={videoUrl} className="w-full h-full object-cover" controls playsInline />
      </div>

      <div className="flex-1 px-5 pt-5 pb-8 flex flex-col gap-4">
        <p className="text-[10px] font-black tracking-widest" style={{ color: '#77ffc8' }}>ADD A CAPTION</p>

        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value.slice(0, 100))}
          placeholder="What's happening at the truck?"
          className="w-full rounded-2xl px-4 py-3 text-sm resize-none outline-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(119,255,200,0.2)', minHeight: '80px' }}
        />
        <p className="text-xs text-right -mt-2" style={{ color: '#bacbc0' }}>{caption.length}/100</p>

        {/* suggestion chips */}
        <div className="flex flex-wrap gap-2">
          {CAPTION_CHIPS.map(chip => (
            <button key={chip}
              onClick={() => setCaption(chip)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.4)' }}>
              {chip}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-auto pt-4">
          <button onClick={onRetry}
            className="flex-1 py-4 rounded-full font-heading font-black text-sm"
            style={{ background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.3)' }}>
            Retry
          </button>
          <button onClick={onPost} disabled={isPosting}
            className="flex-[2] py-4 rounded-full font-heading font-black text-base flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 24px rgba(119,255,200,0.35)', opacity: isPosting ? 0.7 : 1 }}>
            {isPosting ? (
              <><div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#003826 transparent' }} /> Posting…</>
            ) : '🔴 Post Live'}
          </button>
        </div>
      </div>
    </div>
  );
}

// SCREEN: success
function SuccessScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center z-50"
      style={{ background: '#0d1517' }}>
      <div className="text-6xl mb-4 animate-bounce">🔴</div>
      <p className="font-heading font-black text-2xl text-white mb-3">You're LIVE!</p>
      <p className="text-sm" style={{ color: '#bacbc0' }}>
        Customers will see your truck in the live feed for the next 15 minutes.
      </p>
      <div className="mt-6 w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
      <p className="text-xs mt-2" style={{ color: '#6B665C' }}>Redirecting to dashboard…</p>
    </div>
  );
}

// ── MAIN camera component ─────────────────────────────────────────────────────
function GoLiveInner({ truck }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const [screen, setScreen] = useState('camera'); // camera | preview | caption | success
  const [facingMode, setFacingMode] = useState('environment');
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [videoBlob, setVideoBlob] = useState(null);
  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // start camera stream
  const startStream = useCallback(async (mode) => {
    // stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg('Camera not detected — please use a phone or device with a camera.');
      setScreen('error');
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true,
    }).catch(err => {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Camera permission denied. To go live, enable camera in your browser settings.');
      } else {
        setErrorMsg('Camera not detected — please use a phone or device with a camera.');
      }
      setScreen('error');
      return null;
    });
    if (!stream) return;
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  }, []);

  useEffect(() => {
    startStream(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      clearInterval(timerRef.current);
    };
  }, []);

  const flipCamera = async () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    await startStream(newMode);
  };

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current);
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : {});
    recorderRef.current = recorder;

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
      setVideoBlob(blob);
      setScreen('preview');
      streamRef.current?.getTracks().forEach(t => t.stop());
    };

    recorder.start(250); // collect chunks every 250ms
    setRecording(true);
    setElapsed(0);

    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= MAX_DURATION) {
          stopRecording();
          return MAX_DURATION;
        }
        return prev + 1;
      });
    }, 1000);
  }, [stopRecording]);

  const handleRecordToggle = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleRetry = () => {
    setVideoBlob(null);
    setCaption('');
    setElapsed(0);
    setScreen('camera');
    startStream(facingMode);
  };

  const handlePost = async () => {
    setIsPosting(true);
    // upload video
    const { file_url: videoUrl } = await base44.integrations.Core.UploadFile({ file: videoBlob });

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const titleText = caption || `${truck.name} is LIVE 🔴`;

    // create LiveClipVideo record
    await base44.entities.LiveClipVideo.create({
      title: titleText,
      truck_id: truck.id,
      truck_name: truck.name,
      video_url: videoUrl,
      vendor_caption: caption,
      recorded_at: now,
      duration_seconds: elapsed,
      view_count: 0,
      is_active: true,
    });

    // create LiveClip record (is_live=true with expires_at)
    await base44.entities.LiveClip.create({
      truck_id: truck.id,
      truck_name: truck.name,
      truck_image: truck.image_url || '',
      title: titleText,
      image_url: truck.cover_image_url || truck.image_url || '',
      is_live: true,
      likes: 0,
      saves: 0,
      expires_at: expiresAt,
    });

    // update truck
    await base44.entities.FoodTruck.update(truck.id, {
      is_live: true,
      live_description: caption || `🔴 Live now — ${truck.name}`,
    });

    setScreen('success');
    setTimeout(() => navigate('/vendor'), 3000);
  };

  if (screen === 'error') {
    return <ErrorScreen message={errorMsg} onClose={() => navigate('/vendor')} />;
  }

  if (screen === 'preview') {
    const blobUrl = URL.createObjectURL(videoBlob);
    return (
      <div className="fixed inset-0 flex flex-col z-50" style={{ background: '#000' }}>
        <video src={blobUrl} className="flex-1 w-full object-contain" controls playsInline autoPlay loop />
        <div className="flex gap-3 px-5 py-6" style={{ background: '#0d1517' }}>
          <button onClick={handleRetry}
            className="flex-1 py-4 rounded-full font-heading font-black text-sm"
            style={{ background: '#192123', color: '#bacbc0' }}>
            Retry
          </button>
          <button onClick={() => setScreen('caption')}
            className="flex-[2] py-4 rounded-full font-heading font-black text-base"
            style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
            Continue →
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'caption') {
    return (
      <CaptionScreen
        videoBlob={videoBlob}
        caption={caption}
        setCaption={setCaption}
        onPost={handlePost}
        onRetry={handleRetry}
        isPosting={isPosting}
      />
    );
  }

  if (screen === 'success') {
    return <SuccessScreen />;
  }

  // ── CAMERA SCREEN ──
  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Live camera preview */}
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline autoPlay />

      {/* Dark gradient top/bottom for overlays */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 20%, transparent 70%, rgba(0,0,0,0.65) 100%)' }} />

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5"
        style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}>
        {/* Close */}
        <button onClick={() => navigate('/vendor')}
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <X className="w-5 h-5 text-white" />
        </button>

        {/* REC indicator */}
        {recording ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono font-black text-sm text-white tracking-widest">REC</span>
            <span className="font-mono text-sm text-white">{formatTime(elapsed)}</span>
          </div>
        ) : (
          <div className="px-4 py-2 rounded-full"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
            <span className="font-mono text-xs text-white/60">READY</span>
          </div>
        )}

        {/* Flip camera */}
        <button onClick={flipCamera}
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <RefreshCw className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* ── TIMER arc (progress ring) during recording ── */}
      {recording && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="#FF3B30" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - elapsed / MAX_DURATION)}`}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-mono font-black text-lg text-white">{formatTime(elapsed)}</span>
              <span className="font-mono text-[10px] text-white/50">/ {formatTime(MAX_DURATION)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM CONTROLS ── */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>

        {/* Record button */}
        <button onClick={handleRecordToggle}
          className="flex items-center justify-center rounded-full transition-all active:scale-90"
          style={{
            width: 84,
            height: 84,
            background: recording
              ? 'linear-gradient(135deg,#ff3b30,#ff5e57)'
              : 'linear-gradient(135deg,#ff3b30,#ff5e57)',
            boxShadow: recording
              ? '0 0 32px rgba(255,59,48,0.7), 0 0 0 6px rgba(255,255,255,0.15)'
              : '0 0 20px rgba(255,59,48,0.5), 0 0 0 4px rgba(255,255,255,0.12)',
          }}>
          {recording
            ? <Square className="w-9 h-9 text-white" fill="white" />
            : <span className="w-9 h-9 rounded-full bg-white/10 border-4 border-white block" />
          }
        </button>

        <p className="text-white/60 text-xs font-semibold mt-4 px-4 text-center">
          {recording ? 'Tap to stop recording' : 'Tap to start • Max 60 seconds'}
        </p>
      </div>
    </div>
  );
}

export default function GoLive() {
  return (
    <VendorGate>
      {({ truck }) => <GoLiveInner truck={truck} />}
    </VendorGate>
  );
}