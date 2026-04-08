/**
 * useTabNav — preserves per-tab navigation history and resets a tab to root on re-tap.
 *
 * Each bottom-tab root path is tracked. When a user taps a tab:
 * - If on a different tab → navigate to that tab's last visited path (or root).
 * - If on the SAME tab → navigate back to the tab root (reset the stack).
 *
 * Usage: const { navigate: tabNavigate, getTabPath } = useTabNav();
 */
import { useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Roots that map to each bottom-tab
export const TAB_ROOTS = ['/', '/explore', '/live', '/deals', '/profile'];

function getTabRoot(pathname) {
  // Find the deepest matching root
  return TAB_ROOTS.find(r => r === '/' ? pathname === '/' : pathname.startsWith(r)) || null;
}

export function useTabNav() {
  const navigate = useNavigate();
  const location = useLocation();
  // Store last visited full path per tab root
  const tabHistory = useRef({});

  // Call this from AppLayout/pages to record the current path for the active tab
  const recordPath = useCallback((pathname) => {
    const root = getTabRoot(pathname);
    if (root) tabHistory.current[root] = pathname;
  }, []);

  // Call this when a tab button is tapped
  const navigateTab = useCallback((tabRoot) => {
    const currentRoot = getTabRoot(location.pathname);
    if (currentRoot === tabRoot) {
      // Already on this tab — reset to root
      navigate(tabRoot, { replace: true });
    } else {
      // Navigate to last visited path on that tab (or root)
      const dest = tabHistory.current[tabRoot] || tabRoot;
      navigate(dest);
    }
  }, [location.pathname, navigate]);

  return { navigateTab, recordPath, tabHistory };
}