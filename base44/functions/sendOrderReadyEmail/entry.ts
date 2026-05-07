import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function buildEmail(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#141414;border-radius:16px;overflow:hidden;border:1px solid #1E1E1E;">
<tr><td style="padding:28px 32px 20px;border-bottom:1px solid #1E1E1E;">
<span style="font-size:22px;font-weight:900;color:#F5F0E8;">Curb<span style="color:#00F5D4;">Chef</span></span>
</td></tr>
<tr><td style="padding:32px;">${content}</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #1E1E1E;background:#0d0d0d;">
<p style="margin:0 0 6px;font-size:11px;color:#6B665C;">© 2025 CurbChef · Houston, TX</p>
<p style="margin:0;font-size:11px;color:#6B665C;">
<a href="https://curbchef.app" style="color:#00F5D4;text-decoration:none;">Website</a> &nbsp;·&nbsp;
<a href="https://curbchef.app/support" style="color:#6B665C;text-decoration:none;">Support</a>
</p></td></tr>
</table></td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { order_id } = await req.json();

  const order = await base44.asServiceRole.entities.Order.get(order_id);
  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

  const trucks = await base44.asServiceRole.entities.FoodTruck.filter({ id: order.truck_id });
  const truck = trucks[0] || {};
  const address = truck.address || truck.city || 'Houston, TX';

  const content = `
    <div style="text-align:center;padding:16px 0 24px;">
      <div style="font-size:48px;margin-bottom:12px;">🔥</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#F5F0E8;">Your order is READY!</h1>
      <p style="margin:0;font-size:15px;color:#A39E94;">It's hot. It's fresh. It's waiting for you.</p>
    </div>
    <div style="background:#0A0A0A;border:2px solid #00F5D4;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.15em;color:#00F5D4;">PICKUP CODE</p>
      <p style="margin:0;font-size:40px;font-weight:900;letter-spacing:0.2em;color:#F5F0E8;font-family:monospace;">${order.pickup_code || '—'}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;border-radius:12px;border:1px solid #1E1E1E;margin:0 0 28px;overflow:hidden;">
      <tr><td style="padding:12px 16px;font-size:13px;color:#A39E94;width:40%;">🚐 Truck</td><td style="padding:12px 16px;font-size:13px;color:#F5F0E8;font-weight:600;">${order.truck_name}</td></tr>
      <tr><td colspan="2" style="padding:0;height:1px;background:#1E1E1E;"></td></tr>
      <tr><td style="padding:12px 16px;font-size:13px;color:#A39E94;">📍 Address</td><td style="padding:12px 16px;font-size:13px;color:#F5F0E8;font-weight:600;">${address}</td></tr>
    </table>
    <p style="margin:0 0 28px;font-size:14px;color:#A39E94;text-align:center;">Show your code at the window. See you at the curb! 🚶</p>
    <div style="text-align:center;">
      <a href="https://curbchef.app/order/${order.id}" style="display:inline-block;background:#00F5D4;color:#0A0A0A;font-size:15px;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:999px;">Track Order →</a>
    </div>
  `;

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: order.customer_email,
    subject: `🚐 Your order is READY for pickup at ${order.truck_name}!`,
    body: buildEmail(content),
  });

  return Response.json({ sent: true });
});