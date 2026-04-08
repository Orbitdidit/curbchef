import React from 'react';
import { Link } from 'react-router-dom';
import { useAssistant } from './AssistantContext';
import { Star, MapPin, ChevronRight, RotateCcw } from 'lucide-react';
import { formatDist } from '@/lib/geoUtils';

export default function AssistantResults() {
  const { state, reset, setOpen } = useAssistant();
  const results = state.results || [];

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <span className="text-5xl mb-4">😢</span>
        <h3 className="font-heading font-black text-lg mb-1" style={{ color: '#dff0e8' }}>
          No matches found
        </h3>
        <p className="text-sm mb-6" style={{ color: '#bacbc0' }}>
          Try widening your distance or budget.
        </p>
        <button onClick={reset}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-heading font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>
              Your Picks 🔥
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>
              {results.length} matches based on your vibe
            </p>
          </div>
          <button onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: '#2e3638', color: '#bacbc0' }}>
            <RotateCcw className="w-3 h-3" /> Redo
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex flex-col gap-3">
          {results.map(({ truck, bestItem, distance }, i) => (
            <Link
              key={truck.id}
              to={`/truck/${truck.id}`}
              onClick={() => setOpen(false)}
              className="block rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
              style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}
            >
              <div className="flex gap-3 p-3">
                {/* Rank badge + image */}
                <div className="relative flex-shrink-0">
                  <img
                    src={truck.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=200'}
                    alt={truck.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  {i === 0 && (
                    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', boxShadow: '0 0 8px rgba(119,255,200,0.4)' }}>
                      <span className="text-[10px] font-black" style={{ color: '#003826' }}>#1</span>
                    </div>
                  )}
                  {truck.is_live && (
                    <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,59,48,0.9)' }}>
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                      <span className="text-[8px] font-black text-white">LIVE</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-heading font-bold text-sm truncate" style={{ color: '#dff0e8' }}>
                        {truck.name}
                      </p>
                      {truck.status === 'open' && (
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: 'rgba(119,255,200,0.15)', color: '#77ffc8' }}>
                          OPEN
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] font-bold" style={{ color: '#dff0e8' }}>
                          {truck.rating?.toFixed(1) || '4.8'}
                        </span>
                      </div>
                      {distance !== null && (
                        <div className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" style={{ color: '#bacbc0' }} />
                          <span className="text-[10px]" style={{ color: '#bacbc0' }}>
                            {formatDist(distance)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Best match item */}
                  {bestItem && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(253,89,30,0.12)', color: '#fd591e' }}>
                        TOP PICK
                      </span>
                      <span className="text-xs font-semibold truncate" style={{ color: '#bacbc0' }}>
                        {bestItem.name} · ${bestItem.price?.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}>
                    <ChevronRight className="w-4 h-4" style={{ color: '#003826' }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}