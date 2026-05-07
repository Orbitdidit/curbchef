/**
 * CurbChef shared email HTML templates.
 * Each function returns a complete HTML email string.
 */

export function emailWrapper(content) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#141414;border-radius:16px;overflow:hidden;border:1px solid #1E1E1E;">
        <!-- HEADER -->
        <tr>
          <td style="background:#141414;padding:28px 32px 20px;border-bottom:1px solid #1E1E1E;">
            <span style="font-size:22px;font-weight:900;color:#F5F0E8;letter-spacing:-0.5px;">
              Curb<span style="color:#00F5D4;">Chef</span>
            </span>
          </td>
        </tr>
        <!-- BODY -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #1E1E1E;background:#0d0d0d;">
            <p style="margin:0 0 8px;font-size:11px;color:#6B665C;">
              © 2025 CurbChef · Houston, TX
            </p>
            <p style="margin:0;font-size:11px;color:#6B665C;">
              <a href="https://curbchef.app" style="color:#00F5D4;text-decoration:none;">Website</a>
              &nbsp;·&nbsp;
              <a href="https://curbchef.app/support" style="color:#6B665C;text-decoration:none;">Support</a>
              &nbsp;·&nbsp;
              <a href="https://curbchef.app/privacy" style="color:#6B665C;text-decoration:none;">Privacy</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function h1(text) {
  return `<h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#F5F0E8;letter-spacing:-0.5px;">${text}</h1>`;
}

export function subtext(text) {
  return `<p style="margin:0 0 24px;font-size:14px;color:#A39E94;line-height:1.6;">${text}</p>`;
}

export function paragraph(text) {
  return `<p style="margin:0 0 16px;font-size:15px;color:#F5F0E8;line-height:1.7;">${text}</p>`;
}

export function infoBox(rows) {
  const rowsHtml = rows.map(([label, value]) =>
    `<tr>
      <td style="padding:10px 16px;font-size:13px;color:#A39E94;white-space:nowrap;width:40%;">${label}</td>
      <td style="padding:10px 16px;font-size:13px;color:#F5F0E8;font-weight:600;">${value}</td>
    </tr>`
  ).join('<tr><td colspan="2" style="padding:0;"><div style="height:1px;background:#1E1E1E;"></div></td></tr>');
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;border-radius:12px;border:1px solid #1E1E1E;margin:0 0 24px;overflow:hidden;">
    ${rowsHtml}
  </table>`;
}

export function pickupBadge(code) {
  return `<div style="background:#0A0A0A;border:2px solid #00F5D4;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.15em;color:#00F5D4;">PICKUP CODE</p>
    <p style="margin:0;font-size:36px;font-weight:900;letter-spacing:0.2em;color:#F5F0E8;font-family:monospace;">${code}</p>
  </div>`;
}

export function ctaButton(label, href) {
  return `<div style="text-align:center;margin:24px 0 0;">
    <a href="${href}" style="display:inline-block;background:#00F5D4;color:#0A0A0A;font-size:15px;font-weight:900;text-decoration:none;padding:14px 36px;border-radius:999px;letter-spacing:-0.2px;">${label}</a>
  </div>`;
}

export function stepsList(steps) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    ${steps.map(([num, text, href]) => `
    <tr>
      <td style="padding:10px 0;vertical-align:top;width:32px;">
        <div style="width:24px;height:24px;border-radius:50%;background:rgba(0,245,212,0.15);display:inline-flex;align-items:center;justify-content:center;">
          <span style="font-size:12px;font-weight:900;color:#00F5D4;">${num}</span>
        </div>
      </td>
      <td style="padding:10px 0 10px 12px;font-size:14px;color:#F5F0E8;">
        ${href ? `<a href="${href}" style="color:#00F5D4;font-weight:700;text-decoration:none;">${text}</a>` : text}
      </td>
    </tr>`).join('')}
  </table>`;
}

export function divider() {
  return `<div style="height:1px;background:#1E1E1E;margin:24px 0;"></div>`;
}

export function itemsList(items) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;border-radius:12px;border:1px solid #1E1E1E;margin:0 0 16px;overflow:hidden;">
    ${items.map((item, i) => `
    <tr style="${i > 0 ? 'border-top:1px solid #1E1E1E;' : ''}">
      <td style="padding:12px 16px;font-size:13px;color:#F5F0E8;">${item.quantity}× ${item.name}</td>
      <td style="padding:12px 16px;font-size:13px;color:#A39E94;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join('')}
  </table>`;
}

export function totalsTable(rows) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    ${rows.map(([label, val, bold]) => `
    <tr>
      <td style="padding:4px 0;font-size:13px;color:${bold ? '#F5F0E8' : '#A39E94'};font-weight:${bold ? '700' : '400'};">${label}</td>
      <td style="padding:4px 0;font-size:13px;color:${bold ? '#00F5D4' : '#A39E94'};font-weight:${bold ? '900' : '400'};text-align:right;">${val}</td>
    </tr>`).join('')}
  </table>`;
}