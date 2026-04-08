import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscribe, getCart, getCartCount, getCartTotal } from '@/lib/cartStore';

export default function CartFloatingButton() {
  const [cart, setCart] = useState(getCart());

  useEffect(() => subscribe(() => setCart(getCart())), []);

  const count = getCartCount();
  const total = getCartTotal();

  if (count === 0) return null;

  return (
    <Link
      to="/cart"
      aria-label={`View cart: ${count} item${count !== 1 ? 's' : ''}, $${total.toFixed(2)}`}
      className="fixed bottom-24 left-4 right-4 z-40 flex justify-center"
      style={{ maxWidth: '512px', margin: '0 auto', left: 0, right: 0 }}
    >
      <div
        className="w-full mx-4 flex items-center justify-between px-5 py-4 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #77ffc8 0%, #00e6a7 100%)',
          boxShadow: '0 0 24px rgba(119,255,200,0.5)',
          minHeight: '56px',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-heading font-black text-sm"
            style={{ background: 'rgba(0,56,38,0.3)', color: '#003826' }}
          >
            {count}
          </div>
          <span className="font-heading font-bold text-sm" style={{ color: '#003826' }}>
            {cart.truckName || 'Your Feast'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-heading font-black text-sm" style={{ color: '#003826' }}>
            VIEW BAG
          </span>
          <span
            className="font-heading font-black text-sm px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,56,38,0.2)', color: '#003826' }}
          >
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}