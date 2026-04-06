import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import CartFloatingButton from '../cart/CartFloatingButton';

export default function AppLayout() {
  const { pathname } = useLocation();

  // Track scroll positions per tab path
  const scrollPos = React.useRef({});
  const containerRef = React.useRef(null);

  // Save scroll before navigating away
  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Restore saved scroll for this route
    const saved = scrollPos.current[pathname];
    if (saved != null) container.scrollTop = saved;
    else container.scrollTop = 0;
  }, [pathname]);

  const handleScroll = React.useCallback(() => {
    if (containerRef.current) {
      scrollPos.current[pathname] = containerRef.current.scrollTop;
    }
  }, [pathname]);

  return (
    <div className="min-h-screen relative" style={{ background: '#0d1517', maxWidth: '480px', margin: '0 auto' }}>
      <main
        ref={containerRef}
        onScroll={handleScroll}
        className="pb-24"
        style={{ overflowY: 'auto', height: '100dvh' }}
      >
        <Outlet />
      </main>
      <CartFloatingButton />
      <BottomNav />
    </div>
  );
}