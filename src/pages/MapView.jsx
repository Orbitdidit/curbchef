import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Star, Navigation, ChevronLeft } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const truckIcon = new L.DivIcon({
  html: `<div style="background: hsl(160 60% 50%); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">🚚</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function MapView() {
  const { data: trucks = [] } = useQuery({
    queryKey: ['trucks'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }),
  });

  const [selected, setSelected] = useState(null);
  const houstonCenter = [29.7604, -95.3698];

  return (
    <div className="h-screen relative">
      <div className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 right-4 z-[1000] flex items-center gap-3">
        <Link to="/" className="w-10 h-10 bg-card/90 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div className="flex-1 bg-card/90 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-lg">
          <p className="text-sm font-medium">
            <span className="text-primary">{trucks.filter(t => t.status === 'open').length}</span>
            <span className="text-muted-foreground"> trucks open near you</span>
          </p>
        </div>
      </div>

      <MapContainer
        center={houstonCenter}
        zoom={12}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {trucks.map(truck => {
          if (!truck.latitude || !truck.longitude) return null;
          return (
            <Marker
              key={truck.id}
              position={[truck.latitude, truck.longitude]}
              icon={truckIcon}
              eventHandlers={{ click: () => setSelected(truck) }}
            >
              <Popup className="custom-popup">
                <div className="p-0 min-w-[200px]">
                  <p className="font-bold text-sm">{truck.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{truck.cuisine_type}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {selected && (
        <div className="absolute bottom-24 left-4 right-4 z-[1000]">
          <Link to={`/truck/${selected.id}`}>
            <div className="bg-card/95 backdrop-blur-xl rounded-3xl p-4 shadow-2xl flex gap-3">
              <img src={selected.image_url} alt={selected.name} className="w-20 h-20 rounded-2xl object-cover" />
              <div className="flex-1">
                <h3 className="font-heading font-bold text-sm">{selected.name}</h3>
                <p className="text-muted-foreground text-xs capitalize mt-0.5">{selected.cuisine_type?.replace('_', ' ')}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-chart-3 fill-chart-3" />
                    <span className="text-xs font-bold">{selected.rating?.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-primary" />
                    <span className="text-xs text-muted-foreground">0.8 mi</span>
                  </div>
                  {selected.status === 'open' && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">OPEN</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}