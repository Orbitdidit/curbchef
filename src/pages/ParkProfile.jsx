import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Truck, Star, ExternalLink, Instagram, Phone, Clock, Wifi, Music, Dog, Baby, Wine, Umbrella } from 'lucide-react';

const AMENITY_ICONS = {
  'live music': '🎵',
  'dog friendly': '🐕',
  'family friendly': '👨‍👩‍👧',
  'alcohol': '🍺',
  'covered seating': '⛱️',
  'wifi': '📶',
  'restrooms': '🚻',
};

function HeroCarousel({ media, parkName }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!media?.length) return;
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % media.length), 4000);
    return () => clearInterval(timerRef.current);
  }, [media?.length]);

  const current = media?.[idx];
  const src = current?.url || 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=900';

  return (
    <div className="relative w-full" style={{ height: '55vw', maxHeight: '320px', minHeight: '200px' }}>
      <img src={src} alt={parkName} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.3) 0%,transparent 40%,rgba(0,0,0,0.7) 100%)' }} />
      {media?.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {media.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className="rounded-full transition-all"
              style={{ width: i === idx ? 16 : 5, height: 5, background: i === idx ? '#00F5D4' : 'rgba(255,255,255,0.4)' }} />
          ))}
        </div>
      )}
    </div>
  );
}

function TruckRow({ truck }) {
  const statusColor = truck.status === 'open' ? '#00F5D4' : '#6B665C';
  const statusBg = truck.status === 'open' ? 'rgba(0,245,212,0.1)' : 'rgba(107,102,92,0.1)';
  return (
    <Link to={`/truck/${truck.id}`} className="flex items-center gap-3 p-3 rounded-2xl"
      style={{ background: '#1a2123', border: '1px solid rgba(59,74,66,0.2)' }}>
      <img src={truck.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=200'}
        alt={truck.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-sm truncate" style={{ color: '#dff0e8' }}>{truck.name}</p>
        <p className="text-xs capitalize mt-0.5" style={{ color: '#bacbc0' }}>{truck.cuisine_type?.replace(/_/g, ' ')}</p>
        {truck.truck_park_member_status && (
          <span className="text-[10px] font-semibold capitalize" style={{ color: '#A39E94' }}>
            {truck.truck_park_member_status} member
          </span>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5">
        {truck.is_live && (
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,59,48,0.2)', color: '#FF3B30' }}>LIVE</span>
        )}
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
          style={{ background: statusBg, color: statusColor }}>
          {truck.status?.toUpperCase()}
        </span>
      </div>
    </Link>
  );
}

export default function ParkProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('trucks');

  const { data: parks = [] } = useQuery({
    queryKey: ['park-by-slug', slug],
    queryFn: () => base44.entities.TruckPark.filter({ slug }),
  });
  const park = parks[0];

  const { data: trucks = [] } = useQuery({
    queryKey: ['park-trucks', park?.id],
    queryFn: () => base44.entities.FoodTruck.filter({ truck_park_id: park.id, is_approved: true }),
    enabled: !!park?.id,
  });

  const { data: liveClips = [] } = useQuery({
    queryKey: ['park-live-clips', park?.id],
    queryFn: async () => {
      if (!trucks.length) return [];
      const truckIds = trucks.map(t => t.id);
      const all = await base44.entities.LiveClip.list('-created_date', 50);
      return all.filter(c => truckIds.includes(c.truck_id) && c.is_live);
    },
    enabled: !!park?.id && trucks.length > 0,
  });

  const liveTrucks = trucks.filter(t => t.is_live);

  if (!park) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00F5D4 transparent transparent transparent' }} />
      </div>
    );
  }

  const galleryMedia = park.gallery_media?.length
    ? park.gallery_media
    : park.hero_image_url ? [{ type: 'image', url: park.hero_image_url }] : [];

  const TABS = [
    { id: 'trucks', label: `Trucks (${trucks.length})` },
    { id: 'live', label: `Live Now (${liveTrucks.length})` },
    { id: 'photos', label: 'Photos' },
    { id: 'info', label: 'Info' },
  ];

  return (
    <div className="min-h-screen pb-28" style={{ background: '#0A0A0A' }}>
      {/* Back button overlaid on hero */}
      <div className="relative">
        <HeroCarousel media={galleryMedia} parkName={park.name} />
        <button onClick={() => navigate(-1)}
          className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Park Identity */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="font-heading font-black text-2xl leading-tight" style={{ color: '#F5F0E8' }}>{park.name}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#A39E94' }} />
              <span className="text-sm" style={{ color: '#A39E94' }}>{park.address}</span>
            </div>
          </div>
          {park.avg_rating && (
            <div className="flex items-center gap-1 flex-shrink-0 mt-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-heading font-black text-base" style={{ color: '#F5F0E8' }}>{park.avg_rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Live trucks indicator */}
        {liveTrucks.length > 0 && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)' }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0 live-dot" style={{ background: '#FF3B30' }} />
            <span className="text-sm font-bold" style={{ color: '#FF3B30' }}>
              {liveTrucks.length} truck{liveTrucks.length > 1 ? 's' : ''} live right now
            </span>
          </div>
        )}

        {park.description && (
          <p className="text-sm mt-3 leading-relaxed" style={{ color: '#A39E94' }}>{park.description}</p>
        )}
      </div>

      {/* Quick stats strip */}
      <div className="flex gap-3 px-4 mb-4">
        <div className="flex-1 py-2.5 rounded-xl text-center" style={{ background: '#141414' }}>
          <p className="font-heading font-black text-lg" style={{ color: '#00F5D4' }}>{trucks.length}</p>
          <p className="text-[10px] font-bold" style={{ color: '#6B665C' }}>TRUCKS</p>
        </div>
        <div className="flex-1 py-2.5 rounded-xl text-center" style={{ background: '#141414' }}>
          <p className="font-heading font-black text-lg" style={{ color: '#00F5D4' }}>
            {[...new Set(trucks.map(t => t.cuisine_type))].length}
          </p>
          <p className="text-[10px] font-bold" style={{ color: '#6B665C' }}>CUISINES</p>
        </div>
        <div className="flex-1 py-2.5 rounded-xl text-center" style={{ background: '#141414' }}>
          <p className="font-heading font-black text-lg" style={{ color: '#FF3B30' }}>{liveTrucks.length}</p>
          <p className="text-[10px] font-bold" style={{ color: '#6B665C' }}>LIVE NOW</p>
        </div>
      </div>

      {/* Amenity chips */}
      {park.amenities?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 mb-4">
          {park.amenities.map(a => (
            <span key={a} className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{ background: '#141414', color: '#A39E94', border: '1px solid rgba(255,255,255,0.06)' }}>
              {AMENITY_ICONS[a.toLowerCase()] || '✓'} {a}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 px-4 mb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="pb-3 px-3 text-xs font-bold transition-colors relative"
            style={{ color: tab === t.id ? '#00F5D4' : '#6B665C' }}>
            {t.label}
            {tab === t.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: '#00F5D4' }} />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-4">
        {tab === 'trucks' && (
          <div className="flex flex-col gap-2.5">
            {trucks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">🚚</p>
                <p className="font-heading font-bold" style={{ color: '#dff0e8' }}>No trucks listed yet</p>
              </div>
            ) : trucks.map(t => <TruckRow key={t.id} truck={t} />)}
          </div>
        )}

        {tab === 'live' && (
          <div className="flex flex-col gap-2.5">
            {liveTrucks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">📡</p>
                <p className="font-heading font-bold" style={{ color: '#dff0e8' }}>No trucks live right now</p>
                <p className="text-sm mt-1" style={{ color: '#A39E94' }}>Check back soon — things heat up fast.</p>
              </div>
            ) : liveTrucks.map(t => <TruckRow key={t.id} truck={t} />)}
          </div>
        )}

        {tab === 'photos' && (
          <div className="grid grid-cols-2 gap-2">
            {galleryMedia.map((m, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ aspectRatio: '1' }}>
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {galleryMedia.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <p className="text-3xl mb-2">📸</p>
                <p className="font-heading font-bold" style={{ color: '#dff0e8' }}>No photos yet</p>
              </div>
            )}
          </div>
        )}

        {tab === 'info' && (
          <div className="flex flex-col gap-4">
            {park.operating_hours && Object.keys(park.operating_hours).length > 0 && (
              <div className="p-4 rounded-2xl" style={{ background: '#141414' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4" style={{ color: '#00F5D4' }} />
                  <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>Hours</p>
                </div>
                {Object.entries(park.operating_hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between py-1.5"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-sm font-semibold capitalize" style={{ color: '#A39E94' }}>{day}</span>
                    <span className="text-sm font-semibold" style={{ color: '#dff0e8' }}>{hours}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 rounded-2xl flex flex-col gap-3" style={{ background: '#141414' }}>
              <p className="font-heading font-bold text-sm mb-1" style={{ color: '#dff0e8' }}>Contact & Directions</p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(park.address)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,245,212,0.1)' }}>
                  <MapPin className="w-4 h-4" style={{ color: '#00F5D4' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#dff0e8' }}>Get Directions</p>
                  <p className="text-xs" style={{ color: '#A39E94' }}>{park.address}</p>
                </div>
              </a>
              {park.phone && (
                <a href={`tel:${park.phone}`} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,245,212,0.1)' }}>
                    <Phone className="w-4 h-4" style={{ color: '#00F5D4' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#dff0e8' }}>{park.phone}</p>
                </a>
              )}
              {park.website && (
                <a href={park.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,245,212,0.1)' }}>
                    <ExternalLink className="w-4 h-4" style={{ color: '#00F5D4' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#dff0e8' }}>Website</p>
                </a>
              )}
              {park.instagram && (
                <a href={`https://instagram.com/${park.instagram.replace('@','')}`}
                  target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,245,212,0.1)' }}>
                    <Instagram className="w-4 h-4" style={{ color: '#00F5D4' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#dff0e8' }}>{park.instagram}</p>
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 z-50"
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Link
          to={`/explore?park=${park.id}`}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-heading font-black text-base"
          style={{ background: 'linear-gradient(135deg,#00F5D4,#00e6a7)', color: '#0A0A0A', boxShadow: '0 0 24px rgba(0,245,212,0.3)' }}>
          <Truck className="w-5 h-5" />
          Order from a Truck Here
        </Link>
      </div>
    </div>
  );
}