import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Phone, Instagram, ShieldCheck, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { parseServerDate, formatLocalDateTime } from '@/lib/timeUtils';

const VENDOR_TYPE_LABELS = {
  food_truck:          '🚚 Food Truck',
  food_trailer:        '🚛 Food Trailer',
  licensed_popup:      '⛺ Licensed Pop-Up',
  caterer_commercial:  '👨‍🍳 Commercial Kitchen',
  cottage_goods:       '🏡 Cottage Goods',
};

const VERIFICATION_COLORS = {
  pending:      { color: 'var(--cc-amber)', bg: 'rgba(251,191,36,0.1)' },
  verified:     { color: 'var(--cc-accent)', bg: 'rgba(var(--cc-accent-rgb),0.1)' },
  rejected:     { color: 'var(--cc-warm-red)', bg: 'rgba(var(--cc-warm-red-rgb),0.1)' },
  needs_review: { color: 'var(--cc-warm)', bg: 'rgba(var(--cc-warm-rgb),0.1)' },
};

function ApplicationCard({ app, onApprove, onReject, isPending }) {
  const [expanded, setExpanded] = useState(false);

  const statusStyle = {
    submitted: { bg: 'rgba(251,191,36,0.12)', color: 'var(--cc-amber)', border: 'rgba(251,191,36,0.3)', label: 'SUBMITTED' },
    approved: { bg: 'rgba(var(--cc-accent-rgb),0.10)', color: 'var(--cc-accent)', border: 'rgba(var(--cc-accent-rgb),0.3)', label: 'APPROVED' },
    rejected: { bg: 'rgba(var(--cc-warm-red-rgb),0.10)', color: 'var(--cc-warm-red)', border: 'rgba(var(--cc-warm-red-rgb),0.3)', label: 'REJECTED' },
    draft: { bg: 'rgba(186,203,192,0.08)', color: 'var(--cc-ink-dim)', border: 'rgba(186,203,192,0.2)', label: 'DRAFT' },
  }[app.status || 'draft'] || { bg: 'rgba(186,203,192,0.08)', color: 'var(--cc-ink-dim)', border: 'rgba(186,203,192,0.2)', label: 'UNKNOWN' };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--cc-bg-2)', border: '1px solid rgba(var(--cc-line-rgb),0.25)' }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {app.logo_url ? (
            <img src={app.logo_url} alt={app.truck_name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'var(--cc-bg-3)' }}>🚚</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-heading font-black text-base" style={{ color: 'var(--cc-ink)' }}>{app.truck_name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--cc-ink-dim)' }}>{app.owner_name} · {app.email}</p>
                <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--cc-ink-dim)' }}>{app.cuisine_type?.replace('_', ' ')} · {app.city}</p>
                {app.vendor_type && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ background: 'rgba(var(--cc-accent-rgb),0.08)', color: 'var(--cc-accent)', border: '1px solid rgba(var(--cc-accent-rgb),0.2)' }}>
                    {VENDOR_TYPE_LABELS[app.vendor_type] || app.vendor_type}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>
                {statusStyle.label}
              </span>
            </div>
            <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: 'rgba(186,203,192,0.5)' }}>
              <Clock className="w-3 h-3" />
              {formatLocalDateTime(parseServerDate(app.created_date))}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 mt-3 text-xs font-semibold"
          style={{ color: 'var(--cc-ink-dim)' }}
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Hide details' : 'View details'}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: 'rgba(var(--cc-line-rgb),0.2)' }}>
          <div className="pt-4 flex flex-col gap-4">
            <div className="flex gap-4 flex-wrap">
              {app.phone && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--cc-ink-dim)' }}>
                  <Phone className="w-3.5 h-3.5" style={{ color: 'var(--cc-accent)' }} /> {app.phone}
                </div>
              )}
              {app.instagram && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--cc-ink-dim)' }}>
                  <Instagram className="w-3.5 h-3.5" style={{ color: 'var(--cc-accent)' }} /> {app.instagram}
                </div>
              )}
            </div>

            {app.menu_items?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--cc-accent)' }}>MENU ITEMS</p>
                <div className="flex flex-col gap-1.5">
                  {app.menu_items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'var(--cc-bg-0)' }}>
                      <span className="text-sm" style={{ color: 'var(--cc-ink)' }}>{item.name}</span>
                      <div className="flex items-center gap-3">
                        {item.prep_time && <span className="text-xs" style={{ color: 'var(--cc-ink-dim)' }}>~{item.prep_time}min</span>}
                        <span className="font-bold text-sm" style={{ color: 'var(--cc-accent)' }}>${Number(item.price || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {app.food_images?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--cc-accent)' }}>FOOD PHOTOS</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {app.food_images.map((url, i) => (
                    <img key={i} src={url} alt="food" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  ))}
                </div>
              </div>
            )}

            {/* Permit & verification info */}
            {(app.permit_doc_url || app.food_handler_cert_url || app.commissary_info || app.event_authorization_info) && (
              <div>
                <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--cc-amber)' }}>PERMITS & VERIFICATION DOCS</p>
                <div className="flex flex-col gap-2">
                  {app.health_permit_status && (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--cc-accent)' }} />
                      <span className="text-xs" style={{ color: 'var(--cc-ink-dim)' }}>Health Permit: <strong style={{ color: 'var(--cc-ink)' }}>{app.health_permit_status?.replace('_', ' ')}</strong></span>
                    </div>
                  )}
                  {app.permit_doc_url && (
                    <a href={app.permit_doc_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs py-2 px-3 rounded-xl"
                      style={{ background: 'rgba(var(--cc-accent-rgb),0.08)', color: 'var(--cc-accent)', border: '1px solid rgba(var(--cc-accent-rgb),0.2)' }}>
                      <FileText className="w-3.5 h-3.5" /> View Permit Document ↗
                    </a>
                  )}
                  {app.food_handler_cert_url && (
                    <a href={app.food_handler_cert_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs py-2 px-3 rounded-xl"
                      style={{ background: 'rgba(var(--cc-accent-rgb),0.08)', color: 'var(--cc-accent)', border: '1px solid rgba(var(--cc-accent-rgb),0.2)' }}>
                      <FileText className="w-3.5 h-3.5" /> View Food Handler Cert ↗
                    </a>
                  )}
                  {app.commissary_info && (
                    <div className="p-2 rounded-xl" style={{ background: 'var(--cc-bg-0)' }}>
                      <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--cc-ink-dim)' }}>COMMISSARY / KITCHEN</p>
                      <p className="text-xs" style={{ color: 'var(--cc-ink)' }}>{app.commissary_info}</p>
                    </div>
                  )}
                  {app.event_authorization_info && (
                    <div className="p-2 rounded-xl" style={{ background: 'var(--cc-bg-0)' }}>
                      <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--cc-ink-dim)' }}>EVENT / LOCATION AUTH</p>
                      <p className="text-xs" style={{ color: 'var(--cc-ink)' }}>{app.event_authorization_info}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {app.kitchen_check_photo && (
              <div>
                <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--cc-accent)' }}>KITCHEN CHECK PHOTO</p>
                <img src={app.kitchen_check_photo} alt="Kitchen" className="w-full max-w-xs rounded-xl object-cover" style={{ maxHeight: 180 }} />
              </div>
            )}

            {app.truck_photo_url && (
              <div>
                <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--cc-accent)' }}>TRUCK PHOTO</p>
                <img src={app.truck_photo_url} alt="Truck" className="w-full rounded-xl object-cover" style={{ maxHeight: 200 }} />
              </div>
            )}
          </div>
        </div>
      )}

      {app.status === 'submitted' && (
        <div className="px-4 pb-4 flex gap-2.5">
          <button
            onClick={() => onApprove(app)}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-heading font-black text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color: 'var(--cc-accent-deep)', boxShadow: '0 0 16px rgba(var(--cc-accent-rgb),0.3)' }}
          >
            <CheckCircle className="w-4 h-4" />
            Approve Truck
          </button>
          <button
            onClick={() => onReject(app)}
            disabled={isPending}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition-all active:scale-95"
            style={{ background: 'rgba(var(--cc-warm-red-rgb),0.12)', color: 'var(--cc-warm-red)', border: '1px solid rgba(var(--cc-warm-red-rgb),0.25)' }}
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPanel() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['truck-applications'],
    queryFn: () => base44.entities.TruckOnboarding.list('-created_date', 50),
  });

  const approveMutation = useMutation({
    mutationFn: async (app) => {
      // 1. Create FoodTruck — approved but NOT live yet (vendor turns it on)
      const truck = await base44.entities.FoodTruck.create({
        name: app.truck_name,
        cuisine_type: app.cuisine_type || 'fusion',
        description: `${app.truck_name} — ${(app.cuisine_type || 'food').replace('_', ' ')} in ${app.city || 'Houston'}`,
        image_url: app.food_images?.[0] || app.truck_photo_url || '',
        cover_image_url: app.truck_photo_url || app.food_images?.[0] || '',
        address: app.city || 'Houston, TX',
        city: app.city || 'Houston',
        phone: app.phone || '',
        owner_email: (app.email || '').trim().toLowerCase(),
        latitude: app.latitude || null,
        longitude: app.longitude || null,
        status: 'closed',   // vendor opens it themselves
        is_approved: true,
        is_live: false,     // vendor goes live themselves
        rating: 5.0,
        review_count: 0,
        followers_count: 0,
        total_orders: 0,
        stripe_onboarding_status: 'not_connected',
        vendor_plan: 'free',
        vendor_type: app.vendor_type || 'food_truck',
        verification_status: 'verified',
        health_permit_status: app.health_permit_status || 'not_submitted',
        permit_doc_url: app.permit_doc_url || '',
        food_handler_cert_url: app.food_handler_cert_url || '',
        commissary_info: app.commissary_info || '',
        event_authorization_info: app.event_authorization_info || '',
      });

      // 2. Create MenuItem records from onboarding menu
      const validItems = (app.menu_items || []).filter(m => m.name && m.price);
      if (validItems.length) {
        await Promise.all(validItems.map((item, i) =>
          base44.entities.MenuItem.create({
            truck_id: truck.id,
            name: item.name,
            price: parseFloat(item.price) || 0,
            category: 'mains',
            is_available: true,
            is_special: i === 0,
            image_url: app.food_images?.[i] || app.food_images?.[0] || '',
            description: item.prep_time ? `Prep time: ${item.prep_time} min` : '',
          })
        ));
      }

      // 3. Mark application approved
      await base44.entities.TruckOnboarding.update(app.id, { status: 'approved' });

      // 4. Send approval email only after truck + menu are created
      await base44.integrations.Core.SendEmail({
        to: app.email,
        subject: `🎉 ${app.truck_name} is approved on CurbChef!`,
        body: `Hi ${app.owner_name},\n\nGreat news — your food truck "${app.truck_name}" has been approved on CurbChef!\n\nSign in to your Vendor Dashboard to:\n• Connect Stripe to accept card payments (12% platform fee per order)\n• Turn your truck OPEN and GO LIVE to start receiving orders\n• Manage your menu and food photos\n\nDashboard: https://app.curbchef.app/vendor\n\nSign in with: ${app.email}\n\nWelcome to CurbChef! 🚚🔥\n\n— The CurbChef Team`,
      });

      return truck;
    },
    onSuccess: (truck, app) => {
      qc.invalidateQueries({ queryKey: ['truck-applications'] });
      qc.invalidateQueries({ queryKey: ['admin-trucks'] });
      qc.invalidateQueries({ queryKey: ['trucks'] });
      toast({ title: `✅ ${app.truck_name} approved!`, description: 'Truck created. Approval email sent.', duration: 3000 });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (app) => base44.entities.TruckOnboarding.update(app.id, { status: 'rejected' }),
    onSuccess: (_, app) => {
      qc.invalidateQueries({ queryKey: ['truck-applications'] });
      toast({ title: `${app.truck_name} rejected`, duration: 2000 });
    },
  });

  const submitted = applications.filter(a => a.status === 'submitted');
  const reviewed = applications.filter(a => a.status !== 'submitted');

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map(i => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'var(--cc-bg-2)' }} />)}
      </div>
    );
  }

  return (
    <div>
      {submitted.length > 0 ? (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--cc-amber)' }}>PENDING REVIEW</p>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--cc-amber)' }}>
              {submitted.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {submitted.map(app => (
              <ApplicationCard key={app.id} app={app}
                onApprove={(a) => approveMutation.mutate(a)}
                onReject={(a) => rejectMutation.mutate(a)}
                isPending={approveMutation.isPending || rejectMutation.isPending}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 mb-6">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-heading font-bold text-sm" style={{ color: 'var(--cc-ink)' }}>No pending applications</p>
          <p className="text-xs mt-1" style={{ color: 'var(--cc-ink-dim)' }}>All caught up!</p>
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: 'var(--cc-ink-dim)' }}>PREVIOUSLY REVIEWED</p>
          <div className="flex flex-col gap-3">
            {reviewed.map(app => (
              <ApplicationCard key={app.id} app={app}
                onApprove={(a) => approveMutation.mutate(a)}
                onReject={(a) => rejectMutation.mutate(a)}
                isPending={approveMutation.isPending || rejectMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}