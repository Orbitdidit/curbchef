import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  { q: 'How do I place an order?', a: 'Find a truck on the home screen or map, tap it to view their menu, add items to your cart, and check out securely via Stripe. You\'ll get a pickup code to show at the window.' },
  { q: 'Can I cancel my order?', a: 'Orders can only be cancelled before the vendor accepts them. Once a vendor starts preparing your food, the order is non-refundable. Contact us at support@curbchef.com if you have issues.' },
  { q: 'How do CurbChef Rewards work?', a: 'You earn points on every order. Points accumulate toward free food and discounts. Redeem them in the Rewards tab. Points are credited after order completion.' },
  { q: 'My order is wrong / I didn\'t receive my food.', a: 'We\'re sorry! Email support@curbchef.com with your order number and we\'ll make it right within 24 hours.' },
  { q: 'How do I become a vendor?', a: 'Apply at curbchef.app/onboard-truck. Our team reviews applications within 24 hours. Once approved, connect Stripe and you\'re ready to accept orders.' },
  { q: 'What does CurbChef charge vendors?', a: 'CurbChef charges a 12% platform fee per order. There are no monthly fees, no setup costs, and no hidden charges.' },
  { q: 'How do vendor payouts work?', a: 'Payouts are processed through Stripe Connect. Vendors receive their net earnings (order total minus 12% platform fee) directly to their bank account, typically within 2 business days.' },
  { q: 'I see the wrong address for my truck.', a: 'You can update your truck\'s address from the Vendor Dashboard → Edit Profile. GPS coordinates can be updated from your mobile device.' },
  { q: 'How do I delete my account?', a: 'Go to Profile → Delete My Account. Your data will be permanently removed within 30 days per our Privacy Policy.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <button className="w-full text-left p-4 rounded-2xl transition-all" onClick={() => setOpen(o => !o)}
      style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.2)' }}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>{q}</p>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#77ffc8' }} />
               : <ChevronDown className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#bacbc0' }} />}
      </div>
      {open && <p className="text-sm mt-2 leading-relaxed" style={{ color: '#bacbc0' }}>{a}</p>}
    </button>
  );
}

export default function Support() {
  return (
    <div className="min-h-screen pb-20" style={{ background: '#0d1517' }}>
      <div className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-20"
        style={{ background: 'rgba(13,21,23,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.12)' }}>
        <Link to="/" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
        </Link>
        <div>
          <p className="font-heading font-black text-base" style={{ color: '#77ffc8' }}>Help & Support</p>
          <p className="text-[10px]" style={{ color: '#bacbc0' }}>We typically respond within a few hours</p>
        </div>
      </div>

      <div className="px-5 pt-6 max-w-2xl mx-auto">
        <h1 className="font-heading font-black text-2xl mb-2" style={{ color: '#dff0e8' }}>How can we help?</h1>
        <p className="text-sm mb-6" style={{ color: '#bacbc0' }}>Browse FAQs or reach us directly.</p>

        {/* Contact cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <a href="mailto:support@curbchef.com"
            className="flex flex-col items-center gap-2 p-5 rounded-2xl text-center active:scale-95 transition-all"
            style={{ background: 'rgba(119,255,200,0.07)', border: '1px solid rgba(119,255,200,0.2)' }}>
            <Mail className="w-6 h-6" style={{ color: '#77ffc8' }} />
            <div>
              <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>Email Us</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#bacbc0' }}>support@curbchef.com</p>
              <p className="text-[10px]" style={{ color: '#bacbc0' }}>~2 hr response</p>
            </div>
          </a>
          <a href="tel:+18885550199"
            className="flex flex-col items-center gap-2 p-5 rounded-2xl text-center active:scale-95 transition-all"
            style={{ background: 'rgba(253,89,30,0.07)', border: '1px solid rgba(253,89,30,0.2)' }}>
            <Phone className="w-6 h-6" style={{ color: '#fd591e' }} />
            <div>
              <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>Call Us</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#bacbc0' }}>1-888-555-0199</p>
              <p className="text-[10px]" style={{ color: '#bacbc0' }}>Mon–Fri 9am–6pm CST</p>
            </div>
          </a>
        </div>

        {/* FAQs */}
        <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: '#77ffc8' }}>FREQUENTLY ASKED QUESTIONS</p>
        <div className="flex flex-col gap-2 mb-8">
          {FAQS.map(faq => <FaqItem key={faq.q} {...faq} />)}
        </div>

        {/* Legal links */}
        <div className="flex items-center justify-center gap-6 pt-4" style={{ borderTop: '1px solid rgba(59,74,66,0.2)' }}>
          <Link to="/privacy" className="text-xs font-semibold" style={{ color: '#bacbc0' }}>Privacy Policy</Link>
          <Link to="/terms" className="text-xs font-semibold" style={{ color: '#bacbc0' }}>Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}