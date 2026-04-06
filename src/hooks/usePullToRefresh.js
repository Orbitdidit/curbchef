import { useEffect, useRef, useState, useCallback } from 'react';

const THRESHOLD = 72;

/**
 * usePullToRefresh
 * Returns { pulling, pullDist, refreshing } for rendering an indicator.
 * Calls onRefresh() when the user pulls down past THRESHOLD.
 */
export function usePullToRefresh({ onRefresh }) {
  const startY = useRef(null);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY.current === null) return;
    const dist = e.touches[0].clientY - startY.current;
    if (dist > 0) {
      setPullDist(Math.min(dist, THRESHOLD * 1.5));
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (pullDist >= THRESHOLD) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    startY.current = null;
    setPullDist(0);
  }, [pullDist, onRefresh]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pulling: pullDist > 0, pullDist, refreshing };
}