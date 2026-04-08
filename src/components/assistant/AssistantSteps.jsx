import React from 'react';
import { useAssistant } from './AssistantContext';
import { ChevronLeft } from 'lucide-react';

const STEPS = [
  {
    key: 'craving',
    question: 'What are you craving?',
    sub: 'Pick a vibe, we\'ll do the rest.',
    options: [
      { value: 'tacos', label: '🌮 Tacos' },
      { value: 'burgers', label: '🍔 Burgers' },
      { value: 'bbq', label: '🔥 BBQ' },
      { value: 'seafood', label: '🦐 Seafood' },
      { value: 'asian', label: '🍜 Asian' },
      { value: 'healthy', label: '🥗 Healthy' },
      { value: 'sweet', label: '🧁 Sweet' },
      { value: 'pizza', label: '🍕 Pizza' },
      { value: 'surprise', label: '🎲 Surprise Me' },
    ],
  },
  {
    key: 'spice',
    question: 'How spicy?',
    sub: 'Set your heat level.',
    options: [
      { value: 'mild', label: '😌 Mild' },
      { value: 'medium', label: '🌶️ Medium' },
      { value: 'hot', label: '🔥 Hot' },
      { value: 'fire', label: '💀 Fire' },
    ],
  },
  {
    key: 'budget',
    question: 'What\'s your budget?',
    sub: 'Per item range.',
    options: [
      { value: 'cheap', label: '💵 Under $8' },
      { value: 'medium', label: '💰 $8–$15' },
      { value: 'splurge', label: '💎 $15+' },
    ],
  },
  {
    key: 'distance',
    question: 'How far will you go?',
    sub: 'From your current location.',
    options: [
      { value: 'close', label: '🚶 Walking (< 1 mi)' },
      { value: 'nearby', label: '🚗 Short drive (< 3 mi)' },
      { value: 'anywhere', label: '🗺️ Anywhere' },
    ],
  },
  {
    key: 'mealType',
    question: 'Quick bite or full meal?',
    sub: 'Last one, we promise.',
    options: [
      { value: 'quick', label: '⚡ Quick bite' },
      { value: 'full', label: '🍽️ Full meal' },
      { value: 'either', label: '🤷 Either' },
    ],
  },
];

export default function AssistantSteps() {
  const { state, setAnswer, goBack } = useAssistant();
  const step = STEPS[state.step];

  if (!step) return null;

  const progress = ((state.step + 1) / STEPS.length) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-4">
          {state.step > 0 && (
            <button onClick={goBack}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#2e3638' }}>
              <ChevronLeft className="w-4 h-4" style={{ color: '#dff0e8' }} />
            </button>
          )}
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#2e3638' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#77ffc8,#00e6a7)' }} />
          </div>
          <span className="text-[10px] font-bold" style={{ color: '#bacbc0' }}>
            {state.step + 1}/{STEPS.length}
          </span>
        </div>

        <h2 className="font-heading font-black text-xl leading-tight" style={{ color: '#dff0e8' }}>
          {step.question}
        </h2>
        <p className="text-xs mt-1 mb-5" style={{ color: '#bacbc0' }}>{step.sub}</p>
      </div>

      {/* Options */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className={`grid gap-2.5 ${step.options.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {step.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setAnswer(step.key, opt.value)}
              className="flex flex-col items-center justify-center gap-1 py-4 px-3 rounded-2xl text-center transition-all active:scale-95"
              style={{
                background: '#192123',
                border: '1px solid rgba(59,74,66,0.25)',
                minHeight: '72px',
              }}
            >
              <span className="text-2xl leading-none">{opt.label.split(' ')[0]}</span>
              <span className="text-xs font-semibold" style={{ color: '#dff0e8' }}>
                {opt.label.split(' ').slice(1).join(' ')}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}