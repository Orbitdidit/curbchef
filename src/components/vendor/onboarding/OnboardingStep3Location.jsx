import React from 'react';

export default function OnboardingStep3Location({ truck, saveTruck }) {
  const update = (field) => (e) => saveTruck({ [field]: e.target.value });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>Location & Hours 📍</h2>
        <p className="text-sm" style={{ color: '#bacbc0' }}>Help customers find you. You can update your live location anytime from the dashboard.</p>
      </div>

      <div>
        <label className="block text-xs font-bold mb-1" style={{ color: '#77ffc8' }}>Street Address</label>
        <input defaultValue={truck?.address} onBlur={update('address')} placeholder="1234 Main St"
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
      </div>

      <div>
        <label className="block text-xs font-bold mb-1" style={{ color: '#77ffc8' }}>City</label>
        <input defaultValue={truck?.city || 'Houston'} onBlur={update('city')} placeholder="Houston"
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
      </div>

      <div>
        <label className="block text-xs font-bold mb-1" style={{ color: '#77ffc8' }}>Operating Hours</label>
        <textarea defaultValue={truck?.operating_hours} onBlur={update('operating_hours')} rows={3}
          placeholder="e.g. Mon–Fri 11am–3pm, Sat 12–8pm"
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: '#77ffc8' }}>Default Open Time</label>
          <input type="time" defaultValue={truck?.scheduled_open_time} onBlur={update('scheduled_open_time')}
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
            style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: '#77ffc8' }}>Default Close Time</label>
          <input type="time" defaultValue={truck?.scheduled_close_time} onBlur={update('scheduled_close_time')}
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
            style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
        </div>
      </div>
    </div>
  );
}