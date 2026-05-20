import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronLeft, TrendingUp, ShoppingBag } from 'lucide-react';

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = now.getDate() - day;
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

export default function TopItems() {
  const [viewAll, setViewAll] = useState(false);

  const weekStart = getStartOfWeek();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders-week'],
    queryFn: () => base44.entities.Order.filter({ status: 'picked_up' }, '-created_date', 500),
  });

  // Filter to this week
  const weekOrders = orders.filter(o => o.created_date >= weekStart);

  // Aggregate items
  const itemMap = {};
  weekOrders.forEach(order => {
    (order.items || []).forEach(item => {
      const key = item.name;
      if (!itemMap[key]) {
        itemMap[key] = { name: key, qty: 0, revenue: 0, trucks: new Set() };
      }
      itemMap[key].qty += item.quantity || 1;
      itemMap[key].revenue += (item.price || 0) * (item.quantity || 1);
      if (order.truck_name) itemMap[key].trucks.add(order.truck_name);
    });
  });

  const ranked = Object.values(itemMap)
    .sort((a, b) => b.qty - a.qty)
    .map(item => ({ ...item, trucks: Array.from(item.trucks) }));

  const displayed = viewAll ? ranked : ranked.slice(0, 10);
  const totalItemsSold = ranked.reduce((s, i) => s + i.qty, 0);
  const totalRevenue = weekOrders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="min-h-screen dot-bg pb-10" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 flex items-center gap-3"
        style={{ background: '#141414', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link to="/" className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#1A1A1A' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#F5F0E8' }} />
        </Link>
        <div>
          <p className="font-heading font-black text-base" style={{ color: '#F5F0E8' }}>Top Sellers</p>
          <p className="text-xs" style={{ color: '#6B665C' }}>This week's best-performing items</p>
        </div>
      </div>

      <div className="px-5 pt-5 max-w-2xl mx-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Orders', value: weekOrders.length },
            { label: 'Items Sold', value: totalItemsSold },
            { label: 'Revenue', value: `$${totalRevenue.toFixed(0)}` },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 rounded-2xl text-center" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="font-heading font-black text-xl" style={{ color: '#00F5D4' }}>{value}</p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: '#6B665C' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Section header */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4" style={{ color: '#00F5D4' }} />
          <p className="text-[10px] font-black tracking-widest" style={{ color: '#00F5D4' }}>RANKED BY UNITS SOLD</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00F5D4 transparent transparent transparent' }} />
          </div>
        ) : ranked.length === 0 ? (
          <div className="py-16 text-center rounded-2xl" style={{ background: '#141414' }}>
            <ShoppingBag className="w-10 h-10 mx-auto mb-3" style={{ color: '#242424' }} />
            <p className="font-heading font-bold" style={{ color: '#A39E94' }}>No completed orders this week yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayed.map((item, idx) => {
              const maxQty = ranked[0]?.qty || 1;
              const pct = Math.round((item.qty / maxQty) * 100);
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;

              return (
                <div key={item.name} className="p-4 rounded-2xl"
                  style={{ background: '#141414', border: idx < 3 ? '1px solid rgba(0,245,212,0.12)' : '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-heading font-black text-sm w-6 text-center flex-shrink-0"
                      style={{ color: idx < 3 ? '#00F5D4' : '#6B665C' }}>
                      {medal || `#${idx + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-bold text-sm truncate" style={{ color: '#F5F0E8' }}>{item.name}</p>
                      {item.trucks.length > 0 && (
                        <p className="text-[10px] truncate" style={{ color: '#6B665C' }}>
                          {item.trucks.slice(0, 2).join(' · ')}
                          {item.trucks.length > 2 && ` +${item.trucks.length - 2}`}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-heading font-black text-sm" style={{ color: '#F5F0E8' }}>{item.qty} sold</p>
                      <p className="text-[10px]" style={{ color: '#6B665C' }}>${item.revenue.toFixed(0)} rev</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1A1A1A' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: idx === 0 ? '#00F5D4' : idx < 3 ? 'rgba(0,245,212,0.5)' : 'rgba(0,245,212,0.2)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {ranked.length > 10 && (
          <button onClick={() => setViewAll(v => !v)}
            className="w-full mt-4 py-3 rounded-2xl text-sm font-bold transition-all"
            style={{ background: '#141414', color: '#00F5D4', border: '1px solid rgba(0,245,212,0.2)' }}>
            {viewAll ? 'Show Less' : `Show All ${ranked.length} Items`}
          </button>
        )}
      </div>
    </div>
  );
}