import React, { useState } from 'react';
import { X } from 'lucide-react';

/** Thin top banner shown to preview-link visitors who aren't approved members. */
export default function PreviewBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="cc-discovery fixed top-0 left-0 right-0 z-[60] flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-[480px] flex items-center gap-2 px-3 py-2 text-[11px]"
        style={{ background: '#0C0D0E', borderBottom: '1px solid rgba(120,255,201,.25)', paddingTop: 'max(.5rem, env(safe-area-inset-top))' }}>
        <span className="font-mono uppercase tracking-[0.14em] shrink-0" style={{ color: 'var(--cc-d-mint)' }}>Preview</span>
        <span className="truncate text-discovery-muted">Sneak peek before launch</span>
        <a href="https://curbchef.app/#join" className="ml-auto shrink-0 font-bold" style={{ color: 'var(--cc-d-mint)' }}>Join</a>
        <a href="/onboard-truck" className="shrink-0 font-bold" style={{ color: 'var(--cc-d-orange)' }}>List my truck</a>
        <button onClick={() => setOpen(false)} aria-label="Hide preview banner" className="shrink-0 w-6 h-6 flex items-center justify-center">
          <X className="w-3.5 h-3.5 text-discovery-muted" />
        </button>
      </div>
    </div>
  );
}
