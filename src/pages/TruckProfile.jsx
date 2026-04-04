import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import TruckHeader from '../components/truck/TruckHeader';
import MenuItemCard from '../components/truck/MenuItemCard';

export default function TruckProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const truckId = window.location.pathname.split('/truck/')[1]?.split('/')[0];
  const [activeTab, setActiveTab] = useState('menu');

  const { data: truck, isLoading: truckLoading } = useQuery({
    queryKey: ['truck', truckId],
    queryFn: async () => {
      const trucks = await base44.entities.FoodTruck.filter({ id: truckId });
      return trucks[0];
    },
    enabled: !!truckId,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu', truckId],
    queryFn: () => base44.entities.MenuItem.filter({ truck_id: truckId }),
    enabled: !!truckId,
  });

  const { data: clips = [] } = useQuery({
    queryKey: ['clips', truckId],
    queryFn: () => base44.entities.LiveClip.filter({ truck_id: truckId }),
    enabled: !!truckId,
  });

  if (truckLoading || !truck) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'menu', label: 'Menu' },
    { id: 'specials', label: 'Specials' },
    { id: 'clips', label: 'Clips' },
  ];

  const specialItems = menuItems.filter(i => i.is_special);
  const menuByCategory = menuItems.reduce((acc, item) => {
    const cat = item.category || 'mains';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="pb-4">
      <TruckHeader truck={truck} />

      {/* Tabs */}
      <div className="flex gap-1 px-5 mt-5 bg-secondary/50 rounded-2xl mx-5 p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-5 mt-4">
        {activeTab === 'menu' && (
          <div className="space-y-5">
            {Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-heading font-bold text-base capitalize mb-2.5">{category}</h3>
                <div className="space-y-2.5">
                  {items.map(item => (
                    <MenuItemCard key={item.id} item={item} truckId={truckId} />
                  ))}
                </div>
              </div>
            ))}
            {menuItems.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">No menu items yet</p>
            )}
          </div>
        )}

        {activeTab === 'specials' && (
          <div className="space-y-2.5">
            {specialItems.length > 0 ? specialItems.map(item => (
              <MenuItemCard key={item.id} item={item} truckId={truckId} />
            )) : (
              <p className="text-center text-muted-foreground text-sm py-8">No specials right now</p>
            )}
          </div>
        )}

        {activeTab === 'clips' && (
          <div className="grid grid-cols-2 gap-2.5">
            {clips.length > 0 ? clips.map(clip => (
              <div key={clip.id} className="relative rounded-2xl overflow-hidden aspect-[3/4]">
                <img src={clip.image_url} alt={clip.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium">{clip.title}</p>
              </div>
            )) : (
              <p className="col-span-2 text-center text-muted-foreground text-sm py-8">No clips yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}