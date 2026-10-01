import React from 'react';
import { useAssistant } from './AssistantContext';
import { Sparkles, ChevronRight } from 'lucide-react';

export default function AssistantHomeCard() {
  const { setOpen, reset } = useAssistant();

  const handleTap = () => {
    reset();
    setOpen(true);
  };

  return (
    <button
      onClick={handleTap}
      className="w-full text-left rounded-3xl p-5 bg-discovery-surface border border-discovery-line text-discovery-ink"
    >
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-discovery-amber" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-discovery-muted">A little help choosing</span>
      </div>
      <p className="font-heading font-extrabold text-2xl tracking-tight">What should I eat?</p>
      <p className="text-sm leading-relaxed text-discovery-muted mt-2 mb-5">Tell us your craving. We’ll help find your next great bite.</p>
      <span className="flex items-center justify-between text-sm font-bold text-discovery-amber border-t border-discovery-line pt-4">Find my flavor <ChevronRight className="w-5 h-5" /></span>
    </button>
  );
}