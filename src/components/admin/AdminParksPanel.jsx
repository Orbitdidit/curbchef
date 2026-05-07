import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Star, StarOff, Eye, EyeOff } from 'lucide-react';

const EMPTY_PARK = {
  name: '', slug: '', description: '', address: '', city: 'Houston', state: 'TX',
  latitude: 0, longitude: 0, hero_image_url: '', amenities: [],
  is_featured: false, is_active: true, total_trucks: 0,
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function ParkFormModal({ park, onClose }) {
  const [form, setForm] = useState(park || EMPTY_PARK);
  const [amenityInput, setAmenityInput] = useState('');
  const qc = useQueryClient();

  const save = useMutation({
    mutationFn: (data) => park?.id
      ? base44.entities.TruckPark.update(park.id, data)
      : base44.entities.TruckPark.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-parks'] }); onClose(); },
  });

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm(f => ({ ...f, name, slug: f.slug || slugify(name) }));
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setForm(f => ({ ...f, amenities: [...(f.amenities || []), amenityInput.trim()] }));
      setAmenityInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto max-h-[90vh]"
        style={{ background: '#1a2123', border: '1px solid rgba(59,74,66,0.3)' }}>
        <div className="flex items-center justify-between mb-5">
          <p className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>
            {park?.id ? 'Edit Park' : 'Add Park'}
          </p>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(59,74,66,0.3)', color: '#bacbc0' }}>✕</button>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { label: 'Name *', key: 'name', onChange: handleNameChange },
            { label: 'Slug *', key: 'slug' },
            { label: 'Address *', key: 'address' },
            { label: 'City', key: 'city' },
            { label: 'Hero Image URL', key: 'hero_image_url' },
            { label: 'Website', key: 'website' },
            { label: 'Instagram', key: 'instagram' },
            { label: 'Phone', key: 'phone' },
            { label: 'Latitude', key: 'latitude', type: 'number' },
            { label: 'Longitude', key: 'longitude', type: 'number' },
          ].map(({ label, key, type = 'text', onChange }) => (
            <div key={key}>
              <label className="text-[10px] font-bold block mb-1" style={{ color: '#bacbc0' }}>{label}</label>
              <input
                type={type}
                value={form[key] || ''}
                onChange={onChange || (e => setForm(f => ({ ...f, [key]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: '#0d1517', border: '1px solid rgba(59,74,66,0.3)', color: '#dff0e8' }}
              />
            </div>
          ))}

          <div>
            <label className="text-[10px] font-bold block mb-1" style={{ color: '#bacbc0' }}>Description</label>
            <textarea
              value={form.description || ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: '#0d1517', border: '1px solid rgba(59,74,66,0.3)', color: '#dff0e8' }}
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="text-[10px] font-bold block mb-1" style={{ color: '#bacbc0' }}>Amenities</label>
            <div className="flex gap-2 mb-2">
              <input value={amenityInput} onChange={e => setAmenityInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAmenity()}
                placeholder="e.g. live music"
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: '#0d1517', border: '1px solid rgba(59,74,66,0.3)', color: '#dff0e8' }} />
              <button onClick={addAmenity} className="px-3 py-2 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(0,245,212,0.15)', color: '#00F5D4' }}>Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.amenities?.map((a, i) => (
                <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(0,245,212,0.08)', color: '#00F5D4', border: '1px solid rgba(0,245,212,0.15)' }}>
                  {a}
                  <button onClick={() => setForm(f => ({ ...f, amenities: f.amenities.filter((_, j) => j !== i) }))}
                    className="ml-0.5 opacity-60 hover:opacity-100">✕</button>
                </span>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-3">
            {[{ key: 'is_featured', label: 'Featured' }, { key: 'is_active', label: 'Active' }].map(({ key, label }) => (
              <button key={key} onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: form[key] ? 'rgba(0,245,212,0.12)' : '#0d1517',
                  color: form[key] ? '#00F5D4' : '#bacbc0',
                  border: `1px solid ${form[key] ? 'rgba(0,245,212,0.25)' : 'rgba(59,74,66,0.3)'}`,
                }}>
                {label}: {form[key] ? 'YES' : 'NO'}
              </button>
            ))}
          </div>

          <button onClick={() => save.mutate(form)} disabled={save.isPending}
            className="w-full py-3.5 rounded-2xl font-heading font-black text-sm mt-2"
            style={{ background: 'linear-gradient(135deg,#00F5D4,#00e6a7)', color: '#0A0A0A' }}>
            {save.isPending ? 'Saving...' : park?.id ? 'Save Changes' : 'Create Park'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminParksPanel() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: parks = [], isLoading } = useQuery({
    queryKey: ['admin-parks'],
    queryFn: () => base44.entities.TruckPark.list('-featured_order', 100),
  });

  const deletePark = useMutation({
    mutationFn: (id) => base44.entities.TruckPark.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-parks'] }),
  });

  const toggleFeature = useMutation({
    mutationFn: ({ id, val }) => base44.entities.TruckPark.update(id, { is_featured: val }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-parks'] }),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, val }) => base44.entities.TruckPark.update(id, { is_active: val }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-parks'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>TRUCK PARKS</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
          style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.2)' }}>
          <Plus className="w-3.5 h-3.5" /> Add Park
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#192123' }} />)}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {parks.map(park => (
            <div key={park.id} className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
              <img src={park.hero_image_url || 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100'}
                alt={park.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-sm truncate" style={{ color: '#dff0e8' }}>{park.name}</p>
                <p className="text-xs truncate" style={{ color: '#bacbc0' }}>{park.address}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {park.is_featured && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0,245,212,0.1)', color: '#00F5D4' }}>FEATURED</span>}
                  {!park.is_active && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,59,48,0.1)', color: '#FF3B30' }}>INACTIVE</span>}
                  {park.is_sample && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>DEMO</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => toggleFeature.mutate({ id: park.id, val: !park.is_featured })}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: park.is_featured ? 'rgba(0,245,212,0.1)' : 'rgba(59,74,66,0.2)' }}>
                  {park.is_featured ? <Star className="w-3.5 h-3.5" style={{ color: '#00F5D4' }} /> : <StarOff className="w-3.5 h-3.5" style={{ color: '#bacbc0' }} />}
                </button>
                <button onClick={() => toggleActive.mutate({ id: park.id, val: !park.is_active })}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: park.is_active ? 'rgba(0,245,212,0.08)' : 'rgba(59,74,66,0.2)' }}>
                  {park.is_active ? <Eye className="w-3.5 h-3.5" style={{ color: '#00F5D4' }} /> : <EyeOff className="w-3.5 h-3.5" style={{ color: '#bacbc0' }} />}
                </button>
                <button onClick={() => { setEditing(park); setShowForm(true); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(59,74,66,0.2)' }}>
                  <Pencil className="w-3.5 h-3.5" style={{ color: '#bacbc0' }} />
                </button>
                <button onClick={() => { if (confirm(`Delete "${park.name}"?`)) deletePark.mutate(park.id); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,59,48,0.08)' }}>
                  <Trash2 className="w-3.5 h-3.5" style={{ color: '#FF3B30' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm) && (
        <ParkFormModal
          park={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}