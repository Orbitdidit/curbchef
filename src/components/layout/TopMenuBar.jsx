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
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
        style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}
      >
        <Menu className="w-4 h-4" style={{ color: '#bacbc0' }} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[100]"
          style={{ background: 'rgba(8,15,17,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[101] flex flex-col"
        style={{
          width: '280px',
          background: '#151d1f',
          borderLeft: '1px solid rgba(59,74,66,0.3)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(59,74,66,0.2)' }}>
          <div>
            <p className="font-heading font-black text-base" style={{ color: '#77ffc8' }}>CurbChef</p>
            {user && <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>{user.full_name}</p>}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: '#192123' }}
          >
            <X className="w-4 h-4" style={{ color: '#bacbc0' }} />
          </button>
        </div>

        {/* Menu items */}
        <div className="flex-1 overflow-y-auto py-3">
          {menuItems.map(({ icon: Icon, label, to, highlight, admin }) => (
            <Link
              key={label}
              to={to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-5 py-3.5 transition-all"
              style={{
                background: admin ? 'rgba(253,89,30,0.04)' : highlight ? 'rgba(119,255,200,0.04)' : 'transparent',
                borderBottom: '1px solid rgba(59,74,66,0.08)',
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: admin ? 'rgba(253,89,30,0.1)' : highlight ? 'rgba(119,255,200,0.1)' : '#192123' }}
              >
                <Icon className="w-4 h-4" style={{ color: admin ? '#fd591e' : highlight ? '#77ffc8' : '#bacbc0' }} />
              </div>
              <span
                className="flex-1 text-sm font-semibold"
                style={{ color: admin ? '#fd591e' : highlight ? '#77ffc8' : '#dff0e8' }}
              >
                {label}
              </span>
              <ChevronRight className="w-4 h-4" style={{ color: '#3b4a42' }} />
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(59,74,66,0.2)' }}>
          {user ? (
            <button
              onClick={() => { base44.auth.logout(); setOpen(false); }}
              className="w-full py-3 rounded-2xl text-sm font-bold"
              style={{ background: '#192123', color: '#bacbc0' }}
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => { base44.auth.redirectToLogin(); setOpen(false); }}
              className="w-full py-3 rounded-2xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </>
  );
}