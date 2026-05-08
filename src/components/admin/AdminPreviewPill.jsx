import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const CUSTOMER_PATHS = ['/', '/explore', '/map', '/deals', '/live', '/search', '/orders', '/rewards', '/profile', '/experiences', '/parks'];
const VENDOR_PATHS = ['/vendor', '/vendor/orders', '/vendor/menu'];
const ADMIN_PATHS = ['/admin', '/admin/homepage', '/admin/launch'];

export default function AdminPreviewPill() {
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  if (dismissed) return null;

  const isOnAdminPage = ADMIN_PATHS.some(p => location.pathname.startsWith(p));
  const isOnVendorPage = VENDOR_PATHS.some(p => location.pathname.startsWith(p));

  return (
    <div className="fixed bottom-28 right-4 z-50 flex items-center gap-2">
      <Link
        to={isOnAdminPage ? '/' : '/admin'}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs shadow-xl active:scale-95 transition-transform"
        style={{
          background: isOnAdminPage ? 'rgba(251,191,36,0.95)' : 'rgba(20,20,20,0.95)',
          color: isOnAdminPage ? '#1a0f00' : '#fbbf24',
          border: '1px solid rgba(251,191,36,0.4)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        <span>👀</span>
        <span>{isOnAdminPage ? 'Customer View' : isOnVendorPage ? 'Admin' : 'Admin Preview'}</span>
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ background: 'rgba(20,20,20,0.9)', color: '#6B665C', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        ✕
      </button>
    </div>
  );
}