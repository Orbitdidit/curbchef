import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Minus, Plus } from 'lucide-react';
import { addToCart } from '@/lib/cartStore';
import { useToast } from '@/components/ui/use-toast';

export default function ItemDetail() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const pathParts = window.location.pathname.split('/');
  const truckId = pathParts[2];
  const itemId = pathParts[4];

  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', itemId],
    queryFn: async () => {
      const items = await base44.entities.MenuItem.filter({ id: itemId });
      return items[0];
    },
    enabled: !!itemId,
  });

  const { data: truck } = useQuery({
    queryKey: ['truck', truckId],
    queryFn: async () => {
      const trucks = await base44.entities.FoodTruck.filter({ id: truckId });
      return trucks[0];
    },
    enabled: !!truckId,
  });

  const toggleAddOn = (addOn) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(a => a.name === addOn.name);
      return exists ? prev.filter(a => a.name !== addOn.name) : [...prev, addOn];
    });
  };

  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = (item?.price || 0) + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (!item || !truck) return;
    addToCart({
      item_id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      add_ons: selectedAddOns,
      image_url: item.image_url,
    }, truckId, truck.name);
    toast({ title: 'Added to cart', description: `${quantity}x ${item.name}` });
    navigate(-1);
  };

  if (isLoading || !item) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="relative h-72">
        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="px-5 -mt-8 relative">
        <h1 className="font-heading text-2xl font-bold">{item.name}</h1>
        <p className="text-muted-foreground text-sm mt-1.5">{item.description}</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="font-heading text-xl font-bold text-primary">${item.price?.toFixed(2)}</span>
          {item.calories && <span className="text-xs text-muted-foreground">{item.calories} cal</span>}
        </div>

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div className="flex gap-2 mt-3">
            {item.tags.map(tag => (
              <span key={tag} className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {/* Add-ons */}
        {item.add_ons?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-heading font-bold text-base mb-3">Add-ons</h3>
            <div className="space-y-2">
              {item.add_ons.map(addOn => {
                const selected = selectedAddOns.find(a => a.name === addOn.name);
                return (
                  <button
                    key={addOn.name}
                    onClick={() => toggleAddOn(addOn)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      selected ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-secondary'
                    }`}
                  >
                    <span className="text-sm">{addOn.name}</span>
                    <span className="text-sm font-semibold text-primary">+${addOn.price?.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center justify-between mt-6 bg-secondary rounded-2xl px-5 py-3">
          <span className="text-sm font-medium">Quantity</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full bg-card flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-heading font-bold text-lg w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!item.is_available}
          className="w-full mt-5 bg-primary text-primary-foreground py-4 rounded-2xl font-heading font-bold text-base flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          <span>Add to Cart</span>
          <span className="bg-primary-foreground/20 px-3 py-0.5 rounded-lg text-sm">${totalPrice.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
}