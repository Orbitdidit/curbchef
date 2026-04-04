import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Star, MapPin, Clock, Heart, Share2 } from 'lucide-react';

export default function TruckHeader({ truck }) {
  return (
    <div className="relative">
      <div className="h-56 overflow-hidden">
        <img
          src={truck.cover_image_url || truck.image_url}
          alt={truck.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      <div className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 right-4 flex items-center justify-between">
        <Link to="/" className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-white" />
        </Link>
        <div className="flex gap-2">
          <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="px-5 -mt-10 relative">
        <div className="flex items-center gap-2 mb-1.5">
          {truck.status === 'open' && (
            <span className="text-[11px] font-bold text-primary bg-primary/15 px-2.5 py-0.5 rounded-full">OPEN NOW</span>
          )}
          {truck.status === 'closed' && (
            <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">CLOSED</span>
          )}
          {truck.is_live && (
            <span className="text-[11px] font-bold text-accent bg-accent/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <h1 className="font-heading text-2xl font-bold">{truck.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">{truck.description}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-chart-3 fill-chart-3" />
            <span className="text-sm font-bold">{truck.rating?.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({truck.review_count})</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{truck.address || 'Houston, TX'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{truck.operating_hours || '11am–9pm'}</span>
          </div>
        </div>
        <button className="mt-3 bg-secondary text-secondary-foreground px-5 py-2 rounded-xl text-sm font-semibold">
          + Follow · {truck.followers_count || 0}
        </button>
      </div>
    </div>
  );
}