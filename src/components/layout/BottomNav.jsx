import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Compass, Search, User } from 'lucide-react';
import { useTabNav } from '@/hooks/useTabNav';
import { subscribe, getCartCount } from '@/lib/cartStore';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const { navigateTab } = useTabNav();
  const [cartCount, setCartCount] = useState(getCartCount());
  useEffect(() => subscribe(() => setCartCount(getCartCount())), []);

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="w-full max-w-lg px-4 pb-3">
        <div
          className="flex items-center justify-around px-3 py-2 rounded-full"
          role="tablist"
          style={{
            background: 'rgba(20,20,20,0.88)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {tabs.map(({ path, icon: Icon, label }) => {
            const active = path === '/' ? pathname === '/' : pathname.startsWith(path);

            return (
              <button
                key={path}
                role="tab"
                aria-selected={active}
                aria-label={label}
                onClick={() => navigateTab(path)}
                className="flex flex-col items-center gap-1 flex-1 py-2 min-h-[44px] justify-center relative"
              >
                <div className="relative">
                  <Icon
                    className="w-5 h-5 transition-colors"
                    style={{ color: active ? '#00F5D4' : '#6B665C' }}
                    strokeWidth={active ? 2.5 : 1.8}
                    aria-hidden="true"
                  />
                  {path === '/' && cartCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white px-1"
                      style={{ background: '#FF3B30' }}
                    >
                      {cartCount}
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] font-semibold transition-colors"
                  style={{ color: active ? '#00F5D4' : '#6B665C' }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}