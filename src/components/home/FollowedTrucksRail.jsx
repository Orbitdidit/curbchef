import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';

export default function FollowedTrucksRail({ user, trucks }) {
  const { data: follows = [] } = useQuery({
    queryKey: ['follows', user?.email],
    queryFn: () => base44.entities.Follow.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  if (!user || follows.length === 0) return null;

  const followedTrucks = follows
    .map(f => trucks.find(t => t.id === f.truck_id))
    .filter(Boolean);

  if (followedTrucks.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between px-5 mb-3">
        <p className="text-[10px] font-black tracking-widest" style={{ color: 'rgba(186,203,192,0.5)' }}>YOUR TRUCKS</p>
        <span className="text-xs font-bold" style={{ color: '#bacbc0' }}>{followedTrucks.length} following</span>
      </div>
      <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar pb-1">
        {followedTrucks.map(truck => {
          const isLive = truck.is_live;
          const isOpen = truck.status === 'open';
          return (
            <Link key={truck.id} to={`/truck/${truck.id}`} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              {/* Avatar ring */}
              <div className="relative"
                style={{ padding: 2, borderRadius: '50%', background: isLive ? 'linear-gradient(135deg,#ff3b30,#ff6b60)' : isOpen ? 'linear-gradient(135deg,#77ffc8,#00e6a7)' : '#2e3638' }}>
                <div className="w-14 h-14 rounded-full overflow-hidden" style={{ background: '#192123' }}>
                  {truck.image_url ? (
                    <img src={truck.image_url} alt={truck.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🚚</div>
                  )}
                </div>
                {isLive && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: '#ff3b30', border: '2px solid #0d1517' }}>
                    <Radio className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                {!isLive && isOpen && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full"
                    style={{ background: '#77ffc8', border: '2px solid #0d1517' }} />
                )}
              </div>
              <p className="text-[10px] font-bold text-center max-w-[64px] truncate" style={{ color: '#bacbc0' }}>{truck.name}</p>
              {isLive && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,59,48,0.15)', color: '#ff3b30' }}>LIVE</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}