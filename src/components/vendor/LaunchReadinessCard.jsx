import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Rocket } from 'lucide-react';

const CHECKS = [
  {
    id: 'profile',
    label: 'Profile complete',
    sub: 'Name, description, cuisine & photo set',
    fixHref: '/vendor/profile',
    fixLabel: 'Edit Profile',
  },
  {
    id: 'menu',
    label: 'At least 5 menu items',
    sub: 'Build your menu so customers can order',
    fixHref: '/vendor/menu',
    fixLabel: 'Add Items',
  },
  {
    id: 'cover',
    label: 'Cover image set',
    sub: 'A great cover photo drives more clicks',
    fixHref: '/vendor/profile',
    fixLabel: 'Upload Cover',
  },
  {
    id: 'stripe',
    label: 'Stripe payouts enabled',
    sub: 'Connect Stripe to receive payments',
    fixHref: '/vendor',
    fixLabel: 'Connect Stripe',
  },
  {
    id: 'hours',
    label: 'Operating hours set',
    sub: "Let customers know when you're open",
    fixHref: '/vendor/profile',
    fixLabel: 'Set Hours',
  },
  {
    id: 'phone',
    label: 'Phone number set',
    sub: 'Customers and admin may need to reach you',
    fixHref: '/vendor/profile',
    fixLabel: 'Add Phone',
  },
  {
    id: 'liveclip',
    label: 'At least 1 live clip / video',
    sub: 'Videos increase visibility on the home feed',
    fixHref: '/vendor/profile',
    fixLabel: 'Upload Clip',
  },
  {
    id: 'location',
    label: 'GPS location set',
    sub: 'Required to appear on the map',
    fixHref: '/vendor/profile',
    fixLabel: 'Set Location',
  },
];

function buildChecks(truck, menuItems, liveClips) {
  return {
    profile: !!(truck.name && truck.description && truck.cuisine_type && truck.image_url),
    menu: menuItems.length >= 5,
    cover: !!truck.cover_image_url,
    stripe: truck.stripe_onboarding_status === 'payouts_enabled',
    hours: !!(truck.operating_hours && truck.operating_hours.trim()),
    phone: !!(truck.phone && truck.phone.trim()),
    liveclip: liveClips.length >= 1,
    location: !!(truck.latitude && truck.longitude),
  };
}

export default function LaunchReadinessCard({ truck, menuItems, onLaunchReadyChange }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const { data: liveClips = [] } = useQuery({
    queryKey: ['vendor-liveclips', truck?.id],
    queryFn: () => base44.entities.LiveClipVideo.filter({ truck_id: truck.id }),
    enabled: !!truck?.id,
  });

  const checks = buildChecks(truck, menuItems, liveClips);
  const passed = Object.values(checks).filter(Boolean).length;
  const total = 8;
  const pct = Math.round((passed / total) * 100);
  const allPassed = passed === total;
  const isLaunchReady = allPassed || !!truck.launch_ready_override;

  // Auto-update launch_ready on the truck whenever checks change
  useEffect(() => {
    if (!truck?.id) return;
    if (isLaunchReady !== !!truck.launch_ready) {
      base44.entities.FoodTruck.update(truck.id, { launch_ready: isLaunchReady })
        .then(() => {
          qc.invalidateQueries({ queryKey: ['vendor-truck'] });
          if (onLaunchReadyChange) onLaunchReadyChange(isLaunchReady);
        });
    }
  }, [isLaunchReady, truck.id, truck.launch_ready]);

  // Circumference for SVG ring
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct / 100);

  if (isLaunchReady) {
    return (
      <div className="mb-5 rounded-3xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,rgba(0,245,212,0.1),rgba(0,230,167,0.06))', border: '1px solid rgba(0,245,212,0.35)', boxShadow: '0 0 32px rgba(0,245,212,0.1)' }}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(0,245,212,0.15) 0%,transparent 70%)' }} />
        <div className="relative z-10 flex items-center gap-4">
          <div className="text-3xl flex-shrink-0">🎉</div>
          <div>
            <p className="font-heading font-black text-base" style={{ color: '#00F5D4' }}>You're launch ready!</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(0,245,212,0.7)' }}>
              Your truck is now live on CurbChef and visible to customers.
            </p>
          </div>
          <div className="flex-shrink-0 ml-auto">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,245,212,0.15)', border: '1px solid rgba(0,245,212,0.3)' }}>
              <Rocket className="w-5 h-5" style={{ color: '#00F5D4' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const remaining = total - passed;

  return (
    <div className="mb-5 rounded-3xl overflow-hidden"
      style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.3)' }}>
      {/* Header row */}
      <div className="p-5">
        <div className="flex items-center gap-4">
          {/* Circular progress ring */}
          <div className="relative flex-shrink-0 w-16 h-16">
            <svg width="64" height="64" className="transform -rotate-90">
              <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(59,74,66,0.4)" strokeWidth="5" />
              <circle
                cx="32" cy="32" r={r} fill="none"
                stroke={pct >= 75 ? '#00F5D4' : pct >= 40 ? '#fbbf24' : '#fd591e'}
                strokeWidth="5"
                strokeDasharray={circ}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading font-black text-sm leading-none" style={{ color: '#dff0e8' }}>{passed}/{total}</span>
              <span className="text-[9px] font-bold" style={{ color: '#bacbc0' }}>{pct}%</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>Launch Readiness</p>
            <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>
              Complete {remaining} more {remaining === 1 ? 'step' : 'steps'} to start receiving orders.
            </p>
          </div>

          <button onClick={() => setExpanded(e => !e)} className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(59,74,66,0.3)' }}>
            {expanded
              ? <ChevronUp className="w-4 h-4" style={{ color: '#bacbc0' }} />
              : <ChevronDown className="w-4 h-4" style={{ color: '#bacbc0' }} />
            }
          </button>
        </div>

        {/* Quick progress bar */}
        <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(59,74,66,0.3)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct >= 75 ? 'linear-gradient(90deg,#00F5D4,#00e6a7)' : pct >= 40 ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : 'linear-gradient(90deg,#fd591e,#ff8c00)',
            }} />
        </div>
      </div>

      {/* Expandable checklist */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(59,74,66,0.2)' }}>
          {CHECKS.map((check) => {
            const done = checks[check.id];
            return (
              <div key={check.id} className="flex items-center gap-3 px-5 py-3"
                style={{ borderBottom: '1px solid rgba(59,74,66,0.12)' }}>
                {done
                  ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#00F5D4' }} />
                  : <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#fd591e' }} />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: done ? '#dff0e8' : '#bacbc0' }}>{check.label}</p>
                  <p className="text-xs" style={{ color: '#6B665C' }}>{check.sub}</p>
                </div>
                {!done && (
                  <Link to={check.fixHref} className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-black"
                    style={{ background: 'rgba(253,89,30,0.12)', color: '#fd591e', border: '1px solid rgba(253,89,30,0.25)' }}>
                    Fix →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}