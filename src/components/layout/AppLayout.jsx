import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import CartFloatingButton from '../cart/CartFloatingButton';

export default function AppLayout() {
  return (
    <div className="min-h-screen relative" style={{ background: '#0d1517', maxWidth: '480px', margin: '0 auto' }}>
      <main className="pb-24">
        <Outlet />
      </main>
      <CartFloatingButton />
      <BottomNav />
    </div>
  );
}