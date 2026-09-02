import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { RotateCcw, Clock } from 'lucide-react';
import { addToCart } from '@/lib/cartStore';
import { useToast } from '@/components/ui/use-toast';
import { parseServerDate, localDayKey } from '@/lib/timeUtils';

export default function QuickReorder({ user }) {
  const { toast } = useToast();

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders-recent', user?.email],
    queryFn: () => base44.entities.Order.filter({ customer_email: user.email }),
    enabled: !!user?.email,
  });

  if (!user || orders.length === 0) return null;

  const last = [...orders].sort((a, b) => parseServerDate(b.created_date) - parseServerDate(a.created_date))[0];
  if (!last?.items?.length) return null;

  const timeAgo = () => {
    const placed = parseServerDate(last.created_date);
    if (localDayKey(placed) === localDayKey(new Date())) return 'Today';
    const yesterday = new Date(Date.now() - 86400000);
    if (localDayKey(placed) === localDayKey(yesterday)) return 'Yesterday';
    const days = Math.floor((Date.now() - placed.getTime()) / 86400000);
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
    <div className="px-4 mt-6">
      <p className="text-[10px] font-bold tracking-widest mb-3 font-mono" style={{ color: 'var(--cc-ink-faint)' }}>QUICK REORDER</p>
      <div className="p-4 rounded-2xl flex items-center gap-3"
        style={{ background: 'var(--cc-surface)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--cc-surface-3)' }}>
          <div className="w-full h-full flex items-center justify-center text-2xl">🚚</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-sm truncate" style={{ color: 'var(--cc-cream)', letterSpacing: '-0.01em' }}>{last.truck_name}</p>
          <p className="text-xs truncate" style={{ color: 'var(--cc-ink-muted)' }}>
            {last.items.slice(0, 2).map(i => i.name).join(', ')}{last.items.length > 2 ? ` +${last.items.length - 2}` : ''}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" style={{ color: 'var(--cc-ink-faint)' }} />
            <span className="text-[10px] font-mono" style={{ color: 'var(--cc-ink-faint)' }}>{timeAgo()} · ${last.total?.toFixed(2)}</span>
          </div>
        </div>
        <button onClick={handleReorder}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-xs flex-shrink-0"
          style={{ background: 'var(--cc-accent-2)', color: 'var(--cc-black)' }}>
          <RotateCcw className="w-3 h-3" />
          Reorder
        </button>
      </div>
    </div>
  );
}