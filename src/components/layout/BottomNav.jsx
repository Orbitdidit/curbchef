import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Map, Radio, Tag, User } from 'lucide-react';

const tabs = [
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/map', icon: Map, label: 'Map' },
  { path: '/live', icon: Radio, label: 'Live', special: true },
  { path: '/deals', icon: Tag, label: 'Deals' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="w-full max-w-lg">
        <div
          className="flex items-center justify-around px-2 py-2 mx-3 mb-3 rounded-3xl"
          style={{
            background: 'rgba(21,29,31,0.88)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(59,74,66,0.3)',
          }}
        >
          {tabs.map(({ path, icon: Icon, label, special }) => {
            const active = pathname === path || (path !== '/' && pathname.startsWith(path));

            if (special) {
              return (
                <Link key={path} to={path} className="flex flex-col items-center relative -mt-6">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg live-dot"
                    style={{
                      background: 'linear-gradient(135deg, #77ffc8 0%, #00e6a7 100%)',
                      boxShadow: '0 0 24px rgba(119,255,200,0.55), 0 4px 16px rgba(0,0,0,0.4)',
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: '#003826' }} />
                  </div>
                  <span className="text-[10px] font-bold mt-1" style={{ color: '#77ffc8' }}>{label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center gap-1 flex-1 py-2 min-h-[44px] justify-center"
              >
                <Icon
                  className="w-5 h-5 transition-colors"
                  style={{ color: active ? '#77ffc8' : '#bacbc0' }}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: active ? '#77ffc8' : '#bacbc0' }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}