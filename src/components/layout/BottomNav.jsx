import React from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Compass, ShoppingBag, User } from 'lucide-react';
import { useTabNav } from '@/hooks/useTabNav';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/profile', icon: User, label: 'You' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const { navigateTab } = useTabNav();
  return (
    <nav aria-label="Main navigation" className="cc-discovery fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] px-4 pointer-events-none">
      <div className="w-full max-w-[448px] rounded-2xl border border-discovery-line bg-discovery-surface p-1.5 flex items-center shadow-xl pointer-events-auto">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = path === '/' ? pathname === '/' : pathname.startsWith(path);
          return <button key={path} aria-current={active ? 'page' : undefined} onClick={() => navigateTab(path)} className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-14 rounded-xl ${active ? 'bg-discovery-orange text-discovery-dark' : 'text-discovery-muted'}`}>
            <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} aria-hidden="true" />
            <span className="text-[11px] font-bold">{label}</span>
          </button>;
        })}
      </div>
    </nav>
  );
}