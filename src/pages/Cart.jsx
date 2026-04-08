import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { getCart, subscribe, getCartTotal, clearCart } from '@/lib/cartStore';
import { ChevronLeft, Truck, Clock, CreditCard, Zap, MoreVertical, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const TIPS = [15, 18, 20];

export default function Cart() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState(getCart());
  const [tip, setTip] = useState(18);
  const [customTip, setCustomTip] = useState('');
  const [pickupMode, setPickupMode] = useState('asap');
  const [placing, setPlacing] = useState(false);

  useEffect(() => subscribe(() => setCart(getCart())), []);

  const subtotal = getCartTotal();
  const serviceFee = 1.50;
  const tipAmt = customTip ? parseFloat(customTip) : (subtotal * tip / 100);
  const total = subtotal + serviceFee + tipAmt;

  const handlePlace = async () => {
    setPlacing(true);
    const user = await base44.auth.me();
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();

    const res = await base44.functions.invoke('stripeCheckout', {
      truck_id: cart.truckId,
      items: cart.items,
      subtotal,
      tip: tipAmt,
      pickup_time: pickupMode === 'asap' ? 'ASAP' : '7:30 PM',
      pickup_code: code,
      payment_method: 'card',
      success_url: `${window.location.origin}/order/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/cart`,
    });

    if (res.data?.checkout_url) {
      // Stripe Checkout — redirect
      clearCart();
      window.location.href = res.data.checkout_url;
      return;
    }

    if (res.data?.truck_not_connected) {
      // Truck hasn't connected Stripe yet — fall back to direct order creation
      toast({ title: 'Payment processing unavailable', description: 'Placing order directly — vendor will collect payment at pickup.', duration: 4000 });
      const order = await base44.entities.Order.create({
        truck_id: cart.truckId,
        truck_name: cart.truckName,
        customer_email: user.email,
        customer_name: user.full_name,
        items: cart.items,
        subtotal,
        tip: tipAmt,
        total,
        gross_amount: total,
        status: 'placed',
        pickup_time: pickupMode === 'asap' ? 'ASAP' : '7:30 PM',
        pickup_code: code,
        payment_method: 'card',
        is_test_payment: false,
      });
      clearCart();
      navigate(`/order/${order.id}`);
      setPlacing(false);
      return;
    }

    toast({ title: 'Error', description: res.data?.error || 'Could not start checkout', variant: 'destructive' });
    setPlacing(false);
  };

  if (!cart.items?.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center dot-bg" style={{ background: '#0d1517' }}>
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="font-heading font-bold text-xl mb-2" style={{ color: '#dff0e8' }}>Your bag is empty</h2>
        <p className="text-sm mb-8" style={{ color: '#bacbc0' }}>Add items from a truck to get started</p>
        <Link to="/">
          <div className="px-8 py-3 rounded-full font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #77ffc8, #00e6a7)', color: '#003826' }}>
            Discover Trucks
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen dot-bg" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-10"
        style={{ background: 'rgba(13,21,23,0.9)', backdropFilter: 'blur(16px)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
        </button>
        <h1 className="font-heading font-bold text-lg" style={{ color: '#dff0e8' }}>Your Bag</h1>
        <button className="ml-auto" style={{ color: '#bacbc0' }}>
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="px-5 pb-40">
        {/* Pickup Location */}
        <div className="mb-5">
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#77ffc8' }}>PICKUP LOCATION</p>
          <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: '#192123' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(119,255,200,0.12)' }}>
              <Truck className="w-5 h-5" style={{ color: '#77ffc8' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold text-sm truncate" style={{ color: '#dff0e8' }}>{cart.truckName}</p>
              <p className="text-xs" style={{ color: '#bacbc0' }}>123 Main St, Houston</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: 'rgba(119,255,200,0.12)', color: '#77ffc8' }}>
              15–20 min
            </span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-5">
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#77ffc8' }}>ORDER SUMMARY</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: '#192123' }}>
            {cart.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4"
                style={{ borderBottom: i < cart.items.length - 1 ? '1px solid rgba(59,74,66,0.2)' : 'none' }}>
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>{item.name}</p>
                  {item.add_ons?.map((a, j) => (
                    <p key={j} className="text-xs" style={{ color: '#bacbc0' }}>+ {a.name}</p>
                  ))}
                  <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>Qty: {item.quantity}</p>
                </div>
                <span className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pickup Time */}
        <div className="mb-5">
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#77ffc8' }}>PICKUP TIME</p>
          <div className="flex gap-3">
            {[
              { id: 'asap', label: 'ASAP (15–20 min)' },
              { id: 'schedule', label: 'Schedule later' },
            ].map(m => (
              <button key={m.id} onClick={() => setPickupMode(m.id)}
                className="flex-1 py-2.5 rounded-full text-sm font-bold transition-all"
                style={pickupMode === m.id
                  ? { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 14px rgba(119,255,200,0.35)' }
                  : { background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.3)' }
                }>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>SUPPORT THE CREW</p>
            <span className="text-[10px]" style={{ color: '#bacbc0' }}>100% goes to staff</span>
          </div>
          <div className="flex gap-2">
            {TIPS.map(t => (
              <button key={t} onClick={() => { setTip(t); setCustomTip(''); }}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={tip === t && !customTip
                  ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.4)' }
                  : { background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.2)' }
                }>{t}%</button>
            ))}
            <input type="number" placeholder="Other" value={customTip}
              onChange={e => { setCustomTip(e.target.value); setTip(0); }}
              className="flex-1 py-2.5 rounded-xl text-sm text-center font-semibold outline-none"
              style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.2)' }} />
          </div>
        </div>

        {/* Totals */}
        <div className="p-4 rounded-2xl mb-2 space-y-2" style={{ background: '#192123' }}>
          {[
            { label: 'Subtotal', val: `$${subtotal.toFixed(2)}` },
            { label: 'Service Fee', val: `$${serviceFee.toFixed(2)}` },
            { label: `Tip (${tip || 'custom'}%)`, val: `$${tipAmt.toFixed(2)}` },
          ].map(row => (
            <div key={row.label} className="flex justify-between">
              <span className="text-sm" style={{ color: '#bacbc0' }}>{row.label}</span>
              <span className="text-sm font-semibold" style={{ color: '#dff0e8' }}>{row.val}</span>
            </div>
          ))}
          <div className="pt-2 flex justify-between" style={{ borderTop: '1px solid rgba(59,74,66,0.3)' }}>
            <span className="font-heading font-bold" style={{ color: '#dff0e8' }}>Total</span>
            <span className="font-heading font-bold text-lg" style={{ color: '#77ffc8' }}>${total.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-center text-[10px] mb-6" style={{ color: '#bacbc0' }}>Secure payment via Stripe</p>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center px-5 pb-6 pt-4 z-50"
        style={{ background: 'rgba(13,21,23,0.95)', backdropFilter: 'blur(16px)' }}>
        <button onClick={handlePlace} disabled={placing}
          className="w-full max-w-lg flex items-center justify-center gap-2 py-4 rounded-full font-heading font-black text-base transition-all"
          style={{
            background: 'linear-gradient(135deg, #77ffc8 0%, #00e6a7 100%)',
            color: '#003826',
            boxShadow: '0 0 24px rgba(119,255,200,0.4)',
            opacity: placing ? 0.7 : 1,
          }}>
          {placing ? (
            <><div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#003826 transparent transparent transparent' }} /> Processing...</>
          ) : (
            <><ExternalLink className="w-5 h-5" /> Pay ${total.toFixed(2)} via Stripe</>
          )}
        </button>
      </div>
    </div>
  );
}