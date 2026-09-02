import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * FrameLayout — same centered phone-frame as AppLayout, minus the bottom nav.
 * Used for customer-facing pages that own their own back button (Search,
 * Truck Profile, Cart, Radar, etc.) so they stop stretching edge-to-edge
 * on desktop. Vendor and admin routes stay full-width on purpose.
 */
export default function FrameLayout() {
  return (
    <div className="min-h-screen flex items-stretch justify-center" style={{ background: '#050505' }}>
      <div
        className="relative w-full lg:w-[480px] lg:shadow-2xl"
        style={{ background: 'var(--cc-bg-0)', maxWidth: '480px', minHeight: '100dvh' }}
      >
        <main
          id="main-content"
          style={{ overflowY: 'auto', height: '100dvh' }}
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
