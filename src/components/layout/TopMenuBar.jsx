import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Menu, Search, MapPin, Star, HelpCircle, Truck, Shield, ChevronRight, User, UtensilsCrossed } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

const links = [
  { icon: Search, label: 'Search food & trucks', to: '/search' },
  { icon: MapPin, label: 'Food truck map', to: '/map' },
  { icon: UtensilsCrossed, label: 'Chef experiences', to: '/experiences' },
  { icon: Star, label: 'Rewards', to: '/rewards' },
  { icon: User, label: 'Account, notifications & referrals', to: '/profile' },
  { icon: Truck, label: 'Vendor portal', to: '/vendor-portal' },
  { icon: HelpCircle, label: 'Help & support', to: '/support' },
];

export default function TopMenuBar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);
  const menuItems = user?.role === 'admin' ? [...links, { icon: Shield, label: 'Admin dashboard', to: '/admin' }] : links;
  return (
    <div className="cc-discovery">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild><button aria-label="Open menu" className="w-11 h-11 rounded-full bg-discovery-surface border border-discovery-line text-discovery-ink flex items-center justify-center"><Menu className="w-5 h-5" /></button></SheetTrigger>
        <SheetContent className="cc-discovery bg-discovery-bg border-discovery-line text-discovery-ink flex flex-col w-[min(90vw,360px)] pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <SheetHeader className="text-left pb-5 border-b border-discovery-line">
            <SheetTitle className="text-discovery-ink font-heading font-black text-2xl">CURB<span className="text-discovery-orange">CHEF</span></SheetTitle>
            <SheetDescription className="text-discovery-muted">{user ? `Hey, ${user.full_name?.split(' ')[0] || 'chef'}.` : 'Find your flavor in Houston.'}</SheetDescription>
          </SheetHeader>
          <nav aria-label="More destinations" className="flex-1 overflow-y-auto py-3">
            {menuItems.map(({ icon: Icon, label, to }) => <Link key={to} to={to} onClick={() => setOpen(false)} className="min-h-14 py-3 flex items-center gap-3 border-b border-discovery-line text-sm font-semibold"><Icon className="w-4 h-4 text-discovery-amber shrink-0" /><span className="flex-1">{label}</span><ChevronRight className="w-4 h-4 text-discovery-muted" /></Link>)}
          </nav>
          <button onClick={() => { if (user) base44.auth.logout(); else base44.auth.redirectToLogin(window.location.pathname); setOpen(false); }} className="cc-action px-5 py-3 text-sm">{user ? 'Sign out' : 'Sign in'}</button>
        </SheetContent>
      </Sheet>
    </div>
  );
}