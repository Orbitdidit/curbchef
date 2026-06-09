import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Upload } from 'lucide-react';

const MIN_ITEMS = 5;

function MenuItemRow({ item, onSave, onDelete }) {
  const [form, setForm] = useState(item);
  const [uploading, setUploading] = useState(false);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const save = () => { if (form.name?.trim()) onSave(form); };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const updated = { ...form, image_url: file_url };
    setForm(updated);
    onSave(updated);
    setUploading(false);
  };

  return (
    <div className="p-4 rounded-2xl flex flex-col gap-3"
      style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}>
      <div className="flex gap-3">
        <label className="cursor-pointer flex-shrink-0">
          <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
          <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ background: '#0d1517', border: '1px dashed rgba(59,74,66,0.5)' }}>
            {form.image_url
              ? <img src={form.image_url} alt="" className="w-full h-full object-cover" />
              : uploading
                ? <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
                : <Upload className="w-5 h-5" style={{ color: '#3b4a42' }} />
            }
          </div>
        </label>
        <div className="flex-1 flex flex-col gap-2">
          <input value={form.name || ''} onChange={e => update('name', e.target.value)} onBlur={save}
            placeholder="Item name (e.g. Brisket Plate)"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }} />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#bacbc0' }}>$</span>
              <input type="number" value={form.price || ''} onChange={e => update('price', parseFloat(e.target.value))} onBlur={save}
                placeholder="0.00" min="0" step="0.01"
                className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }} />
            </div>
            <select value={form.category || 'mains'} onChange={e => { update('category', e.target.value); save(); }}
              className="px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: '#0d1517', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.4)' }}>
              <option value="mains">Main</option>
              <option value="sides">Side</option>
              <option value="drinks">Drink</option>
              <option value="desserts">Dessert</option>
              <option value="specials">Special</option>
            </select>
          </div>
        </div>
      </div>
      <textarea value={form.description || ''} onChange={e => update('description', e.target.value)} onBlur={save}
        placeholder="What makes it special? (e.g. 14-hour smoked brisket, pickles, jalapeño slaw)"
        rows={2}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
        style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }} />
      <div className="flex items-center justify-between">
        <p className="text-[10px]" style={{ color: (form.price || 0) > 0 && (form.price || 0) < 5 ? '#77ffc8' : 'transparent' }}>
          ⚡ Under $5 — appears in $5 Specials carousel!
        </p>
        <button onClick={() => onDelete(form.id)}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl"
          style={{ color: '#fd591e', background: 'rgba(253,89,30,0.08)' }}>
          <Trash2 className="w-3.5 h-3.5" /> Remove
        </button>
      </div>
    </div>
  );
}

export default function OnboardingStep4Menu({ truck, menuItems, setMenuItems }) {
  const addItem = async () => {
    const newItem = await base44.entities.MenuItem.create({
      truck_id: truck.id, name: '', price: 0, category: 'mains', is_available: true,
    });
    setMenuItems(prev => [...prev, newItem]);
  };

  const saveItem = async (updated) => {
    await base44.entities.MenuItem.update(updated.id, updated);
    setMenuItems(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const deleteItem = async (id) => {
    await base44.entities.MenuItem.delete(id);
    setMenuItems(prev => prev.filter(m => m.id !== id));
  };

  const ready = menuItems.length >= MIN_ITEMS;

  return (
    <div className="flex flex-col gap-5 pb-4">
      <div>
        <h2 className="font-heading font-black text-2xl mb-1" style={{ color: '#dff0e8' }}>Build your menu 🍽️</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#bacbc0' }}>
          Add at least {MIN_ITEMS} items to unlock your profile. More items = more orders!
        </p>
      </div>

      <div className="flex items-center justify-between px-4 py-3 rounded-2xl"
        style={{ background: ready ? 'rgba(119,255,200,0.08)' : 'rgba(253,89,30,0.08)', border: `1px solid ${ready ? 'rgba(119,255,200,0.2)' : 'rgba(253,89,30,0.2)'}` }}>
        <p className="text-sm font-bold" style={{ color: ready ? '#77ffc8' : '#fd591e' }}>
          {ready ? `✓ ${menuItems.length} items — looking good!` : `${menuItems.length} / ${MIN_ITEMS} items — need ${MIN_ITEMS - menuItems.length} more`}
        </p>
      </div>

      <div className="p-4 rounded-2xl" style={{ background: 'rgba(119,255,200,0.04)', border: '1px solid rgba(119,255,200,0.1)' }}>
        <p className="text-xs font-bold mb-1.5" style={{ color: '#77ffc8' }}>💡 Menu tips from top vendors:</p>
        <ul className="text-xs space-y-1" style={{ color: '#bacbc0' }}>
          <li>• Have at least 3 mains, 1 side, and 1 drink</li>
          <li>• Items under $5 appear in the "$5 Specials" carousel — free visibility!</li>
          <li>• Adding a description doubles your add-to-cart rate</li>
          <li>• A food photo = 3× more orders on that item</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        {menuItems.map(item => (
          <MenuItemRow key={item.id} item={item} onSave={saveItem} onDelete={deleteItem} />
        ))}
      </div>

      <button onClick={addItem}
        className="flex items-center justify-center gap-2 py-4 rounded-2xl font-heading font-black text-sm"
        style={{ background: 'rgba(119,255,200,0.08)', color: '#77ffc8', border: '2px dashed rgba(119,255,200,0.25)' }}>
        <Plus className="w-5 h-5" /> Add Menu Item
      </button>
    </div>
  );
}