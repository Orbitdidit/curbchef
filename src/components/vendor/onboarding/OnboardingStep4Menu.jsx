import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2 } from 'lucide-react';

const CATEGORIES = ['mains', 'sides', 'drinks', 'desserts', 'specials'];

function MenuItemRow({ item, onDelete }) {
  const [local, setLocal] = useState(item);

  const save = async (field, value) => {
    const updated = { ...local, [field]: value };
    setLocal(updated);
    await base44.entities.MenuItem.update(item.id, { [field]: value });
  };

  return (
    <div className="p-4 rounded-2xl space-y-3" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.4)' }}>
      <div className="flex gap-2">
        <input defaultValue={local.name} onBlur={e => save('name', e.target.value)}
          placeholder="Item name" className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }} />
        <input defaultValue={local.price} onBlur={e => save('price', parseFloat(e.target.value) || 0)}
          placeholder="$0" type="number" min="0" step="0.01"
          className="w-20 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }} />
        <button onClick={() => onDelete(item.id)} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,59,48,0.1)' }}>
          <Trash2 className="w-4 h-4" style={{ color: '#FF3B30' }} />
        </button>
      </div>
      <select defaultValue={local.category} onBlur={e => save('category', e.target.value)}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none capitalize"
        style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }}>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );
}

export default function OnboardingStep4Menu({ truck, menuItems, setMenuItems }) {
  const addItem = async () => {
    if (!truck?.id) return;
    const item = await base44.entities.MenuItem.create({
      truck_id: truck.id, name: '', price: 0, category: 'mains', is_available: true,
    });
    setMenuItems(prev => [...prev, item]);
  };

  const deleteItem = async (id) => {
    await base44.entities.MenuItem.delete(id);
    setMenuItems(prev => prev.filter(i => i.id !== id));
  };

  const MIN_ITEMS = 3;
  const hasEnough = menuItems.length >= MIN_ITEMS;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>Build your menu 🍽️</h2>
        <p className="text-sm" style={{ color: '#bacbc0' }}>Add at least {MIN_ITEMS} items to complete this step.</p>
      </div>

      {menuItems.length > 0 && (
        <div className="space-y-3">
          {menuItems.map(item => (
            <MenuItemRow key={item.id} item={item} onDelete={deleteItem} />
          ))}
        </div>
      )}

      <button onClick={addItem}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all"
        style={{ background: 'rgba(119,255,200,0.08)', color: '#77ffc8', border: '1px dashed rgba(119,255,200,0.3)' }}>
        <Plus className="w-4 h-4" /> Add Menu Item
      </button>

      {!hasEnough && (
        <p className="text-xs text-center" style={{ color: '#bacbc0' }}>
          {MIN_ITEMS - menuItems.length} more item{MIN_ITEMS - menuItems.length !== 1 ? 's' : ''} needed to continue
        </p>
      )}
    </div>
  );
}