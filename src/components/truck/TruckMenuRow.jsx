import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, UtensilsCrossed } from 'lucide-react';

export default function TruckMenuRow({ item, truckId, quantity, onAdd, onRemove }) {
  return (
    <article className="cc-menu-row rounded-2xl p-4">
      <div className="flex gap-4">
        <Link to={`/truck/${truckId}/item/${item.id}`} className="flex-1 min-w-0">
          {item.is_special && <span className="text-discovery-amber text-[10px] uppercase tracking-widest font-mono">Chef special</span>}
          <h4 className="font-heading font-bold text-base leading-snug text-discovery-ink mt-1">{item.name}</h4>
          <p className="text-xs leading-relaxed text-discovery-muted line-clamp-2 mt-2">{item.description}</p>
        </Link>
        <Link to={`/truck/${truckId}/item/${item.id}`} aria-label={`View ${item.name}`} className="shrink-0">
          {item.image_url ? <img src={item.image_url} alt={item.name} loading="lazy" className="w-24 h-24 rounded-xl object-cover" /> : <div className="w-24 h-24 rounded-xl bg-discovery-raised flex items-center justify-center"><UtensilsCrossed className="w-7 h-7 text-discovery-muted" /></div>}
        </Link>
      </div>
      <div className="flex items-center justify-between gap-3 mt-3">
        <p className="font-heading font-extrabold text-discovery-ink">${item.price?.toFixed(2)}</p>
        <div className="flex items-center gap-2">
          {quantity > 0 && <><button aria-label={`Remove one ${item.name}`} onClick={e => onRemove(e, item)} className="w-11 h-11 rounded-full border border-discovery-line flex items-center justify-center"><Minus className="w-4 h-4" /></button><span aria-live="polite" className="text-sm font-bold min-w-5 text-center">{quantity}</span></>}
          <button aria-label={`Add ${item.name}`} onClick={e => onAdd(e, item)} className="cc-action px-4 inline-flex items-center gap-1.5 text-sm"><Plus className="w-4 h-4" />{quantity === 0 && 'Add'}</button>
        </div>
      </div>
    </article>
  );
}