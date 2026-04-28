import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

// Gradient themes keyed by emoji "mood"
function getTipTheme(emoji) {
  const e = emoji || '';
  if (['📹', '🎬', '📺', '🎥'].includes(e))
    return { grad: 'linear-gradient(135deg,rgba(253,89,30,0.18),rgba(253,89,30,0.06))', border: 'rgba(253,89,30,0.3)', accent: '#fd591e' };
  if (['💸', '🏆', '🚀', '⭐'].includes(e))
    return { grad: 'linear-gradient(135deg,rgba(119,255,200,0.12),rgba(0,230,167,0.05))', border: 'rgba(119,255,200,0.25)', accent: '#77ffc8' };
  if (['🎟️', '🎉', '🎊', '🎁'].includes(e))
    return { grad: 'linear-gradient(135deg,rgba(251,191,36,0.14),rgba(245,158,11,0.05))', border: 'rgba(251,191,36,0.25)', accent: '#fbbf24' };
  if (['🎬', '📸', '🖼️', '🎨'].includes(e))
    return { grad: 'linear-gradient(135deg,rgba(192,132,252,0.14),rgba(167,139,250,0.05))', border: 'rgba(192,132,252,0.25)', accent: '#c084fc' };
  // default blue/system
  return { grad: 'linear-gradient(135deg,rgba(96,165,250,0.14),rgba(59,130,246,0.05))', border: 'rgba(96,165,250,0.25)', accent: '#60a5fa' };
}

function isNew(createdDate) {
  if (!createdDate) return false;
  return (Date.now() - new Date(createdDate).getTime()) < 7 * 24 * 60 * 60 * 1000;
}

function TipCard({ tip, onDismiss, prominent = false }) {
  const theme = getTipTheme(tip.icon_emoji);

  return (
    <div
      className="relative flex flex-col flex-shrink-0 rounded-3xl overflow-hidden"
      style={{
        background: theme.grad,
        border: `1px solid ${theme.border}`,
        width: prominent ? '100%' : '260px',
        minHeight: prominent ? 'auto' : '200px',
        padding: '20px',
      }}
    >
      {/* NEW badge */}
      {isNew(tip.created_date) && (
        <span className="absolute top-3 left-3 text-[9px] font-black px-2 py-0.5 rounded-full"
          style={{ background: theme.accent, color: '#0d1517' }}>
          NEW
        </span>
      )}

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(tip.id)}
        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.25)' }}
      >
        <X className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.7)' }} />
      </button>

      {/* Emoji */}
      <div className="text-3xl mb-3 mt-2">{tip.icon_emoji || '💡'}</div>

      {/* Title */}
      <p className="font-heading font-black text-sm leading-snug mb-2" style={{ color: '#dff0e8' }}>
        {tip.title}
      </p>

      {/* Description */}
      <p className="text-xs leading-relaxed flex-1" style={{ color: 'rgba(186,203,192,0.85)' }}>
        {tip.description}
      </p>

      {/* CTA */}
      {tip.cta_label && tip.cta_link && (
        <Link to={tip.cta_link} className="mt-4 inline-block">
          <div className="px-4 py-2 rounded-full text-xs font-black w-fit"
            style={{ background: theme.accent, color: '#0d1517' }}>
            {tip.cta_label} →
          </div>
        </Link>
      )}
    </div>
  );
}

export default function VendorTipsSection({ user }) {
  const qc = useQueryClient();

  const { data: tips = [] } = useQuery({
    queryKey: ['vendor-tips'],
    queryFn: () => base44.entities.VendorTip.filter({ is_active: true }, 'order_num', 20),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profile-tips', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const profile = profiles[0] || null;
  const dismissed = profile?.dismissed_tips || [];

  const visibleTips = tips.filter(t => !dismissed.includes(t.id));

  const handleDismiss = async (tipId) => {
    const newDismissed = [...dismissed, tipId];
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { dismissed_tips: newDismissed });
    } else if (user?.email) {
      await base44.entities.UserProfile.create({ user_email: user.email, dismissed_tips: newDismissed });
    }
    qc.invalidateQueries({ queryKey: ['user-profile-tips', user?.email] });
  };

  if (visibleTips.length === 0) return null;

  // Rotate featured tip daily based on day of year
  const dayIndex = Math.floor(Date.now() / 86400000) % visibleTips.length;
  const featuredTip = visibleTips[dayIndex];
  const otherTips = visibleTips.filter((_, i) => i !== dayIndex);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black tracking-widest" style={{ color: '#77ffc8' }}>💡 VENDOR TIPS</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8' }}>
          {visibleTips.length} tips
        </span>
      </div>

      {/* Featured tip — prominent */}
      <TipCard tip={featuredTip} onDismiss={handleDismiss} prominent />

      {/* Carousel of remaining tips */}
      {otherTips.length > 0 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar mt-3 pb-1">
          {otherTips.map(tip => (
            <TipCard key={tip.id} tip={tip} onDismiss={handleDismiss} />
          ))}
        </div>
      )}
    </div>
  );
}