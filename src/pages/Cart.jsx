import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, Trash2, Clock, CreditCard, Smartphone } from 'lucide-react';
import { getCart, getCartTotal, updateQuantity, clearCart, subscribe } from '@/lib/cartStore';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const tipOptions = [
  { label: '15%', multiplier: 0.15 },
  { label: '18%', multiplier: 0.18 },
  { label: '20%', multiplier: 0.20 },
  { label: 'None', multiplier: 0 },
];

export default function Cart() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState(getCart());
  const [selectedTip, setSelectedTip] = useState(1);
  const [pickupTime, setPickupTime] = useState('asap');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    return subscribe(setCart);
  }, []);

  const subtotal = getCartTotal();
  const tip = subtotal * tipOptions[selectedTip].multiplier;
  const total = subtotal + tip;

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;
    setPlacing(true);
    const pickupCode = String(Math.floor(1000 + Math.random() * 9000));
    const user = await base44.auth.me();
    await base44.entities.Order.create({
      truck_id: cart.truckId,
      truck_name: cart.truckName,
      customer_email: user.email,
      customer_name: user.full_name,
      items: cart.items,
      subtotal,
      tip,
      total,
      status: 'placed',
      pickup_time: pickupTime === 'asap' ? 'ASAP' : pickupTime,
      pickup_code: pickupCode,
      payment_method: paymentMethod,
    });
    clearCart();
    toast({ title: 'Order placed!', description: `Pickup code: ${pickupCode}` });
    navigate('/orders');
  };

  if (cart.items.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-5">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="font-heading font-bold text-xl mb-1">Your cart is empty</h2>
        <p className="text-muted-foreground text-sm mb-6">Find a truck and start ordering!</p>
        <Link to="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold text-sm">
          Explore Trucks
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-heading font-bold text-lg">Your Cart</h1>
          <p className="text-xs text-muted-foreground">{cart.truckName}</p>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 space-y-3 mt-2">
        {cart.items.map(item => (
          <div key={item.item_id} className="flex gap-3 bg-secondary/50 rounded-2xl p-3">
            {item.image_url && (
              <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-sm">{item.name}</h4>
                <button onClick={() => updateQuantity(item.item_id, 0)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                </button>
              </div>
              {item.add_ons?.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  + {item.add_ons.map(a => a.name).join(', ')}
                </p>
              )}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-card flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3 text-primary-foreground" />
                  </button>
                </div>
                <span className="font-bold text-sm">
                  ${((item.price + (item.add_ons || []).reduce((s, a) => s + a.price, 0)) * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pickup time */}
      <div className="px-5 mt-5">
        <h3 className="font-heading font-bold text-sm mb-2.5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Pickup Time
        </h3>
        <div className="flex gap-2">
          {['asap', '15 min', '30 min'].map(opt => (
            <button
              key={opt}
              onClick={() => setPickupTime(opt)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pickupTime === opt
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {opt === 'asap' ? 'ASAP' : opt}
            </button>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="px-5 mt-5">
        <h3 className="font-heading font-bold text-sm mb-2.5">Add a tip</h3>
        <div className="flex gap-2">
          {tipOptions.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelectedTip(i)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedTip === i
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div className="px-5 mt-5">
        <h3 className="font-heading font-bold text-sm mb-2.5">Payment</h3>
        <div className="space-y-2">
          <button
            onClick={() => setPaymentMethod('apple_pay')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              paymentMethod === 'apple_pay' ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-secondary'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-sm font-medium">Apple Pay</span>
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              paymentMethod === 'card' ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-secondary'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">Credit / Debit Card</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 mt-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tip</span>
          <span>${tip.toFixed(2)}</span>
        </div>
        <div className="h-px bg-border my-2" />
        <div className="flex justify-between">
          <span className="font-heading font-bold">Total</span>
          <span className="font-heading font-bold text-lg text-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Place order */}
      <div className="px-5 mt-5">
        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-heading font-bold text-base shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {placing ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}