import React from 'react';
import TruckMenuRow from '@/components/truck/TruckMenuRow';

export default function TruckMenuList({ groups, items, truckId, getQuantity, onAdd, onRemove, categoryLabel }) {
  const sections = groups || [{ cat: null, items }];
  return (
    <div className="space-y-7">
      {sections.map(({ cat, items: rows }) => (
        <section key={cat || 'items'}>
          {cat && <h3 className="font-heading font-extrabold text-xl mb-4 tracking-tight">{categoryLabel(cat)}</h3>}
          <div className="flex flex-col gap-3">
            {rows.map(item => <TruckMenuRow key={item.id} item={item} truckId={truckId} quantity={getQuantity(item.id)} onAdd={onAdd} onRemove={onRemove} />)}
          </div>
        </section>
      ))}
    </div>
  );
}