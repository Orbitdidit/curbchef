import React from 'react';

const CUISINE_TYPES = [
  'tacos','burgers','bbq','seafood','asian','fusion','desserts','vegan','pizza','soul_food','cajun-fusion','grilled-fusion','mediterranean','fusion-sliders'
];

const VENDOR_TYPES = [
  { value: 'food_truck', label: 'Food Truck' },
  { value: 'food_trailer', label: 'Food Trailer' },
  { value: 'licensed_popup', label: 'Licensed Pop-Up' },
  { value: 'caterer_commercial', label: 'Caterer / Commercial Kitchen' },
  { value: 'cottage_goods', label: 'Cottage Goods' },
];

export default function OnboardingStep1Basics({ truck, saveTruck }) {
  const update = (field) => (e) => saveTruck({ [field]: e.target.value });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>Tell us about your truck 🚚</h2>
        <p className="text-sm" style={{ color: '#bacbc0' }}>Basic info that customers will see on your profile.</p>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold mb-1" style={{ color: '#77ffc8' }}>Truck Name *</label>
        <input defaultValue={truck?.name} onBlur={update('name')} placeholder="e.g. Big Mama's Tacos"
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold mb-1" style={{ color: '#77ffc8' }}>Vendor Type *</label>
        <select defaultValue={truck?.vendor_type || 'food_truck'} onBlur={update('vendor_type')}
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }}>
          {VENDOR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold mb-1" style={{ color: '#77ffc8' }}>Cuisine Type *</label>
        <select defaultValue={truck?.cuisine_type} onBlur={update('cuisine_type')}
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none capitalize"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }}>
          <option value="">Select cuisine…</option>
          {CUISINE_TYPES.map(c => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold mb-1" style={{ color: '#77ffc8' }}>Short Description</label>
        <textarea defaultValue={truck?.description} onBlur={update('description')} rows={3}
          placeholder="What makes your truck special? (shown on your profile)"
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold mb-1" style={{ color: '#77ffc8' }}>Phone Number</label>
        <input defaultValue={truck?.phone} onBlur={update('phone')} placeholder="(713) 555-0000" type="tel"
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
      </div>
    </div>
  );
}