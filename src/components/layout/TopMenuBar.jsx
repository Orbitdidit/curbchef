import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Menu, X, ShoppingBag, Star, Bell, HelpCircle, Gift, Truck, Shield, ChevronRight
} from 'lucide-react';

export default function TopMenuBar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', to: '/orders' },
    { icon: Star, label: 'Rewards', to: '/rewards' },
    { icon: Bell, label: 'Notifications', to: '/profile' },
    { icon: Gift, label: 'Refer a Friend', to: '/profile' },
    { icon: Truck, label: 'Refer a Vendor', to: '/vendor-portal' },
    { icon: Truck, label: 'Apply as Vendor', to: '/vendor-portal', highlight: true },
    { icon: HelpCircle, label: 'Help & Support', to: '/profile' },
  ];

  if (isAdmin) {
    menuItems.push({ icon: Shield, label: 'Admin Dashboard', to: '/admin', admin: true });
  }

  return (
    <>
      {/* Trigger area: Sign In button (unauthenticated) + hamburger */}
      <div className="flex items-center gap-2">
        {!user && (
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
            className="px-4 py-2 rounded-full text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color: 'var(--cc-accent-deep)' }}
          >
            Sign In
          </button>
        )}
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={open}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'var(--cc-bg-2)', border: '1px solid rgba(var(--cc-line-rgb),0.3)' }}
        >
          <Menu className="w-4 h-4" style={{ color: 'var(--cc-ink-dim)' }} aria-hidden="true" />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          role="presentation"
          className="fixed inset-0 z-[100]"
          style={{ background: 'rgba(8,15,17,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed top-0 right-0 bottom-0 z-[101] flex flex-col"
        style={{
          width: '280px',
          background: 'var(--cc-bg-1)',
          borderLeft: '1px solid rgba(var(--cc-line-rgb),0.3)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(var(--cc-line-rgb),0.2)' }}>
          <div>
            <p className="font-heading font-black text-base" style={{ color: 'var(--cc-accent)' }}>CurbChef</p>
            {user && <p className="text-xs mt-0.5" style={{ color: 'var(--cc-ink-dim)' }}>{user.full_name}</p>}
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--cc-bg-2)' }}
          >
            <X className="w-4 h-4" style={{ color: 'var(--cc-ink-dim)' }} aria-hidden="true" />
          </button>
        </div>

        {/* Menu items */}
        <div className="flex-1 overflow-y-auto py-3" role="menu">
          {menuItems.map(({ icon: Icon, label, to, highlight, admin }) => (
            <Link
              key={label}
              to={to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-5 transition-all"
              style={{
                minHeight: '52px',
                alignItems: 'center',
                display: 'flex',
                background: admin ? 'rgba(var(--cc-warm-rgb),0.04)' : highlight ? 'rgba(var(--cc-accent-rgb),0.04)' : 'transparent',
                borderBottom: '1px solid rgba(var(--cc-line-rgb),0.08)',
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: admin ? 'rgba(var(--cc-warm-rgb),0.1)' : highlight ? 'rgba(var(--cc-accent-rgb),0.1)' : 'var(--cc-bg-2)' }}
              >
                <Icon className="w-4 h-4" style={{ color: admin ? 'var(--cc-warm)' : highlight ? 'var(--cc-accent)' : 'var(--cc-ink-dim)' }} />
              </div>
              <span
                className="flex-1 text-sm font-semibold"
                style={{ color: admin ? 'var(--cc-warm)' : highlight ? 'var(--cc-accent)' : 'var(--cc-ink)' }}
              >
                {label}
              </span>
              <ChevronRight className="w-4 h-4" style={{ color: '#3b4a42' }} />
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(var(--cc-line-rgb),0.2)' }}>
          {user ? (
            <button
              onClick={() => { base44.auth.logout(); setOpen(false); }}
              className="w-full py-3 rounded-2xl text-sm font-bold"
              style={{ background: 'var(--cc-bg-2)', color: 'var(--cc-ink-dim)' }}
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => { base44.auth.redirectToLogin(); setOpen(false); }}
              className="w-full py-3 rounded-2xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color: 'var(--cc-accent-deep)' }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </>
  );
}