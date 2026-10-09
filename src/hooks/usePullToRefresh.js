import { useEffect, useRef, useState } from 'react';

const THRESHOLD = 72;

export function usePullToRefresh({ onRefresh, targetRef }) {
  const refresh = useRef(onRefresh);
  refresh.current = onRefresh;
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const target = targetRef?.current || window;
    const scroller = targetRef?.current?.closest('main') || document.scrollingElement;
    let start = null, distance = 0, busy = false, mounted = true;
    const reset = () => { start = null; distance = 0; setPullDist(0); };
    const onStart = e => {
      if (busy) return;
      reset();
      if (e.touches.length !== 1 || scroller.scrollTop > 0 || e.target.closest?.('button, a, input, textarea, select, [contenteditable="true"], [role="dialog"]')) return;
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onMove = e => {
      if (!start || busy) return;
      if (e.touches.length !== 1 || scroller.scrollTop > 0) { reset(); return; }
      const dy = e.touches[0].clientY - start.y;
      const dx = Math.abs(e.touches[0].clientX - start.x);
      if (dy < 0 || (dx > 8 && dx > dy)) { reset(); return; }
      if (dy > 0 && e.cancelable) e.preventDefault();
      distance = Math.min(dy, THRESHOLD * 1.5);
      setPullDist(distance);
    };
    const onEnd = async () => {
      const ready = !!start && distance >= THRESHOLD && !busy;
      reset();
      if (!ready) return;
      busy = true;
      setRefreshing(true);
      try { await refresh.current(); }
      finally { busy = false; if (mounted) setRefreshing(false); }
    };
    target.addEventListener('touchstart', onStart, { passive: true });
    target.addEventListener('touchmove', onMove, { passive: false });
    target.addEventListener('touchend', onEnd, { passive: true });
    target.addEventListener('touchcancel', reset, { passive: true });
    return () => {
      mounted = false;
      target.removeEventListener('touchstart', onStart);
      target.removeEventListener('touchmove', onMove);
      target.removeEventListener('touchend', onEnd);
      target.removeEventListener('touchcancel', reset);
    };
  }, [targetRef]);

  return { pulling: pullDist > 0, pullDist, refreshing };
}