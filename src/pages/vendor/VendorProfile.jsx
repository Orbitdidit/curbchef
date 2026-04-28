import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, ToggleLeft, ToggleRight, ImageIcon, FileText, Utensils } from 'lucide-react';
import VendorGate from '@/components/vendor/VendorGate';
import MediaUpload from '@/components/shared/MediaUpload';
import CoverMediaUploader from '@/components/vendor/CoverMediaUploader';
import { useToast } from '@/components/ui/use-toast';
import { RotateCcw } from 'lucide-react';

const CUISINE_OPTIONS = ['tacos','burgers','bbq','seafood','asian','fusion','desserts','vegan','pizza','soul_food'];

const TABS = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'menu', label: 'Menu Items', icon: Utensils },
];

function MenuAvailabilityToggle({ truckId }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['vendor-menu-items', truckId],
    queryFn: () => base44.entities.MenuItem.filter({ truck_id: truckId }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_available }) => base44.entities.MenuItem.update(id, { is_available }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-menu-items', truckId] }),
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  });

  const grouped = menuItems.reduce((acc, item) => {
    const cat = item.category || 'mains';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (isLoading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
    </div>
  );

  if (!menuItems.length) return (
    <div className="text-center py-10">
      <p className="text-2xl mb-2">🍽️</p>
      <p className="text-sm font-bold" style={{ color: '#dff0e8' }}>No menu items yet</p>
      <p className="text-xs mt-1" style={{ color: '#bacbc0' }}>Add items from the Menu tab first</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <p className="text-xs" style={{ color: '#bacbc0' }}>Toggle items on or off instantly — changes save automatically.</p>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <p className="text-[10px] font-black tracking-widest mb-3 capitalize" style={{ color: '#77ffc8' }}>{cat}</p>
          <div className="flex flex-col gap-2">
            {items.map(item => (
              <div key={item.id}
                className="flex items-center gap-3 p-3.5 rounded-2xl transition-all"
                style={{
                  background: item.is_available ? 'rgba(119,255,200,0.05)' : '#0d1517',
                  border: `1px solid ${item.is_available ? 'rgba(119,255,200,0.15)' : 'rgba(59,74,66,0.2)'}`,
                }}>
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-sm truncate" style={{ color: item.is_available ? '#dff0e8' : '#6B665C' }}>
                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: '#bacbc0' }}>${item.price?.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => toggleMutation.mutate({ id: item.id, is_available: !item.is_available })}
                  disabled={toggleMutation.isPending}
                  className="flex-shrink-0 transition-all"
                >
                  {item.is_available
                    ? <ToggleRight className="w-8 h-8" style={{ color: '#77ffc8' }} />
                    : <ToggleLeft className="w-8 h-8" style={{ color: '#3a4a42' }} />
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function VendorProfileInner({ truck, user }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: profileData = [] } = useQuery({
    queryKey: ['user-profile-tour', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });
  const profile = profileData[0] || null;

  const handleReplayTour = async () => {
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { tour_completed: false });
    } else if (user?.email) {
      await base44.entities.UserProfile.create({ user_email: user.email, tour_completed: false });
    }
    qc.invalidateQueries({ queryKey: ['user-profile-tour', user?.email] });
    toast({ title: '🎬 Tour reset! Head back to the dashboard.', duration: 3000 });
  };
  const [activeTab, setActiveTab] = useState('description');
  const [form, setForm] = useState({
    name: truck.name || '',
    description: truck.description || '',
    cuisine_type: truck.cuisine_type || 'tacos',
    address: truck.address || '',
    operating_hours: truck.operating_hours || '',
    phone: truck.phone || '',
    image_url: truck.image_url || '',
    cover_image_url: truck.cover_image_url || '',
    cover_media: truck.cover_media || [],
    live_description: truck.live_description || '',
    delivery_mode: truck.delivery_mode || 'pickup_only',
    delivery_fee: truck.delivery_fee || 0,
    delivery_eta: truck.delivery_eta || '25–40',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.FoodTruck.update(truck.id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-truck'] });
      toast({ title: 'Profile saved!', duration: 2000 });
      navigate('/vendor');
    },
  });

  const inputStyle = {
    background: '#0d1517', color: '#dff0e8',
    border: '1px solid rgba(59,74,66,0.4)', borderRadius: '0.75rem',
    padding: '10px 14px', fontSize: '0.875rem', outline: 'none', width: '100%',
  };
  const labelStyle = { color: '#bacbc0', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-20"
        style={{ background: 'rgba(13,21,23,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.12)' }}>
        <button onClick={() => navigate('/vendor')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
        </button>
        <div className="flex-1">
          <p className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>Edit Profile</p>
          <p className="text-xs" style={{ color: '#bacbc0' }}>{truck.name}</p>
        </div>
        {activeTab !== 'menu' && (
          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black"
            style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
            <Save className="w-3.5 h-3.5" />
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex px-5 gap-2 pt-4 pb-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl text-xs font-bold transition-all"
            style={activeTab === id
              ? { background: 'rgba(119,255,200,0.1)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.25)' }
              : { background: '#192123', color: '#bacbc0', border: '1px solid transparent' }
            }>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="px-5 pt-4 pb-8 flex flex-col gap-5">

        {/* ── DESCRIPTION TAB ── */}
        {activeTab === 'description' && (
          <>
            <div>
              <label style={labelStyle}>TRUCK NAME</label>
              <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>DESCRIPTION</label>
              <textarea style={{ ...inputStyle, resize: 'none' }} rows={4}
                value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Tell customers what makes your truck special..." />
              <p className="text-[10px] mt-1" style={{ color: '#6B665C' }}>{form.description.length} chars</p>
            </div>
            <div>
              <label style={labelStyle}>CUISINE TYPE</label>
              <select style={inputStyle} value={form.cuisine_type} onChange={e => set('cuisine_type', e.target.value)}>
                {CUISINE_OPTIONS.map(c => (
                  <option key={c} value={c}>{c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>LOCATION / ADDRESS</label>
              <input style={inputStyle} value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. Rainey St, Houston TX" />
            </div>
            <div>
              <label style={labelStyle}>OPERATING HOURS</label>
              <input style={inputStyle} value={form.operating_hours} onChange={e => set('operating_hours', e.target.value)} placeholder="e.g. Mon–Fri 11am–9pm" />
            </div>
            <div>
              <label style={labelStyle}>PHONE</label>
              <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label style={labelStyle}>LIVE STATUS MESSAGE</label>
              <input style={inputStyle} value={form.live_description} onChange={e => set('live_description', e.target.value)} placeholder="e.g. 🔥 Cooking brisket plates until sold out" />
            </div>
            <div>
              <label style={labelStyle}>DELIVERY MODE</label>
              <select style={inputStyle} value={form.delivery_mode} onChange={e => set('delivery_mode', e.target.value)}>
                <option value="pickup_only">🏪 Pickup Only</option>
                <option value="pickup_delivery_curbchef">🛵 Pickup + CurbChef Delivery</option>
                <option value="pickup_delivery_vendor">🚗 Pickup + Vendor Delivery</option>
                <option value="full_delivery" disabled>📦 Full Delivery (coming soon)</option>
              </select>
            </div>
            {/* Replay Tour */}
            <div className="pt-2 border-t" style={{ borderColor: 'rgba(59,74,66,0.2)' }}>
              <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: '#bacbc0' }}>SETTINGS</p>
              <button
                onClick={handleReplayTour}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold w-full"
                style={{ background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.3)' }}
              >
                <RotateCcw className="w-4 h-4" style={{ color: '#77ffc8' }} />
                Replay Welcome Tour
              </button>
            </div>

            {form.delivery_mode !== 'pickup_only' && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label style={labelStyle}>DELIVERY FEE ($)</label>
                  <input type="number" min="0" step="0.5" style={inputStyle} value={form.delivery_fee}
                    onChange={e => set('delivery_fee', parseFloat(e.target.value) || 0)} placeholder="0 = free" />
                </div>
                <div className="flex-1">
                  <label style={labelStyle}>ETA (MIN)</label>
                  <input style={inputStyle} value={form.delivery_eta}
                    onChange={e => set('delivery_eta', e.target.value)} placeholder="25–40" />
                </div>
              </div>
            )}
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
              className="w-full py-4 rounded-full font-heading font-black text-base"
              style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 20px rgba(119,255,200,0.3)' }}>
              {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}

        {/* ── IMAGES TAB ── */}
        {activeTab === 'images' && (
          <>
            <CoverMediaUploader value={form.cover_media} onChange={v => set('cover_media', v)} />
            <MediaUpload type="image" label="Fallback Cover Photo" value={form.cover_image_url}
              onChange={v => set('cover_image_url', v)}
              hint="Used if no carousel media is uploaded · 16:9 recommended" />
            <MediaUpload type="image" label="Truck Logo / Avatar" value={form.image_url}
              onChange={v => set('image_url', v)}
              hint="Square · Used in cards and search results" />
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
              className="w-full py-4 rounded-full font-heading font-black text-base"
              style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 20px rgba(119,255,200,0.3)' }}>
              {saveMutation.isPending ? 'Saving...' : 'Save Images'}
            </button>
          </>
        )}

        {/* ── MENU AVAILABILITY TAB ── */}
        {activeTab === 'menu' && (
          <MenuAvailabilityToggle truckId={truck.id} />
        )}

      </div>
    </div>
  );
}

export default function VendorProfile() {
  return (
    <VendorGate>
      {({ truck, user }) => <VendorProfileInner truck={truck} user={user} />}
    </VendorGate>
  );
}