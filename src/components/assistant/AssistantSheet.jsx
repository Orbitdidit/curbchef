import React, { useEffect } from 'react';
import { useAssistant } from './AssistantContext';
import { useUserLocation } from '@/lib/geoUtils';
import { getRecommendations } from './assistantEngine';
import AssistantSteps from './AssistantSteps';
import AssistantResults from './AssistantResults';
import AssistantLoading from './AssistantLoading';
import { X, Sparkles } from 'lucide-react';

export default function AssistantSheet() {
  const { state, open, setOpen, setResults, setLoading, reset } = useAssistant();
  const { lat, lng } = useUserLocation();

  // Trigger recommendation engine when all answers are collected (step === 5 and no results yet)
  useEffect(() => {
    if (state.step === 5 && !state.results && !state.loading) {
      setLoading(true);
      getRecommendations(state.answers, lat, lng)
        .then(setResults)
        .catch(() => setResults([]));
    }
  }, [state.step, state.results, state.loading]);

  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/60" onClick={handleClose} />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[61] flex justify-center"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div
          className="w-full max-w-lg rounded-t-3xl overflow-hidden flex flex-col"
          style={{
            background: '#0d1517',
            border: '1px solid rgba(59,74,66,0.3)',
            borderBottom: 'none',
            maxHeight: '85dvh',
            minHeight: '50dvh',
          }}
        >
          {/* Handle + header */}
          <div className="flex flex-col items-center pt-3 px-5 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full mb-3" style={{ background: '#2e3638' }} />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)' }}>
                  <Sparkles className="w-4 h-4" style={{ color: '#003826' }} />
                </div>
                <span className="font-heading font-black text-sm" style={{ color: '#77ffc8' }}>
                  What Should I Eat?
                </span>
              </div>
              <button onClick={handleClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: '#2e3638' }}>
                <X className="w-4 h-4" style={{ color: '#bacbc0' }} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {state.loading ? (
              <AssistantLoading />
            ) : state.step < 5 ? (
              <AssistantSteps />
            ) : (
              <AssistantResults />
            )}
          </div>
        </div>
      </div>
    </>
  );
}