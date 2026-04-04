import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin } from 'lucide-react';

export default function TruckCard({ truck }) {
  const distanceMiles = (Math.random() * 3 + 0.3).toFixed(1);

  return (
    <Link to={`/truck/${truck.id}`} className="block group">
      <div className="bg-card rounded-3xl overflow-hidden transition-all duration-300 hover:bg-secondary/50">
        <div className="relative h-44 overflow-hidden">
          <img
            src={truck.image_url}
            alt={truck.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          {truck.status === 'open' && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
              <span className="text-[11px] font-bold text-primary-foreground">OPEN</span>
            </div>
          )}
          {truck.is_live && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-accent/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-white">LIVE</span>
            </div>
          )}
        </div>
        <div className="p-4 -mt-4 relative">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-heading font-bold text-base">{truck.name}</h3>
              <p className="text-muted-foreground text-xs mt-0.5 capitalize">{truck.cuisine_type?.replace('_', ' ')}</p>
            </div>
            <div className="flex items-center gap-1 bg-secondary px-2.5 py-1 rounded-xl">
              <Star className="w-3 h-3 text-chart-3 fill-chart-3" />
              <span className="text-xs font-bold">{truck.rating?.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2.5 text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="text-[11px]">{distanceMiles} mi</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-[11px]">10-15 min</span>
            </div>
            {truck.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-[11px] bg-accent/10 text-accent px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}