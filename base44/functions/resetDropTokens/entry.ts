import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLAN_TOKENS = { free: 2, standard: 10, plus: 25, premium: 60 };

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const trucks = await base44.asServiceRole.entities.FoodTruck.list();
  const now = new Date().toISOString();
  let updated = 0;

  for (const truck of trucks) {
    const maxTokens = PLAN_TOKENS[truck.vendor_plan || 'free'] ?? 2;
    await base44.asServiceRole.entities.FoodTruck.update(truck.id, {
      drop_tokens: maxTokens,
      tokens_reset_at: now,
    });
    updated++;
  }

  return Response.json({ success: true, trucks_updated: updated, reset_at: now });
});