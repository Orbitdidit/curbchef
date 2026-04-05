import React from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All Eats', emoji: '🔥' },
  { id: 'tacos', label: 'Tacos', emoji: '🌮' },
  { id: 'burgers', label: 'Burgers', emoji: '🍔' },
  { id: 'bbq', label: 'BBQ', emoji: '🍖' },
  { id: 'seafood', label: 'Seafood', emoji: '🦐' },
  { id: 'asian', label: 'Asian', emoji: '🍜' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'desserts', label: 'Sweets', emoji: '🍩' },
  { id: 'vegan', label: 'Vegan', emoji: '🥗' },
];

export default function CategoryRow({ selected, onChange }) {
  return (
    <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar pb-1">
      {CATEGORIES.map(cat => {
        const isActive = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className="flex flex-col items-center gap-2 flex-shrink-0 transition-all duration-200"
            style={{ transform: isActive ? 'scale(1.06)' : 'scale(1)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-200"
              style={{
                background: isActive ? 'rgba(119,255,200,0.14)' : '#192123',
                border: isActive ? '1.5px solid rgba(119,255,200,0.5)' : '1.5px solid rgba(59,74,66,0.2)',
                boxShadow: isActive ? '0 0 18px rgba(119,255,200,0.25), inset 0 0 12px rgba(119,255,200,0.06)' : 'none',
              }}
            >
              {cat.emoji}
            </div>
            <span
              className="text-[11px] font-bold whitespace-nowrap transition-all"
              style={{ color: isActive ? '#77ffc8' : '#bacbc0' }}
            >
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}