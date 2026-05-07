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

  // Called from entity automation — payload has event + data
  const truck = payload.data || payload;
  const ownerEmail = truck.owner_email;
  if (!ownerEmail) return Response.json({ skipped: 'no owner_email' });

  // Only fire when is_approved just flipped to true
  const wasApproved = payload.old_data?.is_approved;
  const isNowApproved = truck.is_approved;
  if (wasApproved || !isNowApproved) return Response.json({ skipped: 'not newly approved' });

  const steps = [
    ['1', 'Connect Stripe to receive payments', 'https://curbchef.app/vendor'],
    ['2', 'Add your menu items', 'https://curbchef.app/vendor/menu'],
    ['3', 'Upload truck photos', 'https://curbchef.app/vendor/profile'],
    ['4', 'Go LIVE from your truck (free advertising!)', 'https://curbchef.app/vendor/go-live'],
  ];

  const stepsHtml = steps.map(([num, text, href]) => `
    <tr>
      <td style="padding:10px 0;vertical-align:top;width:32px;">
        <div style="width:24px;height:24px;border-radius:50%;background:rgba(0,245,212,0.15);text-align:center;line-height:24px;">
          <span style="font-size:12px;font-weight:900;color:#00F5D4;">${num}</span>
        </div>
      </td>
      <td style="padding:10px 0 10px 12px;font-size:14px;color:#F5F0E8;">
        <a href="${href}" style="color:#00F5D4;font-weight:700;text-decoration:none;">${text}</a>
      </td>
    </tr>`).join('');

  const content = `
    <div style="text-align:center;padding:16px 0 24px;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#F5F0E8;">Welcome to CurbChef, ${truck.name}!</h1>
      <p style="margin:0;font-size:15px;color:#A39E94;">You're officially in. 🚐💚</p>
    </div>
    <p style="font-size:15px;color:#F5F0E8;line-height:1.7;margin:0 0 24px;">
      Your truck is now live on CurbChef. Customers can find you, order from you, and follow your truck.
    </p>
    <p style="margin:0 0 16px;font-size:13px;font-weight:700;letter-spacing:0.1em;color:#00F5D4;">NEXT STEPS</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">${stepsHtml}</table>
    <div style="height:1px;background:#1E1E1E;margin:0 0 24px;"></div>
    <p style="font-size:14px;color:#A39E94;margin:0 0 28px;">Need help? Reply to this email anytime. Welcome to the family. 🚐💚<br><br>— Chad / CurbChef</p>
    <div style="text-align:center;">
      <a href="https://curbchef.app/vendor" style="display:inline-block;background:#00F5D4;color:#0A0A0A;font-size:15px;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:999px;">Open Your Dashboard →</a>
    </div>
  `;

  await base44.asServiceRole.integrations.Core.SendEmail({
    from_name: 'Chad @ CurbChef',
    to: ownerEmail,
    subject: `🎉 Welcome to CurbChef, ${truck.name}!`,
    body: buildEmail(content),
  });

  return Response.json({ sent: true });
});