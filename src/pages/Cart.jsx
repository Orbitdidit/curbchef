import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCart, subscribe, getCartTotal, clearCart } from '@/lib/cartStore';
import { ChevronLeft, Truck, ExternalLink, ShoppingBag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AssistantNudge from '@/components/assistant/AssistantNudge';

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

  // Fetch the truck to get real address
  const { data: truck } = useQuery({
    queryKey: ['cart-truck', cart.truckId],
    queryFn: () => base44.entities.FoodTruck.get(cart.truckId),
    enabled: !!cart.truckId,
  });

  const subtotal = getCartTotal();
  const serviceFee = 1.50;
  const taxAmt = Number((subtotal * 0.0825).toFixed(2));
  const tipAmt = customTip ? parseFloat(customTip) || 0 : (subtotal * tip / 100);
  const total = subtotal + serviceFee + taxAmt + tipAmt;

  const handlePlace = async () => {
    if (truck?.is_sample) {
      toast({
        title: 'This is a demo truck!',
        description: 'Sign up your real food truck to start receiving orders.',
        duration: 4000,
      });
      return;
    }
    setPlacing(true);
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();

    const timeout = setTimeout(() => {
      setPlacing(false);
      toast({ title: 'Checkout timed out', description:'Please try again.', variant:'destructive' });
    }, 15000);

    try {
      const user = await base44.auth.me();

      const res = await base44.functions.invoke('stripeCheckout', {
        truck_id: cart.truckId,
        items: cart.items,
        subtotal,
        tip: tipAmt,
        pickup_time: pickupMode === 'asap'?'ASAP':'Scheduled',
        pickup_code: code,
        payment_method: 'card',
        success_url: `${window.location.origin}/order/{CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/cart`,
      });

      clearTimeout(timeout);

      if (res.data?.checkout_url) {
        clearCart();
        window.location.href = res.data.checkout_url;
        return;
      }

      if (res.data?.truck_not_connected) {
        toast({ title: "This truck isn't accepting payments yet.", description:"Order saved — you'll pay at pickup.", duration: 4000 });
        const order = await base44.entities.Order.create({
          truck_id: cart.truckId,
          truck_name: cart.truckName,
          customer_email: user.email,
          customer_name: user.full_name,
          items: cart.items,
          subtotal,
          tax: taxAmt,
          tip: tipAmt,
          total,
          gross_amount: total,
          status: 'placed',
          pickup_time: pickupMode === 'asap'?'ASAP':'Scheduled',
          pickup_code: code,
          payment_method: 'card',
          is_test_payment: false,
        });
        clearCart();
        navigate(`/order/${order.id}`);
        setPlacing(false);
        return;
      }

      if (res.data?.error) {
        toast({ title: 'Checkout error', description: res.data.error, variant:'destructive' });
        setPlacing(false);
        return;
      }

      toast({ title: 'Checkout error', description:'Could not start checkout. Please try again.', variant:'destructive' });
      setPlacing(false);
    } catch (err) {
      clearTimeout(timeout);
      toast({ title: 'Checkout failed — please try again', variant:'destructive' });
      setPlacing(false);
    }
  };

  if (!cart.items?.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center dot-bg" style={{ background: 'var(--cc-black)' }}>
        <ShoppingBag className="w-14 h-14 mb-4 mx-auto" style={{ color: 'var(--cc-ink-faint)' }} />
        <h2 className="font-display text-xl mb-2" style={{ color: 'var(--cc-cream)' }}>Your bag is empty</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--cc-ink-muted)' }}>Add items from a truck to get started</p>
        <Link to="/">
          <div className="px-8 py-3 rounded-full font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, var(--cc-accent-2), var(--cc-accent-3))', color:'var(--cc-black)' }}>
            Discover Trucks
          </div>
        </Link>
        <div className="mt-4"><AssistantNudge /></div>
      </div>
    );
  }

  const truckAddress = truck?.address || (truck?.city ? `${truck.city}, TX` : 'Houston, TX');

  return (
    <div className="min-h-screen" style={{ background: 'var(--cc-black)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-10"
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--cc-surface)' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: 'var(--cc-cream)' }} />
        </button>
        <h1 className="font-display text-lg" style={{ color: 'var(--cc-cream)', letterSpacing:'-0.02em' }}>Your Bag</h1>
      </div>

      <div className="px-5 pb-40">
        {/* Pickup Location */}
        <div className="mb-5">
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: 'var(--cc-accent-2)' }}>PICKUP LOCATION</p>
          <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: 'var(--cc-surface)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--cc-accent-rgb),0.12)' }}>
              <Truck className="w-5 h-5" style={{ color: 'var(--cc-accent-2)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-sm truncate" style={{ color: 'var(--cc-cream)' }}>{cart.truckName}</p>
              <p className="text-xs" style={{ color: 'var(--cc-ink-muted)' }}>{truckAddress}</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: 'rgba(var(--cc-accent-rgb),0.12)', color:'var(--cc-accent-2)' }}>
              {truck?.delivery_eta || '15–20 min'}
            </span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-5">
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: 'var(--cc-accent-2)' }}>ORDER SUMMARY</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--cc-surface)' }}>
            {cart.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4"
                style={{ borderBottom: i < cart.items.length - 1 ? '1px solid rgba(var(--cc-line-rgb),0.2)':'none' }}>
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm" style={{ color: 'var(--cc-cream)' }}>{item.name}</p>
                  {item.add_ons?.map((a, j) => (
                    <p key={j} className="text-xs" style={{ color: 'var(--cc-ink-muted)' }}>+ {a.name}</p>
                  ))}
                  <p className="text-xs mt-0.5" style={{ color: 'var(--cc-ink-muted)' }}>Qty: {item.quantity}</p>
                </div>
                <span className="font-display text-sm" style={{ color: 'var(--cc-cream)' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pickup Time */}
        <div className="mb-5">
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: 'var(--cc-accent-2)' }}>PICKUP TIME</p>
          <div className="flex gap-3">
            {[
              { id: 'asap', label:'ASAP (15–20 min)' },
              { id: 'schedule', label:'Schedule later' },
            ].map(m => (
              <button key={m.id} onClick={() => setPickupMode(m.id)}
                className="flex-1 py-2.5 rounded-full text-sm font-bold transition-all"
                style={pickupMode === m.id
                  ? { background: 'linear-gradient(135deg,var(--cc-accent-2),var(--cc-accent-3))', color:'var(--cc-black)', boxShadow:'0 0 14px rgba(var(--cc-accent-rgb),0.35)' }
                  : { background: 'var(--cc-surface)', color:'var(--cc-ink-muted)', border:'1px solid rgba(var(--cc-line-rgb),0.3)' }
                }>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--cc-accent-2)' }}>SUPPORT THE CREW</p>
            <span className="text-[10px]" style={{ color: 'var(--cc-ink-muted)' }}>100% goes to staff</span>
          </div>
          <div className="flex gap-2">
            {TIPS.map(t => (
              <button key={t} onClick={() => { setTip(t); setCustomTip(''); }}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={tip === t && !customTip
                  ? { background: 'rgba(var(--cc-accent-rgb),0.12)', color:'var(--cc-accent-2)', border:'1px solid rgba(var(--cc-accent-rgb),0.4)' }
                  : { background: 'var(--cc-surface)', color:'var(--cc-ink-muted)', border:'1px solid rgba(var(--cc-line-rgb),0.2)' }
                }>{t}%</button>
            ))}
            <input type="number" placeholder="Other" value={customTip}
              onChange={e => { setCustomTip(e.target.value); setTip(0); }}
              className="flex-1 py-2.5 rounded-xl text-sm text-center font-semibold outline-none"
              style={{ background: 'var(--cc-surface)', color:'var(--cc-cream)', border:'1px solid rgba(var(--cc-line-rgb),0.2)' }} />
          </div>
        </div>

        {/* Totals — now includes tax */}
        <div className="p-4 rounded-2xl mb-2 space-y-2" style={{ background: 'var(--cc-surface)' }}>
          {[
            { label: 'Subtotal', val: `$${subtotal.toFixed(2)}` },
            { label: 'Tax (8.25%)', val: `$${taxAmt.toFixed(2)}` },
            { label: 'Service Fee', val: `$${serviceFee.toFixed(2)}` },
            { label: `Tip (${customTip ? 'custom' : `${tip}%`})`, val: `$${tipAmt.toFixed(2)}` },
          ].map(row => (
            <div key={row.label} className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--cc-ink-muted)' }}>{row.label}</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--cc-cream)' }}>{row.val}</span>
            </div>
          ))}
          <div className="pt-2 flex justify-between" style={{ borderTop: '1px solid rgba(var(--cc-line-rgb),0.3)' }}>
            <span className="font-display" style={{ color: 'var(--cc-cream)' }}>Total</span>
            <span className="font-display text-lg" style={{ color: 'var(--cc-accent-2)' }}>${total.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-center text-[10px] mb-6" style={{ color: 'var(--cc-ink-muted)' }}>Secure payment via Stripe · Tax included</p>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center px-5 pb-6 pt-4 z-50"
        style={{ background: 'rgba(13,21,23,0.95)', backdropFilter:'blur(16px)' }}>
        <button onClick={handlePlace} disabled={placing}
          className="w-full max-w-lg flex items-center justify-center gap-2 py-4 rounded-full font-display text-base transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--cc-accent-2) 0%, var(--cc-accent-3) 100%)',
            color: 'var(--cc-black)',
            boxShadow: '0 0 24px rgba(var(--cc-accent-rgb),0.4)',
            opacity: placing ? 0.7 : 1,
          }}>
          {placing ? (
            <><div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--cc-black) transparent transparent transparent' }} /> Processing...</>
          ) : (
            <><ExternalLink className="w-5 h-5" /> Pay ${total.toFixed(2)} via Stripe</>
          )}
        </button>
      </div>
    </div>
  );
}