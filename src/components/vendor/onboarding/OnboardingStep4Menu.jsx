import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import CoachedPhotoUpload from './CoachedPhotoUpload';

const CATEGORIES = ['mains','sides','drinks','desserts','specials'];
const MIN_ITEMS = 3;

const isUnnamed = n => !n?.trim() || n.trim().toLowerCase() === 'new item';

function MenuItemRow({ item, onDelete, truck, onChange }) {
  const [local, setLocal] = useState(item);
  const [writing, setWriting] = useState(false);
  const [desc, setDesc] = useState(item.description || '');

  const save = async (updates) => {
    const updated = { ...local, ...updates };
    setLocal(updated);
    onChange?.(updated);
    await base44.entities.MenuItem.update(item.id, updates);
  };

  // Chef Coach drafts a description; the vendor can edit it before it saves.
  const writeIt = async () => {
    if (isUnnamed(local.name)) return;
    setWriting(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a menu description for "${local.name}" from ${truck?.name || 'a Houston food truck'} (${(truck?.cuisine_type || 'street food').replace(/[_-]/g, ' ')}).
One sentence, 12-20 words. Make it mouth-watering and specific: texture, sauce, how it's cooked. Houston casual, no hype words like "delicious" or "amazing", no emoji, no quotes.`,
      });
      const text = (typeof res === 'string' ? res : res?.result || '').trim().replace(/^["']|["']$/g, '');
      if (text) { setDesc(text); await save({ description: text }); }
    } finally { setWriting(false); }
  };

  return (
    <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: 'var(--cc-bg-2)', border:'1px solid rgba(var(--cc-line-rgb),0.6)' }}>
      <CoachedPhotoUpload
        compact
        kind="food"
        itemName={local.name}
        currentUrl={local.image_url}
        onUploaded={(url) => save({ image_url: url })}
      />
      <div className="flex gap-2">
        <input defaultValue={isUnnamed(local.name) ? '' : local.name} onBlur={e => e.target.value.trim() && save({ name: e.target.value.trim() })} placeholder="Item name" className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'var(--cc-bg-0)', color:'var(--cc-ink)', border:'1px solid rgba(var(--cc-line-rgb),0.4)' }} />
        <input type="number" defaultValue={local.price} onBlur={e => save({ price: parseFloat(e.target.value) || 0 })}
          placeholder="$0.00" className="w-20 px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'var(--cc-bg-0)', color:'var(--cc-ink)', border:'1px solid rgba(var(--cc-line-rgb),0.4)' }} />
      </div>
      <div className="flex flex-col gap-1.5">
        <textarea
          rows={2}
          value={desc}
          onChange={e => setDesc(e.target.value)}
          onBlur={() => desc !== (local.description || '') && save({ description: desc })}
          placeholder="What makes it good? Smoked how long, what sauce, what crunch…"
          className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
          style={{ background: 'var(--cc-bg-0)', color:'var(--cc-ink)', border:'1px solid rgba(var(--cc-line-rgb),0.6)' }}
        />
        <button type="button" onClick={writeIt} disabled={writing || isUnnamed(local.name)}
          className="flex items-center gap-1.5 text-xs font-bold w-fit min-h-8"
          style={{ color: 'var(--cc-accent)', opacity: isUnnamed(local.name) ? 0.45 : 1 }}>
          {writing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {writing ? 'Writing…' : desc ? 'Rewrite it for me' : 'Write it for me'}
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => save({ category: c })}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold capitalize"
              style={local.category === c
                ? { background: 'rgba(var(--cc-accent-rgb),0.15)', color:'var(--cc-accent)'}
                : { background:'var(--cc-bg-0)', color:'var(--cc-ink-faint)' }}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={onDelete} className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(var(--cc-warm-red-rgb),0.08)', color:'var(--cc-warm-red)' }}>
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
      truck_id: truck.id, name: 'New item', price: 0, category:'mains', is_available: true,
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
        <p className="font-display text-xl mb-1" style={{ color: 'var(--cc-ink)' }}>Build your menu</p>
        <p className="text-sm" style={{ color: 'var(--cc-ink-dim)' }}>Add at least {MIN_ITEMS} items. Name and price first, then the photo.</p>
      </div>

      <div className="flex items-center justify-between px-4 py-3 rounded-2xl"
        style={{ background: hasEnough ? 'rgba(var(--cc-accent-rgb),0.07)':'rgba(255,107,26,0.07)', border: `1px solid ${hasEnough ?'rgba(var(--cc-accent-rgb),0.2)':'rgba(255,107,26,0.2)'}` }}>
        <span className="text-sm font-bold" style={{ color: hasEnough ? 'var(--cc-accent)':'var(--cc-warm-2)'}}>
          {menuItems.length} item{menuItems.length !== 1 ?'s':''} added
        </span>
        <span className="text-xs" style={{ color: hasEnough ? 'var(--cc-accent)':'var(--cc-warm-2)'}}>
          {hasEnough ?' Minimum met' : `Need ${MIN_ITEMS - menuItems.length} more`}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {menuItems.map(item => (
          <MenuItemRow key={item.id} item={item} truck={truck} onDelete={() => deleteItem(item.id)}
            onChange={(u) => setMenuItems(prev => prev.map(i => i.id === u.id ? u : i))} />
        ))}
      </div>

      <button onClick={addItem} disabled={adding}
        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold"
        style={{ background: 'rgba(var(--cc-accent-rgb),0.07)', color:'var(--cc-accent)', border:'1px dashed rgba(var(--cc-accent-rgb),0.3)' }}>
        <Plus className="w-4 h-4" />
        {adding ? 'Adding…':'Add Menu Item'}
      </button>
    </div>
  );
}