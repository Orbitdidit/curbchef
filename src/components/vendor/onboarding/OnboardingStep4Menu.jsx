import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2 } from 'lucide-react';

const CATEGORIES = ['mains', 'sides', 'drinks', 'desserts', 'specials'];
const MIN_ITEMS = 3;

function MenuItemRow({ item, onDelete }) {
  const [local, setLocal] = useState(item);

  const save = async (updates) => {
    const updated = { ...local, ...updates };
    setLocal(updated);
    await base44.entities.MenuItem.update(item.id, updates);
  };

  return (
    <div className="p-4 rounded-2xl flex flex-col gap-3" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}>
      <div className="flex gap-2">
        <input defaultValue={local.name} onBlur={e => save({ name: e.target.value })} placeholder="Item name"
          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }} />
        <input type="number" defaultValue={local.price} onBlur={e => save({ price: parseFloat(e.target.value) || 0 })}
          placeholder="$0.00" className="w-20 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => save({ category: c })}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold capitalize"
              style={local.category === c
                ? { background: 'rgba(119,255,200,0.15)', color: '#77ffc8' }
                : { background: '#0d1517', color: '#6B665C' }}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={onDelete} className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,59,48,0.08)', color: '#FF3B30' }}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function OnboardingStep4Menu({ truck, menuItems, setMenuItems }) {
  const [adding, setAdding] = useState(false);

  const addItem = async () => {
    setAdding(true);
    const item = await base44.entities.MenuItem.create({
      truck_id: truck.id, name: 'New Item', price: 0, category: 'mains', is_available: true,
    });
    setMenuItems(prev => [...prev, item]);
    setAdding(false);
  };

  const deleteItem = async (id) => {
    await base44.entities.MenuItem.delete(id);
    setMenuItems(prev => prev.filter(i => i.id !== id));
  };

  const hasEnough = menuItems.length >= MIN_ITEMS;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>Build your menu</p>
        <p className="text-sm" style={{ color: '#bacbc0' }}>Add at least {MIN_ITEMS} items to get started.</p>
      </div>

      <div className="flex items-center justify-between px-4 py-3 rounded-2xl"
        style={{ background: hasEnough ? 'rgba(119,255,200,0.07)' : 'rgba(255,107,26,0.07)', border: `1px solid ${hasEnough ? 'rgba(119,255,200,0.2)' : 'rgba(255,107,26,0.2)'}` }}>
        <span className="text-sm font-bold" style={{ color: hasEnough ? '#77ffc8' : '#FF6B1A' }}>
          {menuItems.length} item{menuItems.length !== 1 ? 's' : ''} added
        </span>
        <span className="text-xs" style={{ color: hasEnough ? '#77ffc8' : '#FF6B1A' }}>
          {hasEnough ? '✓ Minimum met' : `Need ${MIN_ITEMS - menuItems.length} more`}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {menuItems.map(item => (
          <MenuItemRow key={item.id} item={item} onDelete={() => deleteItem(item.id)} />
        ))}
      </div>

      <button onClick={addItem} disabled={adding}
        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold"
        style={{ background: 'rgba(119,255,200,0.07)', color: '#77ffc8', border: '1px dashed rgba(119,255,200,0.3)' }}>
        <Plus className="w-4 h-4" />
        {adding ? 'Adding…' : 'Add Menu Item'}
      </button>
    </div>
  );
}