import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ExternalLink, CheckCircle, XCircle, MessageSquare, Shield, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const ADMIN_EMAILS = ['orbitdidit@gmail.com'];

// ── Doc viewer modal ──────────────────────────────────────────────────────────
function DocModal({ url, title, onClose }) {
  const isImage = url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden"
        style={{ background: '#151d1f', border: '1px solid rgba(59,74,66,0.4)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(59,74,66,0.3)' }}>
          <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>{title}</p>
          <div className="flex items-center gap-3">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold"
              style={{ color: '#77ffc8' }}>
              <ExternalLink className="w-3.5 h-3.5" /> Open full
            </a>
            <button onClick={onClose} className="text-sm font-bold" style={{ color: '#bacbc0' }}>✕</button>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center" style={{ minHeight: 300, maxHeight: '70vh', overflow: 'auto' }}>
          {isImage ? (
            <img src={url} alt={title} className="max-w-full max-h-full rounded-xl object-contain" />
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-4">📄</div>
              <p className="font-semibold mb-3" style={{ color: '#dff0e8' }}>Document preview</p>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full font-bold text-sm"
                style={{ background: 'rgba(119,255,200,0.1)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.3)' }}>
                Open document →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Note modal (reject / request info) ───────────────────────────────────────
function NoteModal({ truck, mode, onClose, onSubmit, loading }) {
  const [note, setNote] = useState('');
  const isReject = mode === 'reject';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl p-6 pb-8"
        style={{ background: '#151d1f', border: `1px solid ${isReject ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.3)'}` }}
        onClick={e => e.stopPropagation()}>
        <p className="font-heading font-black text-lg mb-1" style={{ color: '#dff0e8' }}>
          {isReject ? '❌ Reject Application' : '📋 Request More Info'}
        </p>
        <p className="text-xs mb-4" style={{ color: '#bacbc0' }}>
          {isReject
            ? `Explain why ${truck.name}'s application is being rejected.`
            : `Tell ${truck.name} what additional documents or info you need.`}
        </p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={isReject ? 'Reason for rejection...' : 'What information is missing or needs clarification?'}
          rows={4}
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none mb-4"
          style={{ background: '#192123', color: '#dff0e8', border: '1px solid rgba(59,74,66,0.5)' }}
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-full font-bold text-sm"
            style={{ background: '#192123', color: '#bacbc0' }}>
            Cancel
          </button>
          <button onClick={() => onSubmit(note)} disabled={loading || !note.trim()}
            className="flex-1 py-3 rounded-full font-heading font-black text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: isReject ? '#ef4444' : 'rgba(251,191,36,0.9)',
              color: isReject ? '#fff' : '#1a0f00',
              opacity: loading || !note.trim() ? 0.6 : 1,
            }}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isReject ? 'Send Rejection' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Doc link button ───────────────────────────────────────────────────────────
function DocButton({ url, label, onView }) {
  if (!url) return (
    <span className="text-[10px] font-semibold px-2 py-1 rounded-lg"
      style={{ background: '#192123', color: '#6B665C' }}>
      {label}: —
    </span>
  );
  return (
    <button onClick={() => onView(url, label)}
      className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95"
      style={{ background: 'rgba(119,255,200,0.08)', color: '#77ffc8', border: '1px solid rgba(119,255,200,0.2)' }}>
      📄 {label}
    </button>
  );
}

// ── Stripe status pill ────────────────────────────────────────────────────────
function StripePill({ status }) {
  const cfg = {
    payouts_enabled: { label: 'Connected', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    charges_enabled: { label: 'Charges OK', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    onboarding_started: { label: 'Onboarding', color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
    not_connected: { label: 'Not Connected', color: '#6B665C', bg: '#192123' },
  }[status || 'not_connected'];
  return (
    <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      {cfg.label}
    </span>
  );
}

// ── Truck verification row ────────────────────────────────────────────────────
function TruckRow({ truck, onApprove, onReject, onRequestInfo, loading }) {
  const [docModal, setDocModal] = useState(null); // { url, title }

  return (
    <>
      <div className="p-4 rounded-2xl flex flex-col gap-4"
        style={{ background: '#151d1f', border: '1px solid rgba(59,74,66,0.25)' }}>
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Truck photo */}
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
            style={{ background: '#192123' }}>
            {truck.image_url
              ? <img src={truck.image_url} alt={truck.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-xl">🚚</div>
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-heading font-black text-sm" style={{ color: '#dff0e8' }}>{truck.name}</p>
              <StripePill status={truck.stripe_onboarding_status} />
            </div>
            <p className="text-xs" style={{ color: '#bacbc0' }}>{truck.owner_email || '—'}</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#6B665C' }}>
              Submitted {truck.created_date ? format(new Date(truck.created_date), 'MMM d, yyyy') : '—'}
            </p>
          </div>
        </div>

        {/* Docs row */}
        <div className="flex flex-wrap gap-2">
          <DocButton url={truck.business_license_url} label="Business License"
            onView={(url, label) => setDocModal({ url, label })} />
          <DocButton url={truck.health_cert_url} label="Health Cert"
            onView={(url, label) => setDocModal({ url, label })} />
          <DocButton url={truck.owner_id_url} label="Owner ID"
            onView={(url, label) => setDocModal({ url, label })} />
          <DocButton url={truck.permit_doc_url} label="Permit Doc"
            onView={(url, label) => setDocModal({ url, label })} />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={() => onApprove(truck)} disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-heading font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#22C55E,#16a34a)', color: '#fff', opacity: loading ? 0.6 : 1 }}>
            <CheckCircle className="w-3.5 h-3.5" /> Approve
          </button>
          <button onClick={() => onReject(truck)} disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-heading font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', opacity: loading ? 0.6 : 1 }}>
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
          <button onClick={() => onRequestInfo(truck)} disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-heading font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
            style={{ background: 'rgba(251,191,36,0.08)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)', opacity: loading ? 0.6 : 1 }}>
            <MessageSquare className="w-3.5 h-3.5" /> Request Info
          </button>
        </div>
      </div>

      {docModal && (
        <DocModal url={docModal.url} title={docModal.label} onClose={() => setDocModal(null)} />
      )}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function VerificationQueue() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // { truck, mode: 'reject' | 'info' }
  const [actionLoading, setActionLoading] = useState(false);

  // Auth check
  const { data: adminUser } = useQuery({
    queryKey: ['admin-me-verify'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });
  const isAdmin = !!adminUser && ADMIN_EMAILS.includes(adminUser.email);

  // Fetch queue: trucks with business_license_url set and not yet verified
  const { data: allTrucks = [], isLoading } = useQuery({
    queryKey: ['verification-queue'],
    queryFn: () => base44.entities.FoodTruck.list('created_date', 100),
    enabled: isAdmin,
    select: data => data.filter(t => !t.verified_status && t.business_license_url),
  });

  // Already verified (for reference count)
  const { data: verifiedTrucks = [] } = useQuery({
    queryKey: ['verified-trucks-count'],
    queryFn: () => base44.entities.FoodTruck.list(),
    enabled: isAdmin,
    select: data => data.filter(t => t.verified_status),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['verification-queue'] });
    qc.invalidateQueries({ queryKey: ['verified-trucks-count'] });
  };

  const handleApprove = async (truck) => {
    setActionLoading(true);
    await base44.entities.FoodTruck.update(truck.id, {
      verified_status: true,
      verification_date: new Date().toISOString(),
      verification_status: 'verified',
    });
    // Send verified email if owner email exists
    if (truck.owner_email) {
      await base44.functions.invoke('sendVendorApprovedEmail', { truckId: truck.id, email: truck.owner_email, truckName: truck.name }).catch(() => {});
    }
    invalidate();
    setActionLoading(false);
  };

  const handleNoteSubmit = async (note) => {
    const { truck, mode } = modal;
    setActionLoading(true);
    await base44.entities.FoodTruck.update(truck.id, {
      verification_notes: note,
      verification_status: mode === 'reject' ? 'rejected' : 'needs_review',
      verified_status: false,
    });
    // Could extend to call email functions here
    invalidate();
    setActionLoading(false);
    setModal(null);
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1517' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#77ffc8 transparent transparent transparent' }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-8 text-center" style={{ background: '#0d1517' }}>
        <p className="text-4xl">🔒</p>
        <p className="font-heading font-bold text-lg" style={{ color: '#dff0e8' }}>Admin access required</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 rounded-full font-bold text-sm"
          style={{ background: 'linear-gradient(135deg,#77ffc8,#00e6a7)', color: '#003826' }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: '#0d1517' }}>
      {/* Header */}
      <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 sticky top-0 z-20"
        style={{ background: 'rgba(13,21,23,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(59,74,66,0.2)' }}>
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button onClick={() => navigate('/admin')}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#192123' }}>
            <ChevronLeft className="w-5 h-5" style={{ color: '#dff0e8' }} />
          </button>
          <div className="flex-1">
            <p className="font-heading font-black text-base" style={{ color: '#dff0e8' }}>
              <Shield className="w-4 h-4 inline mr-1.5 mb-0.5" style={{ color: '#22C55E' }} />
              Verification Queue
            </p>
            <p className="text-xs" style={{ color: '#bacbc0' }}>
              {allTrucks.length} pending · {verifiedTrucks.length} verified
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: '#151d1f' }} />)}
          </div>
        ) : allTrucks.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✅</div>
            <p className="font-heading font-black text-xl mb-2" style={{ color: '#dff0e8' }}>Queue is clear!</p>
            <p className="text-sm" style={{ color: '#bacbc0' }}>
              No trucks pending verification. Trucks appear here once they upload a business license.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {allTrucks.map(truck => (
              <TruckRow
                key={truck.id}
                truck={truck}
                loading={actionLoading}
                onApprove={handleApprove}
                onReject={t => setModal({ truck: t, mode: 'reject' })}
                onRequestInfo={t => setModal({ truck: t, mode: 'info' })}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <NoteModal
          truck={modal.truck}
          mode={modal.mode}
          loading={actionLoading}
          onClose={() => setModal(null)}
          onSubmit={handleNoteSubmit}
        />
      )}
    </div>
  );
}