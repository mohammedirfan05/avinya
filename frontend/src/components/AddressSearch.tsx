import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

interface GeocodeSuggestion {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

interface AddressSearchProps {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  onSelect: (coords: { lat: number; lng: number }, placeName: string) => void;
  className?: string;
}

const MAPBOX_KEY = import.meta.env.VITE_MAPBOX_API_KEY as string;

/**
 * Address autocomplete input backed by the Mapbox Geocoding API.
 * Debounces input by 350 ms. Biases results towards Bangalore.
 */
export const AddressSearch: React.FC<AddressSearchProps> = ({
  label,
  placeholder = 'Search address or landmark...',
  defaultValue = '',
  onSelect,
  className = '',
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (text: string) => {
    if (!text.trim() || text.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    if (!MAPBOX_KEY) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const encoded = encodeURIComponent(text);
      // Proximity to Bangalore centre (77.5946, 12.9716) to bias results
      const url =
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json` +
        `?access_token=${MAPBOX_KEY}` +
        `&proximity=77.5946,12.9716` +
        `&country=IN` +
        `&types=address,poi,locality,place,neighborhood,district` +
        `&limit=6`;
      const res = await fetch(url);
      const data = await res.json();
      const feats: GeocodeSuggestion[] = (data.features ?? []).map((f: any) => ({
        id: f.id,
        place_name: f.place_name,
        center: f.center,
      }));
      setSuggestions(feats);
      setOpen(feats.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 350);
  };

  const handleSelect = (suggestion: GeocodeSuggestion) => {
    const [lng, lat] = suggestion.center;
    setQuery(suggestion.place_name);
    setSuggestions([]);
    setOpen(false);
    onSelect({ lat, lng }, suggestion.place_name);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
          <MapPin size={10} className="inline mr-1 text-neutral-500" />
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30 pr-8"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 size={12} className="text-neutral-500 animate-spin" />}
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-neutral-600 hover:text-neutral-300 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-[200] left-0 right-0 mt-1 glass border border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-3 py-2.5 text-xs text-neutral-200 hover:bg-white/10 transition-colors flex items-start gap-2"
              >
                <MapPin size={11} className="text-neutral-500 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{s.place_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressSearch;
