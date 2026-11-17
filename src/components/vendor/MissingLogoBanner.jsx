import React from 'react';
import { Link } from 'react-router-dom';
import { ImageIcon } from 'lucide-react';

export default function MissingLogoBanner() {
  return (
    <Link to="/vendor/profile" className="flex items-center gap-3 p-4 mb-3 rounded-2xl"
      style={{ background: 'rgba(var(--cc-warm-rgb),0.12)', border: '1px solid rgba(var(--cc-warm-rgb),0.35)' }}>
      <ImageIcon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--cc-warm)' }} />
      <div className="flex-1">
        <p className="text-sm font-bold" style={{ color: 'var(--cc-ink)' }}>Add your logo to open</p>
        <p className="text-xs" style={{ color: 'var(--cc-ink-dim)' }}>Customers trust trucks with a real logo. Tap to upload it in Images.</p>
      </div>
    </Link>
  );
}