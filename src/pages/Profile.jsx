import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Star, Gift, Truck, Settings, ChevronRight,
  LogOut, Shield, Bell, HelpCircle, Phone, Mail
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import ReferFriendModal from '@/components/profile/ReferFriendModal';

const TIERS = [
  { key: 'starter', label: 'Starter', min: 0 },
  { key: 'regular', label: 'Regular', min: 500 },
  { key: 'vip', label: 'Night Owl', min: 1000 },
  { key: 'legend', label: 'Legend', min: 2500 },
];

export default function Profile() {
  const [showReferModal, setShowReferModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: rewards = [] } = useQuery({
    queryKey: ['my-rewards'],
    queryFn: () => base44.entities.Reward.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders-count'],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Order.filter({ customer_email: u.email });
    },
  });

  const reward = rewards[0] || { points: 0, tier: 'starter', orders_count: 0 };
  const currentTier = TIERS.find(t => t.key === reward.tier) || TIERS[0];
  const nextTier = TIERS.find(t => t.min > reward.points) || TIERS[TIERS.length - 1];
  const progress = Math.min((reward.points / (nextTier.min || 1)) * 100, 100);

  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', sub: `${orders.length} orders`, to: '/orders', onClick: null },
    { icon: Star, label: 'Rewards', sub: `${reward.points.toLocaleString()} pts · ${currentTier.label}`, to: '/rewards', onClick: null },
    { icon: Gift, label: 'Refer a Friend', sub: 'Earn 500 pts per referral', to: null, onClick: () => setShowReferModal(true) },
    { icon: Truck, label: 'Refer a Vendor', sub: 'Help a truck join CurbChef', to: '/onboard-truck', onClick: null },
  ];

  const settingsItems = [
    { icon: Bell, label: 'Notifications', sub: 'Manage alerts & live pings', to: null, onClick: () => setShowNotifications(true) },
    { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs, contact, report issue', to: null, onClick: () => setShowHelp(true) },
  ];

  const renderItem = ({ icon: ItemIcon, label, sub, to, onClick }, accentColor = '#77ffc8', bgColor = 'rgba(119,255,200,0.08)') => {
    const inner = (
      <div className="flex items-center gap-3 p-4 rounded-2xl"
        style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.15)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bgColor }}>
          <ItemIcon className="w-5 h-5" style={{ color: accentColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>{label}</p>
          <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>{sub}</p>
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#bacbc0' }} />
      </div>
    );
    if (onClick) return <button key={label} className="w-full text-left" onClick={onClick}>{inner}</button>;
    return to ? <Link key={label} to={to}>{inner}</Link> : <div key={label}>{inner}</div>;
  };

  return (
    <div className="min-h-screen pb-32" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4" style={{ background: '#151d1f' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-heading font-black text-xl" style={{ color: '#dff0e8' }}>Profile</p>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
            <Settings className="w-4 h-4" style={{ color: '#bacbc0' }} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-heading font-black text-2xl"
            style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
            {user?.full_name?.[0] || '?'}
          </div>
          <div>
            <p className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>{user?.full_name || 'CurbChef Fan'}</p>
            <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>{user?.email}</p>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{ background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.25)' }}>
              {currentTier.label}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        {/* Points card */}
        <div className="p-5 rounded-3xl mb-5"
          style={{ background: 'linear-gradient(135deg,#192123,#0f1a1c)', border: '1px solid rgba(119,255,200,0.12)', boxShadow: '0 0 24px rgba(119,255,200,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold tracking-widest" style={{ color: '#bacbc0' }}>CURBCHEF POINTS</p>
              <p className="font-heading font-black text-4xl mt-1" style={{ color: '#77ffc8', textShadow: '0 0 16px rgba(119,255,200,0.3)' }}>
                {reward.points.toLocaleString()}
              </p>
            </div>
            <Link to="/rewards">
              <button className="px-4 py-2 rounded-full text-xs font-black"
                style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
                View Rewards
              </button>
            </Link>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden" style={{ background: '#2e3638' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#77ffc8,#00e6a7)', boxShadow: '0 0 8px rgba(119,255,200,0.4)' }} />
          </div>
          <p className="text-xs mt-2" style={{ color: '#bacbc0' }}>
            {Math.max(0, nextTier.min - reward.points).toLocaleString()} pts to {nextTier.label}
          </p>
        </div>

        {/* Menu items */}
        <div className="flex flex-col gap-2 mb-6">
          <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: '#77ffc8' }}>MY ACCOUNT</p>
          {menuItems.map(item => renderItem(item))}
        </div>

        {/* Settings */}
        <div className="flex flex-col gap-2 mb-6">
          <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: '#bacbc0' }}>SETTINGS</p>
          {settingsItems.map(item => renderItem(item, '#bacbc0', 'rgba(186,203,192,0.06)'))}
        </div>

        {/* Admin access */}
        {isAdmin && (
          <div className="mb-6">
            <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: '#fd591e' }}>ADMIN</p>
            <Link to="/admin">
              <div className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: 'rgba(253,89,30,0.08)', border: '1px solid rgba(253,89,30,0.25)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(253,89,30,0.12)' }}>
                  <Shield className="w-5 h-5" style={{ color: '#fd591e' }} />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>Admin Panel</p>
                  <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>Manage trucks, users & content</p>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: '#fd591e' }} />
              </div>
            </Link>
          </div>
        )}

        {/* Sign out + delete */}
        <div className="flex flex-col gap-3 pb-6">
          <button onClick={() => base44.auth.logout('/')}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm"
            style={{ background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.2)' }}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm"
                style={{ background: 'rgba(239,68,68,0.07)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                Delete My Account
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent style={{ background: '#192123', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertDialogHeader>
                <AlertDialogTitle style={{ color: '#dff0e8' }}>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription style={{ color: '#bacbc0' }}>
                  Your account will be signed out and flagged for deletion. Our team will remove your data within 30 days per our privacy policy. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel style={{ background: '#2e3638', color: '#bacbc0', border: 'none' }}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => base44.auth.logout('/')} style={{ background: '#ef4444', color: 'white' }}>
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Refer Friend Modal */}
      {showReferModal && <ReferFriendModal user={user} onClose={() => setShowReferModal(false)} />}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowNotifications(false)}>
          <div className="w-full max-w-lg rounded-t-3xl p-6 pb-10" style={{ background: '#151d1f', border: '1px solid rgba(59,74,66,0.25)' }}
            onClick={e => e.stopPropagation()}>
            <h2 className="font-heading font-black text-lg mb-4" style={{ color: '#dff0e8' }}>🔔 Notifications</h2>
            <p className="text-sm mb-5" style={{ color: '#bacbc0' }}>Push notifications will be available in the mobile app. Make sure to allow notifications when you install CurbChef on your phone.</p>
            <div className="p-4 rounded-2xl mb-4" style={{ background: '#192123' }}>
              <p className="text-sm font-bold mb-1" style={{ color: '#dff0e8' }}>Coming soon in app v1.1:</p>
              <ul className="text-xs space-y-1" style={{ color: '#bacbc0' }}>
                <li>• Live alerts when your fave truck goes LIVE</li>
                <li>• Order ready notifications</li>
                <li>• New CurbDrop deals near you</li>
              </ul>
            </div>
            <button onClick={() => setShowNotifications(false)} className="w-full py-3.5 rounded-full font-heading font-black text-sm"
              style={{ background: '#2e3638', color: '#bacbc0' }}>Got it</button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowHelp(false)}>
          <div className="w-full max-w-lg rounded-t-3xl p-6 pb-10" style={{ background: '#151d1f', border: '1px solid rgba(59,74,66,0.25)' }}
            onClick={e => e.stopPropagation()}>
            <h2 className="font-heading font-black text-lg mb-4" style={{ color: '#dff0e8' }}>Help & Support</h2>
            <div className="flex flex-col gap-3 mb-5">
              <a href="mailto:support@curbchef.com"
                className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: '#192123' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(119,255,200,0.08)' }}>
                  <Mail className="w-5 h-5" style={{ color: '#77ffc8' }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#dff0e8' }}>Email Support</p>
                  <p className="text-xs" style={{ color: '#bacbc0' }}>support@curbchef.com</p>
                </div>
              </a>
              <a href="tel:+18005550100"
                className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: '#192123' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(119,255,200,0.08)' }}>
                  <Phone className="w-5 h-5" style={{ color: '#77ffc8' }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#dff0e8' }}>Call Us</p>
                  <p className="text-xs" style={{ color: '#bacbc0' }}>Mon–Fri, 9am–6pm CST</p>
                </div>
              </a>
            </div>
            <button onClick={() => setShowHelp(false)} className="w-full py-3.5 rounded-full font-heading font-black text-sm"
              style={{ background: '#2e3638', color: '#bacbc0' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}