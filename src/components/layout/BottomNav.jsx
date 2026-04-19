import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Compass, Radio, Tag, User } from 'lucide-react';
import { useTabNav, TAB_ROOTS } from '@/hooks/useTabNav';
import { subscribe, getCartCount } from '@/lib/cartStore';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/live', icon: Radio, label: 'Live', special: true },
  { path: '/deals', icon: Tag, label: 'Deals' },
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
      <div className="w-full max-w-lg">
        <div
          className="flex items-center justify-around px-2 py-2 mx-3 mb-3 rounded-3xl"
          role="tablist"
          style={{
            background: 'rgba(21,29,31,0.88)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(59,74,66,0.3)',
          }}
        >
          {tabs.map(({ path, icon: Icon, label, special }) => {
            const active = path === '/' ? pathname === '/' : pathname.startsWith(path);

            if (special) {
              return (
                <button
                  key={path}
                  role="tab"
                  aria-selected={active}
                  aria-label={label}
                  onClick={() => navigateTab(path)}
                  className="flex flex-col items-center relative -mt-6 min-w-[44px] min-h-[44px] justify-end pb-1"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #77ffc8 0%, #00e6a7 100%)',
                      boxShadow: '0 0 24px rgba(119,255,200,0.55), 0 4px 16px rgba(0,0,0,0.4)',
                      animation: 'neon-pulse 2s ease-in-out infinite',
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: '#003826' }} aria-hidden="true" />
                  </div>
                  <span className="text-[10px] font-bold mt-1" style={{ color: '#77ffc8' }}>{label}</span>
                </button>
              );
            }

            return (
              <button
                key={path}
                role="tab"
                aria-selected={active}
                aria-label={label}
                onClick={() => navigateTab(path)}
                className="flex flex-col items-center gap-1 flex-1 py-2 min-h-[44px] justify-center"
              >
                <div className="relative">
                  <Icon
                    className="w-5 h-5 transition-colors"
                    style={{ color: active ? '#77ffc8' : '#bacbc0' }}
                    strokeWidth={active ? 2.5 : 1.8}
                    aria-hidden="true"
                  />
                  {/* Cart count badge on Home tab */}
                  {path === '/' && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white px-1"
                      style={{ background: '#ff3b30' }}>
                      {cartCount}
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: active ? '#77ffc8' : '#bacbc0' }}
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