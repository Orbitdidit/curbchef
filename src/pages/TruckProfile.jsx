import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Share2, Star, Clock, Plus, Play,
  UserPlus, UserCheck, Users, Flame, MapPin,
  ShoppingBag, Heart, Zap, Radio
} from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';
import { addToCart } from '@/lib/cartStore';
import { useToast } from '@/components/ui/use-toast';

const TABS = ['Menu', 'Clips', 'About'];

export default function TruckProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState('Menu');
  const [menuFilter, setMenuFilter] = useState('all');
  const heroRef = useRef(null);

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

  const categories = [...new Set(menuItems.map(i => i.category))];
  const filteredMenu = menuFilter === 'all' ? menuItems : menuItems.filter(i => i.category === menuFilter);
  const specials = menuItems.filter(i => i.is_special);

  const handleAddToCart = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...item, item_id: item.id, quantity: 1 }, id, truck?.name);
    toast({ title: `${item.name} added`, description: `$${item.price?.toFixed(2)}`, duration: 1500 });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/truck/${id}`;
    if (navigator.share) navigator.share({ title: truck?.name, text: truck?.description, url });
    else navigator.clipboard?.writeText(url);
  };

  if (!truck) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1517' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
      </div>
    );
  }

  const isOpen = truck.status === 'open';

  return (
    <div className="min-h-screen pb-32" style={{ background: '#0d1517' }}>

      {/* ── CINEMATIC HERO ── */}
      <div ref={heroRef} className="relative h-[70vh] min-h-[480px] overflow-hidden">
        {/* Media — slow zoom via CSS animation */}
        <img
          src={truck.cover_image_url || truck.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=900'}
          alt={truck.name}
          loading="eager"
          className="w-full h-full object-cover"
          style={{ animation: 'heroZoom 14s ease-in-out infinite alternate' }}
        />

        {/* Deep cinematic gradient */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(13,21,23,0.25) 0%, rgba(13,21,23,0.1) 30%, rgba(13,21,23,0.65) 65%, rgba(13,21,23,0.98) 100%)' }} />
        {/* Side vignette */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(13,21,23,0.4) 100%)' }} />

        {/* Top nav bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(13,21,23,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(13,21,23,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Live badge */}
        {truck.is_live && (
          <div className="absolute top-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] left-4">
            <span className="flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,40,40,0.92)', color: 'white', backdropFilter: 'blur(8px)', boxShadow: '0 0 20px rgba(255,60,60,0.5)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE NOW
            </span>
          </div>
        )}

        {/* Hero bottom content */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
          {/* Cuisine tags */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full capitalize"
              style={{ background: 'rgba(119,255,200,0.15)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.25)' }}>
              {truck.cuisine_type?.replace('_', ' ')}
            </span>
            {truck.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-full capitalize"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Truck name */}
          <h1 className="font-heading font-black leading-none mb-2"
            style={{ color: '#ffffff', fontSize: 'clamp(2rem, 8vw, 3rem)', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            {truck.name}
          </h1>

          {/* Rating + distance + status row */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-sm text-white">{truck.rating?.toFixed(1) || '4.9'}</span>
              <span className="text-xs text-white/50">({truck.review_count || 500}+)</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" style={{ color: '#77ffc8' }} />
              <span className="text-xs text-white/70">0.8 mi away</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-white/50" />
              <span className="text-xs text-white/70">~12 min</span>
            </div>
            <span
              className="ml-auto text-[11px] font-black px-3 py-1 rounded-full"
              style={isOpen
                ? { background: 'rgba(119,255,200,0.18)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.4)', boxShadow: '0 0 12px rgba(119,255,200,0.2)' }
                : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }
              }
            >
              {isOpen ? '● Open Now' : '○ Closed'}
            </span>
          </div>

          {/* Follow + social proof row */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleFollow}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black transition-all"
              style={isFollowing
                ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.45)', backdropFilter: 'blur(8px)' }
                : { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 18px rgba(119,255,200,0.35)' }
              }
            >
              {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs text-white/50 font-semibold">
                {(truck.followers_count || 0).toLocaleString()} followers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SOCIAL PROOF STRIP ── */}
      <div className="px-5 py-4 flex gap-3 overflow-x-auto no-scrollbar"
        style={{ borderBottom: '1px solid rgba(59,74,66,0.18)' }}>
        {[
          { icon: Flame, label: `${truck.total_orders || '500'}+ orders`, color: '#fd591e' },
          { icon: Star, label: 'Top Rated', color: '#fbbf24' },
          { icon: Zap, label: isOpen ? 'Open Now' : 'Reopens 5pm', color: isOpen ? '#77ffc8' : '#bacbc0' },
          { icon: Radio, label: truck.is_live ? 'Live Stream' : 'Clips Available', color: truck.is_live ? '#ff3b30' : '#bacbc0' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full"
            style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
            <Icon className="w-3 h-3" style={{ color }} />
            <span className="text-[11px] font-bold" style={{ color: '#bacbc0' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div className="sticky top-0 z-20 px-5 py-3 flex gap-2"
        style={{ background: 'rgba(13,21,23,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.15)' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-full text-sm font-bold transition-all"
            style={tab === t
              ? { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 14px rgba(119,255,200,0.3)' }
              : { background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.3)' }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="px-5 pt-5">

        {/* ── MENU TAB ── */}
        {tab === 'Menu' && (
          <>
            {/* Category filter pills */}
            {categories.length > 0 && (
              <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
                {['all', ...categories].map(c => (
                  <button key={c} onClick={() => setMenuFilter(c)}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all capitalize"
                    style={menuFilter === c
                      ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.35)' }
                      : { background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.2)' }
                    }
                  >
                    {c === 'all' ? 'All Eats' : c}
                  </button>
                ))}
              </div>
            )}

            {/* Specials spotlight (horizontal scroll) */}
            {specials.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4" style={{ color: '#fd591e' }} />
                  <h3 className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>Chef's Specials</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full ml-auto"
                    style={{ background: 'rgba(253,89,30,0.15)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.25)' }}>
                    LIMITED
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {specials.map(item => (
                    <Link key={item.id} to={`/truck/${id}/item/${item.id}`}
                      className="relative w-44 flex-shrink-0 rounded-2xl overflow-hidden"
                      style={{ height: '160px' }}>
                      <img src={item.image_url} alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        style={{ transition: 'transform 0.4s ease' }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute top-2 left-2">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                          style={{ background: '#fd591e', color: 'white' }}>HOT</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="font-heading font-black text-white text-sm leading-tight truncate">{item.name}</p>
                        <p className="font-bold text-sm mt-0.5" style={{ color: '#77ffc8' }}>${item.price?.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(e, item)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(119,255,200,0.9)' }}>
                        <Plus className="w-3.5 h-3.5" style={{ color: '#003826' }} />
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Full menu list */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>Full Menu</h3>
              <span className="text-xs" style={{ color: '#bacbc0' }}>{filteredMenu.length} items</span>
            </div>

            <div className="flex flex-col gap-3">
              {filteredMenu.length === 0 ? (
                <p className="text-center py-12 text-sm" style={{ color: '#bacbc0' }}>No items in this category</p>
              ) : filteredMenu.map(item => (
                <Link key={item.id} to={`/truck/${id}/item/${item.id}`}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl group transition-all"
                  style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.15)' }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name}
                      loading="lazy"
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.35)' }} />
                  ) : (
                    <div className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl"
                      style={{ background: '#2e3638' }}>🍽️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-heading font-bold text-sm truncate" style={{ color: '#dff0e8' }}>{item.name}</p>
                      {item.is_special && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: '#fd591e', color: 'white' }}>HOT</span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-2 mb-1.5" style={{ color: '#bacbc0' }}>{item.description}</p>
                    <p className="font-heading font-black text-base" style={{ color: '#77ffc8' }}>
                      ${item.price?.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(e, item)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
                    style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', boxShadow: '0 0 12px rgba(119,255,200,0.25)' }}>
                    <Plus className="w-4 h-4" style={{ color: '#003826' }} />
                  </button>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ── CLIPS TAB ── */}
        {tab === 'Clips' && (
          <div>
            {clips.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🎬</div>
                <p className="font-heading font-bold text-base mb-1" style={{ color: '#dff0e8' }}>No clips yet</p>
                <p className="text-sm" style={{ color: '#bacbc0' }}>Check back when they go live</p>
              </div>
            ) : (
              <>
                {/* Live clip highlight */}
                {clips.filter(c => c.is_live).map(clip => (
                  <Link key={clip.id} to="/live" className="block mb-4">
                    <div className="relative rounded-3xl overflow-hidden" style={{ height: '220px' }}>
                      <img src={clip.image_url} alt={clip.title}
                        className="w-full h-full object-cover"
                        loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/20" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(255,40,40,0.9)', backdropFilter: 'blur(8px)' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span className="text-[11px] font-black text-white">LIVE NOW</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(119,255,200,0.2)', backdropFilter: 'blur(8px)', border: '2px solid rgba(119,255,200,0.4)' }}>
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="font-heading font-black text-white text-lg">{clip.title}</p>
                        <p className="text-white/60 text-xs mt-0.5">Now Cooking · Tap to watch</p>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Grid of clips */}
                <div className="grid grid-cols-2 gap-3">
                  {clips.filter(c => !c.is_live).map(clip => (
                    <Link key={clip.id} to="/live" className="relative rounded-2xl overflow-hidden block"
                      style={{ height: '150px' }}>
                      <img src={clip.image_url} alt={clip.title}
                        className="w-full h-full object-cover"
                        loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(13,21,23,0.6)', backdropFilter: 'blur(6px)' }}>
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-bold truncate leading-tight">{clip.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ABOUT TAB ── */}
        {tab === 'About' && (
          <div className="flex flex-col gap-5 pb-8">
            {/* Description */}
            <div className="p-5 rounded-3xl" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
              <h3 className="font-heading font-black text-base mb-3" style={{ color: '#dff0e8' }}>Our Story</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#bacbc0' }}>
                {truck.description || 'A Houston food truck bringing bold, authentic flavors straight to your curb. Every dish is made fresh, every day.'}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Orders', value: (truck.total_orders || 0).toLocaleString(), icon: ShoppingBag, color: '#77ffc8' },
                { label: 'Followers', value: (truck.followers_count || 0).toLocaleString(), icon: Heart, color: '#fd591e' },
                { label: 'Avg Rating', value: truck.rating?.toFixed(1) || '4.9', icon: Star, color: '#fbbf24' },
                { label: 'Menu Items', value: menuItems.length, icon: Flame, color: '#fd591e' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="p-4 rounded-2xl text-center" style={{ background: '#192123' }}>
                  <Icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
                  <p className="font-heading font-black text-xl" style={{ color: '#dff0e8' }}>{value}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Hours + location */}
            <div className="p-5 rounded-3xl" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
              <h3 className="font-heading font-black text-sm mb-3" style={{ color: '#dff0e8' }}>Location & Hours</h3>
              {truck.address && (
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#77ffc8' }} />
                  <p className="text-sm" style={{ color: '#bacbc0' }}>{truck.address}, {truck.city || 'Houston'}</p>
                </div>
              )}
              {truck.operating_hours && (
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#77ffc8' }} />
                  <p className="text-sm" style={{ color: '#bacbc0' }}>{truck.operating_hours}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── STICKY ORDER CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-5 pb-6 pt-3"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(13,21,23,0.98) 40%)' }}>
        <Link to={`/cart`} className="w-full max-w-lg">
          <button
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-full font-heading font-black text-base transition-all active:scale-95"
            style={{
              background: isOpen
                ? 'linear-gradient(135deg,#77ffc8 0%,#00e6a7 100%)'
                : '#2e3638',
              color: isOpen ? '#003826' : '#bacbc0',
              boxShadow: isOpen ? '0 0 28px rgba(119,255,200,0.4), 0 8px 32px rgba(0,0,0,0.4)' : 'none',
            }}>
            <ShoppingBag className="w-5 h-5" />
            {isOpen ? 'Order From This Truck' : 'Truck is Closed'}
          </button>
        </Link>
      </div>

      <style>{`
        @keyframes heroZoom {
          from { transform: scale(1); }
          to   { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}