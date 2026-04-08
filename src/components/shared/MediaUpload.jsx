import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, X, Image, Video, RefreshCw } from 'lucide-react';

/**
 * MediaUpload — drop-in replacement for URL input fields
 * Props:
 *   value       — current URL (string)
 *   onChange    — (url) => void
 *   type        — 'image' | 'video' | 'any'  (default 'any')
 *   label       — field label
 *   hint        — spec hint text (dimensions, formats, etc.)
 *   aspectHint  — e.g. '16:9 landscape'
 */
export default function MediaUpload({ value, onChange, type = 'any', label, hint, aspectHint }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const accept = type === 'image'
    ? 'image/jpeg,image/png,image/webp,image/gif'
    : type === 'video'
    ? 'video/mp4,video/webm,video/quicktime'
    : 'image/*,video/mp4,video/webm,image/gif';

  const handleFile = async (file) => {
    if (!file) return;
    const maxMB = type === 'video' ? 500 : 20;
    if (file.size > maxMB * 1024 * 1024) {
      setError(`File too large — max ${maxMB}MB`);
      return;
    }
    setError('');
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const isVideo = value && (value.includes('.mp4') || value.includes('.webm') || value.includes('.mov') || value.includes('video'));

  return (
    <div>
      {label && (
        <label className="block text-[10px] font-bold tracking-wider mb-1" style={{ color: '#bacbc0' }}>
          {label.toUpperCase()}
        </label>
      )}

      {/* Spec hint */}
      {hint && (
        <p className="text-[10px] mb-2 leading-relaxed" style={{ color: 'rgba(186,203,192,0.55)' }}>
          {aspectHint && <span className="font-bold" style={{ color: '#77ffc8' }}>{aspectHint} · </span>}
          {hint}
        </p>
      )}

      {value ? (
        /* Preview */
        <div className="relative rounded-xl overflow-hidden mb-2" style={{ background: '#0d1517' }}>
          {isVideo ? (
            <video src={value} className="w-full max-h-48 object-cover" controls muted playsInline />
          ) : (
            <img src={value} alt="preview" className="w-full max-h-48 object-cover" />
          )}
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              onClick={() => inputRef.current?.click()}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(13,21,23,0.85)', backdropFilter: 'blur(8px)' }}
              title="Replace"
            >
              <RefreshCw className="w-3.5 h-3.5" style={{ color: '#77ffc8' }} />
            </button>
            <button
              onClick={() => onChange('')}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(13,21,23,0.85)', backdropFilter: 'blur(8px)' }}
              title="Remove"
            >
              <X className="w-3.5 h-3.5" style={{ color: '#ff3b30' }} />
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all"
          style={{
            background: '#0d1517',
            border: '2px dashed rgba(119,255,200,0.2)',
            minHeight: '96px',
            padding: '20px',
          }}
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
          ) : (
            <>
              {type === 'video' ? <Video className="w-6 h-6" style={{ color: '#77ffc8' }} /> : <Image className="w-6 h-6" style={{ color: '#77ffc8' }} />}
              <p className="text-xs font-semibold" style={{ color: '#bacbc0' }}>
                Tap to upload {type === 'video' ? 'video' : type === 'image' ? 'image' : 'media'}
              </p>
              <p className="text-[10px]" style={{ color: 'rgba(186,203,192,0.4)' }}>or drag & drop</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-[10px] mt-1" style={{ color: '#ff3b30' }}>{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => handleFile(e.target.files[0])}
      />
    </div>
  );
}