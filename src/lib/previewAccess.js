import { base44 } from '@/api/base44Client';

/**
 * Preview links let you show CurbChef to truck owners and friends before
 * launch, on their own phones, with no account:
 *
 *   https://app.curbchef.app/?preview=houston
 *
 * The code lives in HomepageConfig (key "preview_code", headline = code).
 * Change the code to kill old links; set is_active=false to turn previews off.
 * Preview only opens browsing pages. Checkout, orders, vendor and admin
 * still require a real signed-in, approved account.
 */
const STORE_KEY = 'cc_preview';
const TTL_MS = 14 * 24 * 60 * 60 * 1000; // a preview link keeps working on that phone for 2 weeks

// Routes a preview visitor may browse. Everything else stays gated.
const OPEN_PATHS = [/^\/$/, /^\/explore/, /^\/truck\/[^/]+(\/item\/[^/]+)?$/, /^\/crave(\/list)?$/, /^\/parks/,
  /^\/live/, /^\/map/, /^\/deals/, /^\/search/, /^\/top-items/, /^\/experiences/, /^\/radar/, /^\/support/, /^\/privacy/, /^\/terms/];

export const isPreviewPath = path => OPEN_PATHS.some(rx => rx.test(path));

function readStored() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return v && Date.now() - v.at < TTL_MS ? v.code : null;
  } catch { return null; }
}

function store(code) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ code, at: Date.now() })); } catch { /* private mode: in-memory only */ }
}

/** Resolves to true if this browser holds a valid, currently active preview code. */
export async function checkPreviewAccess() {
  let fromUrl = null;
  try {
    const url = new URL(window.location.href);
    fromUrl = url.searchParams.get('preview');
    if (fromUrl) {
      // Clean the code out of the address bar so it isn't screenshotted or re-shared by accident.
      url.searchParams.delete('preview');
      window.history.replaceState(null, '', url.pathname + (url.search ? url.search : '') + url.hash);
    }
  } catch { /* ignore */ }

  const candidate = (fromUrl || readStored() || '').trim().toLowerCase();
  if (!candidate) return false;

  try {
    const rows = await base44.entities.HomepageConfig.filter({ key: 'preview_code', is_active: true });
    const list = Array.isArray(rows) ? rows : (rows?.items || []);
    const ok = list.some(r => (r.headline || '').trim().toLowerCase() === candidate);
    if (ok) store(candidate);
    else { try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ } }
    return ok;
  } catch {
    return false;
  }
}
