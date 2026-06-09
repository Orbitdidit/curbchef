import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Loader2 } from 'lucide-react';

function ImageUploader({ label, hint, currentUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUploaded(file_url);
    setUploading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold" style={{ color: '#77ffc8' }}>{label}</label>
      {hint && <p className="text-xs" style={{ color: '#6B665C' }}>{hint}</p>}
      <label className="relative flex flex-col items-center justify-center rounded-2xl cursor-pointer overflow-hidden"
        style={{ background: '#192123', border: '2px dashed rgba(59,74,66,0.5)', minHeight: 120 }}>
        {currentUrl ? (
          <img src={currentUrl} alt={label} className="w-full h-full object-cover absolute inset-0" style={{ minHeight: 120 }} />
        ) : uploading ? (
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#77ffc8' }} />
        ) : (
          <div className="flex flex-col items-center gap-2 py-6">
            <Upload className="w-5 h-5" style={{ color: '#77ffc8' }} />
            <span className="text-xs font-semibold" style={{ color: '#bacbc0' }}>Tap to upload</span>
          </div>
        )}
        {currentUrl && !uploading && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <Upload className="w-5 h-5 text-white" />
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
    </div>
  );
}

export default function OnboardingStep2Photos({ truck, saveTruck }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>Add your photos</p>
        <p className="text-sm" style={{ color: '#bacbc0' }}>Great photos get 3× more taps. Show off your brand!</p>
      </div>

      <ImageUploader
        label="Truck Logo *"
        hint="Square image works best (min 400×400)"
        currentUrl={truck?.image_url}
        onUploaded={(url) => saveTruck({ image_url: url })}
      />
      <ImageUploader
        label="Truck / Banner Photo *"
        hint="Wide shot of your truck (min 800×400)"
        currentUrl={truck?.cover_image_url}
        onUploaded={(url) => saveTruck({ cover_image_url: url })}
      />
    </div>
  );
}