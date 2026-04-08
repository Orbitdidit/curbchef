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
    <div className="min-h-screen relative" style={{ background: '#0d1517', maxWidth: '480px', margin: '0 auto' }}>
      {/* Top-right hamburger menu — floats above page content */}
      <div className="fixed top-[max(1rem,env(safe-area-inset-top))] right-4 z-30">
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
  );
}