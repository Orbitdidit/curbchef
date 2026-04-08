import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, HelpCircle, MapPin, MessageSquare } from 'lucide-react';

const STEPS = [
  { key: 'placed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'picked_up', label: 'Pickup' },
];

export default function OrderDetail() {
  const { id } = useParams();
  // id might be a Stripe checkout session id (cs_test_...) or a real order id
  const isStripeSession = id?.startsWith('cs_');

  const { data: order } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (isStripeSession) {
        // Look up order by Stripe checkout session id
        const orders = await base44.entities.Order.filter({ stripe_checkout_session_id: id });
        return orders[0] || null;
      }
      return base44.entities.Order.get(id);
    },
    refetchInterval: 10000,
  });

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1517' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
      </div>
    );
  }

  const stepIdx = STEPS.findIndex(s => s.key === order.status);

  return (
    <div className="min-h-screen dot-bg" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
        <Link to="/orders" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
        </Link>
        <div className="text-center">
          <p className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>CurbChef</p>
        </div>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <HelpCircle className="w-4 h-4" style={{ color: '#bacbc0' }} />
        </button>
      </div>

      <div className="px-5 pb-32">
        {/* Status */}
        <div className="mb-6">
          <p className="text-xs font-semibold" style={{ color: '#bacbc0' }}>CURRENT STATUS</p>
          <h1 className="font-heading font-black text-2xl mt-1 leading-tight" style={{ color: '#dff0e8' }}>
            {order.status === 'placed' && 'Order Confirmed'}
            {order.status === 'preparing' && 'Preparing Your Feast'}
            {order.status === 'ready' && 'Ready for Pickup!'}
            {order.status === 'picked_up' && 'Enjoy! 🎉'}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#77ffc8' }}>Est. Ready 11:45 PM</p>
        </div>

        {/* Progress tracker */}
        <div className="relative flex items-center justify-between mb-8">
          <div
            className="absolute h-1 rounded-full"
            style={{
              left: '12px', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: '#192123',
            }}
          />
          <div
            className="absolute h-1 rounded-full transition-all duration-700"
            style={{
              left: '12px', top: '50%', transform: 'translateY(-50%)',
              width: stepIdx === 0 ? '0%' : stepIdx === 1 ? '33%' : stepIdx === 2 ? '66%' : '100%',
              background: 'linear-gradient(90deg, #77ffc8, #00e6a7)',
              boxShadow: '0 0 8px rgba(119,255,200,0.5)',
            }}
          />
          {STEPS.map((step, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <div key={step.key} className="flex flex-col items-center gap-1.5 relative z-10">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: done || active ? 'linear-gradient(135deg, #77ffc8, #00e6a7)' : '#192123',
                    border: !done && !active ? '2px solid rgba(59,74,66,0.4)' : 'none',
                    boxShadow: active ? '0 0 12px rgba(119,255,200,0.5)' : 'none',
                  }}
                >
                  {(done || active) && (
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#003826" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[10px] font-semibold" style={{ color: done || active ? '#77ffc8' : '#bacbc0' }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Pickup Code */}
        {order.pickup_code && (
          <div
            className="p-6 rounded-3xl text-center mb-5"
            style={{ background: '#192123', border: '1px solid rgba(119,255,200,0.15)' }}
          >
            <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#bacbc0' }}>YOUR PICKUP CODE</p>
            <p
              className="font-heading font-black text-5xl tracking-widest"
              style={{ color: '#77ffc8', textShadow: '0 0 20px rgba(119,255,200,0.5)' }}
            >
              {order.pickup_code}
            </p>
            <p className="text-xs mt-3" style={{ color: '#bacbc0' }}>Show this to the vendor at the window</p>
          </div>
        )}

        {/* Truck info */}
        <div className="p-4 rounded-2xl flex items-center gap-3 mb-5" style={{ background: '#192123' }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(119,255,200,0.1)' }}
          >
            <MapPin className="w-5 h-5" style={{ color: '#77ffc8' }} />
          </div>
          <div className="flex-1">
            <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>{order.truck_name}</p>
            <p className="text-xs" style={{ color: '#bacbc0' }}>Rainey Street District</p>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(119,255,200,0.12)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L15 8L8 15" stroke="#77ffc8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Order Details */}
        <div>
          <h3 className="font-heading font-bold text-sm mb-3" style={{ color: '#dff0e8' }}>Order Details</h3>
          <div className="rounded-2xl overflow-hidden" style={{ background: '#192123' }}>
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between px-4 py-3" style={{ borderBottom: i < order.items.length - 1 ? '1px solid rgba(59,74,66,0.2)' : 'none' }}>
                <span className="text-sm" style={{ color: '#bacbc0' }}>{item.quantity}x {item.name}</span>
                <span className="text-sm font-semibold" style={{ color: '#dff0e8' }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(59,74,66,0.3)' }}>
              <span className="font-heading font-bold" style={{ color: '#dff0e8' }}>Total</span>
              <span className="font-heading font-bold" style={{ color: '#77ffc8' }}>${order.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center px-5 pb-6 pt-4 z-50"
        style={{ background: 'rgba(13,21,23,0.95)', backdropFilter: 'blur(16px)' }}
      >
        <button
          className="w-full max-w-lg flex items-center justify-center gap-2 py-4 rounded-full font-heading font-black text-sm"
          style={{
            background: 'linear-gradient(135deg, #77ffc8 0%, #00e6a7 100%)',
            color: '#003826',
            boxShadow: '0 0 20px rgba(119,255,200,0.35)',
          }}
        >
          <MessageSquare className="w-4 h-4" />
          CONTACT TRUCK
        </button>
      </div>
    </div>
  );
}