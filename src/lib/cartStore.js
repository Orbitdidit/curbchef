// Simple cart state using a module-level store with listeners
const STORAGE_KEY = 'curbchef_cart';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { items: [], truckId: null, truckName: '' }; }
  catch { return { items: [], truckId: null, truckName: '' }; }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
}

let cart = load();
let listeners = new Set();

function notify() {
  save();
  listeners.forEach(fn => fn({ ...cart }));
}

export function getCart() {
  return { ...cart };
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function addToCart(item, truckId, truckName) {
  // If switching trucks, clear cart
  if (cart.truckId && cart.truckId !== truckId) {
    cart = { items: [], truckId, truckName };
  }
  cart.truckId = truckId;
  cart.truckName = truckName;

  const existing = cart.items.find(i => i.item_id === item.item_id);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.items.push({ ...item });
  }
  notify();
}

export function updateQuantity(itemId, quantity) {
  if (quantity <= 0) {
    cart.items = cart.items.filter(i => i.item_id !== itemId);
  } else {
    const item = cart.items.find(i => i.item_id === itemId);
    if (item) item.quantity = quantity;
  }
  if (cart.items.length === 0) {
    cart.truckId = null;
    cart.truckName = '';
  }
  notify();
}

export function clearCart() {
  cart = { items: [], truckId: null, truckName: '' };
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  listeners.forEach(fn => fn({ ...cart }));
}

export function getCartTotal() {
  return cart.items.reduce((sum, i) => {
    const addOnsTotal = (i.add_ons || []).reduce((a, ao) => a + ao.price, 0);
    return sum + (i.price + addOnsTotal) * i.quantity;
  }, 0);
}

export function getCartCount() {
  return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}