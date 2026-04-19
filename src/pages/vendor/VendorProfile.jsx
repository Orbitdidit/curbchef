import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import VendorGate from '@/components/vendor/VendorGate';
import MediaUpload from '@/components/shared/MediaUpload';
import CoverMediaUploader from '@/components/vendor/CoverMediaUploader';
import { useToast } from '@/components/ui/use-toast';

const CUISINE_OPTIONS = ['tacos','burgers','bbq','seafood','asian','fusion','desserts','vegan','pizza','soul_food'];

function VendorProfileInner({ truck }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
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
    <div className="min-h-screen pb-16" style={{ background: '#0d1517' }}>
      <div className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-20"
        style={{ background: 'rgba(13,21,23,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.12)' }}>
        <button onClick={() => navigate('/vendor')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
        </button>
        <div className="flex-1">
          <p className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>Edit Truck Profile</p>
          <p className="text-xs" style={{ color: '#bacbc0' }}>{truck.name}</p>
        </div>
        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
          <Save className="w-3.5 h-3.5" />
          {saveMutation.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-5">
        {/* Cover Media Carousel */}
        <CoverMediaUploader
          value={form.cover_media}
          onChange={v => set('cover_media', v)}
        />

        {/* Fallback cover photo (used if no cover_media set) */}
        <MediaUpload type="image" label="Fallback Cover Photo" value={form.cover_image_url}
          onChange={v => set('cover_image_url', v)}
          hint="Used if no carousel media is uploaded · 16:9 recommended" />

        {/* Logo / avatar */}
        <MediaUpload type="image" label="Truck Logo / Avatar" value={form.image_url}
          onChange={v => set('image_url', v)}
          hint="Square · Used in cards and search results" />

        {/* Name */}
        <div>
          <label style={labelStyle}>TRUCK NAME</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>DESCRIPTION</label>
          <textarea style={{ ...inputStyle, resize: 'none' }} rows={3}
            value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        {/* Cuisine */}
        <div>
          <label style={labelStyle}>CUISINE TYPE</label>
          <select style={inputStyle} value={form.cuisine_type} onChange={e => set('cuisine_type', e.target.value)}>
            {CUISINE_OPTIONS.map(c => (
              <option key={c} value={c}>{c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div>
          <label style={labelStyle}>LOCATION / ADDRESS</label>
          <input style={inputStyle} value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. Rainey St, Austin TX" />
        </div>

        {/* Hours */}
        <div>
          <label style={labelStyle}>OPERATING HOURS</label>
          <input style={inputStyle} value={form.operating_hours} onChange={e => set('operating_hours', e.target.value)} placeholder="e.g. Mon–Fri 11am–9pm" />
        </div>

        {/* Phone */}
        <div>
          <label style={labelStyle}>PHONE</label>
          <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
        </div>

        {/* Live description */}
        <div>
          <label style={labelStyle}>LIVE STATUS MESSAGE</label>
          <input style={inputStyle} value={form.live_description} onChange={e => set('live_description', e.target.value)} placeholder="e.g. 🔥 Cooking brisket plates until sold out" />
        </div>

        {/* Delivery mode */}
        <div>
          <label style={labelStyle}>DELIVERY MODE</label>
          <select style={inputStyle} value={form.delivery_mode} onChange={e => set('delivery_mode', e.target.value)}>
            <option value="pickup_only">🏪 Pickup Only</option>
            <option value="pickup_delivery_curbchef">🛵 Pickup + CurbChef Delivery</option>
            <option value="pickup_delivery_vendor">🚗 Pickup + Vendor Delivery</option>
            <option value="full_delivery" disabled>📦 Full Delivery (coming soon)</option>
          </select>
        </div>

        {/* Delivery details (shown when delivery is enabled) */}
        {form.delivery_mode !== 'pickup_only' && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={labelStyle}>DELIVERY FEE ($)</label>
              <input type="number" min="0" step="0.5" style={inputStyle} value={form.delivery_fee}
                onChange={e => set('delivery_fee', parseFloat(e.target.value) || 0)}
                placeholder="0 = free" />
            </div>
            <div className="flex-1">
              <label style={labelStyle}>ETA (MIN)</label>
              <input style={inputStyle} value={form.delivery_eta}
                onChange={e => set('delivery_eta', e.target.value)}
                placeholder="25–40" />
            </div>
          </div>
        )}

        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
          className="w-full py-4 rounded-full font-heading font-black text-base"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 20px rgba(119,255,200,0.3)' }}>
          {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
        </button>
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