import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, Bookmark, Share2, ShoppingBag, X, UserPlus, UserCheck, Volume2, VolumeX } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';
import { formatDistanceToNow } from 'date-fns';

// ── Time helper ───────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

// ── Per-clip card ─────────────────────────────────────────────────────────────
function ClipCard({ clip, isActive, liked, saved, onLike, onSave }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const { isFollowing, toggle: toggleFollow, isPending } = useFollow(clip.truck_id, clip.truck_name);

  // Auto-play / pause based on whether this card is visible
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [isActive]);

  const handleShare = () => {
    const url = `${window.location.origin}/truck/${clip.truck_id}`;
    if (navigator.share) {
      navigator.share({ title: clip.truck_name, text: clip.title, url });
    } else {
      navigator.clipboard?.writeText(url);
    }
  };

  const isLive = clip.is_live && (!clip.expires_at || new Date(clip.expires_at) > new Date());
  const mediaUrl = clip.video_url || null;
  const thumbUrl = clip.image_url || clip.poster_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800';

  return (
    <div className="relative flex-shrink-0" style={{ height: '100dvh', scrollSnapAlign: 'start' }}>
      {/* Background media */}
      {mediaUrl ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          poster={thumbUrl}
          className="absolute inset-0 w-full h-full object-cover"
          muted={muted}
          playsInline
          loop
          onClick={() => setMuted(m => !m)}
        />
      ) : (
        <img src={thumbUrl} alt={clip.title} className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(13,21,23,0.97) 0%, rgba(13,21,23,0.3) 50%, rgba(13,21,23,0.15) 100%)' }} />

      {/* ── Top badges ── */}
      <div className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 flex items-center gap-2">
        {isLive && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,59,48,0.9)', backdropFilter: 'blur(8px)' }}>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white text-[11px] font-black tracking-widest">LIVE</span>
          </div>
        )}
        {clip.vendor_caption && !isLive && (
          <div className="px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(13,21,23,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span className="text-white text-[11px] font-bold">🎬 CLIP</span>
          </div>
        )}
      </div>

      {/* Mute toggle (top right) */}
      {mediaUrl && (
        <button onClick={() => setMuted(m => !m)}
          className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          {muted
            ? <VolumeX className="w-5 h-5 text-white" />
            : <Volume2 className="w-5 h-5 text-white" />
          }
        </button>
      )}

      {/* ── Right action column ── */}
      <div className="absolute right-4 flex flex-col gap-6 items-center"
        style={{ bottom: 'calc(max(2rem, env(safe-area-inset-bottom)) + 160px)' }}>
        {/* Follow avatar */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2"
            style={{ borderColor: '#77ffc8', boxShadow: '0 0 12px rgba(119,255,200,0.4)' }}>
            <img src={clip.truck_image || thumbUrl} alt={clip.truck_name} className="w-full h-full object-cover" />
          </div>
          <button onClick={toggleFollow} disabled={isPending}
            className="w-7 h-7 rounded-full flex items-center justify-center -mt-2.5"
            style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', minWidth: 28, minHeight: 28 }}>
            <span className="text-[9px] font-black" style={{ color: '#003826' }}>{isFollowing ? '✓' : '+'}</span>
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

      {/* ── Bottom info ── */}
      <div className="absolute bottom-0 left-0 right-0 px-5"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        {/* Truck header row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: '#77ffc8' }}>
            <img src={clip.truck_image || thumbUrl} alt={clip.truck_name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-white text-sm truncate">{clip.truck_name}</p>
            <p className="text-[10px]" style={{ color: '#bacbc0' }}>
              {isLive ? <span style={{ color: '#77ffc8' }}>● Live now</span> : timeAgo(clip.created_date)}
            </p>
          </div>
          <button onClick={toggleFollow} disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
            style={isFollowing
              ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.4)' }
              : { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }
            }>
            {isFollowing ? <><UserCheck className="w-3 h-3" />Following</> : <><UserPlus className="w-3 h-3" />Follow</>}
          </button>
        </div>

        {/* Title / caption */}
        <h2 className="font-heading font-black text-2xl text-white mb-1 leading-tight">{clip.title}</h2>
        {clip.vendor_caption && clip.vendor_caption !== clip.title && (
          <p className="text-sm mb-3" style={{ color: '#bacbc0' }}>{clip.vendor_caption}</p>
        )}

        {/* Reaction chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {['Looks tasty! 🔥', "Chef's kiss! 🤌", 'Extra spicy!'].map(r => (
            <button key={r} className="px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
              style={{ background: 'rgba(13,21,23,0.7)', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)', backdropFilter: 'blur(8px)' }}>
              {r}
            </button>
          ))}
        </div>

        {/* CTA */}
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

// ── Main feed ─────────────────────────────────────────────────────────────────
export default function LiveFeed() {
  const qc = useQueryClient();
  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef(null);

  // fetch LiveClips (legacy image-based)
  const { data: imageClips = [] } = useQuery({
    queryKey: ['clips'],
    queryFn: () => base44.entities.LiveClip.list('-created_date', 20),
  });

  // fetch LiveClipVideos (video from Go Live feature)
  const { data: videoClips = [] } = useQuery({
    queryKey: ['live-clip-videos-feed'],
    queryFn: () => base44.entities.LiveClipVideo.filter({ is_active: true }, '-created_date', 30),
  });

  const now = new Date();

  // sort: live first, then by date
  const liveImageClips = imageClips.filter(c => c.is_live && (!c.expires_at || new Date(c.expires_at) > now));
  const otherImageClips = imageClips.filter(c => !c.is_live || (c.expires_at && new Date(c.expires_at) <= now));

  // merge video clips into clip format
  const videoAsFeed = videoClips.map(v => ({
    ...v,
    is_live: false,
    likes: 0,
    saves: 0,
    image_url: v.poster_url || '',
    truck_image: '',
  }));

  const allClips = [...liveImageClips, ...videoAsFeed, ...otherImageClips];

  const likeClip = useMutation({
    mutationFn: (clip) => base44.entities.LiveClip.update(clip.id, { likes: (clip.likes || 0) + 1 }),
    onMutate: async (clip) => {
      await qc.cancelQueries({ queryKey: ['clips'] });
      const previous = qc.getQueryData(['clips']);
      qc.setQueryData(['clips'], (old = []) =>
        old.map(c => c.id === clip.id ? { ...c, likes: (c.likes || 0) + 1 } : c)
      );
      return { previous };
    },
    onError: (_err, clip, ctx) => {
      if (ctx?.previous) qc.setQueryData(['clips'], ctx.previous);
      setLiked(p => { const n = { ...p }; delete n[clip.id]; return n; });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['clips'] }),
  });

  // Track which card is active via IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll('[data-clip-card]');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.clipIdx);
            setActiveIdx(idx);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );
    cards.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [allClips.length]);

  if (allClips.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#0d1517' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
      </div>
    );
  }

  return (
    <div ref={containerRef}
      className="h-screen overflow-y-scroll no-scrollbar"
      style={{ background: '#0d1517', scrollSnapType: 'y mandatory' }}>
      {/* Close */}
      <Link to="/" className="fixed top-[max(1rem,env(safe-area-inset-top))] left-4 z-50 w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(13,21,23,0.7)', backdropFilter: 'blur(10px)' }}>
        <X className="w-5 h-5 text-white" />
      </Link>

      {allClips.map((clip, idx) => (
        <div key={clip.id} data-clip-card data-clip-idx={idx}>
          <ClipCard
            clip={clip}
            isActive={idx === activeIdx}
            liked={!!liked[clip.id]}
            saved={!!saved[clip.id]}
            onLike={() => {
              if (!liked[clip.id] && imageClips.find(c => c.id === clip.id)) {
                setLiked(p => ({ ...p, [clip.id]: true }));
                likeClip.mutate(clip);
              }
            }}
            onSave={() => setSaved(p => ({ ...p, [clip.id]: !p[clip.id] }))}
          />
        </div>
      ))}
    </div>
  );
}