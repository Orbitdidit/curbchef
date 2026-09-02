import React, { useState } from 'react';
import { X, Zap, Upload } from'lucide-react';
import { base44 } from'@/api/base44Client';
import { useQueryClient } from'@tanstack/react-query';

const DURATIONS = [
  { label:'30 min', value: 30 },
  { label:'1 hour', value: 60 },
  { label:'90 min', value: 90 },
];

export default function CreateCurbDropModal({ truck, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title:'',
    description:'',
    deal_price:'',
    original_price:'',
    duration: 60,
    max_claims: 20,
    image_url:'',
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const tokens = truck.drop_tokens ?? 0;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('image_url', file_url);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.deal_price) { setError('Title and deal price are required.'); return; }
    if (tokens < 1) { setError('No drop tokens remaining. Upgrade your plan or wait until Monday.'); return; }

    setSubmitting(true);
    const expiresAt = new Date(Date.now() + form.duration * 60 * 1000).toISOString();

    await base44.entities.CurbDrop.create({
      truck_id: truck.id,
      truck_name: truck.name,
      title: form.title,
      description: form.description,
      deal_price: parseFloat(form.deal_price),
      original_price: form.original_price ? parseFloat(form.original_price) : undefined,
      image_url: form.image_url,
      expires_at: expiresAt,
      max_claims: parseInt(form.max_claims),
      current_claims: 0,
      radius_miles: 1,
      is_active: true,
    });

    // Deduct 1 token
    await base44.entities.FoodTruck.update(truck.id, {
      drop_tokens: Math.max(0, tokens - 1),
    });

    qc.invalidateQueries({ queryKey: ['vendor-truck'] });
    qc.invalidateQueries({ queryKey: ['curb-drops'] });
    qc.invalidateQueries({ queryKey: ['curb-drops-home'] });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)' }}>
      <div className="w-full max-w-lg rounded-t-3xl flex flex-col max-h-[92vh] overflow-y-auto"
        style={{ background: 'var(--cc-bg-1)', border:'1px solid rgba(var(--cc-line-rgb),0.4)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 sticky top-0 z-10"
          style={{ background: 'var(--cc-bg-1)', borderBottom:'1px solid rgba(var(--cc-line-rgb),0.2)' }}>
          <div>
            <p className="font-display text-lg" style={{ color: 'var(--cc-ink)' }}> New Curb Drop</p>
            <p className="text-xs mt-0.5" style={{ color: tokens < 1 ? 'var(--cc-warm)':'var(--cc-ink-dim)'}}>
              {tokens < 1 ?' No tokens left — drops reset Monday': `${tokens} token${tokens !== 1 ?'s':''} remaining`}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--cc-bg-3)' }}>
            <X className="w-4 h-4" style={{ color: 'var(--cc-ink-dim)' }} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest mb-1.5" style={{ color: 'var(--cc-ink-dim)'}}>DROP TITLE *</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder='e.g. "$5 Brisket Tacos (Today Only!)"'
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: 'var(--cc-bg-0)', color:'var(--cc-ink)', border:'1px solid rgba(var(--cc-line-rgb),0.4)' }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest mb-1.5" style={{ color: 'var(--cc-ink-dim)'}}>DESCRIPTION</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="What makes this drop special?"rows={2}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
              style={{ background: 'var(--cc-bg-0)', color:'var(--cc-ink)', border:'1px solid rgba(var(--cc-line-rgb),0.4)' }}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold tracking-widest mb-1.5" style={{ color: 'var(--cc-ink-dim)' }}>DEAL PRICE *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm" style={{ color: 'var(--cc-warm)' }}>$</span>
                <input type="number"min="0"step="0.01"
                  value={form.deal_price}
                  onChange={e => set('deal_price', e.target.value)}
                  placeholder="5.00"className="w-full rounded-xl pl-7 pr-4 py-3 text-sm outline-none"
                  style={{ background: 'var(--cc-bg-0)', color:'var(--cc-ink)', border:'1px solid rgba(var(--cc-warm-rgb),0.3)' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest mb-1.5" style={{ color: 'var(--cc-ink-dim)' }}>ORIGINAL PRICE</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm" style={{ color: 'var(--cc-ink-dim)' }}>$</span>
                <input type="number"min="0"step="0.01"
                  value={form.original_price}
                  onChange={e => set('original_price', e.target.value)}
                  placeholder="12.00"className="w-full rounded-xl pl-7 pr-4 py-3 text-sm outline-none"
                  style={{ background: 'var(--cc-bg-0)', color:'var(--cc-ink)', border:'1px solid rgba(var(--cc-line-rgb),0.4)' }}
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--cc-ink-dim)' }}>DROP DURATION</label>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button key={d.value} onClick={() => set('duration', d.value)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={form.duration === d.value
                    ? { background: 'linear-gradient(135deg,var(--cc-warm),var(--cc-warm-3))', color:'#fff'}
                    : { background:'var(--cc-bg-0)', color:'var(--cc-ink-dim)', border:'1px solid rgba(var(--cc-line-rgb),0.3)' }
                  }>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max Claims */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest mb-1.5" style={{ color: 'var(--cc-ink-dim)' }}>MAX CLAIMS</label>
            <div className="flex gap-2">
              {[10, 20, 50, 100].map(n => (
                <button key={n} onClick={() => set('max_claims', n)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={form.max_claims === n
                    ? { background: 'rgba(var(--cc-accent-rgb),0.15)', color:'var(--cc-accent)', border:'1px solid rgba(var(--cc-accent-rgb),0.35)'}
                    : { background:'var(--cc-bg-0)', color:'var(--cc-ink-dim)', border:'1px solid rgba(var(--cc-line-rgb),0.3)' }
                  }>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest mb-1.5" style={{ color: 'var(--cc-ink-dim)' }}>PHOTO (optional)</label>
            {form.image_url ? (
              <div className="relative rounded-2xl overflow-hidden" style={{ height: '120px' }}>
                <img src={form.image_url} alt="drop"className="w-full h-full object-cover" />
                <button onClick={() => set('image_url','')}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(13,21,23,0.8)' }}>
                  <X className="w-3.5 h-3.5" style={{ color: '#fff' }} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 py-6 rounded-2xl cursor-pointer"
                style={{ background: 'var(--cc-bg-0)', border:'2px dashed rgba(var(--cc-line-rgb),0.4)' }}>
                <Upload className="w-5 h-5" style={{ color: 'var(--cc-ink-dim)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--cc-ink-dim)'}}>
                  {uploading ?'Uploading...':'Tap to upload'}
                </span>
                <input type="file"accept="image/*"className="hidden"onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>

          {error && <p className="text-sm font-bold" style={{ color: 'var(--cc-warm)' }}>{error}</p>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || tokens < 1}
            className="w-full py-4 rounded-2xl font-display text-base transition-all active:scale-95 flex items-center justify-center gap-2"
            style={tokens < 1
              ? { background: 'var(--cc-bg-3)', color:'var(--cc-ink-dim)', opacity: 0.5 }
              : { background:'linear-gradient(135deg,var(--cc-warm),var(--cc-warm-3))', color:'#fff', boxShadow:'0 0 20px rgba(var(--cc-warm-rgb),0.4)' }
            }>
            <Zap className="w-5 h-5" />
            {submitting ? 'Launching Drop...': tokens < 1 ?'No Tokens Left':'Launch Drop — 1 Token'}
          </button>
        </div>
      </div>
    </div>
  );
}