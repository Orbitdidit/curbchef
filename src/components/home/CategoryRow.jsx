import React from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All Eats', emoji: '🔥' },
  { id: 'tacos', label: 'Tacos', emoji: '🌮' },
  { id: 'burgers', label: 'Burgers', emoji: '🍔' },
  { id: 'bbq', label: 'BBQ', emoji: '🔥' },
  { id: 'asian', label: 'Asian', emoji: '🍜' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'seafood', label: 'Seafood', emoji: '🦐' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'desserts', label: 'Sweets', emoji: '🧁' },
];

export default function CategoryRow({ selected, onChange }) {
  return (
    <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar pb-1">
      {CATEGORIES.map(cat => {
        const isActive = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap"
            style={{
              background: isActive ? 'var(--cc-accent-2)' : 'var(--cc-surface-3)',
              color: isActive ? 'var(--cc-black)' : 'var(--cc-ink-muted)',
              border: isActive ? 'none' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}