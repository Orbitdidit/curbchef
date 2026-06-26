import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2024-04-10' });
const PLATFORM_FEE_PERCENT = 0.12; // 12% platform fee
const IS_TEST = Deno.env.get('STRIPE_SECRET_KEY')?.startsWith('sk_test_');

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { truck_id, items, subtotal, tip, pickup_time, pickup_code, payment_method, success_url, cancel_url } = body;

  // Get the truck to find their Stripe account
  const truck = await base44.entities.FoodTruck.get(truck_id).catch(() => null);
  if (!truck) return Response.json({ error: 'Truck not found' }, { status: 200 });

  if (!truck.stripe_account_id || truck.stripe_onboarding_status !== 'payouts_enabled') {
    // Fallback: signal the frontend to create a pay-at-pickup order.
    // Return 200 so the SDK doesn't throw — the frontend reads truck_not_connected.
    return Response.json({ error: 'Vendor payment not set up', truck_not_connected: true }, { status: 200 });
  }

  const taxAmount = Number((subtotal * 0.0825).toFixed(2)); // 8.25% sales tax
  const grossAmount = Number((subtotal + (tip || 0) + 1.50 + taxAmount).toFixed(2));
  const platformFeeAmount = Math.round(subtotal * PLATFORM_FEE_PERCENT * 100); // in cents
  const grossCents = Math.round(grossAmount * 100);

  // Build line items for Stripe
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: `${item.quantity}x ${item.name}` },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  // Add tip as a line item if present
  if (tip > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Tip for crew' },
        unit_amount: Math.round(tip * 100),
      },
      quantity: 1,
    });
  }

  // Service fee line item
  lineItems.push({
    price_data: {
      currency: 'usd',
      product_data: { name: 'Service Fee' },
      unit_amount: 150,
    },
    quantity: 1,
  });

  // Tax line item
  lineItems.push({
    price_data: {
      currency: 'usd',
      product_data: { name: 'Tax (8.25%)' },
      unit_amount: Math.round(taxAmount * 100),
    },
    quantity: 1,
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: success_url || `${req.headers.get('origin')}/order/{CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/cart`,
      payment_intent_data: {
        application_fee_amount: platformFeeAmount,
        transfer_data: { destination: truck.stripe_account_id },
      },
      metadata: {
        truck_id,
        truck_name: truck.name,
        customer_email: user.email,
        customer_name: user.full_name,
        pickup_code,
        pickup_time: pickup_time || 'ASAP',
        platform: 'curbchef',
        is_test: IS_TEST ? 'true' : 'false',
      },
    });

    // Pre-create the order record in "pending_payment" status
    const vendorNetAmount = grossAmount - (platformFeeAmount / 100);
    const order = await base44.asServiceRole.entities.Order.create({
      truck_id,
      truck_name: truck.name,
      customer_email: user.email,
      customer_name: user.full_name,
      items,
      subtotal,
      tax: taxAmount,
      tip: tip || 0,
      total: grossAmount,
      gross_amount: grossAmount,
      platform_fee_amount: platformFeeAmount / 100,
      vendor_net_amount: vendorNetAmount,
      stripe_checkout_session_id: session.id,
      status: 'pending_payment',
      pickup_time: pickup_time || 'ASAP',
      pickup_code,
      payment_method: 'card',
      is_test_payment: IS_TEST,
    });

    return Response.json({ checkout_url: session.url, session_id: session.id, order_id: order.id, is_test: IS_TEST });
  } catch (err) {
    // Return 200 so the SDK surfaces our message instead of a generic 500 throw
    return Response.json({ error: err.message || 'Checkout failed' }, { status: 200 });
  }
});