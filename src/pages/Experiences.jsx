import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, MapPin, Users, DollarSign, Send, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const EXPERIENCE_TYPES = [
  { id: 'private_dinner',     label: 'Private Dinner',       emoji: '🍷' },
  { id: 'anniversary_dinner', label: 'Anniversary Dinner',   emoji: '💑' },
  { id: 'picnic_setup',       label: 'Picnic Setup',         emoji: '🧺' },
  { id: 'wedding_catering',   label: 'Wedding Catering',     emoji: '💍' },
  { id: 'small_catering',     label: 'Private Catering',     emoji: '🍽️' },
  { id: 'crawfish_boil',      label: 'Crawfish Boil',        emoji: '🦞' },
  { id: 'seafood_boil',       label: 'Seafood Boil',         emoji: '🦐' },
  { id: 'brunch',             label: 'Brunch',               emoji: '🥂' },
  { id: 'tasting_menu',       label: 'Tasting Menu',         emoji: '👨‍🍳' },
  { id: 'birthday',           label: 'Birthday',             emoji: '🎂' },
];

const FEATURED_CHEFS = [
  {
    id: 'demo1',
    chef_name: 'Chef Marcus Williams',
    cuisine_specialties: ['Cajun', 'Creole', 'Southern'],
    starting_price: 450,
    city: 'Houston',
    rating: 4.9,
    review_count: 38,
    profile_photo_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
    experience_types: ['crawfish_boil', 'seafood_boil', 'private_dinner'],
    event_size_min: 8,
    event_size_max: 60,
  },
  {
    id: 'demo2',
    chef_name: 'Chef Aaliyah Torres',
    cuisine_specialties: ['Mediterranean', 'Farm-to-Table', 'Tasting Menus'],
    starting_price: 600,
    city: 'Houston',
    rating: 5.0,
    review_count: 24,
    profile_photo_url: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf4?w=400',
    experience_types: ['tasting_menu', 'anniversary_dinner', 'wedding_catering'],
    event_size_min: 2,
    event_size_max: 30,
  },
  {
    id: 'demo3',
    chef_name: 'Chef Deon Baptiste',
    cuisine_specialties: ['Soul Food', 'BBQ', 'Brunch'],
    starting_price: 325,
    city: 'Houston',
    rating: 4.8,
    review_count: 51,
    profile_photo_url: 'https://images.unsplash.com/photo-1600565193348-f74bd3960d14?w=400',
    experience_types: ['brunch', 'birthday', 'small_catering'],
    event_size_min: 5,
    event_size_max: 40,
  },
];

function ChefCard({ chef }) {
  const [showInquiry, setShowInquiry] = useState(false);
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="relative h-48 overflow-hidden">
        <img src={chef.profile_photo_url} alt={chef.chef_name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(10,10,10,0.95) 100%)' }} />
        {chef.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(8px)' }}>
            <Star className="w-3 h-3" style={{ fill: '#FFD60A', color: '#FFD60A' }} />
            <span className="text-xs font-bold" style={{ color: '#F5F0E8' }}>{chef.rating}</span>
            <span className="text-[10px]" style={{ color: '#A39E94' }}>({chef.review_count})</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <p className="font-heading font-black text-xl text-white leading-tight">{chef.chef_name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,232,0.6)' }}>
            {chef.cuisine_specialties?.slice(0, 2).join(' · ')}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4 text-xs" style={{ color: '#A39E94' }}>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>From <strong style={{ color: '#F5F0E8' }}>${chef.starting_price}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{chef.event_size_min}–{chef.event_size_max} guests</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{chef.city}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {chef.experience_types?.slice(0, 3).map(t => {
            const et = EXPERIENCE_TYPES.find(e => e.id === t);
            return et ? (
              <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(192,132,252,0.1)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.2)' }}>
                {et.emoji} {et.label}
              </span>
            ) : null;
          })}
        </div>

        <button onClick={() => setShowInquiry(true)}
          className="w-full py-3 rounded-full font-heading font-black text-sm flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #C084FC, #9333ea)', color: '#fff', boxShadow: '0 0 20px rgba(192,132,252,0.25)' }}>
          <Send className="w-3.5 h-3.5" /> Request Chef
        </button>
      </div>

      {showInquiry && <InquiryModal chef={chef} onClose={() => setShowInquiry(false)} />}
    </div>
  );
}

function InquiryModal({ chef, onClose }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ experience_type: '', event_date: '', guest_count: '', event_location: '', special_requests: '', customer_name: '', customer_email: '', customer_phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.customer_email || !form.experience_type || !form.event_date) {
      toast({ title: 'Please fill in the required fields.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    await base44.entities.ExperienceBooking.create({
      chef_experience_id: chef.id,
      chef_name: chef.chef_name,
      ...form,
      guest_count: parseInt(form.guest_count) || 0,
      status: 'inquiry',
    });
    setSubmitting(false);
    setDone(true);
  };

  const inputClass = "w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none";
  const inputStyle = { background: '#1A1A1A', color: '#F5F0E8', border: '1px solid rgba(255,255,255,0.07)' };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl overflow-y-auto" style={{ background: '#0F0F0F', border: '1px solid rgba(192,132,252,0.15)', maxHeight: '90dvh' }}
        onClick={e => e.stopPropagation()}>
        <div className="p-5">
          {done ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="font-heading font-black text-xl mb-2" style={{ color: '#F5F0E8' }}>Inquiry Sent!</h3>
              <p className="text-sm mb-6" style={{ color: '#A39E94' }}>
                {chef.chef_name} will review your request and reach out within 24 hours.
              </p>
              <button onClick={onClose} className="px-8 py-3 rounded-full font-heading font-black text-sm"
                style={{ background: 'linear-gradient(135deg,#C084FC,#9333ea)', color: '#fff' }}>
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-heading font-black text-lg" style={{ color: '#F5F0E8' }}>Request {chef.chef_name}</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#A39E94' }}>No commitment — this is just an inquiry</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#1A1A1A' }}>
                  <span style={{ color: '#A39E94' }}>✕</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-bold tracking-widest mb-2" style={{ color: '#A39E94' }}>EXPERIENCE TYPE *</p>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_TYPES.map(et => (
                      <button key={et.id} onClick={() => set('experience_type', et.id)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                        style={form.experience_type === et.id
                          ? { background: 'linear-gradient(135deg,#C084FC,#9333ea)', color: '#fff' }
                          : { background: '#1A1A1A', color: '#A39E94', border: '1px solid rgba(255,255,255,0.07)' }
                        }>
                        {et.emoji} {et.label}
                      </button>
                    ))}
                  </div>
                </div>

                {[
                  { key: 'customer_name', label: 'YOUR NAME *', placeholder: 'Full name', type: 'text' },
                  { key: 'customer_email', label: 'EMAIL *', placeholder: 'you@email.com', type: 'email' },
                  { key: 'customer_phone', label: 'PHONE', placeholder: '+1 (713) 000-0000', type: 'tel' },
                  { key: 'event_date', label: 'EVENT DATE *', placeholder: '', type: 'date' },
                  { key: 'guest_count', label: 'GUEST COUNT', placeholder: 'e.g. 12', type: 'number' },
                  { key: 'event_location', label: 'EVENT LOCATION', placeholder: 'Address or neighborhood in Houston', type: 'text' },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <p className="text-[11px] font-bold tracking-widest mb-1.5" style={{ color: '#A39E94' }}>{label}</p>
                    <input type={type} placeholder={placeholder} value={form[key]}
                      onChange={e => set(key, e.target.value)} className={inputClass} style={inputStyle} />
                  </div>
                ))}

                <div>
                  <p className="text-[11px] font-bold tracking-widest mb-1.5" style={{ color: '#A39E94' }}>SPECIAL REQUESTS / DETAILS</p>
                  <textarea placeholder="Dietary restrictions, theme, occasion details..." value={form.special_requests}
                    onChange={e => set('special_requests', e.target.value)}
                    className={inputClass + ' min-h-[80px] resize-none'} style={inputStyle} />
                </div>

                <button onClick={handleSubmit} disabled={submitting}
                  className="w-full py-4 rounded-full font-heading font-black text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#C084FC,#9333ea)', color: '#fff', boxShadow: '0 0 24px rgba(192,132,252,0.3)', opacity: submitting ? 0.7 : 1 }}>
                  <Send className="w-4 h-4" />
                  {submitting ? 'Sending...' : 'Send Inquiry'}
                </button>
                <p className="text-center text-[10px]" style={{ color: '#6B665C' }}>
                  No payment required yet. Chef will contact you to confirm details.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Experiences() {
  const [selectedType, setSelectedType] = useState(null);

  const filteredChefs = selectedType
    ? FEATURED_CHEFS.filter(c => c.experience_types?.includes(selectedType))
    : FEATURED_CHEFS;

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-20"
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link to="/" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#141414' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#F5F0E8' }} />
        </Link>
        <div className="flex-1">
          <p className="font-heading font-black text-base" style={{ color: '#C084FC' }}>CurbChef Experiences</p>
          <p className="text-xs" style={{ color: '#A39E94' }}>Private chefs · Curated events</p>
        </div>
        <div className="px-2.5 py-1 rounded-full text-[10px] font-black"
          style={{ background: 'rgba(192,132,252,0.12)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.25)' }}>
          ✦ BETA
        </div>
      </div>

      <div className="px-5">
        {/* Hero */}
        <div className="relative mt-4 mb-6 rounded-3xl overflow-hidden" style={{ minHeight: 200 }}>
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"
            alt="Private dining"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,10,10,0.85) 0%, rgba(80,0,160,0.6) 100%)' }} />
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" style={{ color: '#C084FC' }} />
              <span className="text-[10px] font-black tracking-widest" style={{ color: '#C084FC' }}>COMING TO HOUSTON</span>
            </div>
            <h1 className="font-heading font-black text-3xl leading-tight text-white mb-2">
              Book a chef.<br />Create a memory.
            </h1>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(245,240,232,0.7)' }}>
              Book a chef for private dinners, picnics, birthdays, weddings, and unforgettable food experiences.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {FEATURED_CHEFS.map((c, i) => (
                  <img key={i} src={c.profile_photo_url} alt={c.chef_name}
                    className="w-8 h-8 rounded-full object-cover border-2" style={{ borderColor: '#0A0A0A' }} />
                ))}
              </div>
              <p className="text-xs" style={{ color: 'rgba(245,240,232,0.6)' }}>
                {FEATURED_CHEFS.length} chefs available in Houston
              </p>
            </div>
          </div>
        </div>

        {/* Experience type filter */}
        <div className="mb-5">
          <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: '#A39E94' }}>WHAT ARE YOU PLANNING?</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button onClick={() => setSelectedType(null)}
              className="px-3 py-2 rounded-full text-xs font-bold flex-shrink-0 transition-all"
              style={!selectedType
                ? { background: 'linear-gradient(135deg,#C084FC,#9333ea)', color: '#fff' }
                : { background: '#141414', color: '#A39E94', border: '1px solid rgba(255,255,255,0.06)' }
              }>
              All
            </button>
            {EXPERIENCE_TYPES.map(et => (
              <button key={et.id} onClick={() => setSelectedType(selectedType === et.id ? null : et.id)}
                className="px-3 py-2 rounded-full text-xs font-bold flex-shrink-0 transition-all whitespace-nowrap"
                style={selectedType === et.id
                  ? { background: 'linear-gradient(135deg,#C084FC,#9333ea)', color: '#fff' }
                  : { background: '#141414', color: '#A39E94', border: '1px solid rgba(255,255,255,0.06)' }
                }>
                {et.emoji} {et.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chef cards */}
        <div className="space-y-4 mb-8">
          <p className="text-[10px] font-black tracking-widest" style={{ color: '#A39E94' }}>
            FEATURED CHEFS · {filteredChefs.length} AVAILABLE
          </p>
          {filteredChefs.map(chef => (
            <ChefCard key={chef.id} chef={chef} />
          ))}
        </div>

        {/* How it works */}
        <div className="rounded-3xl p-5 mb-6"
          style={{ background: 'rgba(192,132,252,0.05)', border: '1px solid rgba(192,132,252,0.15)' }}>
          <p className="text-[10px] font-black tracking-widest mb-4" style={{ color: '#C084FC' }}>HOW IT WORKS</p>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Send a Request', body: 'Tell us your date, guest count, and the vibe you\'re going for.' },
              { step: '02', title: 'Chef Confirms', body: 'Your chef reviews the details and confirms availability within 24h.' },
              { step: '03', title: 'Pay Deposit', body: 'Secure your booking with a small deposit. Final balance due at event.' },
              { step: '04', title: 'Enjoy', body: 'Your chef arrives, sets up, cooks, and creates the experience.' },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-heading font-black text-xs"
                  style={{ background: 'rgba(192,132,252,0.15)', color: '#C084FC' }}>
                  {step}
                </div>
                <div>
                  <p className="font-heading font-bold text-sm" style={{ color: '#F5F0E8' }}>{title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#A39E94' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Are you a chef CTA */}
        <div className="rounded-3xl p-5 mb-4"
          style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f0a1a 100%)', border: '1px solid rgba(192,132,252,0.2)' }}>
          <p className="font-heading font-black text-lg mb-1" style={{ color: '#F5F0E8' }}>Are you a private chef?</p>
          <p className="text-sm mb-4" style={{ color: '#A39E94' }}>
            Join the CurbChef Experiences waitlist and be among the first chefs featured in Houston.
          </p>
          <Link to="/onboard-truck">
            <button className="flex items-center gap-2 px-5 py-3 rounded-full font-heading font-black text-sm"
              style={{ background: 'linear-gradient(135deg,#C084FC,#9333ea)', color: '#fff', boxShadow: '0 0 20px rgba(192,132,252,0.3)' }}>
              Apply as Chef <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}