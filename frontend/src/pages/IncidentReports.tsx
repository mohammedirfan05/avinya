import React, { useState } from 'react';
import {
  Filter,
  Search,
  Download,
  Plus,
  MapPin,
  AlertTriangle,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { useIncidents } from '../hooks/useIncidents';
import { MapboxMap } from '../components/MapboxMap';
import { IncidentReportForm } from '../components/IncidentReportForm';
import type { IncidentType, Severity, IncidentStatus } from '../services/api';

const SEVERITY_DOT: Record<string, string> = {
  low: 'bg-emerald-400',
  medium: 'bg-amber-400',
  high: 'bg-orange-400',
  critical: 'bg-rose-400',
};

const STATUS_BADGE: Record<string, string> = {
  reported: 'bg-blue-500/15 text-blue-300',
  verified: 'bg-indigo-500/15 text-indigo-300',
  in_progress: 'bg-amber-500/15 text-amber-300',
  resolved: 'bg-emerald-500/15 text-emerald-300',
};

const INCIDENT_ICONS: Record<string, string> = {
  pothole: '🕳️',
  accident: '💥',
  congestion: '🚗',
  road_closure: '🚧',
  flooding: '🌊',
};

const IncidentReports: React.FC = () => {
  const { incidents, isLoading, error, createIncident, updateStatus } = useIncidents({ autoRefreshMs: 10000 });
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<IncidentType | ''>('');
  const [filterSeverity, setFilterSeverity] = useState<Severity | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  // Client-side filtering (backend is already filtered via store)
  const filtered = incidents.filter((inc) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !inc.description?.toLowerCase().includes(q) &&
        !inc.incident_type.includes(q) &&
        !inc.severity.includes(q) &&
        !inc.id.includes(q)
      ) return false;
    }
    if (filterType && inc.incident_type !== filterType) return false;
    if (filterSeverity && inc.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-[0.2em] mb-1">Violation Monitoring</h2>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Incident Reports</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 w-64 transition-all text-white placeholder-neutral-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-medium transition-all ${
              showFilters ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
            }`}
          >
            <Filter size={14} />
            Filters
            <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-all"
          >
            <Plus size={14} />
            Report Incident
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="glass rounded-xl border-white/5 p-4 flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as IncidentType | '')}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20"
            >
              <option value="">All Types</option>
              <option value="pothole">Pothole</option>
              <option value="accident">Accident</option>
              <option value="congestion">Congestion</option>
              <option value="road_closure">Road Closure</option>
              <option value="flooding">Flooding</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as Severity | '')}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20"
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="text-xs text-neutral-500 ml-auto">
            {filtered.length} incident{filtered.length !== 1 ? 's' : ''} found
          </div>
        </div>
      )}

      {/* Main Grid: Map + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map */}
        <div className="xl:col-span-1">
          <div className="glass rounded-xl border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-2 text-white">
                <MapPin className="text-primary" size={16} />
                Live Incident Map
              </h3>
              <span className="text-[10px] text-neutral-500">{filtered.length} incidents</span>
            </div>
            <div className="h-[400px]">
              <MapboxMap compact />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="xl:col-span-2">
          <div className="glass rounded-xl border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Recent Incidents</h3>
              <button className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
                <Download size={12} />
                Export
              </button>
            </div>

            {error && (
              <div className="px-4 py-2 bg-rose-500/10 text-xs text-rose-300 border-b border-rose-500/10">
                {error}
              </div>
            )}

            {isLoading && filtered.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">Loading incidents...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">No incidents match your filters</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-left">
                      <th className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Severity</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inc) => (
                      <tr key={inc.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2">
                            <span>{INCIDENT_ICONS[inc.incident_type] || '⚠️'}</span>
                            <span className="capitalize text-neutral-200 text-xs">
                              {inc.incident_type.replace('_', ' ')}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${SEVERITY_DOT[inc.severity]}`} />
                            <span className="capitalize text-xs text-neutral-300">{inc.severity}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-neutral-400 tabular-nums">
                          {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-400 max-w-[200px] truncate">
                          {inc.description || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[inc.status] || 'bg-neutral-500/15 text-neutral-300'}`}>
                            {inc.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {inc.status !== 'resolved' && (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) updateStatus(inc.id, e.target.value as IncidentStatus);
                              }}
                              className="bg-white/5 border border-white/10 rounded text-[10px] text-neutral-400 px-1.5 py-0.5 focus:outline-none"
                            >
                              <option value="">Update...</option>
                              <option value="verified">Verify</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolve</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Form Modal */}
      {showForm && (
        <IncidentReportForm
          onSubmit={async (payload) => {
            await createIncident(payload);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default IncidentReports;
