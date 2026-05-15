import { create } from 'zustand';
import {
  api,
  type Incident,
  type IncidentCreatePayload,
  type IncidentGeoJSON,
  type IncidentStatus,
  type IncidentType,
  type Severity,
} from '../services/api';

interface IncidentFilters {
  incident_type?: IncidentType;
  severity?: Severity;
  status?: IncidentStatus;
}

interface IncidentState {
  incidents: Incident[];
  geojson: IncidentGeoJSON | null;
  filters: IncidentFilters;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  // Actions
  fetchIncidents: () => Promise<void>;
  fetchGeoJSON: () => Promise<void>;
  createIncident: (payload: IncidentCreatePayload) => Promise<Incident>;
  updateStatus: (id: string, status: IncidentStatus) => Promise<void>;
  setFilters: (filters: IncidentFilters) => void;
  clearError: () => void;
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  incidents: [],
  geojson: null,
  filters: {},
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  fetchIncidents: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const incidents = await api.getIncidents(filters);
      set({ incidents, isLoading: false, lastFetchedAt: Date.now() });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to fetch incidents' });
    }
  },

  fetchGeoJSON: async () => {
    try {
      const geojson = await api.getIncidentsGeoJSON();
      set({ geojson });
    } catch (err) {
      console.error('Failed to fetch GeoJSON:', err);
    }
  },

  createIncident: async (payload: IncidentCreatePayload) => {
    set({ isLoading: true, error: null });
    try {
      const incident = await api.createIncident(payload);
      set((state) => ({
        incidents: [incident, ...state.incidents],
        isLoading: false,
      }));
      // Re-fetch geojson to include the new incident
      get().fetchGeoJSON();
      return incident;
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to create incident' });
      throw err;
    }
  },

  updateStatus: async (id: string, status: IncidentStatus) => {
    try {
      const updated = await api.updateIncidentStatus(id, status);
      set((state) => ({
        incidents: state.incidents.map((i) => (i.id === id ? updated : i)),
      }));
      get().fetchGeoJSON();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update status' });
    }
  },

  setFilters: (filters: IncidentFilters) => {
    set({ filters });
    get().fetchIncidents();
  },

  clearError: () => set({ error: null }),
}));

export default useIncidentStore;
