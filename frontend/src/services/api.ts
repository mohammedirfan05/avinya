const API_BASE = 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Traffic feed types (existing)
// ---------------------------------------------------------------------------

export interface TrafficStats {
  total_count: number;
  direction_counts: Record<string, number>;
  class_counts: Record<string, number>;
  fps?: number;
  processed_frames?: number;
  source?: string;
  running?: boolean;
  active_connections?: number;
}

export interface TrafficFeedMessage {
  type: 'snapshot' | 'update';
  stats: TrafficStats;
  frame?: string;
}

// ---------------------------------------------------------------------------
// Incident types
// ---------------------------------------------------------------------------

export type IncidentType = 'pothole' | 'accident' | 'congestion' | 'road_closure' | 'flooding';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'verified' | 'in_progress' | 'resolved';

export interface Incident {
  id: string;
  latitude: number;
  longitude: number;
  incident_type: IncidentType;
  severity: Severity;
  description?: string;
  status: IncidentStatus;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentCreatePayload {
  latitude: number;
  longitude: number;
  incident_type: IncidentType;
  severity: Severity;
  description?: string;
  image?: File;
}

// ---------------------------------------------------------------------------
// Routing types
// ---------------------------------------------------------------------------

export interface RouteLeg {
  duration: number;
  distance: number;
  summary: string;
}

export interface RouteResult {
  duration: number;
  distance: number;
  geometry: GeoJSON.LineString;
  legs: RouteLeg[];
  weight_name: string;
}

export interface DirectionsResponse {
  routes: RouteResult[];
  waypoints: { name: string; location: number[] }[];
  excluded_incidents: number;
  profile_used: string;
}

// ---------------------------------------------------------------------------
// Matrix types
// ---------------------------------------------------------------------------

export interface MatrixCoordinate {
  lon: number;
  lat: number;
  label?: string;
}

export interface BottleneckEntry {
  source_index: number;
  destination_index: number;
  source_label?: string;
  destination_label?: string;
  duration_seconds: number;
  distance_meters?: number;
}

export interface MatrixResponse {
  code: string;
  durations: (number | null)[][];
  distances?: (number | null)[][];
  sources: Record<string, unknown>[];
  destinations: Record<string, unknown>[];
  bottlenecks: BottleneckEntry[];
  profile: string;
  coordinate_count: number;
}

// ---------------------------------------------------------------------------
// GeoJSON Feature Collection (for incidents)
// ---------------------------------------------------------------------------

export interface IncidentGeoJSON {
  type: 'FeatureCollection';
  features: GeoJSON.Feature[];
}

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------

export const api = {
  // --- Traffic feed (existing) ---

  getStats: async (): Promise<TrafficStats> => {
    const response = await fetch(`${API_BASE}/api/stats`);
    return response.json();
  },

  startAnalysis: async (sourceType: 'webcam' | 'video', file?: File): Promise<{ status: string; source: string }> => {
    const formData = new FormData();
    formData.append('source_type', sourceType);
    if (sourceType === 'video' && file) {
      formData.append('file', file);
    }
    const response = await fetch(`${API_BASE}/api/analyze/start`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  stopAnalysis: async (): Promise<{ status: string }> => {
    const response = await fetch(`${API_BASE}/api/analyze/stop`, {
      method: 'POST',
    });
    return response.json();
  },

  connectWebSocket: (onMessage: (data: TrafficFeedMessage) => void) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/traffic`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as TrafficFeedMessage;
        onMessage(data);
      } catch (e) {
        console.error('WebSocket parse error:', e);
      }
    };
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    return ws;
  },

  // --- Incidents ---

  getIncidents: async (filters?: {
    min_lat?: number; max_lat?: number;
    min_lon?: number; max_lon?: number;
    incident_type?: IncidentType;
    severity?: Severity;
    status?: IncidentStatus;
  }): Promise<Incident[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.set(k, String(v));
      });
    }
    const qs = params.toString();
    const response = await fetch(`${API_BASE}/api/incidents/${qs ? `?${qs}` : ''}`);
    return response.json();
  },

  getIncidentById: async (id: string): Promise<Incident> => {
    const response = await fetch(`${API_BASE}/api/incidents/${id}`);
    if (!response.ok) throw new Error('Incident not found');
    return response.json();
  },

  createIncident: async (payload: IncidentCreatePayload): Promise<Incident> => {
    const formData = new FormData();
    formData.append('latitude', String(payload.latitude));
    formData.append('longitude', String(payload.longitude));
    formData.append('incident_type', payload.incident_type);
    formData.append('severity', payload.severity);
    if (payload.description) formData.append('description', payload.description);
    if (payload.image) formData.append('image', payload.image);

    const response = await fetch(`${API_BASE}/api/incidents/`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(err.detail || 'Failed to create incident');
    }
    return response.json();
  },

  updateIncidentStatus: async (id: string, newStatus: IncidentStatus): Promise<Incident> => {
    const formData = new FormData();
    formData.append('new_status', newStatus);
    const response = await fetch(`${API_BASE}/api/incidents/${id}/status`, {
      method: 'PATCH',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to update incident status');
    return response.json();
  },

  getIncidentsGeoJSON: async (bbox?: {
    min_lat: number; max_lat: number;
    min_lon: number; max_lon: number;
  }): Promise<IncidentGeoJSON> => {
    const params = new URLSearchParams();
    if (bbox) {
      params.set('min_lat', String(bbox.min_lat));
      params.set('max_lat', String(bbox.max_lat));
      params.set('min_lon', String(bbox.min_lon));
      params.set('max_lon', String(bbox.max_lon));
    }
    const qs = params.toString();
    const response = await fetch(`${API_BASE}/api/incidents/geojson/${qs ? `?${qs}` : ''}`);
    return response.json();
  },

  // --- Routing ---

  getRoute: async (
    startLon: number, startLat: number,
    endLon: number, endLat: number,
    options?: { avoid_incidents?: boolean; alternatives?: boolean },
  ): Promise<DirectionsResponse> => {
    const params = new URLSearchParams({
      start_lon: String(startLon),
      start_lat: String(startLat),
      end_lon: String(endLon),
      end_lat: String(endLat),
    });
    if (options?.avoid_incidents !== undefined) params.set('avoid_incidents', String(options.avoid_incidents));
    if (options?.alternatives !== undefined) params.set('alternatives', String(options.alternatives));

    const response = await fetch(`${API_BASE}/api/route?${params}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Routing failed' }));
      throw new Error(err.detail || 'Failed to get route');
    }
    return response.json();
  },

  // --- Matrix ---

  getMatrix: async (
    coordinates: MatrixCoordinate[],
    profile: string = 'driving',
  ): Promise<MatrixResponse> => {
    const response = await fetch(`${API_BASE}/api/matrix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates, profile }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Matrix request failed' }));
      throw new Error(err.detail || 'Matrix API error');
    }
    return response.json();
  },

  optimizeSignals: async (
    coordinates: MatrixCoordinate[],
    profile: string = 'driving',
  ): Promise<Record<string, unknown>> => {
    const response = await fetch(`${API_BASE}/api/matrix/optimize-signals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates, profile }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Optimization failed' }));
      throw new Error(err.detail || 'Signal optimization error');
    }
    return response.json();
  },
};
