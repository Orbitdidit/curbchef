import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const app = payload.data;
    if (!app) return Response.json({ ok: true, skipped: 'no data' });

    const truckName = app.truck_name || 'Unknown Truck';
    const ownerName = app.owner_name || 'Unknown Owner';
    const email = app.email || 'No email provided';
    const phone = app.phone || 'No phone';
    const cuisine = (app.cuisine_type || 'N/A').replace('_', ' ');
    const city = app.city || 'N/A';
    const instagram = app.instagram || 'N/A';
    const submittedAt = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });

    const menuList = (app.menu_items || [])
      .filter(m => m.name)
      .map(m => `  • ${m.name} — $${Number(m.price || 0).toFixed(2)}`)
      .join('\n') || '  (none listed)';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'orbitdidit@gmail.com',
      subject: `🚚 New Truck Application: ${truckName}`,
      body: `Hey! A new food truck just applied on CurbChef. Here are the details:\n\n` +
        `🚚 Truck Name: ${truckName}\n` +
        `👤 Owner: ${ownerName}\n` +
        `📧 Email: ${email}\n` +
        `📞 Phone: ${phone}\n` +
        `🍽️ Cuisine: ${cuisine}\n` +
        `📍 City: ${city}\n` +
        `📸 Instagram: ${instagram}\n\n` +
        `MENU ITEMS:\n${menuList}\n\n` +
        `Submitted: ${submittedAt} (CT)\n\n` +
        `👉 Review & approve at: https://www.curbchef.app/admin\n\n` +
        `— CurbChef Auto-Notify`,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});