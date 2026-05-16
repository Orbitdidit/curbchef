import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, CheckCircle, Clock, XCircle, AlertTriangle, Loader2, Image } from 'lucide-react';
import VendorGate from '@/components/vendor/VendorGate';
import VerifiedBadge from '@/components/shared/VerifiedBadge';

// ── Single file upload field ──────────────────────────────────────────────────
function UploadField({ label, hint, required, value, onChange, accept = 'image/*,application/pdf', multiple = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    if (multiple) {
      const urls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        urls.push(file_url);
      }
      onChange([...(value || []), ...urls]);
    } else {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: files[0] });
      onChange(file_url);
    }
    setUploading(false);
  };

  const hasValue = multiple ? (value?.length > 0) : !!value;

  return (
    <div className="p-4 rounded-2xl" style={{ background: '#192123', border: `1px solid ${hasValue ? 'rgba(34,197,94,0.3)' : 'rgba(59,74,66,0.3)'}` }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {hasValue
              ? <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#22C55E' }} />
              : <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: required ? '#fd591e' : '#6B665C' }} />
            }
            <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>
              {label}
              {required && <span className="ml-1 text-xs" style={{ color: '#fd591e' }}>*</span>}
            </p>
          </div>
          {hint && <p className="text-xs mt-0.5 ml-6" style={{ color: '#bacbc0' }}>{hint}</p>}
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all active:scale-95"
          style={{ background: hasValue ? 'rgba(34,197,94,0.1)' : 'rgba(119,255,200,0.1)', color: hasValue ? '#22C55E' : '#77ffc8', border: `1px solid ${hasValue ? 'rgba(34,197,94,0.3)' : 'rgba(119,255,200,0.25)'}` }}
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? 'Uploading...' : hasValue ? (multiple ? 'Add more' : 'Replace') : 'Upload'}
        </button>
      </div>

      {/* Preview */}
      {multiple && value?.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap ml-6">
          {value.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt={`Photo ${i + 1}`} className="w-16 h-16 rounded-xl object-cover" />
              <button
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                style={{ background: '#ef4444', color: '#fff' }}>✕</button>
            </div>
          ))}
        </div>
      )}
      {!multiple && value && (
        <div className="mt-2 ml-6">
          {/\.(jpg|jpeg|png|gif|webp)$/i.test(value) ? (
            <img src={value} alt={label} className="w-24 h-16 rounded-xl object-cover" />
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: '#0d1517', color: '#77ffc8' }}>
              <Image className="w-4 h-4" /> Document uploaded
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}

// ── Status indicator ──────────────────────────────────────────────────────────
function SubmissionStatus({ truck, uploads }) {
  const allRequired = uploads.businessLicense && uploads.healthCert && uploads.ownerId && uploads.truckPhotos?.length >= 3;
  const anyUploaded = uploads.businessLicense || uploads.healthCert || uploads.ownerId || uploads.truckPhotos?.length > 0;
  const isPendingReview = truck.business_license_url && truck.health_cert_url && truck.owner_id_url;

  let status, color, bg, icon;

  if (truck.verification_status === 'rejected') {
    status = 'Rejected — see notes below'; color = '#ef4444'; bg = 'rgba(239,68,68,0.08)'; icon = <XCircle className="w-4 h-4" />;
  } else if (truck.verification_status === 'needs_review') {
    status = 'Needs more info — see notes below'; color = '#fbbf24'; bg = 'rgba(251,191,36,0.08)'; icon = <AlertTriangle className="w-4 h-4" />;
  } else if (isPendingReview) {
    status = 'Pending Review — we\'ll reach out within 24-48 hrs'; color = '#77ffc8'; bg = 'rgba(119,255,200,0.06)'; icon = <Clock className="w-4 h-4" />;
  } else if (allRequired) {
    status = 'Ready to submit'; color = '#22C55E'; bg = 'rgba(34,197,94,0.08)'; icon = <CheckCircle className="w-4 h-4" />;
  } else if (anyUploaded) {
    status = 'In progress — finish uploading required items'; color = '#fbbf24'; bg = 'rgba(251,191,36,0.08)'; icon = <Clock className="w-4 h-4" />;
  } else {
    status = 'Not submitted yet'; color = '#6B665C'; bg = '#192123'; icon = <Clock className="w-4 h-4" />;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: bg, border: `1px solid ${color}25` }}>
      <span style={{ color }}>{icon}</span>
      <p className="text-sm font-semibold" style={{ color }}>{status}</p>
    </div>
  );
}

// ── Main inner component ──────────────────────────────────────────────────────
function VendorVerificationInner({ truck, user }) {
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Local upload state — pre-fill from existing truck data
  const [uploads, setUploads] = useState({
    businessLicense: truck.business_license_url || '',
    healthCert: truck.health_cert_url || '',
    ownerId: truck.owner_id_url || '',
    truckPhotos: truck.cover_media?.map(m => m.url).filter(Boolean) || [],
  });

  const allRequired = uploads.businessLicense && uploads.healthCert && uploads.ownerId && uploads.truckPhotos?.length >= 3;
  const alreadySubmitted = !!(truck.business_license_url && truck.health_cert_url && truck.owner_id_url);
  const isVerified = truck.verified_status;

  const handleSubmit = async () => {
    if (!allRequired || submitting) return;
    setSubmitting(true);

    // Save all doc URLs to truck entity using private upload for sensitive docs
    await base44.entities.FoodTruck.update(truck.id, {
      business_license_url: uploads.businessLicense,
      health_cert_url: uploads.healthCert,
      owner_id_url: uploads.ownerId,
      cover_media: uploads.truckPhotos.map(url => ({ type: 'image', url })),
      verification_status: 'pending',
      verified_status: false,
    });

    // Notify admin via existing function
    await base44.functions.invoke('notifyNewTruckApplication', { truckId: truck.id, truckName: truck.name }).catch(() => {});

    qc.invalidateQueries({ queryKey: ['vendor-truck'] });
    setSubmitting(false);
    setSubmitted(true);
  };

  // ── VERIFIED STATE ──
  if (isVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-20 text-center" style={{ background: '#0d1517' }}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', boxShadow: '0 0 40px rgba(34,197,94,0.2)' }}>
          <CheckCircle className="w-12 h-12" style={{ color: '#22C55E' }} />
        </div>
        <VerifiedBadge size="lg" showLabel className="mb-4 justify-center" />
        <h1 className="font-heading font-black text-3xl mb-2" style={{ color: '#dff0e8' }}>You're Verified ✅</h1>
        {truck.verification_date && (
          <p className="text-sm mb-4" style={{ color: '#bacbc0' }}>
            Verified on {new Date(truck.verification_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
        <p className="text-sm mb-8 max-w-xs" style={{ color: '#bacbc0' }}>
          You can now Go Live, access all features, and build your audience on CurbChef.
        </p>
        <Link to="/vendor">
          <button className="px-8 py-3.5 rounded-full font-heading font-black text-sm"
            style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826', boxShadow: '0 0 20px rgba(119,255,200,0.3)' }}>
            ← Back to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  // ── SUBMISSION FORM ──
  return (
    <div className="min-h-screen pb-24" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-20"
        style={{ background: 'rgba(13,21,23,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.2)' }}>
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Link to="/vendor" className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#192123' }}>
            <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
          </Link>
          <div className="flex-1">
            <p className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>Get Verified</p>
            <p className="text-xs" style={{ color: '#bacbc0' }}>Unlock Live broadcasting & all features</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 max-w-lg mx-auto">
        {/* Intro */}
        <div className="p-5 rounded-3xl mb-6" style={{ background: 'rgba(119,255,200,0.04)', border: '1px solid rgba(119,255,200,0.15)' }}>
          <h2 className="font-heading font-black text-lg mb-1" style={{ color: '#dff0e8' }}>
            🛡️ Verify your truck to unlock Live broadcasting
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#bacbc0' }}>
            Verification takes <strong style={{ color: '#77ffc8' }}>24–48 hours</strong>. We review every truck personally to protect customers and vendors alike.
          </p>
        </div>

        {/* Rejection / needs-review notes */}
        {(truck.verification_status === 'rejected' || truck.verification_status === 'needs_review') && truck.verification_notes && (
          <div className="p-4 rounded-2xl mb-5"
            style={{ background: truck.verification_status === 'rejected' ? 'rgba(239,68,68,0.08)' : 'rgba(251,191,36,0.08)', border: `1px solid ${truck.verification_status === 'rejected' ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.3)'}` }}>
            <p className="text-xs font-black mb-1" style={{ color: truck.verification_status === 'rejected' ? '#ef4444' : '#fbbf24' }}>
              {truck.verification_status === 'rejected' ? '❌ Rejection reason:' : '📋 What we need:'}
            </p>
            <p className="text-sm" style={{ color: '#dff0e8' }}>{truck.verification_notes}</p>
          </div>
        )}

        {/* Upload checklist */}
        <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: '#77ffc8' }}>REQUIRED DOCUMENTS</p>
        <div className="flex flex-col gap-3 mb-6">
          <UploadField
            label="Business License / Permit"
            hint="City or county food service business license"
            required
            value={uploads.businessLicense}
            onChange={v => setUploads(u => ({ ...u, businessLicense: v }))}
            accept="image/*,application/pdf"
          />
          <UploadField
            label="Health Inspection Certificate"
            hint="Current valid health inspection from your county"
            required
            value={uploads.healthCert}
            onChange={v => setUploads(u => ({ ...u, healthCert: v }))}
            accept="image/*,application/pdf"
          />
          <UploadField
            label="Owner Government ID"
            hint="Driver's license or passport — admin-only, never shown publicly"
            required
            value={uploads.ownerId}
            onChange={v => setUploads(u => ({ ...u, ownerId: v }))}
            accept="image/*"
          />
          <UploadField
            label="Truck Photos (minimum 3)"
            hint="Photos of your truck exterior, setup, and food — shown on your profile"
            required
            multiple
            value={uploads.truckPhotos}
            onChange={v => setUploads(u => ({ ...u, truckPhotos: v }))}
            accept="image/*"
          />
        </div>

        {/* Photo count indicator */}
        {uploads.truckPhotos?.length > 0 && uploads.truckPhotos?.length < 3 && (
          <p className="text-xs mb-4 text-center" style={{ color: '#fbbf24' }}>
            ⚠️ Need {3 - uploads.truckPhotos.length} more photo{3 - uploads.truckPhotos.length > 1 ? 's' : ''} (minimum 3 required)
          </p>
        )}

        {/* Status */}
        <div className="mb-5">
          <SubmissionStatus truck={truck} uploads={uploads} />
        </div>

        {/* Success state after submit */}
        {submitted && (
          <div className="p-4 rounded-2xl mb-5 text-center" style={{ background: 'rgba(119,255,200,0.08)', border: '1px solid rgba(119,255,200,0.25)' }}>
            <p className="font-heading font-black text-base mb-1" style={{ color: '#77ffc8' }}>🎉 Submitted for review!</p>
            <p className="text-xs" style={{ color: '#bacbc0' }}>We'll reach out within 24-48 hours. Watch your email.</p>
          </div>
        )}

        {/* Submit button */}
        {!alreadySubmitted && !submitted && (
          <button
            onClick={handleSubmit}
            disabled={!allRequired || submitting}
            className="w-full py-4 rounded-full font-heading font-black text-base flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: allRequired ? 'linear-gradient(135deg,#77ffc8,#00e6a7)' : '#192123',
              color: allRequired ? '#003826' : '#6B665C',
              boxShadow: allRequired ? '0 0 24px rgba(119,255,200,0.3)' : 'none',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {submitting ? 'Submitting...' : '🛡️ Submit for Review'}
          </button>
        )}

        {alreadySubmitted && !submitted && (
          <div className="text-center py-4">
            <p className="text-sm font-semibold" style={{ color: '#bacbc0' }}>
              Documents already on file. Update any field and resubmit if needed.
            </p>
            <button
              onClick={handleSubmit}
              disabled={!allRequired || submitting}
              className="mt-3 px-6 py-3 rounded-full font-bold text-sm transition-all active:scale-95"
              style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.25)' }}>
              {submitting ? 'Resubmitting...' : 'Resubmit for Review'}
            </button>
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}

export default function VendorVerification() {
  return (
    <VendorGate>
      {({ truck, user }) => <VendorVerificationInner truck={truck} user={user} />}
    </VendorGate>
  );
}