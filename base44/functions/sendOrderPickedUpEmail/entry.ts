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

  // Compute points earned (10 pts per $1)
  const pointsEarned = Math.round((order.total || 0) * 10);

  const content = `
    <div style="text-align:center;padding:16px 0 24px;">
      <div style="font-size:48px;margin-bottom:12px;">✅</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#F5F0E8;">Order picked up!</h1>
      <p style="margin:0;font-size:15px;color:#A39E94;">Hope it hit the spot. 🙌</p>
    </div>
    <div style="background:rgba(0,245,212,0.06);border:1px solid rgba(0,245,212,0.25);border-radius:12px;padding:20px;text-align:center;margin:0 0 28px;">
      <p style="margin:0 0 4px;font-size:13px;color:#A39E94;">You just earned</p>
      <p style="margin:0;font-size:32px;font-weight:900;color:#00F5D4;">+${pointsEarned} <span style="font-size:18px;">reward points</span></p>
    </div>
    <p style="margin:0 0 24px;font-size:14px;color:#A39E94;text-align:center;">Rate your experience and help other foodies discover great trucks.</p>
    <div style="text-align:center;margin-bottom:16px;">
      <a href="https://curbchef.app/order/${order.id}" style="display:inline-block;background:#00F5D4;color:#0A0A0A;font-size:15px;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:999px;">Rate ${order.truck_name} ⭐</a>
    </div>
    <div style="text-align:center;">
      <a href="https://curbchef.app/truck/${order.truck_id}" style="font-size:13px;color:#A39E94;text-decoration:none;">Reorder anytime →</a>
    </div>
  `;

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: order.customer_email,
    subject: `✅ Thanks for ordering at ${order.truck_name}!`,
    body: buildEmail(content),
  });

  return Response.json({ sent: true });
});