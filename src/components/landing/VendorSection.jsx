import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const VENDOR_BENEFITS = [
  '✓ Free truck profile + Live Clips',
  '✓ Built-in Stripe payments',
  '✓ Featured in Houston\'s hottest truck parks',
  '✓ Real-time order management',
  '✓ Customer rewards funnel',
  '✓ Early-vendor pricing perks (locked-in for early applicants)',
];

export default function VendorSection() {
  // Fetch real truck data for the social proof logos
  const { data: sampleTrucks = [] } = useQuery({
    queryKey: ['landing-vendor-trucks'],
    queryFn: () => base44.entities.FoodTruck.filter({ is_approved: true }, '-rating', 6),
  });

  const showcaseTrucks = sampleTrucks.slice(0, 2);

  return (
    <section className="py-14" style={{ background: 'rgba(253,89,30,0.03)', borderTop: '1px solid rgba(253,89,30,0.12)', borderBottom: '1px solid rgba(253,89,30,0.12)' }}>
      <div className="px-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1" style={{ background: 'rgba(59,74,66,0.4)' }} />
          <p className="font-heading font-black text-sm tracking-widest" style={{ color: '#fd591e' }}>FOR TRUCK OWNERS</p>
          <div className="h-px flex-1" style={{ background: 'rgba(59,74,66,0.4)' }} />
        </div>
        <h2 className="font-heading font-black text-2xl text-center mb-8" style={{ color: '#dff0e8' }}>
          🚐 Got a Truck? Read this.
        </h2>

        {/* 3 columns (stacked on mobile, row on md+) */}
        <div className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-6 mb-8">

          {/* Column 1: Social proof */}
          <div className="p-5 rounded-3xl" style={{ background: '#151d1f', border: '1px solid rgba(253,89,30,0.2)' }}>
            <p className="font-heading font-black text-sm mb-3" style={{ color: '#fd591e' }}>Real trucks already winning</p>
            <div className="flex flex-col gap-3 mb-3">
              {showcaseTrucks.length > 0 ? showcaseTrucks.map(t => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ background: '#192123' }}>
                    {t.image_url
                      ? <img src={t.image_url} alt={t.name} className="w-full h-full object-cover" />
                      : <span className="w-full h-full flex items-center justify-center text-lg">🚚</span>
                    }
                  </div>
                  <div>
                    <p className="font-bold text-xs" style={{ color: '#dff0e8' }}>{t.name}</p>
                    <p className="text-[10px] capitalize" style={{ color: '#bacbc0' }}>{t.cuisine_type?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              )) : (
                <>
                  {['Bubba\'s BBQ 🔥', 'Jamie Glenn\'s Kitchen 🌮'].map(name => (
                    <div key={name} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: '#192123' }}>🚚</div>
                      <p className="font-bold text-xs" style={{ color: '#dff0e8' }}>{name}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#bacbc0' }}>
              Houston legends already onboarded. More joining daily.
            </p>
          </div>

          {/* Column 2: Benefits */}
          <div className="p-5 rounded-3xl" style={{ background: '#151d1f', border: '1px solid rgba(59,74,66,0.2)' }}>
            <p className="font-heading font-black text-sm mb-3" style={{ color: '#77ffc8' }}>What you get</p>
            <div className="flex flex-col gap-2">
              {VENDOR_BENEFITS.map(b => (
                <p key={b} className="text-xs leading-relaxed" style={{ color: '#bacbc0' }}>{b}</p>
              ))}
            </div>
          </div>

          {/* Column 3: Pricing */}
          <div className="p-5 rounded-3xl" style={{ background: '#151d1f', border: '1px solid rgba(59,74,66,0.2)' }}>
            <p className="font-heading font-black text-sm mb-3" style={{ color: '#77ffc8' }}>What it costs</p>
            <p className="font-heading font-black leading-none mb-1"
              style={{ fontSize: '2.5rem', color: '#dff0e8' }}>12%</p>
            <p className="font-heading font-black text-sm mb-3" style={{ color: '#dff0e8' }}>per order. That's it.</p>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#bacbc0' }}>
              No setup fee. No monthly fee. No menu fee.
            </p>
            <p className="text-[10px] leading-relaxed px-3 py-2 rounded-xl"
              style={{ color: '#bacbc0', background: 'rgba(253,89,30,0.07)', border: '1px solid rgba(253,89,30,0.15)' }}>
              Early-applicant trucks may qualify for grandfathered pricing. Apply to learn more.
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link to="/onboard-truck">
          <button className="w-full py-4 rounded-full font-heading font-black text-base transition-all active:scale-95 mb-3"
            style={{ background: 'linear-gradient(135deg,#fd591e,#e84c14)', color: '#fff', boxShadow: '0 0 24px rgba(253,89,30,0.35)' }}>
            🚐 Apply for Vendor Access →
          </button>
        </Link>
        <p className="text-xs text-center" style={{ color: 'rgba(186,203,192,0.5)' }}>
          We're personally vetting trucks during launch. Apply to talk to our team.
        </p>
      </div>
    </section>
  );
}