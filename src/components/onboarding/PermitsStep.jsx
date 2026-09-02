import React from 'react';
import { Upload, Check, ExternalLink, ShieldCheck, AlertTriangle } from'lucide-react';

const OFFICIAL_RESOURCES = [
  {
    label:'Houston Temporary Food Permit',
    url:'https://www.houstontx.gov/health/Environmental/tempfood.html',
    note:'Required for pop-ups, events & tents',
  },
  {
    label:'Houston Mobile Food Unit Permit',
    url:'https://www.houstontx.gov/health/Environmental/mobilefood.html',
    note:'Required for food trucks & trailers',
  },
  {
    label:'Texas DSHS Mobile Food Establishment',
    url:'https://www.dshs.texas.gov/foodestablishments/mobile.aspx',
    note:'State-level permit for mobile units',
  },
  {
    label:'Texas Cottage Food Rules (DSHS)',
    url:'https://www.dshs.texas.gov/foodestablishments/cottagefood.aspx',
    note:'For home-produced / packaged goods',
  },
];

// What docs each vendor type needs
const DOCS_BY_TYPE = {
  food_truck: ['health_permit','food_handler_cert'],
  food_trailer: ['health_permit','food_handler_cert'],
  licensed_popup: ['health_permit','food_handler_cert','event_permit','event_auth'],
  caterer_commercial: ['health_permit','food_handler_cert','commissary'],
  cottage_goods: ['cottage_license','food_handler_cert'],
  private_chef: ['health_permit','food_handler_cert'],
};

function UploadRow({ label, fieldKey, value, onUpload, onRemove, required, hint }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <p style={{ color: 'var(--cc-ink-dim)', fontSize:'11px', fontWeight:'700', letterSpacing:'0.08em'}}>{label}</p>
        {required && <span style={{ color:'var(--cc-warm)', fontSize: 10 }}>*</span>}
        {hint && <span style={{ color:'var(--cc-ink-faint)', fontSize: 10 }}>· {hint}</span>}
      </div>
      {value ? (
        <div className="flex items-center gap-3 p-3 rounded-2xl"
          style={{ background: 'rgba(var(--cc-accent-rgb),0.07)', border:'1px solid rgba(var(--cc-accent-rgb),0.2)' }}>
          <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cc-accent)' }} />
          <span className="text-xs font-bold flex-1" style={{ color: 'var(--cc-accent)' }}>Uploaded </span>
          <a href={value} target="_blank"rel="noopener noreferrer"className="text-xs font-semibold mr-2" style={{ color: 'var(--cc-accent)' }}>View</a>
          <button onClick={onRemove} className="text-xs" style={{ color: 'var(--cc-ink-dim)' }}>Remove</button>
        </div>
      ) : (
        <label className="flex items-center gap-3 w-full h-14 rounded-2xl cursor-pointer px-4"
          style={{ background: 'var(--cc-bg-2)', border: `2px dashed ${required ?'rgba(var(--cc-accent-rgb),0.25)':'rgba(var(--cc-line-rgb),0.3)'}` }}>
          <Upload className="w-4 h-4 flex-shrink-0" style={{ color: required ? 'var(--cc-accent)':'var(--cc-ink-dim)' }} />
          <span className="text-xs" style={{ color: required ? 'var(--cc-ink-dim)':'var(--cc-ink-faint)'}}>
            {required ?'Upload document (PDF or photo)':'Upload (optional)'}
          </span>
          <input type="file"accept="image/*,application/pdf"className="hidden" onChange={onUpload} />
        </label>
      )}
    </div>
  );
}

export default function PermitsStep({ form, set, handleFileUpload, labelStyle, inputClass, inputStyle }) {
  const vendorType = form.vendor_type;
  const requiredDocs = DOCS_BY_TYPE[vendorType] || ['health_permit'];

  const needs = (doc) => requiredDocs.includes(doc);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl mb-1" style={{ color: 'var(--cc-ink)' }}>Permits & Verification </h2>
        <p className="text-sm" style={{ color: 'var(--cc-ink-dim)'}}>
          Upload your permits to unlock your trust badge. This keeps customers safe and helps your listing stand out.
        </p>
      </div>

      {/* Cottage Goods Disclosure */}
      {vendorType ==='cottage_goods' && (
        <div className="p-4 rounded-2xl space-y-2"
          style={{ background: 'rgba(255,214,10,0.06)', border:'1px solid rgba(255,214,10,0.2)' }}>
          <div className="flex items-center gap-2">
            <span className="text-base"></span>
            <p className="text-xs font-black" style={{ color: 'var(--cc-yellow)' }}>COTTAGE GOODS DISCLOSURE</p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--cc-ink-dim)'}}>
            This product may be produced in a <strong style={{ color:'var(--cc-ink)'}}>private residence</strong> that is not inspected by the state or local health department.
            All cottage goods sold on CurbChef must comply with <strong style={{ color:'var(--cc-ink)' }}>Texas Cottage Food Law</strong> (Texas Health & Safety Code §437.0193).
          </p>
          <p className="text-xs" style={{ color: 'var(--cc-ink-faint)'}}>
            Eligible items include baked goods, candies, jams, jellies, and other non-potentially-hazardous foods sold directly to the consumer.
          </p>
        </div>
      )}

      {/* Health Permit Status */}
      {needs('health_permit') && (
        <div>
          <p className="mb-2" style={labelStyle}>HEALTH PERMIT STATUS <span style={{ color: 'var(--cc-warm)' }}>*</span></p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'approved', label:'Approved & Active' },
              { id:'pending', label:'⏳ Applied — Pending'},
              { id:'not_submitted', label:'Not Yet Applied' },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => set('health_permit_status', id)}
                className="px-3 py-2 rounded-full text-xs font-bold transition-all"
                style={form.health_permit_status === id
                  ? { background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color:'var(--cc-accent-deep)'}
                  : { background:'var(--cc-bg-2)', color:'var(--cc-ink-dim)', border:'1px solid rgba(var(--cc-line-rgb),0.3)'}
                }>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cottage Food License Status */}
      {vendorType ==='cottage_goods' && (
        <div>
          <p className="mb-2"style={labelStyle}>COTTAGE FOOD LICENSE / REGISTRATION</p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'approved', label:'Registered' },
              { id:'pending', label:'⏳ In Progress'},
              { id:'not_submitted', label:'Not Yet Done' },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => set('health_permit_status', id)}
                className="px-3 py-2 rounded-full text-xs font-bold transition-all"
                style={form.health_permit_status === id
                  ? { background: 'linear-gradient(135deg,var(--cc-accent),var(--cc-accent-3))', color:'var(--cc-accent-deep)'}
                  : { background:'var(--cc-bg-2)', color:'var(--cc-ink-dim)', border:'1px solid rgba(var(--cc-line-rgb),0.3)'}
                }>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Permit Doc Upload */}
      <UploadRow
        label={vendorType ==='cottage_goods'?'COTTAGE FOOD LICENSE / PROOF':'HEALTH / OPERATING PERMIT'}
        fieldKey="permit_doc_url"
        value={form.permit_doc_url}
        onUpload={e => handleFileUpload(e, 'permit_doc_url')}
        onRemove={() => set('permit_doc_url','')}
        required={needs('health_permit') || needs('cottage_license')}
        hint="PDF or photo"/>

      {/* Food Handler Cert */}
      <UploadRow
        label="FOOD HANDLER / FOOD MANAGER CERTIFICATE"fieldKey="food_handler_cert_url"
        value={form.food_handler_cert_url}
        onUpload={e => handleFileUpload(e, 'food_handler_cert_url')}
        onRemove={() => set('food_handler_cert_url','')}
        required={false}
        hint="Highly recommended"
      />

      {/* Temporary Event Permit — pop-ups */}
      {needs('event_permit') && (
        <UploadRow
          label="TEMPORARY FOOD EVENT PERMIT"fieldKey="event_permit_url"
          value={form.event_permit_url || ''}
          onUpload={e => handleFileUpload(e,'event_permit_url')}
          onRemove={() => set('event_permit_url','')}
          required
          hint="Required for pop-ups & tents"
        />
      )}

      {/* Event/Location Authorization — pop-ups */}
      {needs('event_auth') && (
        <div>
          <p className="mb-1.5" style={labelStyle}>EVENT / LOCATION AUTHORIZATION <span style={{ color: 'var(--cc-warm)' }}>*</span></p>
          <textarea
            placeholder="Event name, organizer name, location address, event permit #, dates"
            value={form.event_authorization_info}
            onChange={e => set('event_authorization_info', e.target.value)}
            className={inputClass +'min-h-[80px] resize-none'}
            style={inputStyle}
          />
        </div>
      )}

      {/* Commissary — caterer/commercial */}
      {needs('commissary') && (
        <div>
          <p className="mb-1.5" style={labelStyle}>COMMISSARY / COMMERCIAL KITCHEN <span style={{ color: 'var(--cc-warm)' }}>*</span></p>
          <textarea
            placeholder="Kitchen name, address, and your agreement or registration #"
            value={form.commissary_info}
            onChange={e => set('commissary_info', e.target.value)}
            className={inputClass +'min-h-[72px] resize-none'}
            style={inputStyle}
          />
        </div>
      )}

      {/* Official Resources */}
      <div>
        <p className="mb-3"style={{ ...labelStyle }}>OFFICIAL PERMIT RESOURCES</p>
        <div className="flex flex-col gap-2">
          {OFFICIAL_RESOURCES.map(r => (
            <a key={r.label} href={r.url} target="_blank"rel="noopener noreferrer"className="flex items-start gap-3 p-3 rounded-2xl transition-all"
              style={{ background: 'var(--cc-bg-0)', border:'1px solid rgba(var(--cc-line-rgb),0.2)' }}>
              <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--cc-accent)' }} />
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--cc-ink)' }}>{r.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--cc-ink-faint)' }}>{r.note}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Platform Disclaimer */}
      <div className="p-4 rounded-2xl"
        style={{ background: 'rgba(var(--cc-line-rgb),0.12)', border:'1px solid rgba(var(--cc-line-rgb),0.25)' }}>
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--cc-ink-faint)' }} />
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--cc-ink-faint)'}}>
            <strong style={{ color:'var(--cc-ink-dim)' }}>CurbChef does not issue food permits.</strong> Vendors are responsible for meeting all local, state, and event requirements. CurbChef uses verification to help protect customers and maintain platform trust.
          </p>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--cc-ink-faint)'}}>
        Documents are reviewed by the CurbChef team and kept confidential. Questions? Email{''}
        <span style={{ color: 'var(--cc-accent)' }}>verify@curbchef.com</span>
      </p>
    </div>
  );
}