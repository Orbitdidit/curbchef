import React, { useState, useEffect } from 'react';
import { base44 } from'@/api/base44Client';
import { useQueryClient } from'@tanstack/react-query';
import { distanceMiles, useUserLocation } from'@/lib/geoUtils';
import { parseServerDate } from'@/lib/timeUtils';

// Walking 3 mph, driving 20 mph (city + parking)
function calcEta(distMiles, mode) {
  const speed = mode ==='walking'? 3 : 20;
  return Math.max(1, Math.round((distMiles / speed) * 60));
}

export default function CustomerEtaCard({ order, truck }) {
  const qc = useQueryClient();
  const { lat, lng } = useUserLocation();
  const [saving, setSaving] = useState(false);

  const distMiles = lat && truck?.latitude
    ? distanceMiles(lat, lng, truck.latitude, truck.longitude)
    : null;

  const walkEta = distMiles != null ? calcEta(distMiles,'walking') : 8;
  const driveEta = distMiles != null ? calcEta(distMiles,'driving') : 3;

  const alreadySet = !!order.customer_eta_type;
  const arrived = order.customer_eta_type ==='arrived';

  const setEta = async (type) => {
    setSaving(true);
    const eta = type ==='arrived'? 0 : type ==='walking'? walkEta : driveEta;
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
        style={{ background: 'rgba(var(--cc-accent-rgb),0.08)', border:'2px solid rgba(var(--cc-accent-rgb),0.4)' }}>
        <p className="text-3xl mb-2"></p>
        <p className="font-display text-base" style={{ color: 'var(--cc-accent)'}}>You've arrived!</p>
        <p className="text-xs mt-1" style={{ color: 'var(--cc-ink-dim)'}}>The vendor has been notified. Show your pickup code.</p>
      </div>
    );
  }

  if (alreadySet) {
    // Show live countdown
    return <EtaCountdown order={order} onArrive={() => setEta('arrived')} saving={saving} />;
  }

  return (
    <div className="p-5 rounded-3xl mb-5"
      style={{ background: 'var(--cc-bg-2)', border:'1px solid rgba(var(--cc-line-rgb),0.3)' }}>
      <p className="font-display text-base mb-1" style={{ color: 'var(--cc-ink)' }}>
        When will you arrive?
      </p>
      <p className="text-xs mb-4" style={{ color: 'var(--cc-ink-dim)' }}>
        Let the vendor know so your order is hot and ready
      </p>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => setEta('walking')}
          disabled={saving}
          className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all active:scale-95"
          style={{ background: 'rgba(var(--cc-line-rgb),0.25)', border:'1px solid rgba(var(--cc-line-rgb),0.3)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl"></span>
            <div className="text-left">
              <p className="font-display text-sm" style={{ color: 'var(--cc-ink)'}}>I'm walking</p>
              <p className="text-xs" style={{ color: 'var(--cc-ink-dim)' }}>~{walkEta} min away</p>
            </div>
          </div>
          <span className="font-display text-lg" style={{ color: 'var(--cc-accent)'}}>{walkEta}m</span>
        </button>

        <button
          onClick={() => setEta('driving')}
          disabled={saving}
          className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all active:scale-95"
          style={{ background: 'rgba(var(--cc-line-rgb),0.25)', border:'1px solid rgba(var(--cc-line-rgb),0.3)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl"></span>
            <div className="text-left">
              <p className="font-display text-sm" style={{ color: 'var(--cc-ink)'}}>I'm driving</p>
              <p className="text-xs" style={{ color: 'var(--cc-ink-dim)' }}>~{driveEta} min away</p>
            </div>
          </div>
          <span className="font-display text-lg" style={{ color: 'var(--cc-accent)'}}>{driveEta}m</span>
        </button>

        <button
          onClick={() => setEta('arrived')}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-display text-sm transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))',
            color:'var(--cc-accent-deep)',
            boxShadow:'0 0 16px rgba(var(--cc-accent-rgb),0.3)',
          }}
        >
           I'm here!
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
      const setAt = parseServerDate(order.customer_eta_set_at).getTime();
      const arrivalMs = setAt + order.customer_eta_minutes * 60 * 1000;
      const diff = Math.max(0, Math.round((arrivalMs - Date.now()) / 60000));
      setMinsLeft(diff);
    };
    calc();
    const id = setInterval(calc, 15000);
    return () => clearInterval(id);
  }, [order.customer_eta_set_at, order.customer_eta_minutes]);

  const emoji = order.customer_eta_type ==='walking'?'':'';
  const color = minsLeft === 0 ?'var(--cc-accent)': minsLeft <= 3 ?'var(--cc-warm)':'var(--cc-ink)';

  return (
    <div className="p-5 rounded-3xl mb-5 flex items-center justify-between"
      style={{ background: 'var(--cc-bg-2)', border:'1px solid rgba(var(--cc-line-rgb),0.3)' }}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="font-display text-base" style={{ color }}>
            {minsLeft === 0 ? 'Almost there!' : `~${minsLeft} min away`}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--cc-ink-dim)'}}>
            {order.customer_eta_type ==='walking'?'Walking':'Driving'} to you
          </p>
        </div>
      </div>
      <button
        onClick={onArrive}
        disabled={saving}
        className="px-4 py-2 rounded-full font-display text-sm active:scale-95 transition-all"
        style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color:'var(--cc-accent-deep)'}}
      >
        I'm here!
      </button>
    </div>
  );
}