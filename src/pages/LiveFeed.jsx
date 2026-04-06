import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, Bookmark, Share2, ShoppingBag, X, UserPlus, UserCheck } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';

// Per-clip follow wrapper
function ClipCard({ clip, liked, saved, onLike, onSave }) {
  const { isFollowing, toggle: toggleFollow, isPending } = useFollow(clip.truck_id, clip.truck_name);

  const handleShare = () => {
    const url = `${window.location.origin}/truck/${clip.truck_id}`;
    if (navigator.share) {
      navigator.share({ title: clip.truck_name, text: clip.title, url });
    } else {
      navigator.clipboard?.writeText(url);
    }
  };

  return (
    <div className="relative h-screen snap-start flex-shrink-0">
      <img src={clip.image_url} alt={clip.title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,21,23,0.95) 0%, rgba(13,21,23,0.3) 50%, rgba(13,21,23,0.15) 100%)' }} />

      {/* Right actions */}
      <div className="absolute right-4 bottom-44 flex flex-col gap-6 items-center">
        {/* Truck avatar */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2" style={{ borderColor: '#77ffc8', boxShadow: '0 0 12px rgba(119,255,200,0.4)' }}>
            <img src={clip.truck_image || clip.image_url} alt={clip.truck_name} className="w-full h-full object-cover" />
          </div>
          <button
            onClick={toggleFollow}
            disabled={isPending}
            className="w-5 h-5 rounded-full flex items-center justify-center -mt-2.5"
            style={{ background: isFollowing ? '#77ffc8' : 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}
          >
            <span className="text-[8px] font-black" style={{ color: '#003826' }}>{isFollowing ? '✓' : '+'}</span>
          </button>
        </div>

        {/* Like */}
        <button onClick={onLike} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: liked ? 'rgba(253,89,30,0.3)' : 'rgba(13,21,23,0.6)', backdropFilter: 'blur(8px)' }}>
            <Heart className="w-6 h-6" style={{ color: liked ? '#fd591e' : 'white' }} fill={liked ? '#fd591e' : 'none'} />
          </div>
          <span className="text-white text-xs font-bold">{((clip.likes || 0) + (liked ? 1 : 0)).toLocaleString()}</span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(13,21,23,0.6)', backdropFilter: 'blur(8px)' }}>
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-bold">Share</span>
        </button>

        {/* Save */}
        <button onClick={onSave} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: saved ? 'rgba(119,255,200,0.2)' : 'rgba(13,21,23,0.6)', backdropFilter: 'blur(8px)' }}>
            <Bookmark className="w-6 h-6" style={{ color: saved ? '#77ffc8' : 'white' }} fill={saved ? '#77ffc8' : 'none'} />
          </div>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-8">
        {/* Truck header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: '#77ffc8' }}>
            <img src={clip.truck_image || clip.image_url} alt={clip.truck_name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <p className="font-heading font-bold text-white text-sm">{clip.truck_name}</p>
            {clip.is_live && <p className="text-[10px] font-bold" style={{ color: '#77ffc8' }}>● LIVE</p>}
          </div>
          {/* Follow button — bottom row */}
          <button
            onClick={toggleFollow}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all"
            style={isFollowing
              ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.4)' }
              : { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }
            }
          >
            {isFollowing ? <><UserCheck className="w-3 h-3" /> Following</> : <><UserPlus className="w-3 h-3" /> Follow</>}
          </button>
        </div>

        <h2 className="font-heading font-black text-2xl text-white mb-1 leading-tight">{clip.title}</h2>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-bold" style={{ color: '#bacbc0' }}>NOW COOKING:</span>
          <span className="text-[10px] font-bold" style={{ color: '#fd591e' }}>HOT NOW</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#192123' }}>
            <div className="h-full rounded-full" style={{ width: '85%', background: 'linear-gradient(90deg,#77ffc8,#00e6a7)', boxShadow: '0 0 6px rgba(119,255,200,0.5)' }} />
          </div>
          <span className="text-[10px] font-bold" style={{ color: '#77ffc8' }}>85%</span>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {['Looks tasty! 🔥', "Chef's kiss! 🤌", 'Extra spicy!'].map(r => (
            <button key={r} className="px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
              style={{ background: 'rgba(13,21,23,0.7)', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)', backdropFilter: 'blur(8px)' }}>
              {r}
            </button>
          ))}
        </div>

        <Link to={`/truck/${clip.truck_id}`}>
          <button className="w-full py-4 rounded-full font-heading font-black text-base flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 24px rgba(119,255,200,0.4)' }}>
            <ShoppingBag className="w-5 h-5" />
            ORDER FROM THIS TRUCK
          </button>
        </Link>
        <p className="text-center text-xs mt-2" style={{ color: '#bacbc0' }}>Arrives in ~15 mins • Houston, TX</p>
      </div>
    </div>
  );
}

export default function LiveFeed() {
  const qc = useQueryClient();
  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});

  const { data: clips = [] } = useQuery({
    queryKey: ['clips'],
    queryFn: () => base44.entities.LiveClip.list('-created_date', 20),
  });

  const likeClip = useMutation({
    mutationFn: (clip) => base44.entities.LiveClip.update(clip.id, { likes: (clip.likes || 0) + 1 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clips'] }),
  });

  if (clips.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#0d1517' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-scroll snap-y-mandatory no-scrollbar" style={{ background: '#0d1517' }}>
      {/* Close */}
      <Link to="/" className="fixed top-[max(1rem,env(safe-area-inset-top))] left-4 z-50 w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(13,21,23,0.7)', backdropFilter: 'blur(10px)' }}>
        <X className="w-5 h-5 text-white" />
      </Link>

      {clips.map((clip) => (
        <ClipCard
          key={clip.id}
          clip={clip}
          liked={!!liked[clip.id]}
          saved={!!saved[clip.id]}
          onLike={() => {
            if (!liked[clip.id]) {
              setLiked(p => ({ ...p, [clip.id]: true }));
              likeClip.mutate(clip);
            }
          }}
          onSave={() => setSaved(p => ({ ...p, [clip.id]: !p[clip.id] }))}
        />
      ))}
    </div>
  );
}