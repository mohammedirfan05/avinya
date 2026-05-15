import React, { useState } from 'react';
import { Navigation, Clock, Ruler, AlertTriangle, Route, Loader2 } from 'lucide-react';
import { api, type DirectionsResponse } from '../services/api';
import { AddressSearch } from './AddressSearch';

interface RouteNavigatorProps {
  onRouteCalculated?: (response: DirectionsResponse) => void;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

// Bangalore default locations
const BLR_CENTRE   = { lat: 12.9716, lng: 77.5946, label: 'Bangalore City Centre' };
const BLR_AIRPORT  = { lat: 13.1986, lng: 77.7066, label: 'Kempegowda Intl Airport' };

export const RouteNavigator: React.FC<RouteNavigatorProps> = ({ onRouteCalculated }) => {
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number } | null>(BLR_CENTRE);
  const [startLabel, setStartLabel]   = useState(BLR_CENTRE.label);
  const [endCoords, setEndCoords]     = useState<{ lat: number; lng: number } | null>(BLR_AIRPORT);
  const [endLabel, setEndLabel]       = useState(BLR_AIRPORT.label);
  const [avoidIncidents, setAvoidIncidents] = useState(true);
  const [loading, setLoading]  = useState(false);
  const [result, setResult]    = useState<DirectionsResponse | null>(null);
  const [error, setError]      = useState<string | null>(null);

  const calculateRoute = async () => {
    if (!startCoords || !endCoords) {
      setError('Please select both start and end locations');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.getRoute(
        startCoords.lng, startCoords.lat,
        endCoords.lng,   endCoords.lat,
        { avoid_incidents: avoidIncidents, alternatives: true },
      );
      setResult(response);
      onRouteCalculated?.(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Route calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Address Inputs */}
      <div className="space-y-3">
        <AddressSearch
          label="From"
          placeholder="Start location, e.g. MG Road, Bangalore"
          defaultValue={startLabel}
          onSelect={(coords, name) => { setStartCoords(coords); setStartLabel(name); }}
        />
        <AddressSearch
          label="To"
          placeholder="Destination, e.g. Whitefield, Bangalore"
          defaultValue={endLabel}
          onSelect={(coords, name) => { setEndCoords(coords); setEndLabel(name); }}
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={avoidIncidents}
            onChange={(e) => setAvoidIncidents(e.target.checked)}
            className="rounded border-white/20 bg-white/5 text-white focus:ring-0"
          />
          <span className="text-xs text-neutral-300">Avoid active incidents</span>
        </label>

        <button
          onClick={calculateRoute}
          disabled={loading || !startCoords || !endCoords}
          className="w-full py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
          {loading ? 'Calculating...' : 'Calculate Route'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Results */}
      {result && result.routes.length > 0 && (
        <div className="space-y-3">
          {result.excluded_incidents > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <AlertTriangle size={12} />
              Avoiding {result.excluded_incidents} active incident{result.excluded_incidents > 1 ? 's' : ''}
            </div>
          )}

          {result.routes.map((route, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border transition-all ${
                idx === 0
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white flex items-center gap-1.5">
                  <Route size={12} className="text-primary" />
                  {idx === 0 ? 'Recommended Route' : `Alternative ${idx}`}
                </span>
                {idx === 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    Fastest
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {formatDuration(route.duration)}
                </span>
                <span className="flex items-center gap-1">
                  <Ruler size={11} />
                  {formatDistance(route.distance)}
                </span>
              </div>
            </div>
          ))}

          <div className="text-[10px] text-neutral-600 text-center">
            Profile: {result.profile_used} • {result.routes.length} route{result.routes.length > 1 ? 's' : ''} found
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteNavigator;
