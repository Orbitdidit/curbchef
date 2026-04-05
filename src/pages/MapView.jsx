import React, { useState, useRef } from 'react';
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

        {filteredTrucks.map(truck => {
          if (!truck.latitude || !truck.longitude) return null;
          const isSelected = selected?.id === truck.id;
          return (
            <Marker
              key={truck.id}
              position={[truck.latitude, truck.longitude]}
              icon={makeTruckIcon(truck.is_live, isSelected)}
              eventHandlers={{
                click: () => setSelected(isSelected ? null : truck),
              }}
            />
          );
        })}

        <RecenterButton userLat={userLat} userLng={userLng} />
      </MapContainer>

      {/* ── Selected Truck Card ── */}
      {selected && (
        <div
          className="absolute bottom-6 left-4 right-4 z-[1000]"
          style={{ animation: 'fadeSlideUp 0.25s ease' }}
        >
          <Link to={`/truck/${selected.id}`}>
            <div
              className="rounded-3xl overflow-hidden flex gap-0"
              style={{
                background: 'rgba(13,21,23,0.96)',
                border: '1px solid rgba(119,255,200,0.2)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 24px rgba(119,255,200,0.08)',
              }}
            >
              {/* Image */}
              <div className="w-28 flex-shrink-0 relative" style={{ height: '100px' }}>
                <img
                  src={selected.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=300'}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                />
                {selected.is_live && (
                  <div
                    className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,59,48,0.9)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-[9px] font-black text-white">LIVE</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 px-4 py-3 flex flex-col justify-between min-w-0">
                <div>
                  <p className="font-heading font-black text-base leading-tight truncate" style={{ color: '#dff0e8' }}>
                    {selected.name}
                  </p>
                  <p className="text-xs mt-0.5 capitalize" style={{ color: '#bacbc0' }}>
                    {selected.cuisine_type?.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold" style={{ color: '#dff0e8' }}>{selected.rating?.toFixed(1) || '4.8'}</span>
                  </div>
                  {getDistance(selected) != null && (
                    <div className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" style={{ color: '#77ffc8' }} />
                      <span className="text-xs" style={{ color: '#bacbc0' }}>{formatDist(getDistance(selected))} away</span>
                    </div>
                  )}
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full ml-auto"
                    style={
                      selected.status === 'open'
                        ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.3)' }
                        : { background: '#2e3638', color: '#bacbc0' }
                    }
                  >
                    {selected.status === 'open' ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
              </div>

              {/* CTA arrow */}
              <div className="flex items-center pr-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}
                >
                  <ChevronLeft className="w-4 h-4 rotate-180" style={{ color: '#003826' }} />
                </div>
              </div>
            </div>
          </Link>
        </div>
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