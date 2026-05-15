import { useCallback, useEffect, useRef } from 'react';
import { useIncidentStore } from '../store/useIncidentStore';

interface UseIncidentsOptions {
  /** Auto-refresh interval in ms. 0 = disabled.  Default: 15000 (15s). */
  autoRefreshMs?: number;
  /** Whether to fetch on mount. Default: true. */
  fetchOnMount?: boolean;
}

/**
 * Convenience hook that wraps the incident store with auto-refresh logic.
 * Prevents unnecessary re-fetches and cleans up timers on unmount.
 */
export function useIncidents(options: UseIncidentsOptions = {}) {
  const { autoRefreshMs = 15000, fetchOnMount = true } = options;

  const incidents = useIncidentStore((s) => s.incidents);
  const geojson = useIncidentStore((s) => s.geojson);
  const isLoading = useIncidentStore((s) => s.isLoading);
  const error = useIncidentStore((s) => s.error);
  const lastFetchedAt = useIncidentStore((s) => s.lastFetchedAt);
  const fetchIncidents = useIncidentStore((s) => s.fetchIncidents);
  const fetchGeoJSON = useIncidentStore((s) => s.fetchGeoJSON);
  const createIncident = useIncidentStore((s) => s.createIncident);
  const updateStatus = useIncidentStore((s) => s.updateStatus);
  const setFilters = useIncidentStore((s) => s.setFilters);
  const clearError = useIncidentStore((s) => s.clearError);

  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    await Promise.all([fetchIncidents(), fetchGeoJSON()]);
  }, [fetchIncidents, fetchGeoJSON]);

  useEffect(() => {
    mountedRef.current = true;

    if (fetchOnMount) {
      refresh();
    }

    if (autoRefreshMs > 0) {
      timerRef.current = window.setInterval(() => {
        if (mountedRef.current) refresh();
      }, autoRefreshMs);
    }

    return () => {
      mountedRef.current = false;
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [autoRefreshMs, fetchOnMount, refresh]);

  return {
    incidents,
    geojson,
    isLoading,
    error,
    lastFetchedAt,
    refresh,
    createIncident,
    updateStatus,
    setFilters,
    clearError,
  };
}
