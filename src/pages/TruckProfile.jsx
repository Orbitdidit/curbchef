import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCloseCountdown } from '@/hooks/useCloseCountdown';
import ReliabilityBadge from '@/components/shared/ReliabilityBadge';
import {
  ChevronLeft, Share2, Star, Clock, Plus, Minus, Play,
  UserPlus, UserCheck, MapPin, ShoppingBag, Flame, Radio, Zap
} from 'lucide-react';
import DeliveryBadge from '@/components/truck/DeliveryBadge';
import CoverMediaCarousel from '@/components/truck/CoverMediaCarousel';
import { getCart, addToCart, updateQuantity, subscribe as subscribeCart } from '@/lib/cartStore';
import { useFollow } from '@/hooks/useFollow';
import { useToast } from '@/components/ui/use-toast';
import { useUserLocation, distanceMiles } from '@/lib/geoUtils';

const TABS = ['Menu', 'Specials', 'Clips'];

export default function TruckProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState('Menu');
  const [menuFilter, setMenuFilter] = useState('all');
  const [cartState, setCartState] = useState(() => getCart());

  useEffect(() => {
    const unsub = subscribeCart(c => setCartState({ ...c }));
    return unsub;
  }, []);

  const getItemQty = (itemId) => cartState.items.find(i => i.item_id === itemId)?.quantity || 0;
  const totalCartCount = cartState.items.reduce((s, i) => s + i.quantity, 0);

  const { data: truck } = useQuery({
    queryKey: ['truck', id],
    queryFn: () => base44.entities.FoodTruck.get(id),
  });

  const { isFollowing, toggle: toggleFollow, isPending } = useFollow(id, truck?.name);
  const { lat: userLat, lng: userLng } = useUserLocation();
  const realDist = userLat && truck?.latitude
    ? distanceMiles(userLat, userLng, truck.latitude, truck.longitude)
    : null;

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu', id],
    queryFn: () => base44.entities.MenuItem.filter({ truck_id: id }),
  });

  const { data: clips = [] } = useQuery({
    queryKey: ['clips', id],
    queryFn: () => base44.entities.LiveClip.filter({ truck_id: id }),
  });

  // Must be called unconditionally before any early return
  const { label: closeLabel, variant: closeVariant } = useCloseCountdown(truck);

  const categories = [...new Set(menuItems.map(i => i.category))];
  const filteredMenu = menuFilter === 'all' ? menuItems : menuItems.filter(i => i.category === menuFilter);
  const specials = menuItems.filter(i => i.is_special);

  const handleAddToCart = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    if (truck?.is_sample) {
      toast({
        title: '🚫 This is a demo truck!',
        description: 'Sign up your real food truck to start receiving orders.',
        duration: 4000,
        action: (
          <a href="/onboard-truck" className="text-xs font-black underline" style={{ color: '#00F5D4' }}>
            Onboard My Truck →
          </a>
        ),
      });
      return;
    }
    addToCart({ ...item, item_id: item.id, quantity: 1 }, id, truck?.name);
    toast({ title: `${item.name} added`, description: `$${item.price?.toFixed(2)}`, duration: 1500 });
  };

  const handleDecrement = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const qty = getItemQty(item.id);
    updateQuantity(item.id, qty - 1);
  };

  // Reusable inline qty counter rendered on menu rows
  const QtyControl = ({ item }) => {
    const qty = getItemQty(item.id);
    if (qty === 0) {
      return (
        <button onClick={(e) => handleAddToCart(e, item)}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', boxShadow: '0 0 10px rgba(119,255,200,0.2)' }}>
          <Plus className="w-4 h-4" style={{ color: '#003826' }} />
        </button>
      );
    }
    return (
      <div className="flex items-center gap-2 flex-shrink-0" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
        <button onClick={(e) => handleDecrement(e, item)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: '#2e3638' }}>
          <Minus className="w-3.5 h-3.5" style={{ color: '#dff0e8' }} />
        </button>
        <span className="font-heading font-black text-sm w-4 text-center" style={{ color: '#77ffc8' }}>{qty}</span>
        <button onClick={(e) => handleAddToCart(e, item)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}>
          <Plus className="w-3.5 h-3.5" style={{ color: '#003826' }} />
        </button>
      </div>
    );
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

  // Group menu items by category for section display
  const menuByCategory = categories.reduce((acc, cat) => {
    const items = menuItems.filter(i => i.category === cat);
    if (items.length) acc.push({ cat, items });
    return acc;
  }, []);

  const categoryLabel = (cat) => {
    const labels = { mains: 'Signature Hits', sides: 'Sides & Extras', drinks: 'Liquid Neon', desserts: 'Sweet Finish', specials: 'Chef Specials' };
    return labels[cat] || cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen pb-32" style={{ background: '#0d1517' }}>

      {/* ── HERO CAROUSEL ── */}
      <div className="relative">
        <CoverMediaCarousel
          media={truck.cover_media || []}
          fallbackUrl={truck.cover_image_url || truck.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=900'}
        />

        {/* Nav buttons overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] z-10">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(13,21,23,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button onClick={handleShare}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(13,21,23,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* DEMO TRUCK banner */}
        {truck.is_sample && (
          <div className="absolute top-16 left-0 right-0 z-10 mx-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
              style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.4)', backdropFilter: 'blur(10px)' }}>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: 'rgba(251,191,36,0.25)', color: '#fbbf24' }}>DEMO TRUCK</span>
              <p className="text-xs" style={{ color: '#fbbf24' }}>
                This is an example truck showing what your CurbChef page can look like. <a href="/onboard-truck" className="underline font-bold">Create your own!</a>
              </p>
            </div>
          </div>
        )}

        {/* HOT & FRESH / LIVE badge */}
        <div className="absolute bottom-10 left-4 z-10">
          {truck.is_live ? (
            <span className="flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,40,40,0.92)', color: 'white', backdropFilter: 'blur(8px)', boxShadow: '0 0 16px rgba(255,60,60,0.5)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white live-dot" /> LIVE NOW
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(253,89,30,0.85)', color: 'white', backdropFilter: 'blur(8px)' }}>
              🔥 HOT &amp; FRESH
            </span>
          )}
        </div>
      </div>

      {/* ── INFO CARD ── */}
      <div className="mx-4 -mt-4 relative z-10 rounded-3xl p-5 mb-1"
        style={{ background: '#151d1f', border: '1px solid rgba(59,74,66,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>

        {/* Name + Follow */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="font-heading font-black leading-none" style={{ color: '#dff0e8', fontSize: 'clamp(1.6rem,7vw,2.4rem)' }}>
            {truck.name}
          </h1>
          <button
            onClick={toggleFollow}
            disabled={isPending}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-black transition-all"
            style={isFollowing
              ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.4)' }
              : { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 16px rgba(119,255,200,0.3)' }
            }>
            {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Reliability badge */}
        {truck.reliability_score != null && (
          <div className="mb-2">
            <ReliabilityBadge score={truck.reliability_score} size="md" />
          </div>
        )}

        {/* Rating + cuisine + distance */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-sm" style={{ color: '#dff0e8' }}>{truck.rating?.toFixed(1) || '4.9'}</span>
          </div>
          <span style={{ color: 'rgba(186,203,192,0.4)' }}>·</span>
          <span className="text-sm capitalize font-semibold" style={{ color: '#bacbc0' }}>
            {truck.cuisine_type?.replace('_', ' ')}
          </span>
          <span style={{ color: 'rgba(186,203,192,0.4)' }}>·</span>
          <span className="text-sm" style={{ color: '#bacbc0' }}>{realDist != null ? `${realDist.toFixed(1)} mi` : '—'}</span>
        </div>

        {/* Description */}
        {truck.description && (
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#bacbc0' }}>
            {truck.description}
          </p>
        )}

        {/* Delivery availability */}
        <div className="mb-4">
          <DeliveryBadge truck={truck} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl" style={{ background: '#0d1517' }}>
            <p className="text-[9px] font-bold tracking-widest mb-1" style={{ color: 'rgba(186,203,192,0.5)' }}>WAIT TIME</p>
            <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>~12 min</p>
          </div>
          <div className="flex flex-col items-center justify-center py-3 px-1 rounded-2xl col-span-1" style={{ background: '#0d1517' }}>
            <p className="text-[9px] font-bold tracking-widest mb-1" style={{ color: 'rgba(186,203,192,0.5)' }}>HOURS</p>
            <div className="flex items-center gap-1">
              {closeVariant === 'last_call' && (
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: '#ff3b30' }} />
              )}
              <p
                className="font-heading font-black text-[11px] text-center leading-tight"
                style={{
                  color: closeVariant === 'last_call' ? '#ff3b30'
                    : closeVariant === 'cutoff' ? '#bacbc0'
                    : closeVariant === 'soon' ? '#fd591e'
                    : closeVariant === 'closed' ? '#bacbc0'
                    : '#77ffc8'
                }}
              >
                {closeLabel || (isOpen ? 'Open' : 'Closed')}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl" style={{ background: '#0d1517' }}>
            <p className="text-[9px] font-bold tracking-widest mb-1" style={{ color: 'rgba(186,203,192,0.5)' }}>STATUS</p>
            {truck.is_sample ? (
              <span className="font-heading font-black text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' }}>
                DEMO
              </span>
            ) : (
              <p className="font-heading font-black text-sm" style={{ color: isOpen ? '#77ffc8' : '#bacbc0' }}>
                {isOpen ? 'Open' : 'Closed'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="sticky top-0 z-20 px-5 flex gap-6 pt-4 pb-0"
        style={{ background: 'rgba(13,21,23,0.97)', backdropFilter: 'blur(20px)' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="pb-3 text-sm font-black transition-all uppercase tracking-wider border-b-2"
            style={tab === t
              ? { color: '#77ffc8', borderColor: '#77ffc8' }
              : { color: '#bacbc0', borderColor: 'transparent' }
            }>
            {t}
          </button>
        ))}
      </div>
      <div className="h-px mx-5" style={{ background: 'rgba(59,74,66,0.2)' }} />

      {/* ── TAB CONTENT ── */}
      <div className="px-5 pt-5">

        {/* ── MENU TAB ── */}
        {tab === 'Menu' && (
          <>
            {/* Category filter pills */}
            {categories.length > 1 && (
              <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
                {['all', ...categories].map(c => (
                  <button key={c} onClick={() => setMenuFilter(c)}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all capitalize"
                    style={menuFilter === c
                      ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.35)' }
                      : { background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.2)' }
                    }>
                    {c === 'all' ? 'All' : c}
                  </button>
                ))}
              </div>
            )}

            {/* Menu grouped by category */}
            {menuFilter === 'all' && menuByCategory.length > 0 ? (
              <div className="flex flex-col gap-8">
                {menuByCategory.map(({ cat, items }) => (
                  <div key={cat}>
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>
                        {categoryLabel(cat)}
                      </h3>
                      {cat === 'mains' && (
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(253,89,30,0.15)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.3)' }}>
                          TRENDING
                        </span>
                      )}
                    </div>
                    {/* Drinks: 2-col grid cards */}
                    {cat === 'drinks' ? (
                      <div className="grid grid-cols-2 gap-3">
                        {items.map(item => (
                          <Link key={item.id} to={`/truck/${id}/item/${item.id}`}
                            className="p-4 rounded-2xl flex flex-col justify-between"
                            style={{ background: 'linear-gradient(135deg,rgba(119,255,200,0.07),rgba(119,255,200,0.03))', border: '1px solid rgba(119,255,200,0.12)' }}>
                            <div>
                              <p className="font-heading font-black text-sm mb-1" style={{ color: '#dff0e8' }}>{item.name}</p>
                              <p className="text-xs leading-snug" style={{ color: '#bacbc0' }}>{item.description}</p>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <p className="font-heading font-black text-base" style={{ color: '#77ffc8' }}>${item.price?.toFixed(2)}</p>
                              <QtyControl item={item} />
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {items.map(item => (
                          <Link key={item.id} to={`/truck/${id}/item/${item.id}`}
                            className="flex items-center gap-4 py-3 border-b"
                            style={{ borderColor: 'rgba(59,74,66,0.15)' }}>
                            {/* Food image */}
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name}
                                className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }} />
                            ) : (
                              <div className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl"
                                style={{ background: '#192123' }}>🍽️</div>
                            )}
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>{item.name}</p>
                                {item.is_special && (
                                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                                    style={{ background: '#fd591e', color: 'white' }}>HOT</span>
                                )}
                              </div>
                              <p className="text-xs leading-snug mb-2 line-clamp-2" style={{ color: '#bacbc0' }}>{item.description}</p>
                              <p className="font-heading font-black text-base" style={{ color: '#77ffc8' }}>${item.price?.toFixed(2)}</p>
                            </div>
                            <QtyControl item={item} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Filtered view */
              <div className="flex flex-col gap-3">
                {filteredMenu.length === 0 ? (
                  <p className="text-center py-12 text-sm" style={{ color: '#bacbc0' }}>No items in this category</p>
                ) : filteredMenu.map(item => (
                  <Link key={item.id} to={`/truck/${id}/item/${item.id}`}
                    className="flex items-center gap-4 py-3 border-b"
                    style={{ borderColor: 'rgba(59,74,66,0.15)' }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name}
                        className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl"
                        style={{ background: '#192123' }}>🍽️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-black text-sm mb-0.5" style={{ color: '#dff0e8' }}>{item.name}</p>
                      <p className="text-xs leading-snug mb-2 line-clamp-2" style={{ color: '#bacbc0' }}>{item.description}</p>
                      <p className="font-heading font-black text-base" style={{ color: '#77ffc8' }}>${item.price?.toFixed(2)}</p>
                    </div>
                    <QtyControl item={item} />
                  </Link>
                ))}
              </div>
            )}

            {menuItems.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🍽️</p>
                <p className="font-heading font-bold text-base mb-1" style={{ color: '#dff0e8' }}>Menu coming soon</p>
                <p className="text-sm" style={{ color: '#bacbc0' }}>Check back later</p>
              </div>
            )}
          </>
        )}

        {/* ── SPECIALS TAB ── */}
        {tab === 'Specials' && (
          <div>
            {specials.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🔥</p>
                <p className="font-heading font-bold text-base mb-1" style={{ color: '#dff0e8' }}>No specials right now</p>
                <p className="text-sm" style={{ color: '#bacbc0' }}>Check back soon</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4" style={{ color: '#fd591e' }} />
                  <h3 className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>Today's Specials</h3>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full ml-auto"
                    style={{ background: 'rgba(253,89,30,0.15)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.25)' }}>
                    LIMITED
                  </span>
                </div>
                {specials.map(item => (
                  <Link key={item.id} to={`/truck/${id}/item/${item.id}`}
                    className="flex items-center gap-4 py-3 border-b"
                    style={{ borderColor: 'rgba(59,74,66,0.15)' }}>
                    {item.image_url ? (
                      <div className="relative flex-shrink-0">
                        <img src={item.image_url} alt={item.name}
                          className="w-24 h-24 rounded-2xl object-cover"
                          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                          style={{ background: '#fd591e', color: 'white' }}>HOT</span>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-2xl flex-shrink-0 flex items-center justify-center text-4xl"
                        style={{ background: '#192123' }}>🔥</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-black text-sm mb-1" style={{ color: '#dff0e8' }}>{item.name}</p>
                      <p className="text-xs leading-snug mb-2 line-clamp-3" style={{ color: '#bacbc0' }}>{item.description}</p>
                      <p className="font-heading font-black text-lg" style={{ color: '#77ffc8' }}>${item.price?.toFixed(2)}</p>
                    </div>
                    <QtyControl item={item} />
                  </Link>
                ))}
              </div>
            )}
          </div>
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
                {clips.filter(c => c.is_live).map(clip => (
                  <Link key={clip.id} to="/live" className="block mb-4">
                    <div className="relative rounded-3xl overflow-hidden" style={{ height: '220px' }}>
                      <img src={clip.image_url} alt={clip.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/20" />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(255,40,40,0.9)' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white live-dot" />
                        <span className="text-[11px] font-black text-white">LIVE NOW</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(119,255,200,0.2)', border: '2px solid rgba(119,255,200,0.4)' }}>
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="font-heading font-black text-white text-lg">{clip.title}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  {clips.filter(c => !c.is_live).map(clip => (
                    <Link key={clip.id} to="/live" className="relative rounded-2xl overflow-hidden block"
                      style={{ height: '150px' }}>
                      <img src={clip.image_url} alt={clip.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(13,21,23,0.6)' }}>
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-bold truncate">{clip.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── STICKY ORDER CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-5 pb-6 pt-3"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(13,21,23,0.98) 40%)' }}>
        {truck.is_sample ? (
          <a href="/onboard-truck" className="w-full max-w-lg">
            <button className="w-full flex items-center justify-center gap-2.5 py-4 rounded-full font-heading font-black text-base transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#1a0f00', boxShadow: '0 0 24px rgba(251,191,36,0.4)' }}>
              <span>⭐</span>
              <span className="flex-1 text-center">Onboard My Truck →</span>
            </button>
          </a>
        ) : (
          <Link to="/cart" className="w-full max-w-lg">
            <button
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-full font-heading font-black text-base transition-all active:scale-95"
              style={{
                background: isOpen ? 'linear-gradient(135deg,#77ffc8 0%,#00e6a7 100%)' : '#2e3638',
                color: isOpen ? '#003826' : '#bacbc0',
                boxShadow: isOpen ? '0 0 28px rgba(119,255,200,0.4), 0 8px 32px rgba(0,0,0,0.4)' : 'none',
              }}>
              <ShoppingBag className="w-5 h-5" />
              <span className="flex-1 text-center">{isOpen ? 'Order From This Truck' : 'Truck is Closed'}</span>
              {isOpen && totalCartCount > 0 && (
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ background: 'rgba(0,56,38,0.35)' }}>
                  {totalCartCount}
                </span>
              )}
            </button>
          </Link>
        )}
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