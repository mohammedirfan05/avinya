import { Calendar, Activity, RefreshCcw, Wifi, Gauge, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, KpiCard } from '../components/ui';
import { useTrafficFeed } from '../hooks/useTrafficFeed';

const Analytics = () => {
  const { stats, lastUpdateAt, refresh, isLoading, error } = useTrafficFeed({ mode: 'snapshot' });

  const classData = Object.entries(stats.class_counts || {}).map(([name, value]) => ({ name, traffic: value }));
  const directionData = ['left', 'right', 'up', 'down'].map((name) => ({ name, value: stats.direction_counts?.[name] || 0 }));

  const metricCards = [
    { label: 'Tracked Vehicles', value: String(stats.total_count ?? 0), icon: <Activity size={18} />, tone: 'neutral' as const },
    { label: 'Stream FPS', value: stats.fps?.toFixed(1) ?? '0.0', icon: <Gauge size={18} />, tone: 'success' as const },
    { label: 'Active Links', value: String(stats.active_connections ?? 0), icon: <Wifi size={18} />, tone: 'warning' as const },
    { label: 'Source', value: stats.source ?? 'webcam', icon: <ArrowRightLeft size={18} />, tone: 'danger' as const },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">Advanced Intelligence</h2>
          <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200">
            <Wifi size={14} />
            {stats.running ? 'Live stream' : 'Snapshot view'}
          </span>
          <button
            onClick={() => void refresh()}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200 hover:bg-white/10 transition-colors"
          >
            <RefreshCcw size={14} />
            {isLoading ? 'Syncing...' : 'Refresh'}
          </button>
          <span>{lastUpdateAt ? `Updated ${new Date(lastUpdateAt).toLocaleTimeString()}` : 'Awaiting data'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {metricCards.map((card) => (
          <KpiCard key={card.label} label={card.label} value={card.value} icon={card.icon} tone={card.tone} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div layout className="xl:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-medium text-slate-100">Vehicle Composition</h3>
              <span className="text-xs text-slate-400">{classData.length ? `${classData.length} classes` : 'No detections yet'}</span>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} itemStyle={{ color: '#3B82F6' }} />
                  <Bar dataKey="traffic" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div layout>
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-medium flex items-center gap-2 text-slate-100">
                <ArrowRightLeft className="text-primary" size={18} />
                Direction Flow
              </h3>
            </div>
            <div className="space-y-3">
              {directionData.map((entry) => (
                <div key={entry.name} className="bg-white/5 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="text-slate-300 capitalize">{entry.name}</span>
                    <span className="tabular-nums font-medium">{entry.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent-glow"
                      style={{ width: `${Math.min(entry.value * 12, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div layout>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-medium text-slate-100">Live System Notes</h3>
              <Calendar className="text-slate-400" size={18} />
            </div>
            <div className="space-y-4 text-sm text-slate-400">
              <p>{stats.running ? 'The backend is streaming live updates with websocket push, so this view stays synchronized without heavy polling.' : 'The analyzer is idle. Start Traffic Monitoring to populate live metrics and charts.'}</p>
              <p>{error ? `Last refresh issue: ${error}` : 'Metric refresh is healthy.'}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div layout>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-medium text-slate-100">Connection Snapshot</h3>
              <span className="text-xs text-slate-400">backend sync</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-slate-500 mb-1">State</div>
                <div className="font-medium text-slate-100">{stats.running ? 'Live' : 'Idle'}</div>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-slate-500 mb-1">FPS</div>
                <div className="font-medium text-slate-100 tabular-nums">{stats.fps?.toFixed(1) ?? '0.0'}</div>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-slate-500 mb-1">Frames</div>
                <div className="font-medium text-slate-100 tabular-nums">{stats.processed_frames ?? 0}</div>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-slate-500 mb-1">Connections</div>
                <div className="font-medium text-slate-100 tabular-nums">{stats.active_connections ?? 0}</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
