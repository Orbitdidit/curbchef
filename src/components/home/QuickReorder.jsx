import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { RotateCcw, Clock } from 'lucide-react';
import { addToCart } from '@/lib/cartStore';
import { useToast } from '@/components/ui/use-toast';

export default function QuickReorder({ user }) {
  const { toast } = useToast();

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders-recent', user?.email],
    queryFn: () => base44.entities.Order.filter({ customer_email: user.email }),
    enabled: !!user?.email,
  });

  if (!user || orders.length === 0) return null;

  const last = [...orders].sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
  if (!last?.items?.length) return null;

  const timeAgo = () => {
    const diff = Date.now() - new Date(last.created_date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const handleReorder = (e) => {
    e.preventDefault();
    last.items.forEach(item => {
      addToCart({ ...item, item_id: item.item_id, quantity: item.quantity || 1 }, last.truck_id, last.truck_name);
    });
    toast({ title: '🔁 Added to cart', description: `${last.items.length} items from ${last.truck_name}`, duration: 2000 });
  };

  return (
    <div className="px-5 mt-6">
      <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: 'rgba(186,203,192,0.5)' }}>QUICK REORDER</p>
      <div className="p-4 rounded-2xl flex items-center gap-3"
        style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#2e3638' }}>
          <div className="w-full h-full flex items-center justify-center text-2xl">🚚</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-black text-sm truncate" style={{ color: '#dff0e8' }}>{last.truck_name}</p>
          <p className="text-xs truncate" style={{ color: '#bacbc0' }}>
            {last.items.slice(0, 2).map(i => i.name).join(', ')}{last.items.length > 2 ? ` +${last.items.length - 2}` : ''}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" style={{ color: 'rgba(186,203,192,0.4)' }} />
            <span className="text-[10px]" style={{ color: 'rgba(186,203,192,0.4)' }}>{timeAgo()} · ${last.total?.toFixed(2)}</span>
          </div>
        </div>
        <button onClick={handleReorder}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-heading font-black text-xs flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 12px rgba(119,255,200,0.25)' }}>
          <RotateCcw className="w-3 h-3" />
          Reorder
        </button>
      </div>
    </div>
  );
}