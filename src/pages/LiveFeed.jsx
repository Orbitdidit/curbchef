import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, Bookmark, Share2, ShoppingBag, Radio, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveFeed() {
  const { data: clips = [] } = useQuery({
    queryKey: ['live-clips'],
    queryFn: () => base44.entities.LiveClip.list('-created_date', 20),
  });

  const [likedClips, setLikedClips] = useState(new Set());
  const [savedClips, setSavedClips] = useState(new Set());

  const toggleLike = (id) => {
    setLikedClips(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSave = (id) => {
    setSavedClips(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="h-screen overflow-y-auto snap-y-mandatory no-scrollbar bg-black">
      {/* Back button */}
      <Link to="/" className="fixed top-[max(1rem,env(safe-area-inset-top))] left-4 z-50 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center">
        <ChevronLeft className="w-5 h-5 text-white" />
      </Link>

      {clips.length === 0 ? (
        <div className="h-screen flex items-center justify-center text-muted-foreground">
          <p>No clips yet. Check back soon!</p>
        </div>
      ) : (
        clips.map((clip) => (
          <div key={clip.id} className="h-screen snap-start relative">
            <img
              src={clip.image_url}
              alt={clip.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

            {/* Live badge */}
            {clip.is_live && (
              <div className="absolute top-[max(1.5rem,env(safe-area-inset-top))] right-4 flex items-center gap-1.5 bg-accent px-3 py-1 rounded-full">
                <Radio className="w-3 h-3 text-white" />
                <span className="text-xs font-bold text-white">LIVE</span>
              </div>
            )}

            {/* Right sidebar actions */}
            <div className="absolute right-4 bottom-32 flex flex-col items-center gap-5">
              <button onClick={() => toggleLike(clip.id)} className="flex flex-col items-center gap-1">
                <Heart className={`w-7 h-7 ${likedClips.has(clip.id) ? 'fill-accent text-accent' : 'text-white'}`} />
                <span className="text-white text-[10px] font-medium">{(clip.likes || 0) + (likedClips.has(clip.id) ? 1 : 0)}</span>
              </button>
              <button onClick={() => toggleSave(clip.id)} className="flex flex-col items-center gap-1">
                <Bookmark className={`w-7 h-7 ${savedClips.has(clip.id) ? 'fill-primary text-primary' : 'text-white'}`} />
                <span className="text-white text-[10px] font-medium">{clip.saves || 0}</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <Share2 className="w-6 h-6 text-white" />
                <span className="text-white text-[10px] font-medium">Share</span>
              </button>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-20 left-4 right-20">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
                  <img src={clip.truck_image} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-white font-heading font-bold text-sm">{clip.truck_name}</p>
                  <p className="text-white/60 text-xs">Cooking now</p>
                </div>
              </div>
              <p className="text-white text-sm font-medium mb-3">{clip.title}</p>
              <Link
                to={`/truck/${clip.truck_id}`}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-2xl font-semibold text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Order from this truck
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}