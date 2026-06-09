import React from 'react';

export default function OnboardingStep3Location({ truck, saveTruck }) {
  const update = (field, value) => saveTruck({ [field]: value });

  return (
    <div className="flex flex-col gap-6 pb-4">
      <div>
        <h2 className="font-heading font-black text-2xl mb-1" style={{ color: '#dff0e8' }}>Where do you serve? 📍</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#bacbc0' }}>
          Customers use this to find you. Be as specific as you can — cross streets, parking lots, landmarks.
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold mb-2 tracking-widest" style={{ color: '#77ffc8' }}>YOUR USUAL SPOT *</label>
        <input defaultValue={truck?.address || ''} onBlur={e => update('address', e.target.value)}
          placeholder="e.g. 4500 Washington Ave, Houston TX 77007"
          className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
        <p className="text-xs mt-1.5" style={{ color: '#bacbc0' }}>
          💡 You can update your live location any time from the dashboard before you open.
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold mb-2 tracking-widest" style={{ color: '#77ffc8' }}>CITY</label>
        <input defaultValue={truck?.city || 'Houston'} onBlur={e => update('city', e.target.value)}
          placeholder="Houston"
          className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
      </div>

      <div>
        <label className="block text-xs font-bold mb-2 tracking-widest" style={{ color: '#77ffc8' }}>OPERATING HOURS</label>
        <p className="text-xs mb-3" style={{ color: '#bacbc0' }}>
          Tell customers when to find you. Keep it simple — something like "Tue–Sat · 11am–8pm" works great.
        </p>
        <textarea defaultValue={truck?.operating_hours || ''} onBlur={e => update('operating_hours', e.target.value)}
          placeholder={"Tuesday–Saturday: 11am to 8pm\nSunday: 12pm to 5pm\nClosed Monday"}
          rows={4}
          className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none resize-none"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold mb-2 tracking-widest" style={{ color: '#77ffc8' }}>OPENS AT</label>
          <input type="time" defaultValue={truck?.scheduled_open_time || ''} onBlur={e => update('scheduled_open_time', e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
            style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-2 tracking-widest" style={{ color: '#77ffc8' }}>CLOSES AT</label>
          <input type="time" defaultValue={truck?.scheduled_close_time || ''} onBlur={e => update('scheduled_close_time', e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
            style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }} />
        </div>
      </div>
      <p className="text-xs -mt-3" style={{ color: '#bacbc0' }}>
        These times are used to remind customers when you're about to close and track your reliability score.
      </p>
    </div>
  );
}