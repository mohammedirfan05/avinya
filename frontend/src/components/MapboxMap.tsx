import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Map, { Source, Layer, Popup, NavigationControl, type MapLayerMouseEvent, type MapRef } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useIncidents } from '../hooks/useIncidents';
import type { DirectionsResponse } from '../services/api';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY || '';

// ---------------------------------------------------------------------------
// Severity styling lookup
// ---------------------------------------------------------------------------

const SEVERITY_COLORS: Record<string, string> = {
  low: '#22c55e',        // green
  medium: '#f59e0b',     // amber
  high: '#f97316',       // orange
  critical: '#ef4444',   // red
};

const INCIDENT_ICONS: Record<string, string> = {
  pothole: '🕳️',
  accident: '💥',
  congestion: '🚗',
  road_closure: '🚧',
  flooding: '🌊',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SelectedIncident {
  id: string;
  latitude: number;
  longitude: number;
  incident_type: string;
  severity: string;
  description: string;
  status: string;
  created_at: string;
}

interface MapboxMapProps {
  /** If provided, render this route as a line layer */
  routeResponse?: DirectionsResponse | null;
  /** Compact mode (smaller height) for dashboard embedding */
  compact?: boolean;
  /** Map center override */
  center?: { lng: number; lat: number };
  /** Zoom override */
  zoom?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const MapboxMap: React.FC<MapboxMapProps> = ({
  routeResponse,
  compact = false,
  center,
  zoom,
}) => {
  const { geojson, refresh } = useIncidents({ autoRefreshMs: 12000 });
  const [selectedIncident, setSelectedIncident] = useState<SelectedIncident | null>(null);
  const mapRef = useRef<MapRef>(null);

  // Build GeoJSON from store
  const geojsonData = useMemo(() => {
    if (geojson) return geojson;
    return { type: 'FeatureCollection' as const, features: [] };
  }, [geojson]);

  // Build route GeoJSON
  const routeGeoJSON = useMemo(() => {
    if (!routeResponse?.routes?.length) return null;
    return {
      type: 'FeatureCollection' as const,
      features: routeResponse.routes.map((route, idx) => ({
        type: 'Feature' as const,
        properties: { index: idx, primary: idx === 0 },
        geometry: route.geometry,
      })),
    };
  }, [routeResponse]);

  // Click handler for incident points
  const onClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (feature && feature.properties?.id) {
      setSelectedIncident({
        id: feature.properties.id as string,
        latitude: (feature.geometry as GeoJSON.Point).coordinates[1],
        longitude: (feature.geometry as GeoJSON.Point).coordinates[0],
        incident_type: feature.properties.incident_type as string,
        severity: feature.properties.severity as string,
        description: (feature.properties.description as string) || '',
        status: feature.properties.status as string,
        created_at: feature.properties.created_at as string,
      });
    }
  }, []);

  // Missing API key guard
  if (!import.meta.env.VITE_MAPBOX_API_KEY) {
    return (
      <div className="h-full flex items-center justify-center bg-neutral-950 rounded-lg border border-white/5 text-neutral-500 p-4 text-center text-sm">
        <div>
          <p className="font-medium mb-1">Mapbox API Key Required</p>
          <p className="text-xs text-neutral-600">Set <code className="text-neutral-400">VITE_MAPBOX_API_KEY</code> in <code className="text-neutral-400">.env</code></p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-lg overflow-hidden relative ${compact ? 'h-[320px]' : 'h-full min-h-[400px]'}`}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: center?.lng ?? 77.5946,
          latitude: center?.lat ?? 12.9716,
          zoom: zoom ?? 11,
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        interactiveLayerIds={['unclustered-point']}
        onClick={onClick}
        reuseMaps
        attributionControl={false}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {/* ---- Incident Layers ---- */}
        <Source
          id="incidents"
          type="geojson"
          data={geojsonData as any}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          {/* Heatmap — visible at low zoom */}
          <Layer
            id="incidents-heat"
            type="heatmap"
            maxzoom={11}
            paint={{
              'heatmap-weight': ['get', 'severity_weight'],
              'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 11, 3],
              'heatmap-color': [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(0,0,0,0)',
                0.1, 'rgba(33,102,172,0.4)',
                0.3, 'rgb(103,169,207)',
                0.5, 'rgb(253,219,199)',
                0.7, 'rgb(239,138,98)',
                0.9, 'rgb(220,60,60)',
                1, 'rgb(178,24,43)',
              ],
              'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 4, 11, 25],
              'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0.9, 11, 0],
            }}
          />

          {/* Clustered circles */}
          <Layer
            id="clusters"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': [
                'step', ['get', 'point_count'],
                '#6366f1',  // indigo — small
                5, '#f59e0b',   // amber — medium
                15, '#ef4444',  // red — large
              ],
              'circle-radius': ['step', ['get', 'point_count'], 16, 5, 22, 15, 28],
              'circle-stroke-width': 2,
              'circle-stroke-color': 'rgba(255,255,255,0.15)',
              'circle-opacity': 0.9,
            }}
          />

          {/* Cluster count labels */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12,
            }}
            paint={{
              'text-color': '#ffffff',
            }}
          />

          {/* Individual incident points */}
          <Layer
            id="unclustered-point"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': [
                'match', ['get', 'severity'],
                'low', SEVERITY_COLORS.low,
                'medium', SEVERITY_COLORS.medium,
                'high', SEVERITY_COLORS.high,
                'critical', SEVERITY_COLORS.critical,
                '#ffffff',
              ],
              'circle-radius': [
                'match', ['get', 'severity'],
                'critical', 9,
                'high', 7,
                'medium', 6,
                5,
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': 'rgba(255,255,255,0.3)',
            }}
          />

          {/* Severity-based pulse ring for critical incidents */}
          <Layer
            id="critical-pulse"
            type="circle"
            filter={['all', ['!', ['has', 'point_count']], ['==', ['get', 'severity'], 'critical']]}
            paint={{
              'circle-radius': 18,
              'circle-color': 'transparent',
              'circle-stroke-width': 2,
              'circle-stroke-color': 'rgba(239, 68, 68, 0.4)',
              'circle-opacity': 0.6,
            }}
          />
        </Source>

        {/* ---- Route Layer ---- */}
        {routeGeoJSON && (
          <Source id="route" type="geojson" data={routeGeoJSON as any}>
            {/* Alternative routes (rendered first / behind) */}
            <Layer
              id="route-alt"
              type="line"
              filter={['==', ['get', 'primary'], false]}
              paint={{
                'line-color': '#6366f1',
                'line-width': 4,
                'line-opacity': 0.4,
                'line-dasharray': [2, 4],
              }}
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
              }}
            />
            {/* Primary route */}
            <Layer
              id="route-primary"
              type="line"
              filter={['==', ['get', 'primary'], true]}
              paint={{
                'line-color': '#3b82f6',
                'line-width': 5,
                'line-opacity': 0.85,
              }}
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
              }}
            />
          </Source>
        )}

        {/* ---- Popup ---- */}
        {selectedIncident && (
          <Popup
            longitude={selectedIncident.longitude}
            latitude={selectedIncident.latitude}
            closeOnClick={false}
            onClose={() => setSelectedIncident(null)}
            className="z-50"
            maxWidth="280px"
          >
            <div className="p-2 text-neutral-900">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">{INCIDENT_ICONS[selectedIncident.incident_type] || '⚠️'}</span>
                <h3 className="font-bold text-sm capitalize">
                  {selectedIncident.incident_type.replace('_', ' ')}
                </h3>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase"
                  style={{
                    backgroundColor: SEVERITY_COLORS[selectedIncident.severity] + '20',
                    color: SEVERITY_COLORS[selectedIncident.severity],
                  }}
                >
                  {selectedIncident.severity}
                </span>
                <span className="text-[10px] text-gray-500 capitalize">{selectedIncident.status}</span>
              </div>
              {selectedIncident.description && (
                <p className="text-xs text-gray-600 mt-1">{selectedIncident.description}</p>
              )}
              <p className="text-[10px] text-gray-400 mt-1.5">
                {new Date(selectedIncident.created_at).toLocaleString()}
              </p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapboxMap;