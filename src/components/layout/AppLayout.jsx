import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import CartFloatingButton from '../cart/CartFloatingButton';
import TopMenuBar from './TopMenuBar';
import { useTabNav } from '@/hooks/useTabNav';

export default function AppLayout() {
  const { pathname } = useLocation();
  const { recordPath } = useTabNav();

  // Track scroll positions per route
  const scrollPos = useRef({});
  const containerRef = useRef(null);

  // Record current path for tab-history on every navigation
  useEffect(() => {
    recordPath(pathname);
  }, [pathname, recordPath]);

  // Save & restore scroll per route
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const saved = scrollPos.current[pathname];
    if (saved != null) container.scrollTop = saved;
    else container.scrollTop = 0;
  }, [pathname]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      scrollPos.current[pathname] = containerRef.current.scrollTop;
    }
  }, [pathname]);

  return (
    /* Desktop: dark side panels flanking a centered phone-frame */
    <div className="min-h-screen flex items-stretch justify-center" style={{ background: '#050505' }}>
      {/* Left side panel — desktop only */}
      <div className="hidden lg:flex flex-1 items-center justify-end pr-8 max-w-xs">
        <div className="text-right">
          <p className="font-heading font-black text-2xl"><span style={{ color: 'var(--cc-cream)' }}>Curb</span><span style={{ color: 'var(--cc-accent-2)' }}>Chef</span></p>
          <p className="text-xs mt-1" style={{ color: 'var(--cc-ink-faint)' }}>Street food, elevated.</p>
        </div>
      </div>

      {/* Phone frame */}
      <div
        className="relative w-full lg:w-[480px] lg:shadow-2xl"
        style={{ background: 'var(--cc-black)', maxWidth: '480px', minHeight: '100dvh' }}
      >
        {/* Top-right hamburger menu */}
        <div className="fixed top-[max(1rem,env(safe-area-inset-top))] z-30" style={{ right: 'max(1rem, calc(50% - 225px))' }}>
          <TopMenuBar />
        </div>
        <main
          id="main-content"
          ref={containerRef}
          onScroll={handleScroll}
          className="pb-24"
          style={{ overflowY: 'auto', height: '100dvh' }}
          tabIndex={-1}
        >
          <Outlet />
        </main>
        <CartFloatingButton />
        <BottomNav />
      </div>

      {/* Right side panel — desktop only */}
      <div className="hidden lg:flex flex-1 items-center justify-start pl-8 max-w-xs">
        <div className="space-y-3">
          <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(var(--cc-accent-rgb),0.05)', border: '1px solid rgba(var(--cc-accent-rgb),0.1)' }}>
            <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: 'var(--cc-accent)' }}>OPEN NOW</p>
            <p className="font-heading font-black text-lg" style={{ color: 'var(--cc-ink)' }}>Houston, TX</p>
          </div>
          <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(var(--cc-warm-rgb),0.05)', border: '1px solid rgba(var(--cc-warm-rgb),0.12)' }}>
            <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: 'var(--cc-warm)' }}>GET THE APP</p>
            <p className="text-xs" style={{ color: 'var(--cc-ink-dim)' }}>iOS &amp; Android coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}