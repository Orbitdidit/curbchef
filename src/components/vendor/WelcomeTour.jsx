import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

const STEPS = [
  { id: 'welcome', type: 'modal' },
  { id: 'go-live',      type: 'spotlight', targetId: 'tour-go-live' },
  { id: 'curb-drops',   type: 'spotlight', targetId: 'tour-curb-drops' },
  { id: 'hours',        type: 'spotlight', targetId: 'tour-hours' },
  { id: 'orders',       type: 'spotlight', targetId: 'tour-orders' },
  { id: 'done',         type: 'modal' },
];

const STEP_CONTENT = {
  welcome: {
    title: null, // filled dynamically
    body: "Let's show you the 5 features that'll grow your business fastest. Takes 30 seconds.",
  },
  'go-live': {
    title: '📹 GO LIVE — Free advertising',
    body: 'Tap this to record a 60-sec clip of your truck. Customers nearby see you in their LIVE feed instantly.',
  },
  'curb-drops': {
    title: '🎟️ CURB DROPS — Move slow inventory',
    body: 'Got 20 brisket sandwiches left at 2pm? Drop a deal. 200 nearby phones get notified. Sells out fast.',
  },
  hours: {
    title: '⏰ KEEP YOUR HOURS — Build trust',
    body: "Set your real hours and stick to them. Reliable trucks get featured higher. Late opens hurt your score.",
  },
  orders: {
    title: '📦 ORDER QUEUE — Listen for the chime',
    body: 'When a customer orders, you\'ll hear a chime and see them here. Move them through New → Preparing → Ready.',
  },
  done: {
    title: "You're all set! 🚐💚",
    body: 'Hit the streets and let customers find you. Welcome to the family.',
    sub: 'Got questions? Tap the help icon anytime.',
  },
};

function useElementRect(targetId, step) {
  const [rect, setRect] = useState(null);
  useEffect(() => {
    if (!targetId) { setRect(null); return; }
    const el = document.getElementById(targetId);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    // Scroll element into view if needed
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [targetId, step]);
  return rect;
}

function SpotlightOverlay({ rect, onNext, onBack, onSkip, stepIndex, totalSteps, content }) {
  const PAD = 16;
  const spotTop    = rect ? rect.top - PAD : 0;
  const spotLeft   = rect ? rect.left - PAD : 0;
  const spotW      = rect ? rect.width + PAD * 2 : 0;
  const spotH      = rect ? rect.height + PAD * 2 : 0;
  const spotCenterX = spotLeft + spotW / 2;
  const spotCenterY = spotTop + spotH / 2;

  // Tooltip: place above or below based on space
  const tooltipBelow = spotTop > window.innerHeight * 0.5;
  const tooltipTop = tooltipBelow
    ? spotTop - 180
    : spotTop + spotH + 12;

  return (
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: 'auto' }}>
      {/* Dark overlay with SVG cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={spotLeft} y={spotTop}
                width={spotW} height={spotH}
                rx={16} ry={16}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%" height="100%"
          fill="rgba(0,0,0,0.82)"
          mask="url(#spotlight-mask)"
        />
        {/* Mint green glow border around spotlight */}
        {rect && (
          <rect
            x={spotLeft} y={spotTop}
            width={spotW} height={spotH}
            rx={16} ry={16}
            fill="none"
            stroke="#77ffc8"
            strokeWidth="2"
            style={{ filter: 'drop-shadow(0 0 8px rgba(119,255,200,0.6))' }}
          />
        )}
      </svg>

      {/* Tooltip card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute left-4 right-4 rounded-3xl p-5"
        style={{
          top: Math.max(12, Math.min(tooltipTop, window.innerHeight - 220)),
          background: '#151d1f',
          border: '1px solid rgba(119,255,200,0.2)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          zIndex: 10,
        }}
      >
        {/* Step counter */}
        <p className="text-[10px] font-black tracking-widest mb-2" style={{ color: '#77ffc8' }}>
          {stepIndex} OF {totalSteps - 2}
        </p>
        <p className="font-heading font-black text-base leading-snug mb-2" style={{ color: '#dff0e8' }}>
          {content.title}
        </p>
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#bacbc0' }}>
          {content.body}
        </p>
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full"
            style={{ background: '#192123', color: '#bacbc0' }}>
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <button onClick={onSkip} className="text-xs" style={{ color: '#6B665C' }}>Skip tour</button>
          <button onClick={onNext} className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-full"
            style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
            Next <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ModalStep({ content, onNext, onSkip, isLast, firstName, stepIndex, totalSteps }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="w-full max-w-sm rounded-3xl p-7 text-center"
        style={{
          background: '#151d1f',
          border: '1px solid rgba(119,255,200,0.2)',
          boxShadow: '0 0 60px rgba(119,255,200,0.1), 0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        {isLast ? (
          <>
            <div className="text-5xl mb-4">🚐</div>
            <p className="font-heading font-black text-2xl mb-3" style={{ color: '#dff0e8' }}>{content.title}</p>
            <p className="text-sm leading-relaxed mb-2" style={{ color: '#bacbc0' }}>{content.body}</p>
            {content.sub && <p className="text-xs mb-6" style={{ color: '#6B665C' }}>{content.sub}</p>}
            <button onClick={onNext}
              className="w-full py-4 rounded-full font-heading font-black text-base"
              style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 24px rgba(119,255,200,0.35)' }}>
              Let's Go! 🚀
            </button>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <p className="font-heading font-black text-2xl mb-3" style={{ color: '#dff0e8' }}>
              Welcome to CurbChef, {firstName}!
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#bacbc0' }}>
              {content.body}
            </p>
            <button onClick={onNext}
              className="w-full py-4 rounded-full font-heading font-black text-base mb-3"
              style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 24px rgba(119,255,200,0.35)' }}>
              Start Tour →
            </button>
            <button onClick={onSkip} className="text-sm" style={{ color: '#6B665C' }}>
              Skip for now
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function WelcomeTour({ user, profile, onComplete }) {
  const [step, setStep] = useState(0);
  const qc = useQueryClient();

  const currentStep = STEPS[step];
  const rect = useElementRect(
    currentStep.type === 'spotlight' ? currentStep.targetId : null,
    step
  );

  const firstName = user?.full_name?.split(' ')[0] || 'Chef';

  const completeTour = async () => {
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { tour_completed: true });
    } else if (user?.email) {
      await base44.entities.UserProfile.create({ user_email: user.email, tour_completed: true });
    }
    qc.invalidateQueries({ queryKey: ['user-profile-tour', user?.email] });
    onComplete();
  };

  const handleNext = () => {
    if (step >= STEPS.length - 1) {
      completeTour();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => setStep(s => Math.max(0, s - 1));
  const handleSkip = () => completeTour();

  const content = { ...STEP_CONTENT[currentStep.id] };
  if (currentStep.id === 'welcome') {
    content.title = `Welcome to CurbChef, ${firstName}! 🎉`;
  }

  return (
    <AnimatePresence mode="wait">
      {currentStep.type === 'modal' ? (
        <ModalStep
          key={currentStep.id}
          content={content}
          onNext={handleNext}
          onSkip={handleSkip}
          isLast={currentStep.id === 'done'}
          firstName={firstName}
          stepIndex={step}
          totalSteps={STEPS.length}
        />
      ) : (
        <SpotlightOverlay
          key={currentStep.id}
          rect={rect}
          content={content}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
          stepIndex={step}
          totalSteps={STEPS.length}
        />
      )}
    </AnimatePresence>
  );
}