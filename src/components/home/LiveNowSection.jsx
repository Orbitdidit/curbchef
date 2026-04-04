import React from 'react';
import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';

export default function LiveNowSection({ trucks }) {
  const liveTrucks = trucks.filter(t => t.is_live);
  if (liveTrucks.length === 0) return null;

  return (
    <div className="px-5 mt-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" />
          <h2 className="font-heading font-bold text-lg">Live Now</h2>
        </div>
        <Link to="/live" className="text-xs text-primary font-semibold">Watch all</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {liveTrucks.map(truck => (
          <Link
            key={truck.id}
            to={`/live`}
            className="flex-shrink-0 w-32 group"
          >
            <div className="relative w-32 h-44 rounded-2xl overflow-hidden">
              <img
                src={truck.image_url}
                alt={truck.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-accent/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <Radio className="w-2.5 h-2.5 text-white" />
                <span className="text-[10px] font-bold text-white">LIVE</span>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-xs font-bold truncate">{truck.name}</p>
                <p className="text-white/70 text-[10px] truncate">{truck.live_description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}