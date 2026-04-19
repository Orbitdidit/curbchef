import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Star, Minus, Plus } from 'lucide-react';
import { addToCart as addItemToCart, getCart, updateQuantity } from '@/lib/cartStore';
import { useToast } from '@/components/ui/use-toast';

const SPICE = ['Mild', 'Medium', 'High'];

export default function ItemDetail() {
  const { id: truckId, itemId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [qty, setQty] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [spice, setSpice] = useState(null);

  const { data: item } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => base44.entities.MenuItem.get(itemId),
  });

  const { data: truck } = useQuery({
    queryKey: ['truck', truckId],
    queryFn: () => base44.entities.FoodTruck.get(truckId),
  });

  // Pre-fill qty from cart if item already added
  useEffect(() => {
    if (!item) return;
    const cartItem = getCart().items.find(i => i.item_id === item.id);
    if (cartItem) setQty(cartItem.quantity);
  }, [item?.id]);

  const cartItem = item ? getCart().items.find(i => i.item_id === item.id) : null;
  const isInCart = !!cartItem;

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1517' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
      </div>
    );
  }

  const addOnTotal = selectedAddOns.reduce((s, a) => s + a.price, 0);
  const total = (item.price + addOnTotal) * qty;

  const toggleAddOn = (addOn) => {
    setSelectedAddOns(prev =>
      prev.find(a => a.name === addOn.name)
        ? prev.filter(a => a.name !== addOn.name)
        : [...prev, addOn]
    );
  };

  const handleAddToCart = () => {
    if (isInCart) {
      // Update quantity directly
      updateQuantity(item.id, qty);
      toast({ title: 'Cart updated!', description: `${qty}x ${item.name}` });
    } else {
      addItemToCart({
        item_id: item.id,
        name: item.name,
        price: item.price + addOnTotal,
        quantity: qty,
        image_url: item.image_url,
        add_ons: selectedAddOns,
      }, truckId, truck?.name || 'Food Truck');
      toast({ title: 'Added to cart!', description: `${qty}x ${item.name}` });
    }
    navigate(`/truck/${truckId}`);
  };


  return (
    <div className="min-h-screen" style={{ background: '#0d1517' }}>
      {/* Hero image */}
      <div className="relative h-72">
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=600'}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1517] via-transparent to-transparent" />

        {/* Nav */}
        <div className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(13,21,23,0.7)', backdropFilter: 'blur(10px)' }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(13,21,23,0.7)', backdropFilter: 'blur(10px)' }}
          >
            <Heart className="w-4.5 h-4.5 text-white" />
          </button>
        </div>

        {/* Border glow on selected item */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ border: '2px solid rgba(119,255,200,0.1)', borderRadius: 'inherit' }}
        />
      </div>

      {/* Content */}
      <div className="px-5 -mt-4 relative z-10 pb-40">
        {/* Name + price */}
        <div className="flex items-start justify-between mb-3">
          <h1 className="font-heading font-black text-2xl leading-tight flex-1 mr-4" style={{ color: '#dff0e8' }}>
            {item.name}
          </h1>
          <div className="text-right flex-shrink-0">
            <p className="font-heading font-black text-2xl" style={{ color: '#77ffc8' }}>
              ${item.price?.toFixed(2)}
            </p>
            <p className="text-[10px] font-bold" style={{ color: '#bacbc0' }}>PER {item.category?.toUpperCase()}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold" style={{ color: '#dff0e8' }}>4.8</span>
            <span className="text-xs" style={{ color: '#bacbc0' }}>(100 reviews)</span>
          </div>
          {item.is_special && (
            <span
              className="text-[10px] font-black px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(253,89,30,0.15)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.3)' }}
            >
              ★ TRENDING
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed mb-6" style={{ color: '#bacbc0' }}>{item.description}</p>

        {/* Spice Level — only shown when vendor enabled it AND category/tags support it */}
        {item.has_spice_option && (
          item.category === 'mains' ||
          item.tags?.some(t => ['spicy', 'hot'].includes(t.toLowerCase()))
        ) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>SPICE LEVEL</h3>
              <span className="text-[10px]" style={{ color: '#bacbc0' }}>Optional</span>
            </div>
            <div className="flex gap-3">
              {SPICE.map(s => (
                <button
                  key={s}
                  onClick={() => setSpice(prev => prev === s ? null : s)}
                  className="flex-1 py-2.5 rounded-full text-sm font-bold transition-all"
                  style={spice === s
                    ? { background: '#fd591e', color: 'white', boxShadow: '0 0 12px rgba(253,89,30,0.4)' }
                    : { background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.3)' }
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons */}
        {item.add_ons?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-heading font-bold text-sm mb-3" style={{ color: '#dff0e8' }}>ADD-ONS</h3>
            <div className="flex flex-col gap-2">
              {item.add_ons.map((addon) => {
                const selected = selectedAddOns.find(a => a.name === addon.name);
                return (
                  <button
                    key={addon.name}
                    onClick={() => toggleAddOn(addon)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl transition-all"
                    style={{
                      background: '#192123',
                      border: selected ? '1px solid rgba(119,255,200,0.4)' : '1px solid transparent',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ background: selected ? 'rgba(119,255,200,0.12)' : '#2e3638' }}
                    >
                      🍴
                    </div>
                    <span className="flex-1 text-sm font-semibold text-left" style={{ color: '#dff0e8' }}>{addon.name}</span>
                    <span className="text-sm" style={{ color: '#bacbc0' }}>+${addon.price?.toFixed(2)}</span>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: selected ? '#77ffc8' : '#2e3638',
                        border: selected ? 'none' : '1.5px solid rgba(59,74,66,0.4)',
                      }}
                    >
                      {selected && (
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#003826" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <span
                key={tag}
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(119,255,200,0.08)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.2)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sticky bottom: qty + add to cart */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center px-5 pb-6 pt-4 z-50"
        style={{ background: 'rgba(13,21,23,0.97)', backdropFilter: 'blur(16px)' }}
      >
        <div className="w-full max-w-lg flex items-center gap-3">
          {/* Qty control */}
          <div
            className="flex items-center gap-4 px-4 py-3 rounded-2xl flex-shrink-0"
            style={{ background: '#192123' }}
          >
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#2e3638' }}
            >
              <Minus className="w-3.5 h-3.5" style={{ color: '#dff0e8' }} />
            </button>
            <span className="font-heading font-black text-lg w-4 text-center" style={{ color: '#dff0e8' }}>{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}
            >
              <Plus className="w-3.5 h-3.5" style={{ color: '#003826' }} />
            </button>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-4 rounded-2xl font-heading font-black text-base flex items-center justify-between px-5"
            style={{
              background: 'linear-gradient(135deg, #77ffc8 0%, #00e6a7 100%)',
              color: '#003826',
              boxShadow: '0 0 20px rgba(119,255,200,0.4)',
            }}
          >
            <span>{isInCart ? 'Update Cart' : 'Add to Cart'}</span>
            <span>${total.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}