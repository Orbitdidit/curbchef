import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const SECTIONS = [
  {
    title: 'What We Collect',
    body: `When you use CurbChef, we collect information you provide directly — such as your name, email address, and payment details. We also collect usage data including the food trucks you browse, orders you place, and your general location (city-level) to surface nearby trucks.`,
  },
  {
    title: 'How We Use It',
    body: `We use your data to process orders, personalize your feed, calculate rewards points, and send order confirmations. We do not sell your personal data to third parties. Payment processing is handled by Stripe and subject to Stripe's own privacy policy.`,
  },
  {
    title: 'Location Data',
    body: `CurbChef requests optional GPS access to show you nearby trucks. This data is never stored beyond your session and is only used to calculate distance. You can deny location access and still use all features of the app.`,
  },
  {
    title: 'Cookies & Analytics',
    body: `We use cookies to maintain your session and preferences. We may use anonymous analytics data to improve the app experience. We do not use advertising tracking cookies.`,
  },
  {
    title: 'Data Retention',
    body: `We retain your account data for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days, except where required for legal compliance (e.g., financial records).`,
  },
  {
    title: 'Your Rights',
    body: `You can request a copy of your data, correct inaccuracies, or request deletion by contacting us at privacy@curbchef.com. Texas residents have additional rights under the Texas Data Privacy and Security Act.`,
  },
  {
    title: 'Contact',
    body: `Questions about this policy? Email privacy@curbchef.com or write to: CurbChef Inc., Houston, TX.`,
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen pb-20" style={{ background: '#0d1517' }}>
      <div className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-20"
        style={{ background: 'rgba(13,21,23,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.12)' }}>
        <Link to="/" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
        </Link>
        <div>
          <p className="font-heading font-black text-base" style={{ color: '#77ffc8' }}>Privacy Policy</p>
          <p className="text-[10px]" style={{ color: '#bacbc0' }}>Last updated April 2026</p>
        </div>
      </div>

      <div className="px-5 pt-6 max-w-2xl mx-auto">
        <h1 className="font-heading font-black text-2xl mb-2" style={{ color: '#dff0e8' }}>Your Privacy Matters</h1>
        <p className="text-sm mb-8" style={{ color: '#bacbc0' }}>
          CurbChef is built on trust. Here's exactly how we handle your data — plainly, no legal jargon.
        </p>

        <div className="flex flex-col gap-5">
          {SECTIONS.map(({ title, body }) => (
            <div key={title} className="p-5 rounded-2xl" style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
              <p className="font-heading font-bold text-sm mb-2" style={{ color: '#dff0e8' }}>{title}</p>
              <p className="text-sm leading-relaxed" style={{ color: '#bacbc0' }}>{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link to="/terms" className="text-center text-sm font-semibold" style={{ color: '#77ffc8' }}>Terms of Service →</Link>
          <Link to="/support" className="text-center text-sm font-semibold" style={{ color: '#77ffc8' }}>Support →</Link>
        </div>
      </div>
    </div>
  );
}