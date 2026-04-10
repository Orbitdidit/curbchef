import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, Upload, Zap, Flame, Leaf, Beef, Wheat, Droplets, AlertCircle, TrendingUp } from 'lucide-react';

function MacroBar({ label, value, max, color, icon: Icon }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3" style={{ color }} />
          <span className="text-xs font-bold" style={{ color: '#bacbc0' }}>{label}</span>
        </div>
        <span className="text-xs font-black" style={{ color }}>{value}g</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#2e3638' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}60` }} />
      </div>
    </div>
  );
}

function ConfidenceRing({ pct }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? '#77ffc8' : pct >= 50 ? '#fbbf24' : '#fd591e';
  return (
    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} stroke="#2e3638" strokeWidth="5" fill="none" />
        <circle cx="32" cy="32" r={r} stroke={color} strokeWidth="5" fill="none"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-heading font-black text-sm" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}

export default function FoodScan() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const { data: trucks = [] } = useQuery({
    queryKey: ['trucks-scan'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }),
  });

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setResult(null);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(false);

    // Analyze
    setAnalyzing(true);
    const res = await base44.functions.invoke('analyzeFoodImage', { image_url: file_url });
    setAnalyzing(false);
    setResult(res.data);
  };

  // Find nearby trucks matching cuisine type
  const matchedTrucks = result?.cuisine_type
    ? trucks.filter(t => t.cuisine_type === result.cuisine_type && t.status === 'open').slice(0, 3)
    : [];
  // Fallback to any open trucks  
  const suggestedTrucks = matchedTrucks.length > 0
    ? matchedTrucks
    : trucks.filter(t => t.status === 'open' && (t.cuisine_type === 'vegan' || t.cuisine_type === 'fusion')).slice(0, 3);

  const healthColor = result
    ? result.health_score >= 7 ? '#77ffc8' : result.health_score >= 4 ? '#fbbf24' : '#fd591e'
    : '#bacbc0';

  return (
    <div className="min-h-screen pb-32" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-10"
        style={{ background: 'rgba(13,21,23,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.15)' }}>
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
        </button>
        <div>
          <h1 className="font-heading font-black text-lg" style={{ color: '#dff0e8' }}>Food Scan</h1>
          <p className="text-xs" style={{ color: '#bacbc0' }}>AI-powered calorie & macro analysis</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(119,255,200,0.1)', border: '1px solid rgba(119,255,200,0.2)' }}>
          <Zap className="w-3 h-3" style={{ color: '#77ffc8' }} />
          <span className="text-[10px] font-black" style={{ color: '#77ffc8' }}>AI</span>
        </div>
      </div>

      <div className="px-5 pt-6 flex flex-col gap-5">

        {/* Upload area */}
        <div>
          {preview ? (
            <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <img src={preview} alt="food" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(13,21,23,0.8) 100%)' }} />
              {(uploading || analyzing) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  style={{ background: 'rgba(13,21,23,0.7)', backdropFilter: 'blur(8px)' }}>
                  <div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: '#77ffc8 transparent transparent transparent', borderWidth: 3 }} />
                  <p className="font-heading font-bold text-sm" style={{ color: '#77ffc8' }}>
                    {uploading ? 'Uploading...' : 'Analyzing with AI...'}
                  </p>
                </div>
              )}
              {/* Replace button */}
              <button onClick={() => { setPreview(null); setResult(null); }}
                className="absolute bottom-3 right-3 px-4 py-2 rounded-full text-xs font-black"
                style={{ background: 'rgba(13,21,23,0.85)', color: '#bacbc0', backdropFilter: 'blur(8px)' }}>
                Try another →
              </button>
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()}
              className="rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all"
              style={{ aspectRatio: '4/3', background: '#192123', border: '2px dashed rgba(119,255,200,0.2)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(119,255,200,0.08)', border: '1px solid rgba(119,255,200,0.15)' }}>
                <Camera className="w-7 h-7" style={{ color: '#77ffc8' }} />
              </div>
              <div className="text-center">
                <p className="font-heading font-bold text-base mb-1" style={{ color: '#dff0e8' }}>Scan Your Food</p>
                <p className="text-sm" style={{ color: '#bacbc0' }}>Take a photo or upload from gallery</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(186,203,192,0.4)' }}>AI detects food type + estimates calories & macros</p>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full"
                style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}>
                <Upload className="w-4 h-4" style={{ color: '#003826' }} />
                <span className="font-heading font-black text-sm" style={{ color: '#003826' }}>Choose Photo</span>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-2xl" style={{ background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#ff3b30' }} />
            <p className="text-sm" style={{ color: '#ff3b30' }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && !analyzing && (
          <>
            {/* Food name + confidence */}
            <div className="flex items-center gap-4 p-5 rounded-3xl"
              style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
              <ConfidenceRing pct={result.confidence} />
              <div className="flex-1">
                <p className="font-heading font-black text-xl leading-tight" style={{ color: '#dff0e8' }}>{result.food_name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>{result.portion_size}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: result.confidence >= 75 ? 'rgba(119,255,200,0.12)' : 'rgba(251,191,36,0.12)', color: result.confidence >= 75 ? '#77ffc8' : '#fbbf24' }}>
                    {result.confidence >= 75 ? 'HIGH CONFIDENCE' : result.confidence >= 50 ? 'MODERATE' : 'LOW CONFIDENCE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Calorie spotlight */}
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col items-center justify-center py-5 rounded-3xl"
                style={{ background: 'linear-gradient(135deg,rgba(253,89,30,0.12),rgba(253,89,30,0.06))', border: '1px solid rgba(253,89,30,0.2)' }}>
                <Flame className="w-6 h-6 mb-1" style={{ color: '#fd591e' }} />
                <p className="font-heading font-black text-4xl" style={{ color: '#fd591e' }}>{result.calories}</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: 'rgba(186,203,192,0.6)' }}>CALORIES</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-5 rounded-3xl"
                style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
                <TrendingUp className="w-6 h-6 mb-1" style={{ color: healthColor }} />
                <p className="font-heading font-black text-4xl" style={{ color: healthColor }}>{result.health_score}<span className="text-lg">/10</span></p>
                <p className="text-xs font-bold mt-0.5" style={{ color: 'rgba(186,203,192,0.6)' }}>HEALTH SCORE</p>
              </div>
            </div>

            {/* Macros */}
            <div className="p-5 rounded-3xl flex flex-col gap-4"
              style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
              <p className="text-[10px] font-black tracking-widest" style={{ color: 'rgba(186,203,192,0.5)' }}>MACROS BREAKDOWN</p>
              <MacroBar label="Protein" value={result.macros?.protein_g || 0} max={60} color="#77ffc8" icon={Beef} />
              <MacroBar label="Carbs" value={result.macros?.carbs_g || 0} max={100} color="#fbbf24" icon={Wheat} />
              <MacroBar label="Fat" value={result.macros?.fat_g || 0} max={60} color="#fd591e" icon={Droplets} />
              <MacroBar label="Fiber" value={result.macros?.fiber_g || 0} max={30} color="#77ffc8" icon={Leaf} />
            </div>

            {/* Health notes */}
            {result.health_notes && (
              <div className="p-4 rounded-2xl flex items-start gap-3"
                style={{ background: 'rgba(119,255,200,0.06)', border: '1px solid rgba(119,255,200,0.12)' }}>
                <Leaf className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#77ffc8' }} />
                <p className="text-sm leading-relaxed" style={{ color: '#bacbc0' }}>{result.health_notes}</p>
              </div>
            )}

            {/* Healthier alternatives */}
            {result.healthier_alternatives?.length > 0 && (
              <div className="p-5 rounded-3xl" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
                <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: 'rgba(186,203,192,0.5)' }}>HEALTHIER ALTERNATIVES</p>
                <div className="flex flex-col gap-2">
                  {result.healthier_alternatives.map((alt, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                        style={{ background: 'rgba(119,255,200,0.1)' }}>
                        {['🥗', '🍱', '🥙'][i] || '🍽️'}
                      </div>
                      <p className="text-sm" style={{ color: '#bacbc0' }}>{alt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby trucks suggestion */}
            {suggestedTrucks.length > 0 && (
              <div className="p-5 rounded-3xl" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
                <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: 'rgba(186,203,192,0.5)' }}>
                  FIND SOMETHING SIMILAR NEARBY
                </p>
                <div className="flex flex-col gap-3">
                  {suggestedTrucks.map(truck => (
                    <Link key={truck.id} to={`/truck/${truck.id}`}
                      className="flex items-center gap-3 p-3 rounded-2xl"
                      style={{ background: '#0d1517', border: '1px solid rgba(59,74,66,0.15)' }}>
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#2e3638' }}>
                        {truck.image_url
                          ? <img src={truck.image_url} alt={truck.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xl">🚚</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-black text-sm truncate" style={{ color: '#dff0e8' }}>{truck.name}</p>
                        <p className="text-xs capitalize" style={{ color: '#bacbc0' }}>{truck.cuisine_type?.replace('_', ' ')}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(119,255,200,0.12)', color: '#77ffc8' }}>OPEN</span>
                        <span className="text-[10px]" style={{ color: '#bacbc0' }}>⭐ {truck.rating?.toFixed(1) || '4.9'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty state prompt */}
        {!preview && !result && (
          <div className="text-center py-4">
            <p className="text-xs" style={{ color: 'rgba(186,203,192,0.4)' }}>Supports all food types · Works with meals, snacks & drinks</p>
          </div>
        )}
      </div>
    </div>
  );
}