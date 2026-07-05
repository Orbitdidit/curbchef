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
  const { truck_id, items, tip, pickup_time, pickup_code, payment_method, success_url, cancel_url } = body;

  // Get the truck to find their Stripe account
  const truck = await base44.entities.FoodTruck.get(truck_id).catch(() => null);
  if (!truck) return Response.json({ error: 'Truck not found' }, { status: 200 });

  if (!truck.stripe_account_id || truck.stripe_onboarding_status !== 'payouts_enabled') {
    // Fallback: signal the frontend to create a pay-at-pickup order.
    // Return 200 so the SDK doesn't throw — the frontend reads truck_not_connected.
    return Response.json({ error: 'Vendor payment not set up', truck_not_connected: true }, { status: 200 });
  }

  // ── SERVER-SIDE PRICE VERIFICATION ──
  // Never trust client-supplied prices. Fetch each item's real price from
  // the MenuItem entity and recompute the subtotal from scratch.
  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'Invalid cart item' }, { status: 200 });
  }

  const verifiedItems = [];
  let subtotal = 0;
  for (const item of items) {
    if (!item?.item_id) {
      return Response.json({ error: 'Invalid cart item' }, { status: 200 });
    }
    const menuItem = await base44.asServiceRole.entities.MenuItem.get(item.item_id).catch(() => null);
    if (!menuItem) {
      return Response.json({ error: 'Invalid cart item' }, { status: 200 });
    }

    const quantity = Math.max(1, parseInt(item.quantity) || 1);
    const realPrice = Number(menuItem.price) || 0;

    // Verify add-ons against the MenuItem's real add_ons list
    const verifiedAddOns = [];
    if (Array.isArray(item.add_ons) && item.add_ons.length > 0) {
      const realAddOns = Array.isArray(menuItem.add_ons) ? menuItem.add_ons : [];
      for (const addOn of item.add_ons) {
        const match = realAddOns.find(a => a.name === addOn?.name);
        if (!match) {
          return Response.json({ error: 'Invalid cart item' }, { status: 200 });
        }
        verifiedAddOns.push({ name: match.name, price: Number(match.price) || 0 });
      }
    }

    const addOnsTotal = verifiedAddOns.reduce((s, a) => s + a.price, 0);
    const lineTotal = (realPrice + addOnsTotal) * quantity;
    subtotal += lineTotal;

    verifiedItems.push({
      item_id: menuItem.id,
      name: menuItem.name,
      price: realPrice,
      quantity,
      add_ons: verifiedAddOns,
    });
  }
  subtotal = Number(subtotal.toFixed(2));

  // Sanitize tip — block negative or non-numeric values
  const safeTip = Math.max(0, Number(tip) || 0);

  const taxAmount = Number((subtotal * 0.0825).toFixed(2)); // 8.25% sales tax
  const grossAmount = Number((subtotal + safeTip + 1.50 + taxAmount).toFixed(2));
  const platformFeeAmount = Math.round(subtotal * PLATFORM_FEE_PERCENT * 100); // in cents
  const grossCents = Math.round(grossAmount * 100);

  // Build line items for Stripe from the verified items
  const lineItems = verifiedItems.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: `${item.quantity}x ${item.name}` },
      unit_amount: Math.round((item.price + item.add_ons.reduce((s, a) => s + a.price, 0)) * 100),
    },
    quantity: item.quantity,
  }));

  // Add tip as a line item if present
  if (safeTip > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Tip for crew' },
        unit_amount: Math.round(safeTip * 100),
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
      items: verifiedItems,
      subtotal,
      tax: taxAmount,
      tip: safeTip,
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