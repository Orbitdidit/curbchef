import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Zap, Clock, Tag, Star, ChevronRight } from 'lucide-react';

const FEATURED_DEALS = [
  {
    id: 1,
    title: '$5 Off Your First Order',
    truck: 'Any Participating Truck',
    discount: '$5 OFF',
    badge: 'NEW USER',
    badgeColor: '#77ffc8',
    badgeText: '#003826',
    img: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=600',
    expiry: 'Today only',
    code: 'CURB5',
  },
  {
    id: 2,
    title: 'Buy 2 Tacos Get 1 Free',
    truck: 'Street Taco Nation',
    discount: 'B2G1',
    badge: '🔥 HOT DEAL',
    badgeColor: '#fd591e',
    badgeText: '#fff',
    img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600',
    expiry: 'Ends Sunday',
    code: 'TACOLUV',
  },
];

const UNDER_10 = [
  { id: 1, name: 'Street Tacos (2pk)', price: '$7.99', img: 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=300', truck: 'El Taco Loco' },
  { id: 2, name: 'Loaded Fries', price: '$6.50', img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300', truck: 'Curb Fryz' },
  { id: 3, name: 'BBQ Sliders', price: '$9.00', img: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=300', truck: 'Smoke & Fire' },
  { id: 4, name: 'Vegan Bowl', price: '$8.75', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300', truck: 'Green Truck' },
];

const LIMITED = [
  {
    id: 1,
    title: 'Free Churro with Any Order',
    truck: 'Dulce Vida',
    timeLeft: '2h 14m left',
    img: 'https://images.unsplash.com/photo-1548940740-204726a19be3?w=400',
    discount: 'FREE',
  },
  {
    id: 2,
    title: '50% Off Signature Burger',
    truck: 'Patty Wagon HTX',
    timeLeft: '4h 55m left',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    discount: '50% OFF',
  },
];

export default function Deals() {
  const [tab, setTab] = useState('featured');

  const { data: trucks = [] } = useQuery({
    queryKey: ['trucks-deals'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }),
  });

  return (
    <div className="min-h-screen pb-32" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-20"
        style={{ background: 'rgba(13,21,23,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.12)' }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading font-black text-xl" style={{ color: '#dff0e8' }}>Deals</h1>
          <span className="text-[10px] font-black px-3 py-1 rounded-full"
            style={{ background: 'rgba(253,89,30,0.15)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.3)' }}>
            🔥 {FEATURED_DEALS.length + LIMITED.length} ACTIVE
          </span>
        </div>
        <p className="text-xs" style={{ color: '#bacbc0' }}>Exclusive drops for CurbChef fans</p>
      </div>

      <div className="px-5 pt-5">

        {/* Tab pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'featured', label: 'Featured' },
            { id: 'under10', label: 'Under $10' },
            { id: 'limited', label: '⏰ Limited Time' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-4 py-2 rounded-full text-sm font-bold flex-shrink-0 transition-all"
              style={tab === t.id
                ? { background: 'linear-gradient(135deg,#fd591e,#ff8c00)', color: '#fff', boxShadow: '0 0 14px rgba(253,89,30,0.35)' }
                : { background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.25)' }
              }>
              {t.label}
            </button>
          ))}
        </div>

        {/* FEATURED TAB */}
        {tab === 'featured' && (
          <div className="flex flex-col gap-5">
            {FEATURED_DEALS.map(deal => (
              <div key={deal.id} className="rounded-3xl overflow-hidden"
                style={{ background: '#192123', border: '1px solid rgba(253,89,30,0.15)' }}>
                <div className="relative" style={{ height: '180px' }}>
                  <img src={deal.img} alt={deal.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(13,21,23,0.1) 0%,rgba(13,21,23,0.9) 100%)' }} />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                      style={{ background: deal.badgeColor, color: deal.badgeText }}>
                      {deal.badge}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="font-heading font-black text-xl px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(13,21,23,0.8)', color: '#fd591e', backdropFilter: 'blur(8px)' }}>
                      {deal.discount}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-heading font-black text-lg text-white leading-tight">{deal.title}</p>
                    <p className="text-white/60 text-xs mt-0.5">{deal.truck}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: '#fd591e' }} />
                    <span className="text-xs font-bold" style={{ color: '#bacbc0' }}>{deal.expiry}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.3)' }}>
                      Code: {deal.code}
                    </span>
                  </div>
                  <Link to="/">
                    <button className="px-4 py-2 rounded-full font-heading font-black text-xs transition-all active:scale-95"
                      style={{ background: 'linear-gradient(135deg,#fd591e,#ff8c00)', color: '#fff', boxShadow: '0 0 12px rgba(253,89,30,0.3)' }}>
                      Claim →
                    </button>
                  </Link>
                </div>
              </div>
            ))}

            {/* Deals from real trucks */}
            {trucks.length > 0 && (
              <div className="mt-2">
                <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#77ffc8' }}>DEALS FROM NEARBY TRUCKS</p>
                <div className="flex flex-col gap-3">
                  {trucks.slice(0, 4).map(truck => (
                    <Link key={truck.id} to={`/truck/${truck.id}`}>
                      <div className="flex items-center gap-3 p-3.5 rounded-2xl"
                        style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.15)' }}>
                        <img src={truck.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=200'}
                          alt={truck.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-heading font-bold text-sm truncate" style={{ color: '#dff0e8' }}>{truck.name}</p>
                          <p className="text-xs capitalize mt-0.5" style={{ color: '#bacbc0' }}>{truck.cuisine_type?.replace('_', ' ')} · Special today</p>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full mt-1 inline-block"
                            style={{ background: 'rgba(119,255,200,0.12)', color: '#77ffc8' }}>
                            VIEW MENU
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#bacbc0' }} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* UNDER $10 TAB */}
        {tab === 'under10' && (
          <div>
            <p className="text-xs mb-4" style={{ color: '#bacbc0' }}>Great food that won't break the bank 💸</p>
            <div className="grid grid-cols-2 gap-3">
              {UNDER_10.map(item => (
                <div key={item.id} className="rounded-2xl overflow-hidden"
                  style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.15)' }}>
                  <div className="relative" style={{ height: '120px' }}>
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-2 left-2">
                      <span className="font-heading font-black text-base" style={{ color: '#77ffc8' }}>{item.price}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-heading font-bold text-sm leading-tight" style={{ color: '#dff0e8' }}>{item.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>{item.truck}</p>
                    <button className="mt-2 w-full py-2 rounded-full text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIMITED TIME TAB */}
        {tab === 'limited' && (
          <div className="flex flex-col gap-4">
            <p className="text-xs" style={{ color: '#bacbc0' }}>These deals disappear fast. Tap in now ⚡</p>
            {LIMITED.map(deal => (
              <div key={deal.id} className="rounded-3xl overflow-hidden"
                style={{ background: '#192123', border: '1px solid rgba(253,89,30,0.2)' }}>
                <div className="relative" style={{ height: '160px' }}>
                  <img src={deal.img} alt={deal.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(253,89,30,0.9)', backdropFilter: 'blur(8px)' }}>
                    <Clock className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-black text-white">{deal.timeLeft}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="font-heading font-black text-lg text-white leading-tight">{deal.title}</p>
                        <p className="text-white/60 text-xs">{deal.truck}</p>
                      </div>
                      <span className="font-heading font-black text-xl" style={{ color: '#fd591e' }}>{deal.discount}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-3">
                  <button className="w-full py-3 rounded-full font-heading font-black text-sm transition-all active:scale-95"
                    style={{ background: 'linear-gradient(135deg,#fd591e,#ff8c00)', color: '#fff', boxShadow: '0 0 16px rgba(253,89,30,0.35)' }}>
                    <Zap className="w-4 h-4 inline mr-1.5" />
                    Grab This Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}