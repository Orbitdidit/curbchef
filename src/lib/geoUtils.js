/**
 * Haversine distance between two lat/lng points.
 * Returns distance in miles.
 */
export function distanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * React hook — returns { lat, lng, error, loading }
 * Requests browser geolocation once on mount.
 */
import { useState, useEffect } from 'react';

export function useUserLocation() {
  const [location, setLocation] = useState({ lat: null, lng: null, error: null, loading: true });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(l => ({ ...l, error: 'Geolocation not supported', loading: false }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, error: null, loading: false }),
      () => setLocation({ lat: null, lng: null, error: 'Permission denied', loading: false }),
      { timeout: 8000 }
    );
  }, []);

  return location;
}

/**
 * Format distance for display, e.g. "1.2 mi away"
 */
export function formatDist(miles) {
  if (miles == null) return null;
  return miles < 10 ? `${miles.toFixed(1)} mi` : `${Math.round(miles)} mi`;
}