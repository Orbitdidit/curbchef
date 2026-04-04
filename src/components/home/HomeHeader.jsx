import React from 'react';
import { MapPin, Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomeHeader() {
  return (
    <div className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Your location</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-heading font-semibold text-sm">Houston, TX</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/search" className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Search className="w-4.5 h-4.5 text-foreground" />
          </Link>
          <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center relative">
            <Bell className="w-4.5 h-4.5 text-foreground" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full" />
          </button>
        </div>
      </div>
      <h1 className="font-heading text-2xl font-bold leading-tight">
        What's cooking<br />
        <span className="text-primary">near you?</span>
      </h1>
    </div>
  );
}