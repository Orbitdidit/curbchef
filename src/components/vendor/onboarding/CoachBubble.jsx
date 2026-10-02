import React, { useEffect, useState } from 'react';
import { ChefHat, X, Camera } from 'lucide-react';
import { PHOTO_RULES } from './coachScript';

/** Bottom sheet with the six photo rules. Opened from the coach or a photo card. */
export function PhotoGuideSheet({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,.7)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-2xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] max-h-[85vh] overflow-y-auto"
        style={{ background: 'var(--cc-bg-1)', borderTop: '1px solid rgba(var(--cc-accent-rgb),.25)' }}
        onClick={e => e.stopPropagation()} role="dialog" aria-label="Menu photo guide">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="cc-eyebrow cc-eyebrow-teal">Chef Coach · Photo guide</p>
            <p className="font-display text-2xl mt-1" style={{ color: 'var(--cc-ink)' }}>Photos that sell</p>
          </div>
          <button onClick={onClose} aria-label="Close guide" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--cc-bg-3)' }}>
            <X className="w-4 h-4" style={{ color: 'var(--cc-ink-dim)' }} />
          </button>
        </div>
        <ol className="flex flex-col gap-2.5">
          {PHOTO_RULES.map((r, n) => (
            <li key={r.title} className="flex gap-3 rounded-lg p-3" style={{ background: 'var(--cc-bg-2)', border: '1px solid rgba(var(--cc-line-rgb),.6)' }}>
              <span className="font-display text-xl leading-none w-6 shrink-0" style={{ color: 'var(--cc-accent)' }}>{n + 1}</span>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--cc-ink)' }}>{r.title}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--cc-ink-dim)' }}>{r.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-xs mt-4" style={{ color: 'var(--cc-ink-muted)' }}>
          Your phone camera is enough. Upload a shot and I'll score it and tell you exactly what to fix.
        </p>
      </div>
    </div>
  );
}

/**
 * CoachBubble — Chef Coach talking at the top of each onboarding step.
 * Lines appear one after another with a typing beat so it reads like a
 * conversation, not a form label.
 */
export default function CoachBubble({ lines = [], why, guide, stepKey }) {
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    setShown(0); setTyping(true);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setShown(lines.length); setTyping(false); return; }
    let n = 0; const timers = [];
    const next = () => {
      timers.push(setTimeout(() => {
        n += 1; setShown(n);
        if (n < lines.length) next(); else setTyping(false);
      }, n === 0 ? 450 : 900));
    };
    next();
    return () => timers.forEach(clearTimeout);
  }, [stepKey, lines.length]);

  return (
    <div className="mb-6" aria-live="polite">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(var(--cc-accent-rgb),.12)', border: '1px solid rgba(var(--cc-accent-rgb),.35)' }}>
          <ChefHat className="w-3.5 h-3.5" style={{ color: 'var(--cc-accent)' }} />
        </span>
        <span className="cc-eyebrow cc-eyebrow-teal">Chef Coach</span>
      </div>

      <div className="flex flex-col gap-2 pl-9">
        {lines.slice(0, shown).map((l, n) => (
          <p key={n} className="text-sm leading-relaxed rounded-lg rounded-tl-sm px-3.5 py-2.5 w-fit max-w-full"
            style={{ background: 'var(--cc-bg-2)', color: 'var(--cc-ink)', border: '1px solid rgba(var(--cc-line-rgb),.6)' }}>
            {l}
          </p>
        ))}
        {typing && (
          <span className="flex gap-1 px-3.5 py-3 rounded-lg w-fit" style={{ background: 'var(--cc-bg-2)' }} aria-label="Coach is typing">
            {[0, 1, 2].map(d => (
              <span key={d} className="w-1.5 h-1.5 rounded-full motion-safe:animate-bounce" style={{ background: 'var(--cc-ink-muted)', animationDelay: `${d * 120}ms` }} />
            ))}
          </span>
        )}
        {!typing && why && (
          <p className="text-xs leading-relaxed pl-3 mt-1" style={{ color: 'var(--cc-ink-muted)', borderLeft: '2px solid var(--cc-accent)' }}>
            <span className="font-bold" style={{ color: 'var(--cc-accent)' }}>Why it matters: </span>{why}
          </p>
        )}
        {!typing && guide && (
          <button onClick={() => setGuideOpen(true)} className="flex items-center gap-1.5 text-xs font-bold w-fit mt-1 min-h-8" style={{ color: 'var(--cc-accent)' }}>
            <Camera className="w-3.5 h-3.5" /> Open the photo guide
          </button>
        )}
      </div>
      <PhotoGuideSheet open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
