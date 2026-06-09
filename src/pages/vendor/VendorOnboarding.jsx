// TODO v2: Add multilingual support — Spanish + Simplified Chinese minimum.
// Many Houston truck owners speak Spanish or Mandarin/Cantonese as a first language.

import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import OnboardingStep1Basics from '@/components/vendor/onboarding/OnboardingStep1Basics';
import OnboardingStep2Photos from '@/components/vendor/onboarding/OnboardingStep2Photos';
import OnboardingStep3Location from '@/components/vendor/onboarding/OnboardingStep3Location';
import OnboardingStep4Menu from '@/components/vendor/onboarding/OnboardingStep4Menu';
import OnboardingStep5Payments from '@/components/vendor/onboarding/OnboardingStep5Payments';
import OnboardingStep6Extras from '@/components/vendor/onboarding/OnboardingStep6Extras';
import OnboardingStep7Review from '@/components/vendor/onboarding/OnboardingStep7Review';
import OnboardingAssistantPanel from '@/components/vendor/onboarding/OnboardingAssistantPanel';

const STEPS = [
  { id: 1, label: 'Basics', required: true },
  { id: 2, label: 'Photos', required: true },
  { id: 3, label: 'Location & Hours', required: true },
  { id: 4, label: 'Menu', required: true },
  { id: 5, label: 'Get Paid', required: false },
  { id: 6, label: 'Extras', required: false },
  { id: 7, label: 'Go Live!', required: false },
];

export default function VendorOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [truck, setTruck] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssistant, setShowAssistant] = useState(false);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      const trucks = await base44.entities.FoodTruck.filter({ owner_email: me.email });
      if (trucks.length > 0) {
        const t = trucks[0];
        setTruck(t);
        const items = await base44.entities.MenuItem.filter({ truck_id: t.id });
        setMenuItems(items);
        if (t.onboarding_step && t.onboarding_step > 1) setStep(t.onboarding_step);
      }
      setLoading(false);
    };
    init();
  }, []);

  const saveTruck = useCallback(async (updates) => {
    if (!truck?.id) return;
    setTruck(prev => ({ ...prev, ...updates }));
    await base44.entities.FoodTruck.update(truck.id, updates);
  }, [truck]);

  const goNext = () => {
    const next = Math.min(step + 1, STEPS.length);
    setStep(next);
    saveTruck({ onboarding_step: next });
    window.scrollTo(0, 0);
  };

  const goPrev = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleComplete = async () => {
    await saveTruck({ onboarding_completed: true });
    navigate('/vendor');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1517' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#0d1517' }}>
        <div className="text-5xl mb-4">🚚</div>
        <p className="font-heading font-black text-xl mb-2" style={{ color: '#dff0e8' }}>No truck found</p>
        <p className="text-sm mb-6" style={{ color: '#bacbc0' }}>Ask your CurbChef contact to link your account to a truck.</p>
        <button onClick={() => navigate('/vendor-portal')}
          className="px-6 py-3 rounded-full font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
          Go to Vendor Portal
        </button>
      </div>
    );
  }

  const pct = Math.round(((step - 1) / STEPS.length) * 100);
  const currentStepInfo = STEPS[step - 1];
  const stepProps = { truck, saveTruck, menuItems, setMenuItems, onNext: goNext, onPrev: goPrev };

  return (
    <div className="min-h-screen pb-32" style={{ background: '#0d1517' }}>
      {/* Sticky header with progress */}
      <div className="sticky top-0 z-20 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4"
        style={{ background: 'rgba(13,21,23,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(59,74,66,0.2)' }}>
        <div className="flex items-center gap-3 mb-3 max-w-lg mx-auto">
          {step > 1 && (
            <button onClick={goPrev} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#192123' }}>
              <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
            </button>
          )}
          <div className="flex-1">
            <p className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>Set Up Your Truck 🚚</p>
            <p className="text-xs" style={{ color: '#bacbc0' }}>
              Step {step} of {STEPS.length} · {pct}% complete
              {!currentStepInfo.required && <span style={{ color: '#6B665C' }}> · Optional</span>}
            </p>
          </div>
          <button onClick={() => setShowAssistant(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.2)' }}>
            <MessageCircle className="w-3.5 h-3.5" /> Help
          </button>
        </div>

        {/* Progress bar */}
        <div className="max-w-lg mx-auto">
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#192123' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#77ffc8,#00e6a7)', boxShadow: '0 0 6px rgba(119,255,200,0.4)' }} />
          </div>
          <div className="flex justify-between mt-2 px-0.5">
            {STEPS.map(s => (
              <button key={s.id} onClick={() => { setStep(s.id); window.scrollTo(0, 0); }}>
                <div className="w-3 h-3 rounded-full transition-all"
                  style={{
                    background: s.id < step ? '#77ffc8' : s.id === step ? '#00f5d4' : '#2e3638',
                    boxShadow: s.id === step ? '0 0 6px rgba(119,255,200,0.6)' : 'none',
                  }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="px-5 pt-6 max-w-lg mx-auto">
        {step === 1 && <OnboardingStep1Basics {...stepProps} />}
        {step === 2 && <OnboardingStep2Photos {...stepProps} />}
        {step === 3 && <OnboardingStep3Location {...stepProps} />}
        {step === 4 && <OnboardingStep4Menu {...stepProps} />}
        {step === 5 && <OnboardingStep5Payments {...stepProps} />}
        {step === 6 && <OnboardingStep6Extras {...stepProps} />}
        {step === 7 && <OnboardingStep7Review {...stepProps} onComplete={handleComplete} />}
      </div>

      {/* Bottom nav — only for steps 1–6 */}
      {step < 7 && (
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3"
          style={{ background: 'rgba(13,21,23,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(59,74,66,0.2)' }}>
          <div className="flex gap-3 max-w-lg mx-auto">
            {!currentStepInfo.required && (
              <button onClick={goNext}
                className="flex-1 py-3.5 rounded-full text-sm font-semibold"
                style={{ background: '#192123', color: '#bacbc0' }}>
                Skip for now
              </button>
            )}
            <button onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-heading font-black text-sm"
              style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 16px rgba(119,255,200,0.3)' }}>
              {step === 6 ? 'Review & Launch' : 'Save & Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* AI assistant side panel */}
      {showAssistant && (
        <OnboardingAssistantPanel truck={truck} currentStep={step} onClose={() => setShowAssistant(false)} />
      )}
    </div>
  );
}