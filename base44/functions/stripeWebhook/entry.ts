import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2024-04-10' });
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    return Response.json({ error: `Webhook signature failed: ${err.message}` }, { status: 400 });
  }

  // Use service role since this is a webhook (no user auth)
  const base44 = createClientFromRequest(req);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { truck_id, customer_email, pickup_code, pickup_time, type, tokens_to_add } = session.metadata || {};

    // Handle token pack purchase
    if (type === 'token_pack' && truck_id) {
      const truck = await base44.asServiceRole.entities.FoodTruck.get(truck_id);
      if (truck) {
        await base44.asServiceRole.entities.FoodTruck.update(truck_id, {
          drop_tokens: (truck.drop_tokens || 0) + parseInt(tokens_to_add || '3'),
        });
      }
      return Response.json({ received: true });
    }

    // Find the pre-created order by session id
    const orders = await base44.asServiceRole.entities.Order.filter({ stripe_checkout_session_id: session.id });
    if (orders.length > 0) {
      await base44.asServiceRole.entities.Order.update(orders[0].id, {
        status: 'placed',
        stripe_payment_intent_id: session.payment_intent,
      });
    }

    // Update truck stats
    if (truck_id) {
      const truck = await base44.asServiceRole.entities.FoodTruck.get(truck_id);
      if (truck) {
        await base44.asServiceRole.entities.FoodTruck.update(truck_id, {
          total_orders: (truck.total_orders || 0) + 1,
          total_revenue: (truck.total_revenue || 0) + (session.amount_total / 100),
        });
      }
    }

    // Award loyalty points to customer
    if (customer_email) {
      try {
        const orderTotal = session.amount_total / 100;
        const pointsEarned = Math.round(orderTotal * 10);
        const rewards = await base44.asServiceRole.entities.Reward.filter({ user_email: customer_email });

        if (rewards.length > 0) {
          const r = rewards[0];
          const newPoints = (r.points || 0) + pointsEarned;
          const newOrders = (r.orders_count || 0) + 1;
          const newTier = newPoints >= 2500 ? 'legend' : newPoints >= 1000 ? 'vip' : newPoints >= 500 ? 'regular' : 'starter';
          await base44.asServiceRole.entities.Reward.update(r.id, {
            points: newPoints,
            orders_count: newOrders,
            tier: newTier,
          });
        } else {
          const newTier = pointsEarned >= 500 ? 'regular' : 'starter';
          await base44.asServiceRole.entities.Reward.create({
            user_email: customer_email,
            points: pointsEarned,
            orders_count: 1,
            tier: newTier,
          });
        }
      } catch (e) {
        console.error('Rewards update failed:', e);
      }
    }
  }

  if (event.type === 'account.updated') {
    const account = event.data.object;
    const status = account.payouts_enabled
      ? 'payouts_enabled'
      : account.charges_enabled
      ? 'charges_enabled'
      : 'onboarding_started';

    // Find truck by stripe_account_id and update status
    const trucks = await base44.asServiceRole.entities.FoodTruck.filter({ stripe_account_id: account.id });
    if (trucks.length > 0) {
      await base44.asServiceRole.entities.FoodTruck.update(trucks[0].id, { stripe_onboarding_status: status });
    }
  }

  return Response.json({ received: true });
});