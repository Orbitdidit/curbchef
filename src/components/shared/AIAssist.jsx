import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, ChevronDown } from 'lucide-react';

const ACTIONS = [
  { id: 'headline', label: 'Suggest Headline' },
  { id: 'rewrite', label: 'Rewrite Copy' },
  { id: 'shorten', label: 'Shorten' },
  { id: 'exciting', label: 'Make More Exciting' },
  { id: 'premium', label: 'Make It Premium' },
  { id: 'houston', label: 'Houston Vibe 🤠' },
  { id: 'promo', label: 'Food Truck Promo Style' },
];

const PROMPTS = {
  headline: (t, ctx) => `Generate a punchy, exciting headline for a food truck app. Context: "${ctx || t}". Max 8 words. Return only the headline text.`,
  rewrite: (t) => `Rewrite this copy for a premium food truck app in a bold, energetic style: "${t}". Return only the rewritten text.`,
  shorten: (t) => `Shorten this to under 10 words while keeping the energy: "${t}". Return only the shortened text.`,
  exciting: (t) => `Make this more exciting and high-energy for a food truck app: "${t}". Return only the text.`,
  premium: (t) => `Rewrite this to sound premium and aspirational for an upscale food truck experience: "${t}". Return only the text.`,
  houston: (t) => `Rewrite this with Houston street food culture energy. Make it feel local and authentic: "${t}". Return only the text.`,
  promo: (t) => `Rewrite as a food truck promo: punchy, urgent, mouth-watering. Context: "${t}". Return only the promo text.`,
};

/**
 * AIAssist — shows a sparkle button next to any text field
 * Props:
 *   value       — current text value
 *   context     — optional extra context (e.g. truck name, food type)
 *   onApply     — (newText) => void
 */
export default function AIAssist({ value, context, onApply }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null); // action id

  const handleAction = async (action) => {
    if (!value && !context) return;
    setLoading(action.id);
    setOpen(false);
    try {
      const prompt = PROMPTS[action.id](value || '', context || '');
      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      onApply(result.trim());
    } catch (e) {
      // fail silently
    }
    setLoading(null);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        disabled={!!loading}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all"
        style={{
          background: loading ? 'rgba(119,255,200,0.06)' : 'rgba(119,255,200,0.1)',
          color: '#77ffc8',
          border: '1px solid rgba(119,255,200,0.2)',
        }}
      >
        {loading ? (
          <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
        ) : (
          <Sparkles className="w-3 h-3" />
        )}
        {loading ? 'Writing...' : 'AI Assist'}
        {!loading && <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-50 rounded-2xl overflow-hidden shadow-xl"
            style={{ background: '#192123', border: '1px solid rgba(119,255,200,0.2)', minWidth: '180px' }}
          >
            {ACTIONS.map(action => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold transition-all hover:bg-white/5"
                style={{ color: '#dff0e8' }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}