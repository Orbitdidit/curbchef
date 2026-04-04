import React from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';

export default function MenuItemCard({ item, truckId }) {
  return (
    <Link to={`/truck/${truckId}/item/${item.id}`} className="block">
      <div className="flex gap-3 bg-secondary/50 rounded-2xl p-3 hover:bg-secondary transition-colors">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm truncate">{item.name}</h4>
            {item.is_special && (
              <span className="flex-shrink-0 text-[10px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5" /> HOT
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{item.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="font-heading font-bold text-sm text-primary">${item.price?.toFixed(2)}</span>
            {!item.is_available && (
              <span className="text-[10px] text-destructive font-medium">Sold out</span>
            )}
          </div>
          {item.tags?.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {item.tags.map(tag => (
                <span key={tag} className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}