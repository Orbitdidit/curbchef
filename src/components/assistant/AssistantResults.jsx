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
        <h3 className="font-display text-lg mb-1" style={{ color: 'var(--cc-ink)' }}>
          No matches found
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--cc-ink-dim)' }}>
          Try widening your distance or budget.
        </p>
        <button onClick={reset}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-heading font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color: 'var(--cc-accent-deep)' }}>
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
            <h2 className="font-display text-lg" style={{ color: 'var(--cc-ink)' }}>
              Your Picks 🔥
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--cc-ink-dim)' }}>
              {results.length} matches based on your vibe
            </p>
          </div>
          <button onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: 'var(--cc-bg-3)', color: 'var(--cc-ink-dim)' }}>
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
              style={{ background: 'var(--cc-bg-2)', border: '1px solid rgba(var(--cc-line-rgb),0.2)' }}
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
                      style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', boxShadow: '0 0 8px rgba(var(--cc-accent-rgb),0.4)' }}>
                      <span className="text-[10px] font-black" style={{ color: 'var(--cc-accent-deep)' }}>#1</span>
                    </div>
                  )}
                  {truck.is_live && (
                    <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(var(--cc-warm-red-rgb),0.9)' }}>
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                      <span className="text-[8px] font-black text-white">LIVE</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-heading font-bold text-sm truncate" style={{ color: 'var(--cc-ink)' }}>
                        {truck.name}
                      </p>
                      {truck.status === 'open' && (
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: 'rgba(var(--cc-accent-rgb),0.15)', color: 'var(--cc-accent)' }}>
                          OPEN
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] font-bold" style={{ color: 'var(--cc-ink)' }}>
                          {truck.rating?.toFixed(1) || '4.8'}
                        </span>
                      </div>
                      {distance !== null && (
                        <div className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" style={{ color: 'var(--cc-ink-dim)' }} />
                          <span className="text-[10px]" style={{ color: 'var(--cc-ink-dim)' }}>
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
                        style={{ background: 'rgba(var(--cc-warm-rgb),0.12)', color: 'var(--cc-warm)' }}>
                        TOP PICK
                      </span>
                      <span className="text-xs font-semibold truncate" style={{ color: 'var(--cc-ink-dim)' }}>
                        {bestItem.name} · ${bestItem.price?.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))' }}>
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--cc-accent-deep)' }} />
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