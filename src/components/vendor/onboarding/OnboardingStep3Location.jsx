import React from 'react';

export default function OnboardingStep3Location({ truck, saveTruck }) {
  const update = (field) => (e) => saveTruck({ [field]: e.target.value });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>Where do you operate?</p>
        <p className="text-sm" style={{ color: '#bacbc0' }}>Help customers find you.</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold" style={{ color: '#77ffc8' }}>Street Address</label>
        <input defaultValue={truck?.address || ''} onBlur={update('address')} placeholder="123 Main St"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold" style={{ color: '#77ffc8' }}>City</label>
        <input defaultValue={truck?.city || 'Houston'} onBlur={update('city')} placeholder="Houston"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold" style={{ color: '#77ffc8' }}>Operating Hours</label>
        <p className="text-xs" style={{ color: '#6B665C' }}>e.g. Mon–Fri 11am–8pm, Sat 10am–10pm</p>
        <textarea defaultValue={truck?.operating_hours || ''} onBlur={update('operating_hours')}
          rows={2} placeholder="Mon–Fri 11am–8pm"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold" style={{ color: '#77ffc8' }}>Default Open Time</label>
          <input type="time" defaultValue={truck?.scheduled_open_time || ''} onBlur={update('scheduled_open_time')}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold" style={{ color: '#77ffc8' }}>Default Close Time</label>
          <input type="time" defaultValue={truck?.scheduled_close_time || ''} onBlur={update('scheduled_close_time')}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
        </div>
      </div>
    </div>
  );
}