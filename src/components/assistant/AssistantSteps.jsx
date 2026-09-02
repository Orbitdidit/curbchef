import React from 'react';
import { useAssistant } from './AssistantContext';
import { ChevronLeft } from 'lucide-react';

const STEPS = [
  {
    key: 'craving',
    question: 'What are you craving?',
    sub: 'Pick a vibe, we\'ll do the rest.',
    options: [
      { value: 'tacos', label: 'Tacos' },
      { value: 'burgers', label: 'Burgers' },
      { value: 'bbq', label: 'BBQ' },
      { value: 'seafood', label: 'Seafood' },
      { value: 'asian', label: 'Asian' },
      { value: 'healthy', label: 'Healthy' },
      { value: 'sweet', label: 'Sweet' },
      { value: 'pizza', label: 'Pizza' },
      { value: 'surprise', label: 'Surprise me' },
    ],
  },
  {
    key: 'spice',
    question: 'How spicy?',
    sub: 'Set your heat level.',
    options: [
      { value: 'mild', label: 'Mild' },
      { value: 'medium', label: 'Medium' },
      { value: 'hot', label: 'Hot' },
      { value: 'fire', label: 'Fire' },
    ],
  },
  {
    key: 'budget',
    question: 'What\'s your budget?',
    sub: 'Per item range.',
    options: [
      { value: 'cheap', label: 'Under $8' },
      { value: 'medium', label: '$8–$15' },
      { value: 'splurge', label: '$15+' },
    ],
  },
  {
    key: 'distance',
    question: 'How far will you go?',
    sub: 'From your current location.',
    options: [
      { value: 'close', label: 'Walking', hint: 'Under 1 mi' },
      { value: 'nearby', label: 'Short drive', hint: 'Under 3 mi' },
      { value: 'anywhere', label: 'Anywhere', hint: 'No limit' },
    ],
  },
  {
    key: 'mealType',
    question: 'Quick bite or full meal?',
    sub: 'Last one, we promise.',
    options: [
      { value: 'quick', label: 'Quick bite' },
      { value: 'full', label: 'Full meal' },
      { value: 'either', label: 'Either' },
    ],
  },
];

export default function AssistantSteps() {
  const { state, setAnswer, goBack } = useAssistant();
  const step = STEPS[state.step];

  if (!step) return null;

  // When the spice step is auto-skipped, the counter shouldn't jump 1/5 → 3/5.
  const total = state.spiceSkipped ? STEPS.length - 1 : STEPS.length;
  const current = state.spiceSkipped && state.step > 1 ? state.step : state.step + 1;
  const progress = (current / total) * 100;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-4">
          {state.step > 0 && (
            <button onClick={goBack} aria-label="Back"
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--cc-bg-3)' }}>
              <ChevronLeft className="w-4 h-4" style={{ color: 'var(--cc-ink)' }} />
            </button>
          )}
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--cc-bg-3)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'var(--cc-accent)' }} />
          </div>
          <span className="cc-eyebrow" style={{ letterSpacing: '0.08em' }}>
            {current}/{total}
          </span>
        </div>

        <h2 className="font-display text-2xl leading-none" style={{ color: 'var(--cc-ink)' }}>
          {step.question}
        </h2>
        <p className="text-xs mt-1.5 mb-5" style={{ color: 'var(--cc-ink-muted)' }}>{step.sub}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className={`grid gap-2.5 ${step.options.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {step.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setAnswer(step.key, opt.value)}
              className="flex flex-col items-center justify-center gap-0.5 py-4 px-3 rounded-2xl text-center transition-all active:scale-95"
              style={{
                background: 'var(--cc-bg-2)',
                border: '1px solid rgba(var(--cc-line-rgb),0.25)',
                minHeight: '66px',
              }}
            >
              <span className="font-display text-base leading-none" style={{ color: 'var(--cc-ink)' }}>
                {opt.label}
              </span>
              {opt.hint && (
                <span className="cc-eyebrow" style={{ fontSize: '8px' }}>{opt.hint}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
