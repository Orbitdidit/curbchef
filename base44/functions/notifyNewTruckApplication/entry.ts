import { secureEndpoint, storedRecord, recordId, ownsTruck, deny, escapeData, recipient } from '../../shared/security.ts';

const ADMIN_EMAIL = 'admin@curbchef.com';

function vendorTypeLabel(type) {
  const map = {
    food_truck: '🚚 Food Truck',
    food_trailer: '🚛 Food Trailer',
    licensed_popup: '⛺ Licensed Pop-Up / Tent',
    caterer_commercial: '👨‍🍳 Caterer / Commercial Kitchen',
    cottage_goods: '🏡 Cottage Goods',
    private_chef: '👑 Private Chef',
  };
  return map[type] || type || 'Unknown';
}

function permitLabel(status) {
  const map = {
    approved: '✅ Approved & Active',
    pending: '⏳ Pending Approval',
    not_submitted: '📝 Not Yet Submitted',
  };
  return map[status] || status || '—';
}

export default async function(req) {
  return secureEndpoint(req, async ({ base44, user, body }) => {
    const verification = !!(body.truck_id || body.truckId);
    let record;
    if (verification) {
      const truck = await storedRecord(base44, 'FoodTruck', recordId(body, 'truck_id', 'truckId'));
      if (!ownsTruck(user, truck) || truck.verification_status !== 'pending') throw deny();
      record = { ...truck, truck_name: truck.name, email: truck.owner_email };
    } else {
      if (user.role !== 'admin') throw deny();
      record = await storedRecord(base44, 'TruckOnboarding', recordId(body, 'application_id'));
      if (record.status !== 'submitted') return Response.json({ skipped: 'not submitted' });
    }
    const application = escapeData(record);
    const toVendor = verification ? null : recipient(record.email);
    const truckName = application.truck_name || 'Unknown Truck';
    const ownerName = application.owner_name || '—';
    const vendorEmail = application.email || '—';
    const vendorType = vendorTypeLabel(application.vendor_type);
    const cuisine = (application.cuisine_type || '—').replace('_', ' ');
    const city = application.city || '—';
    const phone = application.phone || '—';
    const instagram = application.instagram ? `@${application.instagram.replace('@', '')}` : '—';
    const healthPermit = permitLabel(application.health_permit_status);
    const hasPermitDoc = application.permit_doc_url ? '✅ Uploaded' : '❌ Not uploaded';
    const hasFoodHandler = application.food_handler_cert_url ? '✅ Uploaded' : '—';
    const commissary = application.commissary_info || '—';
    const eventAuth = application.event_authorization_info || '—';
    const menuCount = Array.isArray(application.menu_items) ? application.menu_items.filter(m => m.name).length : 0;
    const isOpenNow = application.is_open_now ? '🟢 Yes' : 'No';
    const kitchenCheck = application.kitchen_check_photo ? '✅ Photo submitted' : '—';
    const submittedAt = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', dateStyle: 'full', timeStyle: 'short' });

    const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="font-family:Inter,sans-serif;background:#0A0A0A;color:#F5F0E8;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">

    <div style="background:linear-gradient(135deg,#003826,#001f16);border:1px solid rgba(0,245,212,0.25);border-radius:16px;padding:24px;margin-bottom:24px;">
      <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:rgba(0,245,212,0.6);margin:0 0 8px;">NEW APPLICATION</p>
      <h1 style="font-size:28px;font-weight:900;color:#00F5D4;margin:0 0 4px;">${truckName}</h1>
      <p style="font-size:14px;color:rgba(245,240,232,0.6);margin:0;">${vendorType} · ${city}</p>
    </div>

    <div style="background:#141414;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:20px;margin-bottom:16px;">
      <p style="font-size:10px;font-weight:700;letter-spacing:0.1em;color:#A39E94;margin:0 0 16px;">VENDOR DETAILS</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        ${[
          ['Owner', ownerName],
          ['Email', vendorEmail],
          ['Phone', phone],
          ['Instagram', instagram],
          ['Vendor Type', vendorType],
          ['Cuisine', cuisine],
          ['City', city],
        ].map(([k, v]) => `
        <tr>
          <td style="padding:6px 0;color:#A39E94;width:140px;">${k}</td>
          <td style="padding:6px 0;color:#F5F0E8;font-weight:600;">${v}</td>
        </tr>`).join('')}
      </table>
    </div>

    <div style="background:#141414;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:20px;margin-bottom:16px;">
      <p style="font-size:10px;font-weight:700;letter-spacing:0.1em;color:#A39E94;margin:0 0 16px;">PERMITS & VERIFICATION</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        ${[
          ['Health Permit Status', healthPermit],
          ['Permit Document', hasPermitDoc],
          ['Food Handler Cert', hasFoodHandler],
          ['Commissary Info', commissary],
          ['Event Authorization', eventAuth],
          ['Kitchen Check Photo', kitchenCheck],
        ].map(([k, v]) => `
        <tr>
          <td style="padding:6px 0;color:#A39E94;width:180px;vertical-align:top;">${k}</td>
          <td style="padding:6px 0;color:#F5F0E8;font-weight:600;">${v}</td>
        </tr>`).join('')}
      </table>
    </div>

    <div style="background:#141414;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:20px;margin-bottom:16px;">
      <p style="font-size:10px;font-weight:700;letter-spacing:0.1em;color:#A39E94;margin:0 0 16px;">OPERATIONS</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        ${[
          ['Menu Items Added', menuCount],
          ['Open Now?', isOpenNow],
          ['Submitted At', submittedAt],
        ].map(([k, v]) => `
        <tr>
          <td style="padding:6px 0;color:#A39E94;width:140px;">${k}</td>
          <td style="padding:6px 0;color:#F5F0E8;font-weight:600;">${v}</td>
        </tr>`).join('')}
      </table>
    </div>

    <div style="text-align:center;padding-top:16px;">
      <a href="https://app.base44.com" style="display:inline-block;background:linear-gradient(135deg,#00F5D4,#00e6a7);color:#0A0A0A;font-weight:900;font-size:14px;padding:14px 28px;border-radius:999px;text-decoration:none;">
        Review in Admin Dashboard →
      </a>
    </div>

    <p style="text-align:center;font-size:11px;color:#6B665C;margin-top:24px;">CurbChef · Houston, TX</p>
  </div>
</body>
</html>`;

    const vendorHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="font-family:Inter,sans-serif;background:#0A0A0A;color:#F5F0E8;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">

    <div style="background:linear-gradient(135deg,#003826,#001f16);border:1px solid rgba(0,245,212,0.25);border-radius:16px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="font-size:32px;margin:0 0 8px;">🎉</p>
      <h1 style="font-size:24px;font-weight:900;color:#00F5D4;margin:0 0 8px;">Application Received!</h1>
      <p style="font-size:14px;color:rgba(245,240,232,0.6);margin:0;">We'll review your details and get back to you within 24 hours.</p>
    </div>

    <div style="background:#141414;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:20px;margin-bottom:16px;">
      <p style="font-size:13px;color:#A39E94;margin:0 0 12px;">Here's a summary of what you submitted:</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        ${[
          ['Truck Name', truckName],
          ['Vendor Type', vendorType],
          ['Cuisine', cuisine],
          ['City', city],
          ['Health Permit', healthPermit],
          ['Menu Items', menuCount + ' added'],
        ].map(([k, v]) => `
        <tr>
          <td style="padding:6px 0;color:#A39E94;width:140px;">${k}</td>
          <td style="padding:6px 0;color:#F5F0E8;font-weight:600;">${v}</td>
        </tr>`).join('')}
      </table>
    </div>

    <div style="background:#141414;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:20px;margin-bottom:24px;">
      <p style="font-size:11px;font-weight:700;letter-spacing:0.08em;color:#00F5D4;margin:0 0 12px;">WHAT HAPPENS NEXT</p>
      ${[
        ['✅', 'CurbChef reviews your menu, photos & permits'],
        ['📧', 'You\'ll get an approval email within 24 hours'],
        ['🔐', 'Log in to your vendor dashboard to connect Stripe & go live'],
      ].map(([icon, text]) => `
      <div style="display:flex;gap:12px;margin-bottom:8px;">
        <span style="font-size:16px;">${icon}</span>
        <p style="font-size:13px;color:#A39E94;margin:0;">${text}</p>
      </div>`).join('')}
    </div>

    <p style="text-align:center;font-size:12px;color:#6B665C;">
      Questions? Reply to this email or contact <span style="color:#00F5D4;">support@curbchef.com</span>
    </p>
    <p style="text-align:center;font-size:11px;color:#6B665C;margin-top:8px;">CurbChef · Houston, TX</p>
  </div>
</body>
</html>`;

    const messages = [{ to: ADMIN_EMAIL, subject: `New application: ${truckName}`, body: adminHtml }];
    if (toVendor) messages.push({ to: toVendor, subject: `We received your CurbChef application — ${truckName}`, body: vendorHtml });
    await Promise.all(messages.map(message => base44.asServiceRole.integrations.Core.SendEmail(message)));
    return Response.json({ success: true, sent: messages.length });
  });
}