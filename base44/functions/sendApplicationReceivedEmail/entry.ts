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
  const payload = await req.json();

  const app = payload.data || payload;
  const toEmail = app.email;
  if (!toEmail) return Response.json({ skipped: 'no email' });

  // Only fire on status = submitted
  if (app.status !== 'submitted') return Response.json({ skipped: 'not submitted' });

  const content = `
    <div style="text-align:center;padding:16px 0 24px;">
      <div style="font-size:48px;margin-bottom:12px;">📝</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#F5F0E8;">Application received!</h1>
      <p style="margin:0;font-size:15px;color:#A39E94;">We'll be in touch within 24 hours.</p>
    </div>
    <p style="font-size:15px;color:#F5F0E8;line-height:1.7;margin:0 0 24px;">
      Thanks for applying to CurbChef${app.truck_name ? `, <strong>${app.truck_name}</strong>` : ''}. Our team is reviewing your info now and will respond within 24 hours.
    </p>
    <div style="background:#0A0A0A;border-radius:12px;border:1px solid #1E1E1E;padding:20px;margin:0 0 28px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#00F5D4;letter-spacing:0.08em;">WHILE YOU WAIT</p>
      <p style="margin:0 0 8px;font-size:14px;color:#A39E94;line-height:1.6;">
        Check out how successful trucks set up their CurbChef pages and get inspiration for yours.
      </p>
      <a href="https://curbchef.app/explore" style="font-size:14px;color:#00F5D4;text-decoration:none;font-weight:700;">Browse top Houston trucks →</a>
    </div>
    <p style="font-size:14px;color:#A39E94;margin:0 0 28px;line-height:1.6;">Have questions? Just reply to this email.<br><br>— Chad / CurbChef</p>
    <div style="text-align:center;">
      <a href="https://curbchef.app/explore" style="display:inline-block;background:#00F5D4;color:#0A0A0A;font-size:15px;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:999px;">Explore CurbChef →</a>
    </div>
  `;

  await base44.asServiceRole.integrations.Core.SendEmail({
    from_name: 'Chad @ CurbChef',
    to: toEmail,
    subject: `📝 We got your application — ${app.truck_name || 'Your Truck'}`,
    body: buildEmail(content),
  });

  return Response.json({ sent: true });
});