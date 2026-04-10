import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bike, Store, Clock, DollarSign, Bell } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DELIVERY_MODES = {
  pickup_only: null,
  pickup_delivery_curbchef: { label: 'CurbChef Delivery', color: '#77ffc8', bg: 'rgba(119,255,200,0.1)', border: 'rgba(119,255,200,0.25)' },
  pickup_delivery_vendor: { label: 'Vendor Delivery', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
};

export default function DeliveryBadge({ truck }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [user, setUser] = React.useState(null);
  React.useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const mode = truck.delivery_mode || 'pickup_only';
  const deliveryInfo = DELIVERY_MODES[mode];
  const isPickupOnly = mode === 'pickup_only';

  const { data: myRequest } = useQuery({
    queryKey: ['delivery-request', truck.id, user?.email],
    queryFn: () => base44.entities.DeliveryRequest.filter({ truck_id: truck.id, user_email: user.email }),
    enabled: !!user?.email && isPickupOnly,
  });

  const { data: requestCount } = useQuery({
    queryKey: ['delivery-request-count', truck.id],
    queryFn: () => base44.entities.DeliveryRequest.filter({ truck_id: truck.id }),
    enabled: isPickupOnly,
  });

  const requestDelivery = useMutation({
    mutationFn: () => base44.entities.DeliveryRequest.create({
      truck_id: truck.id,
      truck_name: truck.name,
      user_email: user?.email || 'anonymous',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery-request', truck.id] });
      qc.invalidateQueries({ queryKey: ['delivery-request-count', truck.id] });
      toast({ title: '✅ Request noted!', description: "We'll notify you when delivery launches here.", duration: 3000 });
    },
  });

  const alreadyRequested = myRequest?.length > 0;
  const totalRequests = requestCount?.length || 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Pickup always available */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}>
        <Store className="w-3 h-3" style={{ color: '#bacbc0' }} />
        <span className="text-[11px] font-black" style={{ color: '#bacbc0' }}>Pickup</span>
      </div>

      {/* Delivery badge or Coming Soon */}
      {deliveryInfo ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: deliveryInfo.bg, border: `1px solid ${deliveryInfo.border}` }}>
          <Bike className="w-3 h-3" style={{ color: deliveryInfo.color }} />
          <span className="text-[11px] font-black" style={{ color: deliveryInfo.color }}>{deliveryInfo.label}</span>
        </div>
      ) : (
        <button
          onClick={() => !alreadyRequested && user && requestDelivery.mutate()}
          disabled={alreadyRequested || requestDelivery.isPending || !user}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
          style={alreadyRequested
            ? { background: 'rgba(119,255,200,0.08)', border: '1px solid rgba(119,255,200,0.2)' }
            : { background: 'rgba(186,203,192,0.06)', border: '1px dashed rgba(186,203,192,0.2)' }
          }>
          <Bell className="w-3 h-3" style={{ color: alreadyRequested ? '#77ffc8' : '#bacbc0' }} />
          <span className="text-[11px] font-black" style={{ color: alreadyRequested ? '#77ffc8' : '#bacbc0' }}>
            {alreadyRequested ? 'Delivery Requested ✓' : 'Delivery Coming Soon'}
          </span>
        </button>
      )}

      {/* Delivery meta: time + fee */}
      {deliveryInfo && (
        <div className="w-full flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" style={{ color: 'rgba(186,203,192,0.5)' }} />
            <span className="text-xs" style={{ color: '#bacbc0' }}>{truck.delivery_eta || '25–40'} min</span>
          </div>
          <span style={{ color: 'rgba(186,203,192,0.3)' }}>·</span>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" style={{ color: 'rgba(186,203,192,0.5)' }} />
            <span className="text-xs" style={{ color: '#bacbc0' }}>
              {truck.delivery_fee ? `$${truck.delivery_fee.toFixed(2)} delivery fee` : 'Free delivery'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}