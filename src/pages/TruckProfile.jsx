import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Share2, Star, Clock, Plus, Play, UserPlus, UserCheck } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';


const TABS = ['Menu', 'Specials', 'Clips'];

export default function TruckProfile() {
  const { id } = useParams();
  const [tab, setTab] = useState('Menu');
  const [menuFilter, setMenuFilter] = useState('all');

  const { data: truck } = useQuery({
    queryKey: ['truck', id],
    queryFn: () => base44.entities.FoodTruck.get(id),
  });

  const { isFollowing, toggle: toggleFollow, isPending } = useFollow(id, truck?.name);

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu', id],
    queryFn: () => base44.entities.MenuItem.filter({ truck_id: id }),
  });

  const { data: clips = [] } = useQuery({
    queryKey: ['clips', id],
    queryFn: () => base44.entities.LiveClip.filter({ truck_id: id }),
  });

  const specials = menuItems.filter(i => i.is_special);
  const categories = [...new Set(menuItems.map(i => i.category))];
  const filteredMenu = menuFilter === 'all' ? menuItems : menuItems.filter(i => i.category === menuFilter);

  if (!truck) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1517' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0d1517' }}>
      {/* Hero */}
      <div className="relative h-64">
        <img
          src={truck.cover_image_url || truck.image_url}
          alt={truck.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1517] via-[#0d1517]/30 to-transparent" />

        {/* Nav */}
        <div className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 right-4 flex items-center justify-between">
          <Link
            to="/"
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(13,21,23,0.7)', backdropFilter: 'blur(10px)' }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex gap-2">
            <button
              onClick={toggleFollow}
              disabled={isPending}
              className="flex items-center gap-1.5 py-2 px-4 rounded-full text-xs font-bold transition-all"
              style={isFollowing
                ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.4)' }
                : { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }
              }
            >
              {isFollowing ? <><UserCheck className="w-3 h-3" /> Following</> : <><UserPlus className="w-3 h-3" /> Follow</>}
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/truck/${id}`;
                if (navigator.share) navigator.share({ title: truck?.name, url });
                else navigator.clipboard?.writeText(url);
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(13,21,23,0.7)', backdropFilter: 'blur(10px)' }}
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Top badge */}
        {truck.is_live && (
          <div className="absolute top-[max(4rem,calc(env(safe-area-inset-top)+3rem))] left-4">
            <span
              className="text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5"
              style={{ background: 'rgba(253,89,30,0.9)', color: 'white' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              HOT & FRESH
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-5 -mt-6 relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-black text-2xl leading-tight" style={{ color: '#dff0e8' }}>{truck.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: '#bacbc0' }}>
              {truck.cuisine_type?.replace('_', ' ')} • 0.8 miles away
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>
              {truck.rating?.toFixed(1) || '4.9'}
            </span>
            <span className="text-xs" style={{ color: '#bacbc0' }}>({truck.review_count || 500}+)</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" style={{ color: '#bacbc0' }} />
            <span className="text-xs font-bold" style={{ color: '#dff0e8' }}>WAIT TIME</span>
            <span className="text-xs" style={{ color: '#bacbc0' }}>12 min</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold" style={{ color: '#dff0e8' }}>SPICE</span>
            <span className="text-xs" style={{ color: '#bacbc0' }}>High</span>
          </div>
          <span
            className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={truck.status === 'open'
              ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.3)' }
              : { background: '#2e3638', color: '#bacbc0' }
            }
          >
            {truck.status === 'open' ? 'Open' : 'Closed'}
          </span>
        </div>

        <p className="text-sm mb-5 leading-relaxed" style={{ color: '#bacbc0' }}>{truck.description}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mb-4">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-full text-sm font-bold transition-all"
            style={tab === t
              ? { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 12px rgba(119,255,200,0.25)' }
              : { background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.3)' }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-5 pb-32">
        {tab === 'Menu' && (
          <>
            {/* Category filter */}
            <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
              {['all', ...categories].map(c => (
                <button
                  key={c}
                  onClick={() => setMenuFilter(c)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all"
                  style={menuFilter === c
                    ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.35)' }
                    : { background: '#192123', color: '#bacbc0' }
                  }
                >
                  {c === 'all' ? 'All Eats' : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>

            {/* Signature Hits label */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>Signature Hits</h3>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(253,89,30,0.15)', color: '#fd591e' }}
              >
                TRENDING
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {filteredMenu.map(item => (
                <Link
                  key={item.id}
                  to={`/truck/${id}/item/${item.id}`}
                  className="flex items-center gap-3 p-3 rounded-2xl group"
                  style={{ background: '#192123' }}
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-bold text-sm truncate" style={{ color: '#dff0e8' }}>{item.name}</p>
                      {item.is_special && (
                        <span
                          className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: '#fd591e', color: 'white' }}
                        >
                          HOT
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#bacbc0' }}>{item.description}</p>
                    <p className="font-heading font-bold text-sm mt-1" style={{ color: '#77ffc8' }}>
                      ${item.price?.toFixed(2)}
                    </p>
                  </div>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}
                  >
                    <Plus className="w-4 h-4" style={{ color: '#003826' }} />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {tab === 'Specials' && (
          <div className="flex flex-col gap-3">
            {specials.length === 0 ? (
              <p className="text-center py-12 text-sm" style={{ color: '#bacbc0' }}>No specials right now</p>
            ) : specials.map(item => (
              <Link key={item.id} to={`/truck/${id}/item/${item.id}`} className="block">
                <div className="relative h-40 rounded-3xl overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: '#fd591e', color: 'white' }}>
                      HOT DEAL
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="font-heading font-black text-white text-lg leading-tight">{item.name}</p>
                      <p className="text-white/60 text-xs">{item.description?.slice(0, 40)}...</p>
                    </div>
                    <p className="font-heading font-black text-xl" style={{ color: '#77ffc8' }}>${item.price?.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === 'Clips' && (
          <div className="grid grid-cols-2 gap-3">
            {clips.length === 0 ? (
              <p className="col-span-2 text-center py-12 text-sm" style={{ color: '#bacbc0' }}>No clips yet</p>
            ) : clips.map(clip => (
              <Link key={clip.id} to="/live" className="relative h-40 rounded-2xl overflow-hidden block">
                <img src={clip.image_url} alt={clip.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(119,255,200,0.2)', backdropFilter: 'blur(4px)' }}>
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-bold truncate">{clip.title}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}