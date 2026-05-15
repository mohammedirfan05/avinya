import React from 'react'
import { Car, Clock, AlertCircle, Map as MapIcon, Wifi, RefreshCcw, AlertTriangle, Navigation } from 'lucide-react'
import { KpiCard, Card } from '../components/ui'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTrafficFeed } from '../hooks/useTrafficFeed'
import { useIncidents } from '../hooks/useIncidents'
import { MapboxMap } from '../components/MapboxMap'
import { RouteNavigator } from '../components/RouteNavigator'
import { useNavigate } from 'react-router-dom'
import type { DirectionsResponse } from '../services/api'

const SEVERITY_DOT: Record<string, string> = {
  low: 'bg-emerald-400',
  medium: 'bg-amber-400',
  high: 'bg-orange-400',
  critical: 'bg-rose-400',
}

const INCIDENT_ICONS: Record<string, string> = {
  pothole: '🕳️',
  accident: '💥',
  congestion: '🚗',
  road_closure: '🚧',
  flooding: '🌊',
}

const Dashboard: React.FC = () => {
  const { stats, lastUpdateAt, refresh, isLoading, isConnected, error } = useTrafficFeed({ mode: 'live' })
  const { incidents } = useIncidents({ autoRefreshMs: 15000 })
  const navigate = useNavigate()
  const [routeResponse, setRouteResponse] = React.useState<DirectionsResponse | null>(null)

  const kpis = [
    { label: 'Active Vehicles', value: String(stats.total_count ?? 0), icon: <Car size={18} />, tone: 'neutral' as const },
    { label: 'Stream FPS', value: stats.fps?.toFixed(1) ?? '0.0', icon: <Clock size={18} />, tone: 'success' as const },
    { label: 'Connections', value: String(stats.active_connections ?? 0), icon: <Wifi size={18} />, tone: 'warning' as const },
    { label: 'Active Incidents', value: String(incidents.filter(i => i.status !== 'resolved').length), icon: <AlertTriangle size={18} />, tone: 'danger' as const },
  ] as const

  const vehicleMixData = Object.entries(stats.class_counts || {}).map(([name, value]) => ({ name, traffic: value }))

  // Show latest 5 incidents
  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-[0.2em] mb-1">Overview</h2>
          <h1 className="text-3xl font-semibold tracking-tight text-white">System Status</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-400">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white">
            <Wifi size={14} />
            {isConnected ? 'Websocket live' : 'Reconnecting'}
          </span>
          <button
            onClick={() => void refresh()}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCcw size={14} />
            {isLoading ? 'Syncing...' : 'Refresh'}
          </button>
          <span>{lastUpdateAt ? `Updated ${new Date(lastUpdateAt).toLocaleTimeString()}` : 'Awaiting data'}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          Live feed issue: {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((s) => (
          <KpiCard key={s.label} label={s.label} value={s.value} icon={s.icon} tone={s.tone} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div layout className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-medium text-white">Live Vehicle Mix</h3>
              <span className="text-xs text-neutral-400">{vehicleMixData.length ? `${vehicleMixData.length} classes tracked` : 'Waiting for detections'}</span>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleMixData}>
                  <defs>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="name" stroke="#737373" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#737373" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #262626', borderRadius: '8px' }} itemStyle={{ color: '#FFFFFF' }} />
                  <Bar dataKey="traffic" fill="#FFFFFF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div layout>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium flex items-center gap-2 text-white">
                <AlertCircle className="text-primary" size={18} />
                Recent Incidents
              </h3>
              <button
                onClick={() => navigate('/incident-reports')}
                className="text-[10px] text-neutral-500 hover:text-white transition-colors"
              >
                View all →
              </button>
            </div>
            <div className="space-y-2.5">
              {recentIncidents.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-6">No incidents reported</p>
              ) : (
                recentIncidents.map((inc) => (
                  <div key={inc.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <span className="text-base mt-0.5">{INCIDENT_ICONS[inc.incident_type] || '⚠️'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white capitalize">
                          {inc.incident_type.replace('_', ' ')}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[inc.severity]}`} />
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {inc.description || `${inc.latitude.toFixed(3)}, ${inc.longitude.toFixed(3)}`}
                      </p>
                    </div>
                    <span className="text-[10px] text-neutral-600 whitespace-nowrap">
                      {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Grid: Live Map + Route Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div layout>
          <Card className="min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium flex items-center gap-2 text-white">
                <MapIcon className="text-primary" size={18} /> Live Incident Map
              </h3>
            </div>
            <div className="h-[320px] rounded-lg overflow-hidden border border-white/5">
              <MapboxMap compact routeResponse={routeResponse} />
            </div>
          </Card>
        </motion.div>

        <motion.div layout>
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-medium flex items-center gap-2 text-white">
                <Navigation className="text-primary" size={18} />
                Smart Route Planner
              </h3>
            </div>
            <RouteNavigator onRouteCalculated={setRouteResponse} />
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
