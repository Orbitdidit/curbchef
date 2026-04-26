import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Upload, Plus, Trash2, Check, Flame } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import OnboardingGuideChat from '@/components/onboarding/OnboardingGuideChat';
import PermitsStep from '@/components/onboarding/PermitsStep';

const STEPS = ['Vendor Type', 'Basic Info', 'Location', 'Permits', 'Media', 'Menu', 'Go Live', 'Kitchen Check', 'Preview'];

const CUISINES = ['tacos', 'burgers', 'bbq', 'seafood', 'asian', 'fusion', 'desserts', 'vegan', 'pizza', 'soul_food', 'other'];

const VENDOR_TYPES = [
  { id: 'food_truck',         label: 'Food Truck',                   emoji: '🚚', sub: 'A full motor vehicle used as a mobile kitchen' },
  { id: 'food_trailer',       label: 'Food Trailer',                 emoji: '🚛', sub: 'A towed, non-motorized trailer kitchen' },
  { id: 'licensed_popup',     label: 'Licensed Pop-Up / Tent',       emoji: '⛺', sub: 'Permitted event or tent setup with health approval' },
  { id: 'caterer_commercial', label: 'Caterer / Commercial Kitchen',  emoji: '👨‍🍳', sub: 'Operates from a licensed commercial or commissary kitchen' },
  { id: 'cottage_goods',      label: 'Cottage Goods / Packaged',     emoji: '🏡', sub: 'Pre-packaged goods made in a permitted cottage kitchen' },
];

const COMING_SOON_TYPES = [
  { id: 'private_chef', label: 'Private Chef / Experiences', emoji: '👑', sub: 'Coming soon — curated private dining & chef experiences' },
];

export default function OnboardTruck() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    vendor_type: '', truck_name: '', owner_name: '', phone: '', email: '', cuisine_type: '', instagram: '',
    city: 'Houston', latitude: null, longitude: null,
    permit_doc_url: '', food_handler_cert_url: '', event_permit_url: '', commissary_info: '', event_authorization_info: '',
    health_permit_status: 'not_submitted',
    logo_url: '', truck_photo_url: '', food_images: [],
    menu_items: [{ name: '', price: '', prep_time: '' }],
    is_open_now: false, is_opening_soon: false, countdown_minutes: 30,
    kitchen_check_photo: '', kitchen_check_time: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const uploadFile = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    return file_url;
  };

  const handleFileUpload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    toast({ title: 'Uploading...' });
    const url = await uploadFile(file);
    set(key, url);
    toast({ title: 'Uploaded!' });
  };

  const handleFoodImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (form.food_images.length >= 5) return toast({ title: 'Max 5 images', variant: 'destructive' });
    const url = await uploadFile(file);
    set('food_images', [...form.food_images, url]);
  };

  const handleKitchenCheck = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadFile(file);
    set('kitchen_check_photo', url);
    set('kitchen_check_time', new Date().toISOString());
  };

  const addMenuItem = () => set('menu_items', [...form.menu_items, { name: '', price: '', prep_time: '' }]);
  const removeMenuItem = (i) => set('menu_items', form.menu_items.filter((_, idx) => idx !== i));
  const updateMenuItem = (i, key, val) => {
    const items = [...form.menu_items];
    items[i] = { ...items[i], [key]: val };
    set('menu_items', items);
  };

  const handleGeolocate = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      set('latitude', pos.coords.latitude);
      set('longitude', pos.coords.longitude);
      toast({ title: 'Location captured!' });
    });
  };

  const handleSubmit = async () => {
    if (!form.truck_name || !form.owner_name || !form.email) {
      toast({ title: 'Please fill in truck name, your name, and email.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const user = await base44.auth.me().catch(() => null);
    const vendorEmail = user?.email || form.email;
    await base44.entities.TruckOnboarding.create({
      ...form,
      email: vendorEmail,
      menu_items: form.menu_items.filter(m => m.name && m.price),
      status: 'submitted',
      step_completed: 9,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  const canNext = () => {
    if (step === 0) return !!form.vendor_type;
    if (step === 1) return form.truck_name && form.owner_name && form.email;
    if (step === 2) return form.city;
    return true;
  };

  const inputClass = "w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none";
  const inputStyle = { background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.35)' };
  const labelStyle = { color: '#bacbc0', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em' };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#0d1517' }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg,rgba(119,255,200,0.15),rgba(119,255,200,0.05))', border: '1px solid rgba(119,255,200,0.3)' }}>
          <span className="text-4xl">🎉</span>
        </div>
        <h1 className="font-heading font-black text-3xl mb-3" style={{ color: '#dff0e8' }}>Application Submitted!</h1>
        <p className="text-sm mb-2 max-w-sm" style={{ color: '#bacbc0' }}>
          <span className="font-bold" style={{ color: '#77ffc8' }}>{form.truck_name}</span> is now under review by the CurbChef team.
        </p>
        <p className="text-sm mb-8 max-w-sm" style={{ color: '#bacbc0' }}>
          We'll review your application and approve your truck within <strong style={{ color: '#dff0e8' }}>24 hours</strong>. You'll receive a confirmation email at <strong style={{ color: '#77ffc8' }}>{form.email}</strong>.
        </p>
        <div className="w-full max-w-sm space-y-3">
          <div className="p-4 rounded-2xl text-left" style={{ background: '#192123', border: '1px solid rgba(119,255,200,0.12)' }}>
            <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: '#77ffc8' }}>WHAT HAPPENS NEXT</p>
            {[
              '✅ CurbChef reviews your menu, photos & kitchen check',
              '📧 You\'ll get an approval email within 24 hours',
              '🔐 Log in to your vendor dashboard to connect Stripe & go live',
            ].map((step, i) => (
              <p key={i} className="text-xs mb-1.5" style={{ color: '#bacbc0' }}>{step}</p>
            ))}
          </div>
          <button onClick={() => navigate('/')}
            className="w-full py-4 rounded-full font-heading font-black text-base"
            style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 24px rgba(119,255,200,0.35)' }}>
            Back to CurbChef
          </button>
          <button onClick={() => base44.auth.redirectToLogin('/vendor-portal')}
            className="w-full py-3 rounded-full font-heading font-black text-sm"
            style={{ background: '#192123', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.2)' }}>
            Sign In to Vendor Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-20"
        style={{ background: 'rgba(13,21,23,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.15)' }}>
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#192123' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
        </button>
        <div className="flex-1">
          <p className="font-heading font-black text-base" style={{ color: '#77ffc8' }}>Truck Onboarding</p>
          <p className="text-xs" style={{ color: '#bacbc0' }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="w-4 h-4" style={{ color: '#fd591e' }} />
          <span className="text-xs font-bold" style={{ color: '#bacbc0' }}>{Math.round(((step) / STEPS.length) * 100)}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: '#192123' }}>
        <div className="h-full transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: 'linear-gradient(90deg,#77ffc8,#00e6a7)' }} />
      </div>

      <div className="px-5 pt-6 pb-40">

        {/* STEP 0 — Vendor Type */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-heading font-black text-2xl mb-1" style={{ color: '#dff0e8' }}>What kind of vendor are you? 🏷️</h2>
            <p className="text-sm mb-6" style={{ color: '#bacbc0' }}>
              CurbChef only accepts verified, permitted vendors. Choose the type that best describes your operation.
            </p>
            {VENDOR_TYPES.map(({ id, label, emoji, sub }) => (
              <button key={id} onClick={() => set('vendor_type', id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                style={{
                  background: form.vendor_type === id ? 'rgba(119,255,200,0.08)' : '#192123',
                  border: form.vendor_type === id ? '1px solid rgba(119,255,200,0.4)' : '1px solid rgba(59,74,66,0.2)',
                }}>
                <span className="text-3xl flex-shrink-0">{emoji}</span>
                <div className="flex-1">
                  <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>{sub}</p>
                </div>
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: form.vendor_type === id ? '#77ffc8' : '#2e3638' }}>
                  {form.vendor_type === id && <Check className="w-3 h-3" style={{ color: '#003826' }} />}
                </div>
              </button>
            ))}
            {/* Coming Soon */}
            {COMING_SOON_TYPES.map(({ id, label, emoji, sub }) => (
              <div key={id} className="flex items-center gap-4 p-4 rounded-2xl opacity-50 cursor-not-allowed"
                style={{ background: '#192123', border: '1px solid rgba(59,74,66,0.15)' }}>
                <span className="text-3xl flex-shrink-0">{emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>{label}</p>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(192,132,252,0.15)', color: '#C084FC', border: '1px solid rgba(192,132,252,0.25)' }}>
                      COMING SOON
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: '#6B665C' }}>{sub}</p>
                </div>
              </div>
            ))}

            <div className="p-3 rounded-xl" style={{ background: 'rgba(253,89,30,0.07)', border: '1px solid rgba(253,89,30,0.2)' }}>
              <p className="text-xs" style={{ color: '#fd591e' }}>
                ⚠️ Home kitchen hot plates without a permit or commissary agreement are not eligible. All vendors must hold a valid health permit or cottage food license.
              </p>
            </div>
          </div>
        )}

        {/* STEP 1 — Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-heading font-black text-2xl mb-1" style={{ color: '#dff0e8' }}>Let's get started 🚚</h2>
            <p className="text-sm mb-6" style={{ color: '#bacbc0' }}>Tell us about your food truck.</p>
            {[
              { key: 'truck_name', label: 'TRUCK NAME', placeholder: 'e.g. Smoke & Soul BBQ' },
              { key: 'owner_name', label: 'YOUR NAME', placeholder: 'Full name' },
              { key: 'phone', label: 'PHONE', placeholder: '+1 (713) 000-0000', type: 'tel' },
              { key: 'email', label: 'EMAIL', placeholder: 'you@email.com', type: 'email' },
              { key: 'instagram', label: 'INSTAGRAM (optional)', placeholder: '@yourtruck' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <p className="mb-1.5" style={labelStyle}>{label}</p>
                <input
                  type={type || 'text'}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            ))}
            <div>
              <p className="mb-2" style={labelStyle}>CUISINE TYPE</p>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map(c => (
                  <button key={c} onClick={() => set('cuisine_type', c)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all"
                    style={form.cuisine_type === c
                      ? { background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }
                      : { background: '#192123', color: '#bacbc0', border: '1px solid rgba(59,74,66,0.3)' }
                    }>
                    {c.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Location */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-heading font-black text-2xl mb-1" style={{ color: '#dff0e8' }}>Where are you parked? 📍</h2>
            <p className="text-sm mb-6" style={{ color: '#bacbc0' }}>Set your current zone or location.</p>
            <div>
              <p className="mb-1.5" style={labelStyle}>CITY / ZONE</p>
              <input type="text" placeholder="Houston, TX" value={form.city}
                onChange={e => set('city', e.target.value)} className={inputClass} style={inputStyle} />
            </div>
            <button onClick={handleGeolocate}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm"
              style={{ background: 'rgba(119,255,200,0.08)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.25)' }}>
              <MapPin className="w-4 h-4" />
              {form.latitude ? `📍 ${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}` : 'Use My Current Location'}
            </button>
          </div>
        )}

        {/* STEP 3 — Permits & Verification */}
        {step === 3 && (
          <PermitsStep
            form={form}
            set={set}
            handleFileUpload={handleFileUpload}
            labelStyle={labelStyle}
            inputClass={inputClass}
            inputStyle={inputStyle}
          />
        )}

        {/* STEP 4 — Media */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-heading font-black text-2xl mb-1" style={{ color: '#dff0e8' }}>Show us your vibe 📸</h2>
            <p className="text-sm mb-6" style={{ color: '#bacbc0' }}>Upload your logo, truck photo, and food shots.</p>
            {[
              { key: 'logo_url', label: 'LOGO' },
              { key: 'truck_photo_url', label: 'TRUCK PHOTO' },
            ].map(({ key, label }) => (
              <div key={key}>
                <p className="mb-2" style={labelStyle}>{label}</p>
                {form[key] ? (
                  <div className="relative h-32 rounded-2xl overflow-hidden">
                    <img src={form[key]} alt={label} className="w-full h-full object-cover" />
                    <button onClick={() => set(key, '')}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(13,21,23,0.8)' }}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ) : (
                  <label className="block w-full h-28 rounded-2xl flex items-center justify-center cursor-pointer"
                    style={{ background: '#192123', border: '2px dashed rgba(119,255,200,0.2)' }}>
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6" style={{ color: '#77ffc8' }} />
                      <span className="text-xs" style={{ color: '#bacbc0' }}>Tap to upload</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, key)} />
                  </label>
                )}
              </div>
            ))}
            <div>
              <p className="mb-2" style={labelStyle}>FOOD IMAGES ({form.food_images.length}/5)</p>
              <div className="grid grid-cols-3 gap-2">
                {form.food_images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => set('food_images', form.food_images.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(13,21,23,0.85)' }}>
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                ))}
                {form.food_images.length < 5 && (
                  <label className="aspect-square rounded-xl flex items-center justify-center cursor-pointer"
                    style={{ background: '#192123', border: '2px dashed rgba(119,255,200,0.2)' }}>
                    <Plus className="w-6 h-6" style={{ color: '#77ffc8' }} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFoodImageUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 — Menu */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-heading font-black text-2xl mb-1" style={{ color: '#dff0e8' }}>Build your menu 🍽️</h2>
            <p className="text-sm mb-6" style={{ color: '#bacbc0' }}>Add your key items. You can add more later.</p>
            {form.menu_items.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl space-y-3" style={{ background: '#192123' }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold" style={{ color: '#77ffc8' }}>ITEM {i + 1}</p>
                  {form.menu_items.length > 1 && (
                    <button onClick={() => removeMenuItem(i)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
                <input placeholder="Item name" value={item.name} onChange={e => updateMenuItem(i, 'name', e.target.value)}
                  className={inputClass} style={{ ...inputStyle, background: '#0f1a1c' }} />
                <div className="flex gap-2">
                  <input placeholder="Price ($)" type="number" value={item.price} onChange={e => updateMenuItem(i, 'price', e.target.value)}
                    className={inputClass} style={{ ...inputStyle, background: '#0f1a1c', flex: 1 }} />
                  <input placeholder="Prep time" value={item.prep_time} onChange={e => updateMenuItem(i, 'prep_time', e.target.value)}
                    className={inputClass} style={{ ...inputStyle, background: '#0f1a1c', flex: 1 }} />
                </div>
              </div>
            ))}
            <button onClick={addMenuItem}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold"
              style={{ background: 'rgba(119,255,200,0.08)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.2)' }}>
              <Plus className="w-4 h-4" /> Add Another Item
            </button>
          </div>
        )}

        {/* STEP 6 — Go Live */}
        {step === 6 && (
          <div className="space-y-5">
            <h2 className="font-heading font-black text-2xl mb-1" style={{ color: '#dff0e8' }}>Go Live Setup 🔴</h2>
            <p className="text-sm mb-6" style={{ color: '#bacbc0' }}>Set your current status so customers can find you.</p>
            {[
              { key: 'is_open_now', label: 'Open Now', sub: 'Start accepting orders immediately' },
              { key: 'is_opening_soon', label: 'Opening Soon', sub: 'Let customers know you\'re coming' },
            ].map(({ key, label, sub }) => (
              <button key={key} onClick={() => set(key, !form[key])}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                style={{
                  background: form[key] ? 'rgba(119,255,200,0.08)' : '#192123',
                  border: form[key] ? '1px solid rgba(119,255,200,0.35)' : '1px solid rgba(59,74,66,0.2)',
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: form[key] ? 'rgba(119,255,200,0.15)' : '#2e3638' }}>
                  <span className="text-xl">{key === 'is_open_now' ? '🟢' : '⏱️'}</span>
                </div>
                <div className="flex-1">
                  <p className="font-heading font-bold text-sm" style={{ color: '#dff0e8' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#bacbc0' }}>{sub}</p>
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: form[key] ? '#77ffc8' : '#2e3638' }}>
                  {form[key] && <Check className="w-3.5 h-3.5" style={{ color: '#003826' }} />}
                </div>
              </button>
            ))}
            {form.is_opening_soon && (
              <div>
                <p className="mb-1.5" style={labelStyle}>COUNTDOWN (MINUTES)</p>
                <input type="number" value={form.countdown_minutes} onChange={e => set('countdown_minutes', parseInt(e.target.value))}
                  className={inputClass} style={inputStyle} />
              </div>
            )}
          </div>
        )}

        {/* STEP 7 — Kitchen Check */}
        {step === 7 && (
          <div className="space-y-5">
            <h2 className="font-heading font-black text-2xl mb-1" style={{ color: '#dff0e8' }}>Kitchen Check ✅</h2>
            <p className="text-sm mb-2" style={{ color: '#bacbc0' }}>
              Snap a quick photo of your kitchen interior to build customer trust. This is auto-timestamped as "Checked Today."
            </p>
            {form.kitchen_check_photo ? (
              <div className="relative rounded-3xl overflow-hidden">
                <img src={form.kitchen_check_photo} alt="Kitchen" className="w-full h-48 object-cover" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(13,21,23,0.85)', backdropFilter: 'blur(10px)' }}>
                    <Check className="w-4 h-4" style={{ color: '#77ffc8' }} />
                    <span className="text-xs font-bold" style={{ color: '#77ffc8' }}>
                      Checked: {new Date(form.kitchen_check_time).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <button onClick={() => { set('kitchen_check_photo', ''); set('kitchen_check_time', ''); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(13,21,23,0.8)' }}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ) : (
              <label className="block w-full h-48 rounded-3xl flex items-center justify-center cursor-pointer"
                style={{ background: '#192123', border: '2px dashed rgba(119,255,200,0.2)' }}>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(119,255,200,0.1)' }}>
                    <span className="text-2xl">📸</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#dff0e8' }}>Snap Kitchen Photo</p>
                    <p className="text-xs mt-1" style={{ color: '#bacbc0' }}>Auto-timestamped for customers</p>
                  </div>
                </div>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleKitchenCheck} />
              </label>
            )}
            <p className="text-xs text-center" style={{ color: '#bacbc0' }}>
              Optional but strongly recommended. Increases customer trust by 40%.
            </p>
          </div>
        )}

        {/* STEP 8 — Preview & Submit */}
        {step === 8 && (
          <div className="space-y-5">
            <h2 className="font-heading font-black text-2xl mb-1" style={{ color: '#dff0e8' }}>You're ready! 🎉</h2>
            <p className="text-sm mb-6" style={{ color: '#bacbc0' }}>Review your details and go live on CurbChef.</p>

            <div className="p-5 rounded-3xl space-y-3" style={{ background: '#192123', border: '1px solid rgba(119,255,200,0.15)' }}>
              {form.truck_photo_url && (
                <img src={form.truck_photo_url} alt="Truck" className="w-full h-36 object-cover rounded-2xl" />
              )}
              <h3 className="font-heading font-black text-xl" style={{ color: '#dff0e8' }}>{form.truck_name || '—'}</h3>
              <p className="text-sm capitalize" style={{ color: '#bacbc0' }}>{form.cuisine_type?.replace('_', ' ')} • {form.city}</p>
              <div className="flex gap-2 flex-wrap">
                {form.vendor_type && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(119,255,200,0.12)', color: '#77ffc8' }}>
                    {VENDOR_TYPES.find(v => v.id === form.vendor_type)?.emoji} {VENDOR_TYPES.find(v => v.id === form.vendor_type)?.label}
                  </span>
                )}
                {form.health_permit_status === 'approved' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(119,255,200,0.12)', color: '#77ffc8' }}>✓ Permit Approved</span>
                )}
                {form.is_open_now && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(119,255,200,0.12)', color: '#77ffc8' }}>● Open Now</span>
                )}
                {form.menu_items.filter(m => m.name).length > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#2e3638', color: '#bacbc0' }}>
                    {form.menu_items.filter(m => m.name).length} menu items
                  </span>
                )}
                {form.kitchen_check_photo && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(119,255,200,0.12)', color: '#77ffc8' }}>✓ Kitchen Checked</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl" style={{ background: '#192123', border: '1px solid rgba(119,255,200,0.12)' }}>
              <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: '#77ffc8' }}>NEXT STEP AFTER APPROVAL</p>
              <p className="text-xs" style={{ color: '#bacbc0' }}>
                Once approved, visit your Vendor Dashboard to connect your Stripe account and start accepting card payments. CurbChef collects a 12% platform fee per order.
              </p>
            </div>
            <p className="text-xs text-center px-4" style={{ color: '#bacbc0' }}>
              After submitting, our team will review your application and approve your truck within 24 hours.
            </p>

            <button onClick={handleSubmit} disabled={submitting}
              className="w-full py-4 rounded-full font-heading font-black text-base"
              style={{
                background: 'linear-gradient(135deg,#77ffc8,#00e6a7)',
                color: '#003826',
                boxShadow: '0 0 24px rgba(119,255,200,0.4)',
                opacity: submitting ? 0.7 : 1,
              }}>
              {submitting ? 'Submitting...' : '🚀 Submit & Go Live'}
            </button>
          </div>
        )}
      </div>

      {/* Launch Coach — contextual AI helper */}
      <div className="fixed bottom-24 left-4 right-4 z-40">
        <OnboardingGuideChat currentStep={step} vendorEmail={form.email} />
      </div>

      {/* Sticky nav */}
      {step < 8 && (
        <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-4 z-50"
          style={{ background: 'rgba(13,21,23,0.97)', backdropFilter: 'blur(16px)' }}>
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-heading font-black text-base transition-all"
            style={{
              background: canNext() ? 'linear-gradient(135deg,#77ffc8,#00e6a7)' : '#192123',
              color: canNext() ? '#003826' : '#bacbc0',
              boxShadow: canNext() ? '0 0 24px rgba(119,255,200,0.35)' : 'none',
            }}>
            Continue <ChevronRight className="w-5 h-5" />
          </button>
          {step >= 2 && (
            <button onClick={() => setStep(s => s + 1)} className="w-full text-center mt-3 text-sm font-semibold" style={{ color: '#bacbc0' }}>
              Skip this step
            </button>
          )}
        </div>
      )}
    </div>
  );
}