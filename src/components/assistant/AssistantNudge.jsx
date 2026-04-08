import React from 'react';
import { useAssistant } from './AssistantContext';
import { Sparkles } from 'lucide-react';

export default function AssistantNudge() {
  const { setOpen, reset } = useAssistant();

  return (
    <button
      onClick={() => { reset(); setOpen(true); }}
      className="flex items-center gap-2 px-5 py-3 rounded-full mx-auto active:scale-95 transition-transform"
      style={{
        background: 'rgba(119,255,200,0.08)',
        border: '1px solid rgba(119,255,200,0.2)',
      }}
    >
      <Sparkles className="w-4 h-4" style={{ color: '#77ffc8' }} />
      <span className="text-sm font-bold" style={{ color: '#77ffc8' }}>
        Need help choosing?
      </span>
    </button>
  );
}