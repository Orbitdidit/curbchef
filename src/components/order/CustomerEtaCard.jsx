import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { distanceMiles, useUserLocation } from '@/lib/geoUtils';

// Walking 3 mph, driving 20 mph (city + parking)
function calcEta(distMiles, mode) {
  const speed = mode === 'walking' ? 3 : 20;
  return Math.max(1, Math.round((distMiles / speed) * 60));
}

export default function CustomerEtaCard({ order, truck }) {
  const qc = useQueryClient();
  const { lat, lng } = useUserLocation();
  const [saving, setSaving] = useState(false);

  const distMiles = lat && truck?.latitude
    ? distanceMiles(lat, lng, truck.latitude, truck.longitude)
    : null;

  const walkEta = distMiles != null ? calcEta(distMiles, 'walking') : 8;
  const driveEta = distMiles != null ? calcEta(distMiles, 'driving') : 3;

  const alreadySet = !!order.customer_eta_type;
  const arrived = order.customer_eta_type === 'arrived';

  const setEta = async (type) => {
    setSaving(true);
    const eta = type === 'arrived' ? 0 : type === 'walking' ? walkEta : driveEta;
    await base44.entities.Order.update(order.id, {
      customer_eta_type: type,
      customer_eta_minutes: eta,
      customer_eta_set_at: new Date().toISOString(),
    });
    qc.invalidateQueries({ queryKey: ['order', order.id] });
    qc.invalidateQueries({ queryKey: ['vendor-orders'] });
    setSaving(false);
  };

  if (arrived) {
    return (
      <div className="p-5 rounded-3xl mb-5 text-center"
        style={{ background: 'rgba(119,255,200,0.08)', border: '2px solid rgba(119,255,200,0.4)' }}>
        <p className="text-3xl mb-2">👋</p>
        <p className="font-heading font-black text-base" style={{ color: '#77ffc8' }}>You've arrived!</p>
        <p className="text-xs mt-1" style={{ color: '#bacbc0' }}>The vendor has been notified. Show your pickup code.</p>
      </div>
    );
  }

  if (alreadySet) {
    // Show live countdown
    return <EtaCountdown order={order} onArrive={() => setEta('arrived')} saving={saving} />;
  }

  return (
    <div className="p-5 rounded-3xl mb-5"
      style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}>
      <p className="font-heading font-black text-base mb-1" style={{ color: '#dff0e8' }}>
        When will you arrive?
      </p>
      <p className="text-xs mb-4" style={{ color: '#bacbc0' }}>
        Let the vendor know so your order is hot and ready
      </p>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => setEta('walking')}
          disabled={saving}
          className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all active:scale-95"
          style={{ background: 'rgba(59,74,66,0.25)', border: '1px solid rgba(59,74,66,0.3)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🚶</span>
            <div className="text-left">
              <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>I'm walking</p>
              <p className="text-xs" style={{ color: '#bacbc0' }}>~{walkEta} min away</p>
            </div>
          </div>
          <span className="font-heading font-black text-lg" style={{ color: '#77ffc8' }}>{walkEta}m</span>
        </button>

        <button
          onClick={() => setEta('driving')}
          disabled={saving}
          className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all active:scale-95"
          style={{ background: 'rgba(59,74,66,0.25)', border: '1px solid rgba(59,74,66,0.3)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🚗</span>
            <div className="text-left">
              <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>I'm driving</p>
              <p className="text-xs" style={{ color: '#bacbc0' }}>~{driveEta} min away</p>
            </div>
          </div>
          <span className="font-heading font-black text-lg" style={{ color: '#77ffc8' }}>{driveEta}m</span>
        </button>

        <button
          onClick={() => setEta('arrived')}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-heading font-black text-sm transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg,#77ffc8,#00e6a7)',
            color: '#003826',
            boxShadow: '0 0 16px rgba(119,255,200,0.3)',
          }}
        >
          👋 I'm here!
        </button>
      </div>
    </div>
  );
}

function EtaCountdown({ order, onArrive, saving }) {
  const [minsLeft, setMinsLeft] = useState(null);

  useEffect(() => {
    const calc = () => {
      if (!order.customer_eta_set_at || !order.customer_eta_minutes) return;
      const setAt = new Date(order.customer_eta_set_at).getTime();
      const arrivalMs = setAt + order.customer_eta_minutes * 60 * 1000;
      const diff = Math.max(0, Math.round((arrivalMs - Date.now()) / 60000));
      setMinsLeft(diff);
    };
    calc();
    const id = setInterval(calc, 15000);
    return () => clearInterval(id);
  }, [order.customer_eta_set_at, order.customer_eta_minutes]);

  const emoji = order.customer_eta_type === 'walking' ? '🚶' : '🚗';
  const color = minsLeft === 0 ? '#77ffc8' : minsLeft <= 3 ? '#fd591e' : '#dff0e8';

  return (
    <div className="p-5 rounded-3xl mb-5 flex items-center justify-between"
      style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="font-heading font-black text-base" style={{ color }}>
            {minsLeft === 0 ? 'Almost there!' : `~${minsLeft} min away`}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>
            {order.customer_eta_type === 'walking' ? 'Walking' : 'Driving'} to you
          </p>
        </div>
      </div>
      <button
        onClick={onArrive}
        disabled={saving}
        className="px-4 py-2 rounded-full font-heading font-black text-sm active:scale-95 transition-all"
        style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}
      >
        I'm here!
      </button>
    </div>
  );
}