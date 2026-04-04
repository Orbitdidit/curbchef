import React from 'react';
import TruckCard from './TruckCard';

export default function TrendingSection({ trucks }) {
  return (
    <div className="px-5 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading font-bold text-lg">Trending Near You</h2>
        <span className="text-xs text-muted-foreground">Houston, TX</span>
      </div>
      <div className="flex flex-col gap-4">
        {trucks.map(truck => (
          <TruckCard key={truck.id} truck={truck} />
        ))}
      </div>
    </div>
  );
}