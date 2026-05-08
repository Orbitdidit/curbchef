import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Star, Lock } from 'lucide-react';

function TruckModal({ truck, onClose, onJoin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl p-6 pb-8"
        style={{ background: '#151d1f', border: '1px solid rgba(119,255,200,0.2)' }}
        onClick={e => e.stopPropagation()}>
        <div className="text-4xl mb-3 text-center">🔒</div>
        <h3 className="font-heading font-black text-xl text-center mb-2" style={{ color: '#dff0e8' }}>
          Want to order from {truck.name}?
        </h3>
        <p className="text-sm text-center mb-6 leading-relaxed" style={{ color: '#bacbc0' }}>
          Join the waitlist and get notified when CurbChef goes live in your area.
        </p>
        <button onClick={onJoin}
          className="w-full py-4 rounded-full font-heading font-black text-base transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 24px rgba(119,255,200,0.35)' }}>
          🚀 Join the Waitlist
        </button>
        <button onClick={onClose} className="w-full mt-3 py-3 rounded-full text-sm font-semibold"
          style={{ color: '#bacbc0' }}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

export default function TruckPeekSection({ onJoinWaitlist }) {
  const [selectedTruck, setSelectedTruck] = useState(null);

  const { data: trucks = [] } = useQuery({
    queryKey: ['landing-peek-trucks'],
    queryFn: () => base44.entities.FoodTruck.list('-rating', 8),
    select: data => data
      .filter(t => t.is_sample || t.is_approved)
      .slice(0, 5),
  });

  const handleTruckTap = (truck) => {
    // Track tap — fire and forget
    base44.entities.FoodTruck.update(truck.id, {
      truck_card_taps: (truck.truck_card_taps || 0) + 1,
    }).catch(() => {});
    setSelectedTruck(truck);
  };

  const handleJoin = () => {
    setSelectedTruck(null);
    onJoinWaitlist('truck_peek');
  };

  if (!trucks.length) return null;

  return (
    <section className="py-14 overflow-hidden">
      {/* Header */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1" style={{ background: 'rgba(59,74,66,0.4)' }} />
          <p className="font-heading font-black text-sm tracking-widest" style={{ color: '#fd591e' }}>SNEAK PEEK</p>
          <div className="h-px flex-1" style={{ background: 'rgba(59,74,66,0.4)' }} />
        </div>
        <h2 className="font-heading font-black text-2xl text-center" style={{ color: '#dff0e8' }}>
          🔥 Cooking right now in Houston
        </h2>
        <p className="text-sm text-center mt-1" style={{ color: '#bacbc0' }}>
          Real trucks. Real food. Ordering unlocks at launch.
        </p>
      </div>

      {/* Horizontal scroll row */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2">
        {trucks.map(truck => {
          const img = truck.image_url || truck.cover_image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=400&q=80';
          return (
            <button key={truck.id} onClick={() => handleTruckTap(truck)}
              className="flex-shrink-0 rounded-3xl overflow-hidden relative active:scale-95 transition-transform text-left"
              style={{ width: 200, background: '#151d1f', border: '1px solid rgba(59,74,66,0.3)' }}>
              {/* Image */}
              <div className="relative" style={{ height: 140 }}>
                <img src={img} alt={truck.name} className="w-full h-full object-cover" />
                {/* Blur overlay on bottom 30% for deal teaser */}
                <div className="absolute bottom-0 left-0 right-0 h-14 flex items-center justify-center"
                  style={{ backdropFilter: 'blur(6px)', background: 'rgba(13,21,23,0.55)' }}>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(253,89,30,0.85)', color: '#fff' }}>
                    🔒 $5 Special
                  </span>
                </div>
                {/* Open indicator */}
                {truck.status === 'open' && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(119,255,200,0.4)' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#77ffc8' }} />
                    <span className="text-[9px] font-black" style={{ color: '#77ffc8' }}>OPEN NOW</span>
                  </div>
                )}
                {/* Lock overlay hint */}
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                  <Lock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.6)' }} />
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-heading font-black text-sm truncate" style={{ color: '#dff0e8' }}>{truck.name}</p>
                <p className="text-xs capitalize mb-2" style={{ color: '#bacbc0' }}>
                  {truck.cuisine_type?.replace(/_/g, ' ')}
                </p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold" style={{ color: '#dff0e8' }}>
                    {truck.rating?.toFixed(1) || '4.8'}
                  </span>
                </div>
                <p className="text-[10px] mt-2 font-semibold" style={{ color: 'rgba(119,255,200,0.7)' }}>
                  🔒 Order access unlocks at launch
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Swipe hint */}
      <p className="text-center text-xs mt-3 font-semibold" style={{ color: 'rgba(186,203,192,0.4)' }}>
        Swipe to see more →
      </p>

      {/* Modal */}
      {selectedTruck && (
        <TruckModal
          truck={selectedTruck}
          onClose={() => setSelectedTruck(null)}
          onJoin={handleJoin}
        />
      )}
    </section>
  );
}