import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Phone, Copy, Check } from 'lucide-react';
import CustomerEtaCard from '@/components/order/CustomerEtaCard';
import { useToast } from '@/components/ui/use-toast';

const STEPS = [
  { key: 'placed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'picked_up', label: 'Pickup' },
];

const STATUS_LABELS = {
  placed: 'Order Confirmed',
  preparing: 'Preparing Your Feast',
  ready: 'Ready for Pickup! 🎉',
  picked_up: 'Enjoy! 😋',
  pending_payment: 'Payment Pending...',
};

export default function OrderDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [showContact, setShowContact] = useState(false);
  const [copied, setCopied] = useState(false);

  const isStripeSession = id?.startsWith('cs_');

  const { data: order } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (isStripeSession) {
        const orders = await base44.entities.Order.filter({ stripe_checkout_session_id: id });
        return orders[0] || null;
      }
      return base44.entities.Order.get(id);
    },
    refetchInterval: 8000,
  });

  const { data: truck } = useQuery({
    queryKey: ['truck-for-order', order?.truck_id],
    queryFn: () => base44.entities.FoodTruck.get(order.truck_id),
    enabled: !!order?.truck_id,
  });

  const handleCopyCode = () => {
    if (order?.pickup_code) {
      navigator.clipboard.writeText(order.pickup_code);
      setCopied(true);
      toast({ title: 'Pickup code copied!', duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#00F5D4 transparent transparent transparent' }} />
      </div>
    );
  }

  const stepIdx = STEPS.findIndex(s => s.key === order.status);

  // Dynamic ready estimate: placed time + ~15 min
  const placedAt = order.created_date ? new Date(order.created_date) : new Date();
  const readyAt = new Date(placedAt.getTime() + 15 * 60000);
  const readyLabel = order.status === 'ready'
    ? 'Ready now!'
    : order.status === 'picked_up'
    ? 'Completed'
    : `Est. ready ${readyAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;

  return (
    <div className="min-h-screen dot-bg" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
        <Link to="/orders" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#141414' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#F5F0E8' }} />
        </Link>
        <p className="font-heading font-black text-base" style={{ color: '#F5F0E8' }}>CurbChef</p>
        <div className="w-9 h-9" />
      </div>

      <div className="px-5 pb-32">
        {/* Status */}
        <div className="mb-6">
          <p className="text-xs font-semibold" style={{ color: '#A39E94' }}>CURRENT STATUS</p>
          <h1 className="font-heading font-black text-2xl mt-1 leading-tight" style={{ color: '#F5F0E8' }}>
            {STATUS_LABELS[order.status] || 'Processing...'}
          </h1>
          <p className="text-sm mt-1 font-semibold" style={{ color: '#00F5D4' }}>{readyLabel}</p>
        </div>

        {/* Progress tracker */}
        <div className="relative flex items-center justify-between mb-8">
          <div className="absolute h-1 rounded-full"
            style={{ left: '12px', right: '12px', top: '50%', transform: 'translateY(-50%)', background: '#141414' }} />
          <div className="absolute h-1 rounded-full transition-all duration-700"
            style={{
              left: '12px', top: '50%', transform: 'translateY(-50%)',
              width: stepIdx <= 0 ? '0%' : stepIdx === 1 ? '33%' : stepIdx === 2 ? '66%' : '100%',
              background: 'linear-gradient(90deg, #00F5D4, #00e6a7)',
              boxShadow: '0 0 8px rgba(119,255,200,0.5)',
            }} />
          {STEPS.map((step, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <div key={step.key} className="flex flex-col items-center gap-1.5 relative z-10">
                <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: done || active ? 'linear-gradient(135deg, #00F5D4, #00e6a7)' : '#141414',
                    border: !done && !active ? '2px solid rgba(59,74,66,0.4)' : 'none',
                    boxShadow: active ? '0 0 12px rgba(119,255,200,0.5)' : 'none',
                  }}>
                  {(done || active) && (
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[10px] font-semibold" style={{ color: done || active ? '#00F5D4' : '#A39E94' }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Pickup Code */}
        {order.pickup_code && (
          <button onClick={handleCopyCode}
            className="w-full p-6 rounded-3xl text-center mb-5 active:scale-95 transition-all"
            style={{ background: '#141414', border: '1px solid rgba(119,255,200,0.15)' }}>
            <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#A39E94' }}>YOUR PICKUP CODE</p>
            <p className="font-heading font-black text-5xl tracking-widest"
              style={{ color: '#00F5D4', textShadow: '0 0 20px rgba(119,255,200,0.5)' }}>
              {order.pickup_code}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {copied ? <Check className="w-3.5 h-3.5" style={{ color: '#00F5D4' }} /> : <Copy className="w-3.5 h-3.5" style={{ color: '#A39E94' }} />}
              <p className="text-xs" style={{ color: '#A39E94' }}>
                {copied ? 'Copied!' : 'Tap to copy · Show to vendor at window'}
              </p>
            </div>
          </button>
        )}

        {/* ETA Card */}
        {order.status !== 'pending_payment' && order.status !== 'picked_up' && (
          <CustomerEtaCard order={order} truck={truck} />
        )}

        {/* Truck info */}
        <div className="p-4 rounded-2xl flex items-center gap-3 mb-5" style={{ background: '#141414' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(119,255,200,0.1)' }}>
            <MapPin className="w-5 h-5" style={{ color: '#00F5D4' }} />
          </div>
          <div className="flex-1">
            <p className="font-heading font-bold text-sm" style={{ color: '#F5F0E8' }}>{order.truck_name}</p>
            <p className="text-xs" style={{ color: '#A39E94' }}>{truck?.address || truck?.city || 'Houston, TX'}</p>
          </div>
        </div>

        {/* Order Details */}
        <div>
          <h3 className="font-heading font-bold text-sm mb-3" style={{ color: '#F5F0E8' }}>Order Details</h3>
          <div className="rounded-2xl overflow-hidden" style={{ background: '#141414' }}>
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between px-4 py-3"
                style={{ borderBottom: i < order.items.length - 1 ? '1px solid rgba(59,74,66,0.2)' : 'none' }}>
                <span className="text-sm" style={{ color: '#A39E94' }}>{item.quantity}x {item.name}</span>
                <span className="text-sm font-semibold" style={{ color: '#F5F0E8' }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            {order.tax > 0 && (
              <div className="flex justify-between px-4 py-2">
                <span className="text-xs" style={{ color: '#A39E94' }}>Tax (8.25%)</span>
                <span className="text-xs" style={{ color: '#A39E94' }}>${order.tax?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(59,74,66,0.3)' }}>
              <span className="font-heading font-bold" style={{ color: '#F5F0E8' }}>Total</span>
              <span className="font-heading font-bold" style={{ color: '#00F5D4' }}>${order.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Truck CTA */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center px-5 pb-6 pt-4 z-50"
        style={{ background: 'rgba(13,21,23,0.95)', backdropFilter: 'blur(16px)' }}>
        <button onClick={() => setShowContact(true)}
          className="w-full max-w-lg flex items-center justify-center gap-2 py-4 rounded-full font-heading font-black text-sm"
          style={{ background: 'linear-gradient(135deg, #00F5D4 0%, #00e6a7 100%)', color: '#0A0A0A', boxShadow: '0 0 20px rgba(119,255,200,0.35)' }}>
          <Phone className="w-4 h-4" />
          Contact Truck
        </button>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowContact(false)}>
          <div className="w-full max-w-lg rounded-t-3xl p-6 pb-10" style={{ background: '#151d1f', border: '1px solid rgba(59,74,66,0.25)' }}
            onClick={e => e.stopPropagation()}>
            <h2 className="font-heading font-black text-lg mb-1" style={{ color: '#F5F0E8' }}>Contact {order.truck_name}</h2>
            <p className="text-xs mb-5" style={{ color: '#A39E94' }}>Order #{order.pickup_code}</p>
            <div className="flex flex-col gap-3 mb-4">
              {truck?.phone ? (
                <a href={`tel:${truck.phone}`}
                  className="flex items-center gap-3 p-4 rounded-2xl active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg,rgba(119,255,200,0.1),rgba(119,255,200,0.05))', border: '1px solid rgba(119,255,200,0.2)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(119,255,200,0.12)' }}>
                    <Phone className="w-5 h-5" style={{ color: '#00F5D4' }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#F5F0E8' }}>Call Truck</p>
                    <p className="text-xs" style={{ color: '#A39E94' }}>{truck.phone}</p>
                  </div>
                </a>
              ) : (
                <div className="p-4 rounded-2xl" style={{ background: '#141414' }}>
                  <p className="text-sm font-bold mb-1" style={{ color: '#F5F0E8' }}>📍 Pickup location</p>
                  <p className="text-xs" style={{ color: '#A39E94' }}>{truck?.address || 'Find the truck at its listed location'}</p>
                  <p className="text-xs mt-2" style={{ color: '#A39E94' }}>Show your pickup code <span className="font-black" style={{ color: '#00F5D4' }}>{order.pickup_code}</span> at the window.</p>
                </div>
              )}
            </div>
            <button onClick={() => setShowContact(false)}
              className="w-full py-3.5 rounded-full font-heading font-black text-sm"
              style={{ background: '#2e3638', color: '#A39E94' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}