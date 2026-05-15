import React, { useState, useRef } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';
import type { IncidentCreatePayload, IncidentType, Severity } from '../services/api';
import { AddressSearch } from './AddressSearch';

interface IncidentReportFormProps {
  onSubmit: (payload: IncidentCreatePayload) => Promise<void>;
  onClose: () => void;
}

const INCIDENT_TYPES: { value: IncidentType; label: string; emoji: string }[] = [
  { value: 'pothole',      label: 'Pothole',      emoji: '🕳️' },
  { value: 'accident',     label: 'Accident',     emoji: '💥' },
  { value: 'congestion',   label: 'Congestion',   emoji: '🚗' },
  { value: 'road_closure', label: 'Road Closure', emoji: '🚧' },
  { value: 'flooding',     label: 'Flooding',     emoji: '🌊' },
];

const SEVERITY_LEVELS: { value: Severity; label: string; color: string }[] = [
  { value: 'low',      label: 'Low',      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { value: 'medium',   label: 'Medium',   color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { value: 'high',     label: 'High',     color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  { value: 'critical', label: 'Critical', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
];

export const IncidentReportForm: React.FC<IncidentReportFormProps> = ({ onSubmit, onClose }) => {
  const [incidentType, setIncidentType] = useState<IncidentType>('pothole');
  const [severity, setSeverity] = useState<Severity>('medium');
  // Coords resolved from geocoding — default to Bangalore centre
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 });
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAddressSelect = (c: { lat: number; lng: number }, placeName: string) => {
    setCoords(c);
    setResolvedAddress(placeName);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!resolvedAddress) {
      setError('Please search and select a location first');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        latitude: coords.lat,
        longitude: coords.lng,
        incident_type: incidentType,
        severity,
        description: description.trim() || undefined,
        image: image || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 glass rounded-2xl border border-white/10 shadow-2xl animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
            <AlertTriangle size={20} className="text-amber-400" />
            Report Incident
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-neutral-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Incident Type */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
              Incident Type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {INCIDENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setIncidentType(t.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    incidentType === t.value
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-white/[0.02] border-white/5 text-neutral-500 hover:bg-white/5 hover:text-neutral-300'
                  }`}
                >
                  <span className="text-base">{t.emoji}</span>
                  <span className="truncate w-full text-center">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
              Severity
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SEVERITY_LEVELS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSeverity(s.value)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    severity === s.value ? s.color : 'bg-white/[0.02] border-white/5 text-neutral-500 hover:bg-white/5'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Address / Location */}
          <div>
            <AddressSearch
              label="Location"
              placeholder="Search area, road, landmark in Bangalore..."
              onSelect={handleAddressSelect}
            />
            {/* Show resolved coords as subtle confirmation */}
            {resolvedAddress && (
              <p className="mt-1.5 text-[10px] text-neutral-600 tabular-nums">
                📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30 resize-none"
              placeholder="Describe the incident..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
              Photo (optional)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-dashed border-white/10 rounded-lg text-sm text-neutral-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <Upload size={14} />
              {image ? image.name : 'Upload Photo'}
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-sm text-rose-300">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-neutral-300 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Report Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentReportForm;
