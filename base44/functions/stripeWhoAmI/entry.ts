import Stripe from 'npm:stripe@14.21.0';

// TEMPORARY diagnostic: reports which Stripe account the app's key belongs to.
// Returns no secrets. Guarded by a one-time token. Delete after use.
const CHECK_TOKEN = '2cb7cca8c6a3323f91f80a9fef4b3115';

Deno.serve(async (req) => {
  let body: { token?: string } = {};
  try { body = await req.json(); } catch { /* empty */ }
  if (body.token !== CHECK_TOKEN) return Response.json({ error: 'forbidden' }, { status: 403 });

  const key = Deno.env.get('STRIPE_SECRET_KEY') || '';
  if (!key) return Response.json({ error: 'STRIPE_SECRET_KEY not set' });
  const stripe = new Stripe(key, { apiVersion: '2024-04-10' });
  try {
    const acct = await stripe.accounts.retrieve();
    let bubbas = null;
    try {
      const b = await stripe.accounts.retrieve('acct_1TgMTe9qkyFnQoaX');
      bubbas = { found: true, charges_enabled: b.charges_enabled, payouts_enabled: b.payouts_enabled, details_submitted: b.details_submitted };
    } catch (e) { bubbas = { found: false, error: String(e?.message || e).slice(0, 120) }; }
    return Response.json({
      key_mode: key.startsWith('sk_live') || key.startsWith('rk_live') ? 'LIVE' : 'TEST',
      key_type: key.slice(0, 3),
      platform_account_id: acct.id,
      account_email: acct.email,
      business_name: acct.business_profile?.name || acct.settings?.dashboard?.display_name || null,
      country: acct.country,
      bubbas_connected_account: bubbas,
      webhook_secret_set: Boolean(Deno.env.get('STRIPE_WEBHOOK_SECRET')),
    });
  } catch (e) {
    return Response.json({ error: String(e?.message || e).slice(0, 200) });
  }
});
