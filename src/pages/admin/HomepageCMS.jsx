import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronLeft, Save, Plus, Trash2, Video, Image, Star, Truck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SECTION_ICONS = {
  hero_video: Video,
  mid_video: Video,
  promo_card_1: Image,
  promo_card_2: Image,
  rewards_promo: Star,
};

const DEFAULT_CONFIGS = [
  { key: 'hero_video', label: 'Hero Video (Top of Homepage)', video_url: '', poster_url: '', headline: "Houston's Hottest\nStreet Food — Live", subline: 'Order from trucks cooking right now', cta_label: 'Watch Live', cta_href: '/live', is_active: true },
  { key: 'mid_video', label: 'Mid-Page Video', video_url: '', poster_url: '', headline: 'Real Food.\nReal Trucks.', subline: 'STREET FOOD CULTURE', is_active: true },
  { key: 'promo_card_1', label: 'Promo Card #1 (Rewards)', headline: 'Earn points on every pickup', subline: 'Unlock discounts, freebies, and VIP drops', cta_label: 'Start Earning', cta_href: '/rewards', is_active: true },
  { key: 'promo_card_2', label: 'Promo Card #2 (Vendor)', headline: 'Get discovered. Get paid.', subline: 'Go live and reach hungry customers nearby', cta_label: 'Apply Now', cta_href: '/vendor', is_active: true },
];

function ConfigCard({ item, onSave, onDelete }) {
  const [form, setForm] = useState(item);
  const Icon = SECTION_ICONS[item.key] || Truck;
  const isDirty = JSON.stringify(form) !== JSON.stringify(item);

  const fields = [
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'video_url', label: 'Video URL', type: 'text', show: item.key.includes('video') },
    { key: 'poster_url', label: 'Poster / Fallback Image URL', type: 'text', show: item.key.includes('video') },
    { key: 'image_url', label: 'Image URL', type: 'text', show: !item.key.includes('video') },
    { key: 'headline', label: 'Headline', type: 'textarea' },
    { key: 'subline', label: 'Sub-label / Copy', type: 'textarea' },
    { key: 'cta_label', label: 'CTA Button Text', type: 'text' },
    { key: 'cta_href', label: 'CTA Link', type: 'text' },
  ].filter(f => f.show !== false);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(119,255,200,0.1)', border: '1px solid rgba(119,255,200,0.2)' }}
        >
          <Icon className="w-4 h-4" style={{ color: '#77ffc8' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>{item.label}</p>
          <p className="text-[10px] font-mono" style={{ color: '#bacbc0' }}>{item.key}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={form.is_active
              ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.3)' }
              : { background: '#2e3638', color: '#bacbc0' }
            }
          >
            {form.is_active ? 'Active' : 'Hidden'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-[10px] font-bold tracking-wider mb-1" style={{ color: '#bacbc0' }}>
              {f.label.toUpperCase()}
            </label>
            {f.type === 'textarea' ? (
              <textarea
                value={form[f.key] || ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                rows={2}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }}
              />
            ) : (
              <input
                type="text"
                value={form[f.key] || ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => onSave(form)}
          disabled={!isDirty}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all"
          style={isDirty
            ? { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }
            : { background: '#2e3638', color: '#bacbc0', opacity: 0.5 }
          }
        >
          <Save className="w-3.5 h-3.5" />
          Save Changes
        </button>
        {!DEFAULT_CONFIGS.find(d => d.key === item.key) && (
          <button
            onClick={() => onDelete(item.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30', border: '1px solid rgba(255,59,48,0.2)' }}
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default function HomepageCMS() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['homepage_config'],
    queryFn: () => base44.entities.HomepageConfig.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (item) =>
      item.id
        ? base44.entities.HomepageConfig.update(item.id, item)
        : base44.entities.HomepageConfig.create(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage_config'] });
      toast({ title: 'Saved!', description: 'Homepage config updated.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HomepageConfig.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['homepage_config'] }),
  });

  // Merge: defaults + any saved overrides
  const merged = DEFAULT_CONFIGS.map(def => {
    const saved = configs.find(c => c.key === def.key);
    return saved ? { ...def, ...saved } : { ...def };
  });
  // Plus any custom ones not in defaults
  const extras = configs.filter(c => !DEFAULT_CONFIGS.find(d => d.key === c.key));
  const allItems = [...merged, ...extras];

  const handleSave = (item) => {
    saveMutation.mutate(item);
  };

  return (
    <div className="min-h-screen dot-bg" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-10"
        style={{ background: 'rgba(13,21,23,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(59,74,66,0.15)' }}
      >
        <Link to="/admin" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
        </Link>
        <div>
          <h1 className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>Homepage CMS</h1>
          <p className="text-xs" style={{ color: '#bacbc0' }}>Edit videos, promo cards & copy</p>
        </div>
        <Link
          to="/"
          className="ml-auto px-4 py-2 rounded-full text-xs font-bold"
          style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.25)' }}
        >
          Preview Home →
        </Link>
      </div>

      <div className="px-5 py-6 flex flex-col gap-4">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: '#192123' }} />
          ))
        ) : (
          allItems.map(item => (
            <ConfigCard
              key={item.key}
              item={item}
              onSave={handleSave}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))
        )}

        <p className="text-center text-xs pb-8" style={{ color: 'rgba(186,203,192,0.35)' }}>
          Changes go live instantly on the homepage
        </p>
      </div>
    </div>
  );
}