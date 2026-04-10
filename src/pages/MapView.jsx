import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Star, ChevronLeft, Navigation, Radio } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useUserLocation, distanceMiles, formatDist } from '@/lib/geoUtils';

// Suppress default icon
delete L.Icon.Default.prototype._getIconUrl;

function makeTruckIcon(isLive, isSelected) {
  const bg = isLive ? '#ff3b30' : isSelected ? '#77ffc8' : '#192123';
  const border = isLive ? '#ff6b60' : isSelected ? '#00e6a7' : '#3b4a42';
  const shadow = isLive
    ? '0 0 16px rgba(255,59,48,0.7)'
    : isSelected
    ? '0 0 16px rgba(119,255,200,0.6)'
    : '0 4px 12px rgba(0,0,0,0.5)';
  const size = isSelected ? 44 : 36;
  return new L.DivIcon({
    html: `<div style="
      background:${bg};
      width:${size}px;height:${size}px;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:${isSelected ? 20 : 16}px;
      box-shadow:${shadow};
      border:2px solid ${border};
      transition:all 0.2s ease;
    ">🚚</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Recenter button — uses map context
function RecenterButton({ userLat, userLng }) {
  const map = useMap();
  if (!userLat || !userLng) return null;
  return (
    <button
      onClick={() => map.setView([userLat, userLng], 14)}
      className="absolute bottom-36 right-4 z-[1000] w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl"
      style={{ background: 'rgba(13,21,23,0.92)', border: '1px solid rgba(119,255,200,0.3)', backdropFilter: 'blur(12px)' }}
    >
      <Navigation className="w-5 h-5" style={{ color: '#77ffc8' }} />
    </button>
  );
}

const FILTERS = ['All', 'Live', 'Open Now', 'Tacos', 'BBQ', 'Near Me'];

export default function MapView() {
  const { data: trucks = [] } = useQuery({
    queryKey: ['trucks'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }),
  });

  const { lat: userLat, lng: userLng } = useUserLocation();
  const [selected, setSelected] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef(null);
  const mapRef = useRef(null);
  const houstonCenter = [29.7604, -95.3698];

  const filteredTrucks = trucks.filter(truck => {
    if (activeFilter === 'Live') return truck.is_live;
    if (activeFilter === 'Open Now') return truck.status === 'open';
    if (activeFilter === 'Tacos') return truck.cuisine_type === 'tacos';
    if (activeFilter === 'BBQ') return truck.cuisine_type === 'bbq';
    if (activeFilter === 'Near Me') {
      if (!userLat || !truck.latitude) return true;
      return distanceMiles(userLat, userLng, truck.latitude, truck.longitude) <= 5;
    }
    return true;
  });

  const openCount = filteredTrucks.filter(t => t.status === 'open').length;

  function getDistance(truck) {
    if (!userLat || !truck.latitude) return null;
    return distanceMiles(userLat, userLng, truck.latitude, truck.longitude);
  }

  // Trucks with coordinates sorted by distance
  const mappedTrucks = filteredTrucks
    .filter(t => t.latitude && t.longitude)
    .sort((a, b) => {
      const da = getDistance(a) ?? 9999;
      const db = getDistance(b) ?? 9999;
      return da - db;
    });

  function selectTruckAtIndex(i) {
    const idx = Math.max(0, Math.min(i, mappedTrucks.length - 1));
    setCarouselIndex(idx);
    const truck = mappedTrucks[idx];
    setSelected(truck);
    // Pan map to truck
    if (mapRef.current && truck?.latitude) {
      mapRef.current.setView([truck.latitude, truck.longitude], 15, { animate: true });
    }
  }

  return (
    <div className="h-screen relative overflow-hidden" style={{ background: '#0d1517' }}>

      {/* ── Top bar ── */}
      <div
        className="absolute top-0 left-0 right-0 z-[1000] px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3"
        style={{ background: 'linear-gradient(180deg, rgba(13,21,23,0.95) 0%, rgba(13,21,23,0.0) 100%)', pointerEvents: 'none' }}
      >
        <div className="flex items-center gap-3 mb-3" style={{ pointerEvents: 'all' }}>
          <Link
            to="/"
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(13,21,23,0.88)', border: '1px solid rgba(59,74,66,0.4)', backdropFilter: 'blur(12px)' }}
          >
            <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
          </Link>
          <div
            className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl"
            style={{ background: 'rgba(13,21,23,0.88)', border: '1px solid rgba(59,74,66,0.35)', backdropFilter: 'blur(12px)' }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: '#77ffc8', boxShadow: '0 0 6px #77ffc8' }} />
            <span className="text-sm font-semibold" style={{ color: '#dff0e8' }}>
              <span style={{ color: '#77ffc8' }}>{openCount}</span> trucks open near you
            </span>
            <span className="ml-auto text-[10px]" style={{ color: '#bacbc0' }}>within 5 mi</span>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar" style={{ pointerEvents: 'all' }}>
          {FILTERS.map(f => {
            const isActive = activeFilter === f;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200"
                style={
                  isActive
                    ? {
                        background: f === 'Live' ? 'rgba(255,59,48,0.9)' : 'linear-gradient(135deg,#77ffc8,#00e6a7)',
                        color: f === 'Live' ? 'white' : '#003826',
                        boxShadow: f === 'Live' ? '0 0 14px rgba(255,59,48,0.5)' : '0 0 14px rgba(119,255,200,0.35)',
                      }
                    : {
                        background: 'rgba(13,21,23,0.85)',
                        color: '#bacbc0',
                        border: '1px solid rgba(59,74,66,0.4)',
                        backdropFilter: 'blur(10px)',
                      }
                }
              >
                {f === 'Live' && isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                {f === 'Live' && !isActive && <Radio className="w-3 h-3" />}
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Map ── */}
      <MapContainer
        center={houstonCenter}
        zoom={12}
        className="h-full w-full"
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {mappedTrucks.map((truck, i) => {
          const isSelected = selected?.id === truck.id;
          return (
            <Marker
              key={truck.id}
              position={[truck.latitude, truck.longitude]}
              icon={makeTruckIcon(truck.is_live, isSelected)}
              eventHandlers={{
                click: () => {
                  const idx = mappedTrucks.findIndex(t => t.id === truck.id);
                  selectTruckAtIndex(idx);
                  // scroll carousel
                  if (carouselRef.current) {
                    carouselRef.current.scrollTo({ left: idx * (carouselRef.current.offsetWidth + 12), behavior: 'smooth' });
                  }
                },
              }}
            />
          );
        })}

        <RecenterButton userLat={userLat} userLng={userLng} />
      </MapContainer>

      {/* ── Truck Carousel ── */}
      {mappedTrucks.length > 0 && selected && (
        <div className="absolute bottom-6 left-0 right-0 z-[1000]" style={{ animation: 'fadeSlideUp 0.25s ease' }}>
          <div
            ref={carouselRef}
            className="flex gap-3 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory"
            onScroll={e => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollLeft / (el.offsetWidth + 12));
              if (idx !== carouselIndex && mappedTrucks[idx]) {
                setCarouselIndex(idx);
                setSelected(mappedTrucks[idx]);
                const t = mappedTrucks[idx];
                if (mapRef.current && t.latitude) {
                  mapRef.current.setView([t.latitude, t.longitude], 15, { animate: true });
                }
              }
            }}
          >
            {mappedTrucks.map((truck, i) => {
              const dist = getDistance(truck);
              const isActive = i === carouselIndex;
              return (
                <div key={truck.id} className="flex-shrink-0 snap-start" style={{ width: 'calc(100vw - 32px)' }}>
                  <div
                    className="rounded-3xl overflow-hidden transition-all duration-200"
                    style={{
                      background: 'rgba(13,21,23,0.97)',
                      border: isActive ? '1px solid rgba(119,255,200,0.35)' : '1px solid rgba(59,74,66,0.25)',
                      backdropFilter: 'blur(24px)',
                      boxShadow: isActive ? '0 12px 48px rgba(0,0,0,0.7), 0 0 28px rgba(119,255,200,0.1)' : '0 8px 32px rgba(0,0,0,0.5)',
                      opacity: isActive ? 1 : 0.75,
                    }}
                  >
                    <div className="flex gap-0">
                      <div className="w-28 flex-shrink-0 relative" style={{ height: 100 }}>
                        <img
                          src={truck.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=300'}
                          alt={truck.name}
                          className="w-full h-full object-cover"
                        />
                        {truck.is_live && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,59,48,0.9)' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white live-dot" />
                            <span className="text-[9px] font-black text-white">LIVE</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 px-4 pt-3 pb-2 min-w-0">
                        <p className="font-heading font-black text-base leading-tight mb-0.5" style={{ color: '#dff0e8' }}>{truck.name}</p>
                        <p className="text-xs capitalize mb-2" style={{ color: '#bacbc0' }}>{truck.cuisine_type?.replace('_', ' ')}</p>
                        <div className="flex gap-2">
                          {[
                            { label: 'WAIT TIME', value: '~12 min' },
                            { label: 'DISTANCE', value: dist != null ? `${dist.toFixed(1)} mi` : '—' },
                            { label: 'STATUS', value: truck.status === 'open' ? 'Open' : 'Closed', color: truck.status === 'open' ? '#77ffc8' : '#bacbc0' },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="flex flex-col items-center px-2 py-1.5 rounded-xl flex-1"
                              style={{ background: '#0d1517' }}>
                              <p className="text-[8px] font-bold tracking-wider mb-0.5" style={{ color: 'rgba(186,203,192,0.5)' }}>{label}</p>
                              <p className="font-heading font-black text-xs" style={{ color: color || '#dff0e8' }}>{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2.5 px-4 pb-4 pt-2">
                      <Link to={`/truck/${truck.id}`} className="flex-1">
                        <button className="w-full py-3 rounded-full font-heading font-black text-sm"
                          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 16px rgba(119,255,200,0.3)' }}>
                          View Menu
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          if (truck.latitude) window.open(`https://www.google.com/maps/dir/?api=1&destination=${truck.latitude},${truck.longitude}`, '_blank');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-heading font-black text-sm"
                        style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.3)' }}>
                        🚶 Directions
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* dot indicators */}
          {mappedTrucks.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {mappedTrucks.map((_, i) => (
                <button key={i}
                  onClick={() => {
                    selectTruckAtIndex(i);
                    if (carouselRef.current) {
                      carouselRef.current.scrollTo({ left: i * (carouselRef.current.offsetWidth + 12), behavior: 'smooth' });
                    }
                  }}
                  className="rounded-full transition-all duration-300"
                  style={{ width: i === carouselIndex ? 20 : 6, height: 6, background: i === carouselIndex ? '#77ffc8' : 'rgba(186,203,192,0.3)' }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* open carousel on first truck tap */}
      {mappedTrucks.length > 0 && !selected && (
        <button
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-5 py-3 rounded-full font-heading font-black text-sm"
          style={{ background: 'rgba(13,21,23,0.92)', border: '1px solid rgba(119,255,200,0.3)', color: '#77ffc8', backdropFilter: 'blur(12px)' }}
          onClick={() => selectTruckAtIndex(0)}
        >
          {openCount} trucks nearby — tap to explore
        </button>
      )}

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}