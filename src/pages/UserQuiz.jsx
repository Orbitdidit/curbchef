import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const STEPS = [
  {
    key: 'favorite_foods',
    question: "What's your go-to street food?",
    multi: true,
    options: ['🌮 Tacos', '🍔 Burgers', '🔥 BBQ', '🍣 Asian', '🍕 Pizza', '🥗 Vegan', '🦞 Seafood', '🍰 Desserts'],
  },
  {
    key: 'spice_level',
    question: 'How do you handle heat?',
    multi: false,
    options: ['😊 Mild', '🌶 Medium', '🔥 Hot', '💀 Fire'],
    values: ['mild', 'medium', 'hot', 'fire'],
  },
  {
    key: 'vibe',
    question: "What's your vibe?",
    multi: false,
    options: ['⚡ Quick Bite', '🌙 Late Night', '🥦 Healthy', '🍲 Comfort Food'],
    values: ['quick_bite', 'late_night', 'healthy', 'comfort'],
  },
  {
    key: 'max_distance_miles',
    question: 'How far will you go for good food?',
    multi: false,
    options: ['🚶 1 mile', '🚗 3 miles', '🛻 5 miles', '🗺️ Anywhere'],
    values: [1, 3, 5, 50],
  },
  {
    key: 'notifications_enabled',
    question: 'Want live alerts when trucks are near?',
    multi: false,
    options: ['🔔 Yes, notify me!', '🔕 No thanks'],
    values: [true, false],
  },
];

export default function UserQuiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);

  const current = STEPS[step];

  const select = (optionIndex, optionLabel) => {
    const val = current.values ? current.values[optionIndex] : optionLabel.replace(/^.{2}\s/, '');
    if (current.multi) {
      const prev = answers[current.key] || [];
      const exists = prev.includes(val);
      setAnswers(a => ({ ...a, [current.key]: exists ? prev.filter(v => v !== val) : [...prev, val] }));
    } else {
      setAnswers(a => ({ ...a, [current.key]: val }));
      setTimeout(() => {
        if (step < STEPS.length - 1) setStep(s => s + 1);
      }, 300);
    }
  };

  const isSelected = (optionIndex, optionLabel) => {
    const val = current.values ? current.values[optionIndex] : optionLabel.replace(/^.{2}\s/, '');
    if (current.multi) return (answers[current.key] || []).includes(val);
    return answers[current.key] === val;
  };

  const handleFinish = async () => {
    setSaving(true);
    const user = await base44.auth.me();
    const existing = await base44.entities.UserProfile.filter({ user_email: user.email });
    const data = { ...answers, user_email: user.email, quiz_completed: true };
    if (existing.length > 0) await base44.entities.UserProfile.update(existing[0].id, data);
    else await base44.entities.UserProfile.create(data);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cc-bg-0)' }}>
      {/* Progress */}
      <div className="h-1 w-full" style={{ background: 'var(--cc-bg-2)' }}>
        <div className="h-full transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: 'linear-gradient(90deg,var(--cc-accent),var(--cc-accent-3))' }} />
      </div>

      <div className="flex-1 flex flex-col px-5 pt-[max(3rem,env(safe-area-inset-top))] pb-12">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))' }}>
            <span className="text-xs font-black" style={{ color: 'var(--cc-accent-deep)' }}>CC</span>
          </div>
          <span className="font-display text-sm" style={{ color: 'var(--cc-accent)' }}>CurbChef</span>
          <span className="ml-auto text-xs" style={{ color: 'var(--cc-ink-dim)' }}>{step + 1} / {STEPS.length}</span>
        </div>

        <h2 className="font-display text-2xl mb-8 leading-tight" style={{ color: 'var(--cc-ink)' }}>
          {current.question}
        </h2>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {current.options.map((opt, i) => (
            <button key={opt} onClick={() => select(i, opt)}
              className="flex items-center justify-center text-center py-5 px-3 rounded-2xl font-bold text-sm transition-all"
              style={isSelected(i, opt)
                ? { background: 'linear-gradient(135deg,rgba(var(--cc-accent-rgb),0.15),rgba(0,230,167,0.1))', color: 'var(--cc-accent)', border: '1.5px solid rgba(var(--cc-accent-rgb),0.5)' }
                : { background: 'var(--cc-bg-2)', color: 'var(--cc-ink-dim)', border: '1px solid rgba(var(--cc-line-rgb),0.25)' }
              }>
              {opt}
            </button>
          ))}
        </div>

        {/* Nav buttons */}
        <div className="mt-8 flex gap-3">
          {step < STEPS.length - 1 && current.multi && (
            <button onClick={() => setStep(s => s + 1)}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-display text-base"
              style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color: 'var(--cc-accent-deep)', boxShadow: '0 0 20px rgba(var(--cc-accent-rgb),0.35)' }}>
              Next <ChevronRight className="w-5 h-5" />
            </button>
          )}
          {step === STEPS.length - 1 && (
            <button onClick={handleFinish} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-display text-base"
              style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color: 'var(--cc-accent-deep)', boxShadow: '0 0 20px rgba(var(--cc-accent-rgb),0.35)' }}>
              {saving ? 'Saving...' : '🚀 Let\'s Eat!'}
            </button>
          )}
          <button onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : handleFinish()}
            className="px-5 py-4 rounded-full text-sm font-semibold" style={{ background: 'var(--cc-bg-2)', color: 'var(--cc-ink-dim)' }}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}