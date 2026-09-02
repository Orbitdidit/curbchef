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
        background: 'rgba(var(--cc-accent-rgb),0.08)',
        border: '1px solid rgba(var(--cc-accent-rgb),0.2)',
      }}
    >
      <Sparkles className="w-4 h-4" style={{ color: 'var(--cc-accent)' }} />
      <span className="text-sm font-bold" style={{ color: 'var(--cc-accent)' }}>
        Need help choosing?
      </span>
    </button>
  );
}