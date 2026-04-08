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
      className="w-full text-left rounded-3xl overflow-hidden active:scale-[0.98] transition-transform"
      style={{
        background: 'linear-gradient(135deg, rgba(119,255,200,0.08) 0%, rgba(0,230,167,0.04) 100%)',
        border: '1px solid rgba(119,255,200,0.2)',
      }}
    >
      <div className="flex items-center gap-4 p-5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg,#77ffc8,#00e6a7)',
            boxShadow: '0 0 16px rgba(119,255,200,0.35)',
          }}
        >
          <Sparkles className="w-6 h-6" style={{ color: '#003826' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-black text-base leading-tight" style={{ color: '#dff0e8' }}>
            What should I eat?
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>
            Tell us your craving and we'll find your best match.
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(119,255,200,0.12)' }}
        >
          <ChevronRight className="w-5 h-5" style={{ color: '#77ffc8' }} />
        </div>
      </div>
      <div className="px-5 pb-4">
        <div
          className="w-full py-2.5 rounded-full text-center font-heading font-black text-sm"
          style={{
            background: 'linear-gradient(135deg,#77ffc8,#00e6a7)',
            color: '#003826',
            boxShadow: '0 0 12px rgba(119,255,200,0.25)',
          }}
        >
          Get Picks
        </div>
      </div>
    </button>
  );
}