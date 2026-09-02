import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, X, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const CUISINES = ['tacos','burgers','bbq','seafood','asian','fusion','desserts','vegan','pizza','soul_food'];

export default function AdminQuickAddTruck() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: '', owner_email: '', cuisine_type: 'tacos', city: 'Houston', description: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.name || !form.owner_email) return;
    setSaving(true);
    await base44.entities.FoodTruck.create({
      ...form,
      owner_email: (form.owner_email || '').trim().toLowerCase(),
      status: 'closed',
      is_live: false,
      is_approved: true,
      stripe_onboarding_status: 'not_connected',
      followers_count: 0,
      total_orders: 0,
      total_revenue: 0,
    });
    qc.invalidateQueries({ queryKey: ['admin-trucks'] });
    setSaving(false);
    setDone(true);
    setTimeout(() => { setDone(false); setOpen(false); setForm({ name: '', owner_email: '', cuisine_type: 'tacos', city: 'Houston', description: '' }); }, 1500);
  };

  const inputStyle = {
    background: 'var(--cc-bg-0)', color: 'var(--cc-ink)',
    border: '1px solid rgba(var(--cc-line-rgb),0.35)',
    width: '100%', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', outline: 'none',
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
        style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color: 'var(--cc-accent-deep)' }}
      >
        <Plus className="w-3.5 h-3.5" /> Quick Add Truck
      </button>

      {/* Overlay */}
      {open && (
        <>
          <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(8,15,17,0.75)', backdropFilter: 'blur(6px)' }} onClick={() => setOpen(false)} />
          <div
            className="fixed inset-x-4 z-[101] rounded-3xl p-5 flex flex-col gap-4"
            style={{ background: 'var(--cc-bg-1)', border: '1px solid rgba(var(--cc-line-rgb),0.3)', top: '50%', transform: 'translateY(-50%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading font-bold text-sm" style={{ color: 'var(--cc-ink)' }}>Quick Add Truck</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--cc-ink-dim)' }}>Admin-created · vendor will connect Stripe later</p>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--cc-bg-2)' }}>
                <X className="w-4 h-4" style={{ color: 'var(--cc-ink-dim)' }} />
              </button>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-wide mb-1" style={{ color: 'var(--cc-ink-dim)' }}>TRUCK NAME *</p>
                <input placeholder="e.g. Smoke & Soul BBQ" value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wide mb-1" style={{ color: 'var(--cc-ink-dim)' }}>VENDOR EMAIL * <span style={{ color: 'var(--cc-accent)' }}>(they'll manage this truck)</span></p>
                <input type="email" placeholder="vendor@email.com" value={form.owner_email} onChange={e => set('owner_email', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wide mb-1.5" style={{ color: 'var(--cc-ink-dim)' }}>CUISINE TYPE</p>
                <div className="flex flex-wrap gap-1.5">
                  {CUISINES.map(c => (
                    <button key={c} onClick={() => set('cuisine_type', c)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold capitalize transition-all"
                      style={form.cuisine_type === c
                        ? { background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color: 'var(--cc-accent-deep)' }
                        : { background: 'var(--cc-bg-2)', color: 'var(--cc-ink-dim)', border: '1px solid rgba(var(--cc-line-rgb),0.25)' }
                      }>
                      {c.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wide mb-1" style={{ color: 'var(--cc-ink-dim)' }}>CITY</p>
                <input placeholder="Houston" value={form.city} onChange={e => set('city', e.target.value)} style={inputStyle} />
              </div>
            </div>

            <p className="text-[10px]" style={{ color: 'var(--cc-ink-dim)' }}>
              ✓ Truck will be auto-approved. Vendor logs in with <strong style={{ color: 'var(--cc-accent)' }}>{form.owner_email || '...'}</strong> to access their dashboard and connect Stripe.
            </p>

            <button
              onClick={handleCreate}
              disabled={!form.name || !form.owner_email || saving || done}
              className="w-full py-3.5 rounded-full font-heading font-black text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: done ? 'rgba(var(--cc-accent-rgb),0.1)' : 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))',
                color: done ? 'var(--cc-accent)' : 'var(--cc-accent-deep)',
                opacity: (!form.name || !form.owner_email) ? 0.5 : 1,
              }}
            >
              {done ? <><Check className="w-4 h-4" /> Created!</> : saving ? 'Creating...' : 'Create Truck'}
            </button>
          </div>
        </>
      )}
    </>
  );
}