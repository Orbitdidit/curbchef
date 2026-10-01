import React from 'react';

const CATEGORIES = [
  { id:'all', label:'All Eats', emoji:''},
  { id:'tacos', label:'Tacos', emoji:''},
  { id:'burgers', label:'Burgers', emoji:''},
  { id:'bbq', label:'BBQ', emoji:''},
  { id:'asian', label:'Asian', emoji:''},
  { id:'pizza', label:'Pizza', emoji:''},
  { id:'seafood', label:'Seafood', emoji:''},
  { id:'vegan', label:'Vegan', emoji:''},
  { id:'desserts', label:'Sweets', emoji:''},
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
            aria-pressed={isActive}
            className={`flex-shrink-0 min-h-11 px-4 rounded-xl text-sm font-semibold border whitespace-nowrap ${isActive ? 'bg-discovery-paper text-discovery-dark border-discovery-paper' : 'bg-discovery-surface text-discovery-muted border-discovery-line'}`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}