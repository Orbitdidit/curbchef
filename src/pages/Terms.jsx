import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Acceptance',
    body: `By accessing or using CurbChef, you agree to these Terms. If you don't agree, please don't use the platform. These terms apply to customers, vendors, and visitors.`,
  },
  {
    title: '2. The CurbChef Platform',
    body: `CurbChef is a mobile and web platform that connects customers with local food truck vendors. We are not a food vendor ourselves — we provide the marketplace and payment infrastructure. Food quality, safety, and order accuracy are the responsibility of each vendor.`,
  },
  {
    title: '3. Orders & Payments',
    body: `All payments are processed securely through Stripe. When you place an order, you authorize the charge. Refunds are handled on a case-by-case basis. CurbChef collects a 12% platform fee from vendors on each transaction. Customers are charged the listed price plus applicable taxes.`,
  },
  {
    title: '4. Vendor Responsibilities',
    body: `Vendors are responsible for maintaining accurate menu information, food safety compliance, and fulfilling orders. CurbChef reserves the right to remove any vendor who fails to meet quality or reliability standards. Vendors must connect a valid Stripe account to receive payouts.`,
  },
  {
    title: '5. Rewards Program',
    body: `CurbChef Rewards points are earned on eligible orders and may be redeemed for available rewards. Points have no cash value, do not expire, and are non-transferable. CurbChef reserves the right to modify or discontinue the rewards program at any time.`,
  },
  {
    title: '6. User Conduct',
    body: `You agree not to abuse the platform, manipulate reviews, submit fraudulent orders, or attempt to access other users' accounts. Violations may result in account suspension or termination.`,
  },
  {
    title: '7. Intellectual Property',
    body: `All CurbChef branding, design, and software is owned by CurbChef Inc. Vendors retain ownership of their content (menus, photos) and grant CurbChef a license to display it on the platform.`,
  },
  {
    title: '8. Limitation of Liability',
    body: `CurbChef is not liable for food quality, food safety incidents, or losses arising from vendor failures. Our liability is limited to the amount you paid for the specific order in question.`,
  },
  {
    title: '9. Changes to Terms',
    body: `We may update these terms periodically. Continued use of CurbChef after changes means you accept the updated terms. We'll notify you of major changes via email.`,
  },
  {
    title: '10. Contact',
    body: `Questions? Contact legal@curbchef.com or visit CurbChef Inc., Houston, TX.`,
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen pb-20" style={{ background: '#0d1517' }}>
      <div className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-20"
        style={{ background: 'rgba(13,21,23,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.12)' }}>
        <Link to="/" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
        </Link>
        <div>
          <p className="font-heading font-black text-base" style={{ color: '#77ffc8' }}>Terms of Service</p>
          <p className="text-[10px]" style={{ color: '#bacbc0' }}>Last updated April 2026</p>
        </div>
      </div>

      <div className="px-5 pt-6 max-w-2xl mx-auto">
        <h1 className="font-heading font-black text-2xl mb-2" style={{ color: '#dff0e8' }}>Terms of Service</h1>
        <p className="text-sm mb-8" style={{ color: '#bacbc0' }}>
          These terms govern your use of the CurbChef platform. Please read them carefully.
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
          <Link to="/privacy" className="text-center text-sm font-semibold" style={{ color: '#77ffc8' }}>Privacy Policy →</Link>
          <Link to="/support" className="text-center text-sm font-semibold" style={{ color: '#77ffc8' }}>Support →</Link>
        </div>
      </div>
    </div>
  );
}