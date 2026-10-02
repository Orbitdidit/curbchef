import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Loader2, ChefHat, RefreshCw } from 'lucide-react';

const tone = s => (s >= 8 ? 'var(--cc-accent)' : s >= 6 ? '#F2BA62' : 'var(--cc-warm)');

/**
 * Photo upload with Chef Coach feedback. Uploads, saves immediately (a usable
 * photo beats none), then asks gradeFoodPhoto for a score and quick fixes.
 */
export default function CoachedPhotoUpload({ label, hint, currentUrl, onUploaded, kind = 'food', itemName = '', compact = false }) {
  const [uploading, setUploading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [grade, setGrade] = useState(null);
  const [error, setError] = useState('');

  const handleFile = async e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(''); setGrade(null); setUploading(true);
    let stage = 'upload';
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await onUploaded(file_url);
      stage = 'grade';
      setUploading(false);
      setGrading(true);
      const res = await base44.functions.invoke('gradeFoodPhoto', { image_url: file_url, kind, item_name: itemName });
      const data = res?.data ?? res;
      if (data?.error) throw new Error(data.error);
      setGrade(data);
    } catch (err) {
      setError(stage === 'upload' ? "That upload didn't go through. Try again." : 'Photo saved. Coach feedback is unavailable right now.');
    } finally {
      setUploading(false); setGrading(false);
    }
  };

  const h = compact ? 96 : 140;

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs font-bold" style={{ color: 'var(--cc-accent)' }}>{label}</label>}
      {hint && <p className="text-xs -mt-1" style={{ color: 'var(--cc-ink-faint)' }}>{hint}</p>}

      <label className="relative flex items-center justify-center rounded-lg cursor-pointer overflow-hidden"
        style={{ background: 'var(--cc-bg-0)', border: currentUrl ? '1px solid rgba(var(--cc-line-rgb),.6)' : '2px dashed rgba(var(--cc-line-rgb),.9)', minHeight: h }}>
        {currentUrl && <img src={currentUrl} alt={label || itemName || 'Uploaded photo'} className="absolute inset-0 w-full h-full object-cover" />}
        {uploading ? (
          <Loader2 className="relative w-6 h-6 animate-spin" style={{ color: 'var(--cc-accent)' }} />
        ) : currentUrl ? (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: 'rgba(12,13,14,.75)', color: 'var(--cc-ink)' }}>
            <RefreshCw className="w-3 h-3" /> Retake
          </span>
        ) : (
          <span className="flex flex-col items-center gap-1.5 py-4">
            <Upload className="w-5 h-5" style={{ color: 'var(--cc-accent)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--cc-ink-dim)' }}>{kind === 'food' ? 'Add a photo' : 'Tap to upload'}</span>
          </span>
        )}
        <input type="file" accept="image/*" capture={kind === 'food' ? 'environment' : undefined} className="hidden" onChange={handleFile} />
      </label>

      {grading && (
        <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--cc-ink-muted)' }}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Chef Coach is looking at your photo…
        </p>
      )}

      {grade && (
        <div className="rounded-lg p-3 flex gap-3" style={{ background: 'var(--cc-bg-2)', border: '1px solid rgba(var(--cc-line-rgb),.6)' }}>
          <div className="flex flex-col items-center shrink-0">
            <span className="font-display text-3xl leading-none" style={{ color: tone(grade.score) }}>{grade.score}</span>
            <span className="cc-eyebrow" style={{ fontSize: 8 }}>/ 10</span>
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--cc-ink)' }}>
              <ChefHat className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--cc-accent)' }} />
              {grade.is_relevant === false ? "Hmm, I can't spot the food here." : grade.verdict}
            </p>
            {grade.tips?.length > 0 && (
              <ul className="mt-1.5 flex flex-col gap-1">
                {grade.tips.map(t => (
                  <li key={t} className="text-xs leading-relaxed" style={{ color: 'var(--cc-ink-dim)' }}>· {t}</li>
                ))}
              </ul>
            )}
            {grade.score < 7 && <p className="text-xs mt-1.5 font-bold" style={{ color: tone(grade.score) }}>Tap the photo to retake it.</p>}
          </div>
        </div>
      )}

      {error && <p className="text-xs" style={{ color: 'var(--cc-warm)' }}>{error}</p>}
    </div>
  );
}
