import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight } from 'lucide-react';

const PILLS = ['🍷 Private Dinner', '🦞 Crawfish Boil', '🧺 Picnic', '💍 Wedding', '🥂 Brunch', '👨‍🍳 Tasting Menu'];

export default function ExperiencesTeaser() {
  return (
    <div className="mx-5 mt-6">
      <div className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0d0a1f 60%, #0A0A0A 100%)', border: '1px solid rgba(192,132,252,0.2)', boxShadow: '0 0 40px rgba(192,132,252,0.07)' }}>

        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.15) 0%, transparent 70%)' }} />

        <div className="relative z-10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#C084FC' }} />
            <span className="text-[10px] font-black tracking-widest" style={{ color: '#C084FC' }}>CURBCHEF EXPERIENCES</span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(192,132,252,0.15)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.25)' }}>
              NEW
            </span>
          </div>

          <h3 className="font-heading font-black text-xl leading-tight mb-1" style={{ color: '#F5F0E8' }}>
            Book a private chef.
          </h3>
          <p className="text-xs mb-4" style={{ color: 'rgba(245,240,232,0.5)' }}>
            Private dinners, picnics, birthdays, weddings, and unforgettable food experiences.
          </p>

          {/* Experience pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {PILLS.map(p => (
              <span key={p} className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(192,132,252,0.08)', color: 'rgba(192,132,252,0.8)', border: '1px solid rgba(192,132,252,0.15)' }}>
                {p}
              </span>
            ))}
          </div>

          <Link to="/experiences">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full font-heading font-black text-xs"
              style={{ background: 'linear-gradient(135deg, #C084FC, #9333ea)', color: '#fff', boxShadow: '0 0 16px rgba(192,132,252,0.3)' }}>
              Browse Chefs <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}