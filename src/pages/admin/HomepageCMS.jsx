import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronLeft, Save, Trash2, Video, Image, Star, Truck, Plus, Pencil, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import MediaUpload from '@/components/shared/MediaUpload';
import AIAssist from '@/components/shared/AIAssist';

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
  { key: 'promo_card_1', label: 'Promo Card #1 (Rewards)', image_url: '', headline: 'Earn points on every pickup', subline: 'Unlock discounts, freebies, and VIP drops', cta_label: 'Start Earning', cta_href: '/rewards', is_active: true },
  { key: 'promo_card_2', label: 'Promo Card #2 (Vendor)', image_url: '', headline: 'Get discovered. Get paid.', subline: 'Go live and reach hungry customers nearby', cta_label: 'Apply Now', cta_href: '/vendor', is_active: true },
];

function TextFieldWithAI({ label, value, onChange, multiline, context }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] font-bold tracking-wider" style={{ color: '#bacbc0' }}>
          {label.toUpperCase()}
        </label>
        <AIAssist value={value} context={context} onApply={onChange} />
      </div>
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          rows={2}
          className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
          style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl px-3 py-2 text-sm outline-none"
          style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }}
        />
      )}
    </div>
  );
}

function ConfigCard({ item, onSave, onDelete }) {
  const [form, setForm] = useState(item);
  useEffect(() => { setForm(item); }, [item.id, item.video_url, item.image_url, item.poster_url]);
  const Icon = SECTION_ICONS[item.key] || Truck;
  const isDirty = JSON.stringify(form) !== JSON.stringify(item);
  const isVideo = item.key.includes('video');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="rounded-2xl p-5" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}>
      {/* Card header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(119,255,200,0.1)', border: '1px solid rgba(119,255,200,0.2)' }}>
          <Icon className="w-4 h-4" style={{ color: '#77ffc8' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>{item.label}</p>
          <p className="text-[10px] font-mono" style={{ color: '#bacbc0' }}>{item.key}</p>
        </div>
        <button
          onClick={() => set('is_active', !form.is_active)}
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={form.is_active
            ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.3)' }
            : { background: '#2e3638', color: '#bacbc0' }
          }
        >
          {form.is_active ? 'Active' : 'Hidden'}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Media uploads */}
        {isVideo ? (
          <>
            <MediaUpload
              type="video"
              label="Video"
              value={form.video_url}
              onChange={v => set('video_url', v)}
              aspectHint="16:9 landscape"
              hint="MP4 or WebM recommended · Max 100MB · Center crop-safe zone"
            />
            <MediaUpload
              type="image"
              label="Poster / Fallback Image"
              value={form.poster_url}
              onChange={v => set('poster_url', v)}
              aspectHint="1920×1080"
              hint="JPEG or PNG · Max 10MB · Shown while video loads"
            />
          </>
        ) : (
          <MediaUpload
            type="image"
            label="Promo Image"
            value={form.image_url}
            onChange={v => set('image_url', v)}
            aspectHint="4:3 or 16:9"
            hint="JPEG, PNG or GIF · Max 10MB · Keep key content centered"
          />
        )}

        {/* Text fields with AI */}
        <TextFieldWithAI
          label="Headline"
          value={form.headline}
          onChange={v => set('headline', v)}
          multiline
          context={item.label}
        />
        <TextFieldWithAI
          label="Sub-copy"
          value={form.subline}
          onChange={v => set('subline', v)}
          multiline
          context={item.label}
        />
        <div>
          <label className="block text-[10px] font-bold tracking-wider mb-1" style={{ color: '#bacbc0' }}>CTA BUTTON TEXT</label>
          <input type="text" value={form.cta_label || ''} onChange={e => set('cta_label', e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }} />
        </div>
        <div>
          <label className="block text-[10px] font-bold tracking-wider mb-1" style={{ color: '#bacbc0' }}>CTA LINK</label>
          <input type="text" value={form.cta_href || ''} onChange={e => set('cta_href', e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }} />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-5">
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
          Save
        </button>
        {!DEFAULT_CONFIGS.find(d => d.key === item.key) && (
          <button onClick={() => onDelete(item.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30', border: '1px solid rgba(255,59,48,0.2)' }}>
            <Trash2 className="w-3 h-3" />Delete
          </button>
        )}
      </div>
    </div>
  );
}

function LiveVideosManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newClip, setNewClip] = useState({ title: '', truck_name: '', video_url: '', poster_url: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingClip, setEditingClip] = useState(null);

  const { data: clips = [] } = useQuery({
    queryKey: ['live-clip-videos'],
    queryFn: () => base44.entities.LiveClipVideo.list('sort_order', 20),
  });

  const createClip = useMutation({
    mutationFn: (data) => base44.entities.LiveClipVideo.create({ ...data, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-clip-videos'] });
      setNewClip({ title: '', truck_name: '', video_url: '', poster_url: '' });
      setShowForm(false);
      toast({ title: 'Video added to Live Now!' });
    },
  });

  const deleteClip = useMutation({
    mutationFn: (id) => base44.entities.LiveClipVideo.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['live-clip-videos'] }),
  });

  const toggleClip = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.LiveClipVideo.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['live-clip-videos'] }),
  });

  const updateClip = useMutation({
    mutationFn: ({ id, ...data }) => base44.entities.LiveClipVideo.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-clip-videos'] });
      setEditingClip(null);
      toast({ title: 'Video updated!', duration: 2000 });
    },
  });

  return (
    <div className="rounded-2xl p-5" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.25)' }}>
          <Video className="w-4 h-4" style={{ color: '#ff3b30' }} />
        </div>
        <div className="flex-1">
          <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>Live Now Videos</p>
          <p className="text-[10px]" style={{ color: '#bacbc0' }}>Shown on homepage when no trucks are live · loops silently</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mb-4 p-4 rounded-xl flex flex-col gap-3" style={{ background: '#0d1517', border: '1px solid rgba(119,255,200,0.15)' }}>
          <input placeholder="Title (e.g. 14hr brisket slicing 🔥)" value={newClip.title}
            onChange={e => setNewClip(c => ({ ...c, title: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }} />
          <input placeholder="Truck name" value={newClip.truck_name}
            onChange={e => setNewClip(c => ({ ...c, truck_name: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }} />
          <MediaUpload type="video" label="Video File" value={newClip.video_url}
            onChange={v => setNewClip(c => ({ ...c, video_url: v }))}
            onThumbnailGenerated={t => setNewClip(c => ({ ...c, poster_url: c.poster_url || t }))}
            hint="MP4 recommended · thumbnail auto-generated" />
          <MediaUpload type="image" label="Thumbnail (auto-generated or replace)" value={newClip.poster_url}
            onChange={v => setNewClip(c => ({ ...c, poster_url: v }))}
            hint="Auto-captured from video · tap to replace" />
          <button
            onClick={() => createClip.mutate(newClip)}
            disabled={!newClip.video_url || !newClip.title || createClip.isPending}
            className="py-2.5 rounded-xl font-bold text-sm"
            style={newClip.video_url && newClip.title
              ? { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }
              : { background: '#2e3638', color: '#bacbc0', opacity: 0.5 }}>
            {createClip.isPending ? 'Saving...' : 'Save Video'}
          </button>
        </div>
      )}

      {/* Clip list */}
      {clips.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: '#bacbc0' }}>No videos yet — add one above</p>
      ) : (
        <div className="flex flex-col gap-2">
          {clips.map(clip => (
            <div key={clip.id} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: '#0d1517', border: '1px solid rgba(59,74,66,0.2)' }}>
              {clip.poster_url ? (
                <img src={clip.poster_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: '#192123' }}>🎬</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: '#dff0e8' }}>{clip.title}</p>
                {clip.truck_name && <p className="text-xs truncate" style={{ color: '#bacbc0' }}>{clip.truck_name}</p>}
              </div>
              <button onClick={() => setEditingClip({ ...clip })}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(119,255,200,0.1)' }}>
                <Pencil className="w-3 h-3" style={{ color: '#77ffc8' }} />
              </button>
              <button onClick={() => toggleClip.mutate({ id: clip.id, is_active: !clip.is_active })}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0"
                style={clip.is_active
                  ? { background: 'rgba(119,255,200,0.12)', color: '#77ffc8' }
                  : { background: '#2e3638', color: '#bacbc0' }}>
                {clip.is_active ? 'On' : 'Off'}
              </button>
              <button onClick={() => deleteClip.mutate(clip.id)}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,59,48,0.1)' }}>
                <Trash2 className="w-3 h-3" style={{ color: '#ff3b30' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingClip && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-t-3xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.4)' }}>
            <div className="flex items-center justify-between">
              <p className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>Edit Video</p>
              <button onClick={() => setEditingClip(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#2e3638' }}>
                <X className="w-4 h-4" style={{ color: '#bacbc0' }} />
              </button>
            </div>
            <input placeholder="Title" value={editingClip.title || ''}
              onChange={e => setEditingClip(c => ({ ...c, title: e.target.value }))}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }} />
            <input placeholder="Truck name" value={editingClip.truck_name || ''}
              onChange={e => setEditingClip(c => ({ ...c, truck_name: e.target.value }))}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)' }} />
            <MediaUpload type="video" label="Video File" value={editingClip.video_url}
              onChange={v => setEditingClip(c => ({ ...c, video_url: v }))}
              onThumbnailGenerated={t => setEditingClip(c => ({ ...c, poster_url: c.poster_url || t }))}
              hint="MP4 recommended · thumbnail auto-generated" />
            <MediaUpload type="image" label="Thumbnail (auto-generated or replace)" value={editingClip.poster_url}
              onChange={v => setEditingClip(c => ({ ...c, poster_url: v }))}
              hint="Auto-captured from video · tap to replace" />
            <button
              onClick={() => updateClip.mutate(editingClip)}
              disabled={updateClip.isPending}
              className="py-3 rounded-xl font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
              {updateClip.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
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
      toast({ title: 'Saved!', description: 'Homepage updated.', duration: 2000 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HomepageConfig.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['homepage_config'] }),
  });

  const merged = DEFAULT_CONFIGS.map(def => {
    const saved = configs.find(c => c.key === def.key);
    return saved ? { ...def, ...saved } : { ...def };
  });
  const extras = configs.filter(c => !DEFAULT_CONFIGS.find(d => d.key === c.key));
  const allItems = [...merged, ...extras];

  return (
    <div className="min-h-screen dot-bg" style={{ background: '#0d1517' }}>
      <div
        className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-10"
        style={{ background: 'rgba(13,21,23,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(59,74,66,0.15)' }}
      >
        <Link to="/admin" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
        </Link>
        <div>
          <h1 className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>Homepage CMS</h1>
          <p className="text-xs" style={{ color: '#bacbc0' }}>Upload media · Edit copy · Go live instantly</p>
        </div>
        <Link to="/" className="ml-auto px-4 py-2 rounded-full text-xs font-bold"
          style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.25)' }}>
          Preview →
        </Link>
      </div>

      <div className="px-5 py-6 flex flex-col gap-4">
        {/* Live Now videos manager — always shown first */}
        <LiveVideosManager />

        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: '#192123' }} />)
        ) : (
          allItems.map(item => (
            <ConfigCard key={item.key} item={item}
              onSave={item => saveMutation.mutate(item)}
              onDelete={id => deleteMutation.mutate(id)}
            />
          ))
        )}
        <p className="text-center text-xs pb-8" style={{ color: 'rgba(186,203,192,0.3)' }}>
          Changes go live instantly on the homepage
        </p>
      </div>
    </div>
  );
}