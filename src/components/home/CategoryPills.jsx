import React from 'react';

const categories = [
  { id: 'all', label: 'All', emoji: '🔥' },
  { id: 'tacos', label: 'Tacos', emoji: '🌮' },
  { id: 'burgers', label: 'Burgers', emoji: '🍔' },
  { id: 'bbq', label: 'BBQ', emoji: '🍖' },
  { id: 'seafood', label: 'Seafood', emoji: '🦐' },
  { id: 'asian', label: 'Asian', emoji: '🍜' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'desserts', label: 'Desserts', emoji: '🍩' },
  { id: 'vegan', label: 'Vegan', emoji: '🥗' },
];

export default function CategoryPills({ active, onSelect }) {
  return (
    <div className="flex gap-2.5 px-5 overflow-x-auto no-scrollbar py-3">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl whitespace-nowrap text-sm font-medium transition-all duration-200 ${
            active === cat.id
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}