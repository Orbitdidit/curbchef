import React, { useState } from 'react';
import { Clock, Plus } from 'lucide-react';

/**
 * Vendor "Today's Hours" section on the dashboard.
 * Shows open/close time pickers and +15min / +30min / +1hr extend buttons.
 */
export default function TodaysHours({ truck, onUpdate }) {
  const [saving, setSaving] = useState(false);

  const open = truck.scheduled_open_time || '';
  const close = truck.scheduled_close_time || '';

  const handleChange = async (field, value) => {
    setSaving(true);
    await onUpdate({ [field]: value });
    setSaving(false);
  };

  const extendClose = async (addMins) => {
    if (!close) return;
    const [h, m] = close.split(':').map(Number);
    const total = h * 60 + m + addMins;
    const newH = Math.floor(total / 60) % 24;
    const newM = total % 60;
    const newVal = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    setSaving(true);
    await onUpdate({ scheduled_close_time: newVal });
    setSaving(false);
  };

  const fmt12 = (timeStr) => {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="mb-5 p-4 rounded-2xl" style={{ background: '#192123', border: '1px solid rgba(119,255,200,0.1)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4" style={{ color: '#77ffc8' }} />
        <p className="text-[10px] font-bold tracking-widest" style={{ color: '#77ffc8' }}>TODAY'S HOURS</p>
        {saving && <span className="text-[10px]" style={{ color: '#bacbc0' }}>Saving...</span>}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Open time */}
        <div>
          <label className="block text-[10px] font-bold mb-1.5" style={{ color: '#bacbc0' }}>OPENS AT</label>
          <input
            type="time"
            value={open}
            onChange={e => handleChange('scheduled_open_time', e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm font-bold outline-none"
            style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)', colorScheme: 'dark' }}
          />
          {open && (
            <p className="text-[10px] mt-1 font-semibold" style={{ color: '#77ffc8' }}>{fmt12(open)}</p>
          )}
        </div>

        {/* Close time */}
        <div>
          <label className="block text-[10px] font-bold mb-1.5" style={{ color: '#bacbc0' }}>CLOSES AT</label>
          <input
            type="time"
            value={close}
            onChange={e => handleChange('scheduled_close_time', e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm font-bold outline-none"
            style={{ background: '#0d1517', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.4)', colorScheme: 'dark' }}
          />
          {close && (
            <p className="text-[10px] mt-1 font-semibold" style={{ color: '#77ffc8' }}>{fmt12(close)}</p>
          )}
        </div>
      </div>

      {/* Extend close time buttons */}
      <div>
        <p className="text-[10px] font-bold mb-2" style={{ color: 'rgba(186,203,192,0.6)' }}>EXTEND CLOSE TIME</p>
        <div className="flex gap-2">
          {[
            { label: '+15 min', mins: 15 },
            { label: '+30 min', mins: 30 },
            { label: '+1 hr', mins: 60 },
          ].map(({ label, mins }) => (
            <button
              key={label}
              onClick={() => extendClose(mins)}
              disabled={!close || saving}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-black transition-all active:scale-95"
              style={close
                ? { background: 'rgba(119,255,200,0.08)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.2)' }
                : { background: '#192123', color: '#bacbc0', opacity: 0.4 }
              }
            >
              <Plus className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
        {!close && (
          <p className="text-[10px] mt-2" style={{ color: 'rgba(186,203,192,0.4)' }}>Set a close time to enable quick-extend</p>
        )}
      </div>
    </div>
  );
}