import React from 'react';
import { useAssistant } from './AssistantContext';
import { Sparkles } from 'lucide-react';

export default function AssistantFAB() {
  const { setOpen, reset } = useAssistant();

  const handleTap = () => {
    reset();
    setOpen(true);
  };

  return (
    <button
      onClick={handleTap}
      className="fixed z-50 w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-transform"
      style={{
        bottom: 'calc(6.5rem + env(safe-area-inset-bottom))',
        right: '1rem',
        background: 'linear-gradient(135deg, #77ffc8 0%, #00e6a7 100%)',
        boxShadow: '0 0 20px rgba(119,255,200,0.45), 0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <Sparkles className="w-6 h-6" style={{ color: '#003826' }} />
    </button>
  );
}