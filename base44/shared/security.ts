import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export function deny(status = 403, message = 'Forbidden') {
  return Object.assign(new Error(message), { status });
}

// Every entry point authenticates before parsing input or using elevated access.
export async function secureEndpoint(req, operation, { admin = false } = {}) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) throw deny(admin ? 403 : 401, admin ? 'Forbidden' : 'Sign in required');
    if (admin && user.role !== 'admin') throw deny();
    if (req.method !== 'POST') throw deny(405, 'Method not allowed');
    let body;
    try { body = await req.json(); } catch { throw deny(400, 'Invalid request'); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw deny(400, 'Invalid request');
    return await operation({ base44, user, body });
  } catch (error) {
    const status = [400, 401, 403, 405].includes(error?.status) ? error.status : 500;
    if (status === 500) console.error('Protected operation failed:', error?.message);
    return Response.json({ error: status === 500 ? 'Unable to complete this request' : error.message }, { status });
  }
}

// Legacy workflow envelopes provide IDs, never trusted recipient/content fields.
export function recordId(body, ...keys) {
  const id = keys.map(key => body[key]).find(value => value != null)
    ?? body.event?.entity_id ?? body.entity_id ?? body.data?.id ?? body.id;
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) throw deny();
  return id;
}

export async function storedRecord(base44, entity, id) {
  const page = await base44.asServiceRole.entities[entity].filter({ id }, { limit: 1 });
  if (!page.items[0]) throw deny();
  return page.items[0];
}

export function ownsTruck(user, truck) {
  return user.role === 'admin' || (!!user.email && String(truck.owner_email || '').trim().toLowerCase() === user.email.trim().toLowerCase());
}

export async function vendorOrder(base44, user, body, status) {
  const order = await storedRecord(base44, 'Order', recordId(body, 'order_id'));
  const truck = await storedRecord(base44, 'FoodTruck', order.truck_id);
  if (!ownsTruck(user, truck) || order.status !== status) throw deny();
  return { order, truck };
}

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export function escapeData(value) {
  if (typeof value === 'string') return escapeHtml(value);
  if (Array.isArray(value)) return value.map(escapeData);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, escapeData(val)]));
  return value;
}
export function recipient(value) {
  if (typeof value !== 'string' || value.length > 254 || !/^[^\s<>,;]+@[^\s<>,;]+\.[^\s<>,;]+$/.test(value)) throw deny(400, 'Invalid stored recipient');
  return value.trim();
}
export function boundedText(value, max = 2000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw deny(400, 'Invalid text');
  return value.trim();
}