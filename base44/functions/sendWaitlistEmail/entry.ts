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

  const entry = payload.data || payload;
  const toEmail = entry.email;
  if (!toEmail) return Response.json({ skipped: 'no email' });

  const position = entry.position || '—';
  const referralLink = `https://curbchef.app?ref=${encodeURIComponent(toEmail)}`;

  const perks = [
    '2× reward points for life',
    'Priority access to Curb Drops (flash deals)',
    'Founder badge on your profile',
    'Early access to AR Truck Radar',
  ];

  const perksHtml = perks.map(p =>
    `<tr><td style="padding:8px 16px;font-size:13px;color:#F5F0E8;">
      <span style="color:#00F5D4;font-weight:700;margin-right:8px;">✦</span>${p}
    </td></tr>`
  ).join('');

  const content = `
    <div style="text-align:center;padding:16px 0 24px;">
      <div style="font-size:48px;margin-bottom:12px;">🚀</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#F5F0E8;">You're on the waitlist!</h1>
      <p style="margin:0;font-size:15px;color:#A39E94;">The future of food truck discovery is almost here.</p>
    </div>
    <div style="background:#0A0A0A;border:2px solid #00F5D4;border-radius:12px;padding:16px;text-align:center;margin:0 0 24px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.15em;color:#A39E94;">YOUR POSITION</p>
      <p style="margin:0;font-size:40px;font-weight:900;color:#00F5D4;">#${position}</p>
    </div>
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#00F5D4;letter-spacing:0.08em;">FOUNDING MEMBER PERKS</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;border-radius:12px;border:1px solid #1E1E1E;margin:0 0 24px;overflow:hidden;">
      ${perksHtml}
    </table>
    <div style="background:rgba(0,245,212,0.06);border:1px solid rgba(0,245,212,0.2);border-radius:12px;padding:20px;margin:0 0 28px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#00F5D4;">🏃 Skip the line — invite friends</p>
      <p style="margin:0 0 12px;font-size:13px;color:#A39E94;">Share your referral link to move up 10 spots per friend who joins.</p>
      <div style="background:#0A0A0A;border-radius:8px;padding:12px;border:1px solid #1E1E1E;">
        <a href="${referralLink}" style="font-size:13px;color:#00F5D4;text-decoration:none;word-break:break-all;">${referralLink}</a>
      </div>
    </div>
    <p style="font-size:14px;color:#A39E94;margin:0 0 24px;text-align:center;">Launching soon. Stay hungry. 🌮<br><br>— CurbChef</p>
  `;

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: toEmail,
    subject: `🚀 You're on the CurbChef waitlist!`,
    body: buildEmail(content),
  });

  return Response.json({ sent: true });
});