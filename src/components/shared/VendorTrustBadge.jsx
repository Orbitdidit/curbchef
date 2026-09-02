import React from 'react';
import { ShieldCheck } from 'lucide-react';

const BADGE_CONFIG = {
  food_truck: {
    label:'Verified Truck',
    color:'var(--cc-accent-2)',
    bg:'rgba(0,245,212,0.1)',
    border:'rgba(0,245,212,0.25)',
    emoji:'',
  },
  food_trailer: {
    label:'Verified Trailer',
    color:'var(--cc-accent-2)',
    bg:'rgba(0,245,212,0.1)',
    border:'rgba(0,245,212,0.25)',
    emoji:'',
  },
  licensed_popup: {
    label:'Verified Pop-Up',
    color:'var(--cc-yellow)',
    bg:'rgba(255,214,10,0.1)',
    border:'rgba(255,214,10,0.25)',
    emoji:'',
  },
  caterer_commercial: {
    label:'Commercial Kitchen Verified',
    color:'var(--cc-warm-2)',
    bg:'rgba(255,107,26,0.1)',
    border:'rgba(255,107,26,0.25)',
    emoji:'',
  },
  cottage_goods: {
    label:'Cottage Goods',
    color:'var(--cc-ink-muted)',
    bg:'rgba(163,158,148,0.1)',
    border:'rgba(163,158,148,0.25)',
    emoji:'',
  },
  private_chef: {
    label:'Private Chef Verified',
    color:'var(--cc-violet)',
    bg:'rgba(192,132,252,0.1)',
    border:'rgba(192,132,252,0.25)',
    emoji:'',
  },
};

export default function VendorTrustBadge({ truck, size ='sm'}) {
  if (!truck?.vendor_type) return null;

  const config = BADGE_CONFIG[truck.vendor_type];
  if (!config) return null;

  // Only show if verified or show pending state
  const isVerified = truck.verification_status ==='verified';
  const isPending = !truck.verification_status || truck.verification_status ==='pending';

  if (!isVerified && !isPending) return null;

  const isSm = size ==='sm';

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full"
      style={{
        background: isVerified ? config.bg : 'rgba(163,158,148,0.08)',
        border: `1px solid ${isVerified ? config.border :'rgba(163,158,148,0.15)'}`,
        padding: isSm ?'2px 8px':'4px 12px',
      }}
    >
      {isVerified ? (
        <ShieldCheck
          style={{ color: config.color, width: isSm ? 10 : 13, height: isSm ? 10 : 13, flexShrink: 0 }}
        />
      ) : (
        <span style={{ fontSize: isSm ? 9 : 11 }}>⏳</span>
      )}
      <span
        style={{
          color: isVerified ? config.color :'var(--cc-ink-faint)',
          fontSize: isSm ? 9 : 11,
          fontWeight: 700,
          letterSpacing:'0.03em',
          whiteSpace:'nowrap',
        }}
      >
        {isVerified ? config.label :'Pending Verification'}
      </span>
      {truck.vendor_type ==='cottage_goods'&& isVerified && (
        <span style={{ fontSize: isSm ? 8 : 10, color:'var(--cc-ink-faint)', marginLeft: 2 }}>ⓘ</span>
      )}
    </div>
  );
}