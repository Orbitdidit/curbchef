import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Loader2 } from 'lucide-react';

function ImageUpload({ label, value, onUpload, hint }) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUpload(file_url);
    setLoading(false);
  };

  return (
    <div>
      <label className="block text-xs font-bold mb-1" style={{ color: '#77ffc8' }}>{label}</label>
      {hint && <p className="text-xs mb-2" style={{ color: '#6B665C' }}>{hint}</p>}
      <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl cursor-pointer transition-all"
        style={{ background: value ? 'transparent' : '#192123', border: `2px dashed ${value ? 'rgba(119,255,200,0.4)' : 'rgba(59,74,66,0.5)'}`, overflow: 'hidden' }}>
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#77ffc8' }} />
        ) : value ? (
          <img src={value} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-6 h-6" style={{ color: '#77ffc8' }} />
            <span className="text-xs font-semibold" style={{ color: '#bacbc0' }}>Tap to upload</span>
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
    </div>
  );
}

export default function OnboardingStep2Photos({ truck, saveTruck }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-black text-xl mb-1" style={{ color: '#dff0e8' }}>Add photos 📸</h2>
        <p className="text-sm" style={{ color: '#bacbc0' }}>Great photos get 3× more clicks. Make it look delicious.</p>
      </div>

      <ImageUpload label="Truck Logo *" value={truck?.image_url}
        hint="Square logo, shown as your avatar on the map"
        onUpload={(url) => saveTruck({ image_url: url })} />

      <ImageUpload label="Cover / Hero Photo *" value={truck?.cover_image_url}
        hint="Wide banner shown at the top of your truck page"
        onUpload={(url) => saveTruck({ cover_image_url: url })} />
    </div>
  );
}