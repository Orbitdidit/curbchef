import { secureEndpoint } from '../../shared/security.ts';
import { secrets } from 'base44:runtime';
import Stripe from 'npm:stripe@14.21.0';

export default async function(req) {
  return secureEndpoint(req, async ({ base44, user, body }) => {
  const stripe = new Stripe(secrets.get('STRIPE_SECRET_KEY'), { apiVersion: '2024-04-10' });
  const IS_TEST = secrets.get('STRIPE_SECRET_KEY')?.startsWith('sk_test_');
  const { action, truck_id, return_url, refresh_url } = body;

  if (action === 'create_account_link') {
    // Find the truck owned by this user
    const trucks = await base44.entities.FoodTruck.filter({ owner_email: user.email });
    const truck = trucks[0];
    if (!truck) return Response.json({ error: 'No truck found for this vendor' }, { status: 404 });

    let stripeAccountId = truck.stripe_account_id;

    // Create Stripe Express account if not exists
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        business_type: 'individual',
        metadata: { truck_id: truck.id, truck_name: truck.name, platform: 'curbchef' },
      });
      stripeAccountId = account.id;
      await base44.asServiceRole.entities.FoodTruck.update(truck.id, {
        stripe_account_id: stripeAccountId,
        stripe_onboarding_status: 'onboarding_started',
      });
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refresh_url || `${req.headers.get('origin')}/vendor`,
      return_url: return_url || `${req.headers.get('origin')}/vendor`,
      type: 'account_onboarding',
    });

    return Response.json({ url: accountLink.url, stripe_account_id: stripeAccountId, is_test: IS_TEST });
  }

  if (action === 'check_status') {
    const trucks = await base44.entities.FoodTruck.filter({ owner_email: user.email.trim().toLowerCase() });
    const truck = trucks[0];
    if (!truck?.stripe_account_id) return Response.json({ status: 'not_connected' });
    const account = await stripe.accounts.retrieve(truck.stripe_account_id);
    const status = account.payouts_enabled
      ? 'payouts_enabled'
      : account.charges_enabled
      ? 'charges_enabled'
      : 'onboarding_started';

    await base44.asServiceRole.entities.FoodTruck.update(truck.id, { stripe_onboarding_status: status });

    return Response.json({ status, charges_enabled: account.charges_enabled, payouts_enabled: account.payouts_enabled, is_test: IS_TEST });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
  });
}