import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), { apiVersion: '2024-04-10' });

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { truck_id, success_url, cancel_url } = body;

  const trucks = await base44.entities.FoodTruck.filter({ owner_email: user.email });
  const truck = trucks.find(t => t.id === truck_id) || trucks[0];
  if (!truck) return Response.json({ error: 'Truck not found' }, { status: 404 });

  const origin = req.headers.get('origin') || 'https://curbchef.com';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: '🎟️ Curb Drop Token Pack',
          description: '+3 Curb Drop tokens for your truck this week',
        },
        unit_amount: 500, // $5.00
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: success_url || `${origin}/vendor?token_pack=success`,
    cancel_url: cancel_url || `${origin}/vendor`,
    metadata: {
      type: 'token_pack',
      truck_id: truck.id,
      truck_name: truck.name,
      vendor_email: user.email,
      tokens_to_add: '3',
    },
  });

  return Response.json({ checkout_url: session.url });
});