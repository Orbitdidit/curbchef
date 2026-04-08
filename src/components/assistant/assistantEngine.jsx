import { base44 } from '@/api/base44Client';
import { distanceMiles } from '@/lib/geoUtils';

const BUDGET_MAP = {
  cheap: 8,
  medium: 15,
  splurge: 50,
};

const DISTANCE_MAP = {
  close: 1,
  nearby: 3,
  anywhere: 999,
};

const CRAVING_CUISINE_MAP = {
  tacos: ['tacos', 'fusion'],
  burgers: ['burgers'],
  bbq: ['bbq', 'soul_food'],
  seafood: ['seafood'],
  asian: ['asian', 'fusion'],
  healthy: ['vegan'],
  sweet: ['desserts'],
  pizza: ['pizza'],
  surprise: null, // anything
};

export async function getRecommendations(answers, userLat, userLng) {
  const trucks = await base44.entities.FoodTruck.filter({ is_approved: true });
  const allItems = await base44.entities.MenuItem.list('-created_date', 200);

  const maxPrice = BUDGET_MAP[answers.budget] || 15;
  const maxDist = DISTANCE_MAP[answers.distance] || 999;
  const targetCuisines = answers.craving ? CRAVING_CUISINE_MAP[answers.craving] : null;

  // Score each truck
  const scored = trucks.map(truck => {
    let score = 0;
    const dist = (userLat && truck.latitude)
      ? distanceMiles(userLat, userLng, truck.latitude, truck.longitude)
      : null;

    // Distance filter
    if (dist !== null && dist > maxDist) return null;

    // Status bonus
    if (truck.status === 'open') score += 30;
    if (truck.is_live) score += 20;

    // Cuisine match
    if (targetCuisines && targetCuisines.includes(truck.cuisine_type)) {
      score += 40;
    } else if (!targetCuisines) {
      score += 15; // surprise me — slight bonus to all
    }

    // Rating
    score += (truck.rating || 4) * 5;

    // Proximity bonus
    if (dist !== null) {
      score += Math.max(0, 20 - dist * 5);
    }

    // Get truck's menu items
    const truckItems = allItems.filter(i => i.truck_id === truck.id && i.is_available !== false);

    // Budget filter: find items within budget
    const affordableItems = truckItems.filter(i => i.price <= maxPrice);
    if (affordableItems.length === 0 && truckItems.length > 0) {
      score -= 20; // penalize but don't exclude
    }

    // Spice preference (if items have tags)
    if (answers.spice === 'hot' || answers.spice === 'fire') {
      const spicyItems = truckItems.filter(i => i.tags?.some(t => t.toLowerCase().includes('spic')));
      if (spicyItems.length > 0) score += 10;
    }

    // Meal type
    if (answers.mealType === 'quick') {
      const sides = truckItems.filter(i => ['sides', 'drinks'].includes(i.category));
      if (sides.length > 0) score += 5;
    } else if (answers.mealType === 'full') {
      const mains = truckItems.filter(i => i.category === 'mains');
      if (mains.length > 1) score += 10;
    }

    // Pick best matching item
    let bestItem = null;
    const candidates = affordableItems.length > 0 ? affordableItems : truckItems;
    if (candidates.length > 0) {
      // Prefer specials, then mains, then highest priced within budget
      bestItem = candidates.find(i => i.is_special) ||
        candidates.find(i => i.category === 'mains') ||
        candidates.sort((a, b) => b.price - a.price)[0];
    }

    return { truck, score, distance: dist, bestItem, itemCount: truckItems.length };
  }).filter(Boolean);

  // Sort by score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 5);
}