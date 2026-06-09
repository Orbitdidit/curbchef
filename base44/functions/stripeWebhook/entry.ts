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

    // Send vendor "new order" notification email
    if (orders.length > 0) {
      const vendorOrder = { ...orders[0], status: 'placed' };
      try {
        const vendorTrucks = await base44.asServiceRole.entities.FoodTruck.filter({ id: vendorOrder.truck_id });
        const vendorTruck = vendorTrucks[0];
        if (vendorTruck?.owner_email) {
          const platformFee = (vendorOrder.total || 0) * 0.12;
          const vendorNet = (vendorOrder.total || 0) - platformFee;
          const itemsHtml = (vendorOrder.items || []).map(item =>
            `<tr>
              <td style="padding:10px 16px;font-size:13px;color:#F5F0E8;">${item.quantity}× ${item.name}</td>
              <td style="padding:10px 16px;font-size:13px;color:#A39E94;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
            </tr><tr><td colspan="2" style="height:1px;background:#1E1E1E;padding:0;"></td></tr>`
          ).join('');
          const vendorEmailBody = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#141414;border-radius:16px;overflow:hidden;border:1px solid #1E1E1E;">
<tr><td style="padding:28px 32px 20px;border-bottom:1px solid #1E1E1E;">
<span style="font-size:22px;font-weight:900;color:#F5F0E8;">Curb<span style="color:#00F5D4;">Chef</span></span>
</td></tr>
<tr><td style="padding:32px;">
  <div style="text-align:center;padding:16px 0 24px;">
    <div style="font-size:48px;margin-bottom:12px;">🔔</div>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#F5F0E8;">Cha-ching! New order.</h1>
    <p style="margin:0;font-size:15px;color:#A39E94;">Someone's hungry — time to cook 🔥</p>
  </div>
  <div style="background:#0A0A0A;border:2px solid #fd591e;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.15em;color:#fd591e;">PICKUP CODE</p>
    <p style="margin:0;font-size:40px;font-weight:900;letter-spacing:0.2em;color:#F5F0E8;font-family:monospace;">${vendorOrder.pickup_code || '—'}</p>
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;border-radius:12px;border:1px solid #1E1E1E;margin:0 0 16px;overflow:hidden;">${itemsHtml}</table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;border-radius:12px;border:1px solid #1E1E1E;margin:0 0 24px;overflow:hidden;">
    <tr><td style="padding:12px 16px;font-size:13px;color:#A39E94;">🧾 Order Total</td><td style="padding:12px 16px;font-size:13px;color:#F5F0E8;font-weight:600;text-align:right;">$${(vendorOrder.total || 0).toFixed(2)}</td></tr>
    <tr><td colspan="2" style="height:1px;background:#1E1E1E;padding:0;"></td></tr>
    <tr><td style="padding:12px 16px;font-size:13px;color:#00F5D4;font-weight:700;">💵 You Receive</td><td style="padding:12px 16px;font-size:13px;color:#00F5D4;font-weight:900;text-align:right;">$${vendorNet.toFixed(2)}</td></tr>
    <tr><td colspan="2" style="height:1px;background:#1E1E1E;padding:0;"></td></tr>
    <tr><td style="padding:12px 16px;font-size:13px;color:#A39E94;">⏰ Pickup Time</td><td style="padding:12px 16px;font-size:13px;color:#F5F0E8;font-weight:600;text-align:right;">${vendorOrder.pickup_time || 'ASAP'}</td></tr>
  </table>
  <div style="text-align:center;">
    <a href="https://curbchef.app/vendor/orders" style="display:inline-block;background:#00F5D4;color:#0A0A0A;font-size:15px;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:999px;">Open Dashboard →</a>
  </div>
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #1E1E1E;background:#0d0d0d;">
<p style="margin:0 0 6px;font-size:11px;color:#6B665C;">© 2025 CurbChef · Houston, TX</p>
</td></tr>
</table></td></tr></table></body></html>`;
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: vendorTruck.owner_email,
            subject: `🔔 New order at ${vendorOrder.truck_name} — Code ${vendorOrder.pickup_code}`,
            body: vendorEmailBody,
          });
          console.log(`[vendorEmail] sent to ${vendorTruck.owner_email} for order ${vendorOrder.id}`);
        } else {
          console.warn(`[vendorEmail] skipped — no owner_email for truck ${vendorOrder.truck_id}`);
        }
      } catch (e) {
        console.error('[vendorEmail] failed:', e.message);
      }
    }

    // Send Order Confirmed email to customer
    if (orders.length > 0) {
      const order = orders[0];
      const truck = truck_id ? await base44.asServiceRole.entities.FoodTruck.get(truck_id).catch(() => null) : null;
      const address = truck?.address || truck?.city || 'Houston, TX';
      const itemsHtml = (order.items || []).map(item =>
        `<tr>
          <td style="padding:10px 16px;font-size:13px;color:#F5F0E8;">${item.quantity}× ${item.name}</td>
          <td style="padding:10px 16px;font-size:13px;color:#A39E94;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
      ).join('<tr><td colspan="2" style="height:1px;background:#1E1E1E;padding:0;"></td></tr>');

      const subtotal = order.subtotal || 0;
      const tax = order.tax || 0;
      const tip = order.tip || 0;
      const serviceFee = 1.50;
      const total = order.total || 0;

      const emailBody = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#141414;border-radius:16px;overflow:hidden;border:1px solid #1E1E1E;">
<tr><td style="padding:28px 32px 20px;border-bottom:1px solid #1E1E1E;">
<span style="font-size:22px;font-weight:900;color:#F5F0E8;">Curb<span style="color:#00F5D4;">Chef</span></span>
</td></tr>
<tr><td style="padding:32px;">
  <div style="text-align:center;padding:0 0 24px;">
    <div style="font-size:48px;margin-bottom:12px;">🍴</div>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#F5F0E8;">Order Confirmed!</h1>
    <p style="margin:0;font-size:15px;color:#A39E94;">Hey ${order.customer_name || 'there'}! Your order at ${order.truck_name} is locked in.</p>
  </div>
  <div style="background:#0A0A0A;border:2px solid #00F5D4;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.15em;color:#00F5D4;">PICKUP CODE</p>
    <p style="margin:0;font-size:40px;font-weight:900;letter-spacing:0.2em;color:#F5F0E8;font-family:monospace;">${order.pickup_code || '—'}</p>
  </div>
  <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#00F5D4;letter-spacing:0.08em;">ORDER DETAILS</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;border-radius:12px;border:1px solid #1E1E1E;margin:0 0 16px;overflow:hidden;">${itemsHtml}</table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    <tr><td style="padding:4px 0;font-size:13px;color:#A39E94;">Subtotal</td><td style="padding:4px 0;font-size:13px;color:#A39E94;text-align:right;">$${subtotal.toFixed(2)}</td></tr>
    <tr><td style="padding:4px 0;font-size:13px;color:#A39E94;">Service Fee</td><td style="padding:4px 0;font-size:13px;color:#A39E94;text-align:right;">$${serviceFee.toFixed(2)}</td></tr>
    <tr><td style="padding:4px 0;font-size:13px;color:#A39E94;">Tax</td><td style="padding:4px 0;font-size:13px;color:#A39E94;text-align:right;">$${tax.toFixed(2)}</td></tr>
    <tr><td style="padding:4px 0;font-size:13px;color:#A39E94;">Tip</td><td style="padding:4px 0;font-size:13px;color:#A39E94;text-align:right;">$${tip.toFixed(2)}</td></tr>
    <tr><td style="padding:8px 0 4px;font-size:15px;font-weight:900;color:#F5F0E8;border-top:1px solid #1E1E1E;">Total</td><td style="padding:8px 0 4px;font-size:15px;font-weight:900;color:#00F5D4;text-align:right;border-top:1px solid #1E1E1E;">$${total.toFixed(2)}</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;border-radius:12px;border:1px solid #1E1E1E;margin:0 0 24px;overflow:hidden;">
    <tr><td style="padding:12px 16px;font-size:13px;color:#A39E94;">⏰ Pickup Time</td><td style="padding:12px 16px;font-size:13px;color:#F5F0E8;font-weight:600;">${order.pickup_time || 'ASAP'}</td></tr>
    <tr><td colspan="2" style="height:1px;background:#1E1E1E;padding:0;"></td></tr>
    <tr><td style="padding:12px 16px;font-size:13px;color:#A39E94;">📍 Address</td><td style="padding:12px 16px;font-size:13px;color:#F5F0E8;font-weight:600;">${address}</td></tr>
  </table>
  <p style="font-size:13px;color:#A39E94;text-align:center;margin:0 0 24px;">Show your pickup code at the truck. The chef has been notified and is firing up. 🔥</p>
  <div style="text-align:center;">
    <a href="https://curbchef.app/order/${order.id}" style="display:inline-block;background:#00F5D4;color:#0A0A0A;font-size:15px;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:999px;">Track Your Order →</a>
  </div>
  <p style="text-align:center;margin:24px 0 0;font-size:13px;color:#6B665C;">The curb is the kitchen. — CurbChef</p>
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #1E1E1E;background:#0d0d0d;">
<p style="margin:0 0 6px;font-size:11px;color:#6B665C;">© 2025 CurbChef · Houston, TX</p>
<p style="margin:0;font-size:11px;color:#6B665C;"><a href="https://curbchef.app" style="color:#00F5D4;text-decoration:none;">Website</a> &nbsp;·&nbsp; <a href="https://curbchef.app/support" style="color:#6B665C;text-decoration:none;">Support</a></p>
</td></tr>
</table></td></tr></table></body></html>`;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: order.customer_email,
          subject: `🍴 Order Confirmed — ${order.truck_name}`,
          body: emailBody,
        });
      } catch (e) {
        console.error('Order confirmed email failed:', e);
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