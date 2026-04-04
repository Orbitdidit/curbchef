import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { getCart, getCartCount, getCartTotal, subscribe } from '@/lib/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartFloatingButton() {
  const [cart, setCart] = useState(getCart());

  useEffect(() => {
    return subscribe(setCart);
  }, []);

  const count = getCartCount();
  const total = getCartTotal();

  if (count === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto"
      >
        <Link
          to="/cart"
          className="flex items-center justify-between bg-primary text-primary-foreground rounded-2xl px-5 py-4 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            </div>
            <span className="font-semibold text-sm">View Cart</span>
          </div>
          <span className="font-bold">${total.toFixed(2)}</span>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}