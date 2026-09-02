import React from 'react';

const CUISINE_OPTIONS = ['tacos','burgers','bbq','seafood','asian','fusion','desserts','vegan','pizza','soul_food','cajun-fusion','grilled-fusion','mediterranean','fusion-sliders'];

const VENDOR_TYPES = [
  { id:'food_truck', label:'Food Truck' },
  { id:'food_trailer', label:'Food Trailer' },
  { id:'licensed_popup', label:'Licensed Pop-up / Tent' },
  { id:'caterer_commercial', label:'Caterer / Commercial Kitchen' },
  { id:'cottage_goods', label:'Cottage Goods' },
];

export default function OnboardingStep1Basics({ truck, saveTruck }) {
  const update = (field) => (e) => saveTruck({ [field]: e.target.value });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-display text-xl mb-1" style={{ color: 'var(--cc-ink)' }}>Tell us about your truck</p>
        <p className="text-sm" style={{ color: 'var(--cc-ink-dim)' }}>This is how customers will find and remember you.</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold" style={{ color: 'var(--cc-accent)'}}>Truck Name *</label>
        <input defaultValue={truck?.name ||''} onBlur={update('name')} placeholder="e.g. El Fuego Tacos" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ background: 'var(--cc-bg-2)', color:'var(--cc-ink)', border:'1px solid rgba(var(--cc-line-rgb),0.5)' }} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold" style={{ color: 'var(--cc-accent)' }}>Vendor Type *</label>
        <div className="flex flex-col gap-2">
          {VENDOR_TYPES.map(vt => (
            <button key={vt.id} onClick={() => saveTruck({ vendor_type: vt.id })}
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all"
              style={truck?.vendor_type === vt.id
                ? { background: 'rgba(var(--cc-accent-rgb),0.12)', color:'var(--cc-accent)', border:'1px solid rgba(var(--cc-accent-rgb),0.35)'}
                : { background:'var(--cc-bg-2)', color:'var(--cc-ink-dim)', border:'1px solid rgba(var(--cc-line-rgb),0.4)' }}>
              {vt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold" style={{ color: 'var(--cc-accent)' }}>Cuisine Type *</label>
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map(c => (
            <button key={c} onClick={() => saveTruck({ cuisine_type: c })}
              className="px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all"
              style={truck?.cuisine_type === c
                ? { background: 'rgba(var(--cc-accent-rgb),0.15)', color:'var(--cc-accent)', border:'1px solid rgba(var(--cc-accent-rgb),0.4)'}
                : { background:'var(--cc-bg-2)', color:'var(--cc-ink-dim)', border:'1px solid rgba(var(--cc-line-rgb),0.4)'}}>
              {c.replace(/-/g,' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold" style={{ color: 'var(--cc-accent)'}}>Description</label>
        <textarea defaultValue={truck?.description ||''} onBlur={update('description')}
          rows={3} placeholder="Tell customers what makes your food special…" className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
          style={{ background: 'var(--cc-bg-2)', color:'var(--cc-ink)', border:'1px solid rgba(var(--cc-line-rgb),0.5)' }} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold" style={{ color: 'var(--cc-accent)' }}>Phone Number</label>
        <input type="tel" defaultValue={truck?.phone || ''} onBlur={update('phone')} placeholder="(713) 555-0100" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ background: 'var(--cc-bg-2)', color:'var(--cc-ink)', border:'1px solid rgba(var(--cc-line-rgb),0.5)' }} />
      </div>
    </div>
  );
}