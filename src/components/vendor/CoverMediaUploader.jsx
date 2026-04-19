import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const MAX_ITEMS = 4;
const ACCEPT = 'image/*,video/mp4,video/webm,.gif';

function detectType(url) {
  if (!url) return 'image';
  const lower = url.toLowerCase();
  if (lower.includes('.gif') || lower.includes('gif')) return 'gif';
  if (lower.includes('.mp4') || lower.includes('.webm') || lower.includes('video')) return 'video';
  return 'image';
}

export default function CoverMediaUploader({ value = [], onChange }) {
  const fileRef = useRef();
  const [uploading, setUploading] = React.useState(false);
  const [dragIdx, setDragIdx] = React.useState(null);
  const [overIdx, setOverIdx] = React.useState(null);

  const handleFiles = async (files) => {
    const remaining = MAX_ITEMS - value.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (!toUpload.length) return;
    setUploading(true);
    const newItems = [];
    for (const file of toUpload) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const type = file.type.startsWith('video') ? 'video' : file.name.endsWith('.gif') ? 'gif' : 'image';
      newItems.push({ type, url: file_url, thumbnail_url: '' });
    }
    onChange([...value, ...newItems]);
    setUploading(false);
  };

  const remove = (idx) => onChange(value.filter((_, i) => i !== idx));

  const onDragStart = (idx) => setDragIdx(idx);
  const onDragOver = (e, idx) => { e.preventDefault(); setOverIdx(idx); };
  const onDrop = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setOverIdx(null); return; }
    const reordered = [...value];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    onChange(reordered);
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-bold tracking-wider" style={{ color: '#bacbc0' }}>
          COVER MEDIA ({value.length}/{MAX_ITEMS}) — images, GIFs, videos
        </label>
        <span className="text-[10px]" style={{ color: 'rgba(186,203,192,0.5)' }}>drag to reorder</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {value.map((item, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={(e) => onDragOver(e, idx)}
            onDrop={(e) => onDrop(e, idx)}
            className="relative rounded-2xl overflow-hidden"
            style={{
              aspectRatio: '16/9',
              border: overIdx === idx ? '2px solid #77ffc8' : '1px solid rgba(59,74,66,0.3)',
              background: '#192123',
              opacity: dragIdx === idx ? 0.5 : 1,
              cursor: 'grab',
            }}
          >
            {item.type === 'video' ? (
              <video src={item.url} className="w-full h-full object-cover" muted playsInline />
            ) : (
              <img src={item.url} alt="" className="w-full h-full object-cover" />
            )}
            {/* Type badge */}
            <span className="absolute bottom-1.5 left-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase"
              style={{ background: 'rgba(13,21,23,0.8)', color: '#77ffc8' }}>
              {item.type}
            </span>
            {/* Drag handle */}
            <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(13,21,23,0.7)' }}>
              <GripVertical className="w-3 h-3" style={{ color: '#bacbc0' }} />
            </div>
            {/* Remove */}
            <button onClick={() => remove(idx)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,59,48,0.85)' }}>
              <Trash2 className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {/* Add slot */}
        {value.length < MAX_ITEMS && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="relative rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
            style={{
              aspectRatio: '16/9',
              border: '2px dashed rgba(119,255,200,0.25)',
              background: 'rgba(119,255,200,0.03)',
              color: '#77ffc8',
            }}
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-bold">Add Media</span>
              </>
            )}
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept={ACCEPT} multiple className="hidden"
        onChange={e => handleFiles(e.target.files)} />

      <p className="text-[10px] mt-2" style={{ color: 'rgba(186,203,192,0.5)' }}>
        Supports JPG, PNG, GIF, MP4, WebM · Max 4 items
      </p>
    </div>
  );
}