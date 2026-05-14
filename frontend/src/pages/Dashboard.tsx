import { motion } from 'framer-motion';
import { 
  Car, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Brain, 
  Map as MapIcon,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';

const data = [
  { name: '00:00', traffic: 400 },
  { name: '04:00', traffic: 300 },
  { name: '08:00', traffic: 900 },
  { name: '12:00', traffic: 700 },
  { name: '16:00', traffic: 1000 },
  { name: '20:00', traffic: 600 },
  { name: '23:59', traffic: 450 },
];

const stats = [
  { label: 'Active Vehicles', value: '12,842', change: '+12%', icon: Car, color: 'text-primary' },
  { label: 'Avg Wait Time', value: '42s', change: '-18%', icon: Clock, color: 'text-traffic-green' },
  { label: 'Congestion Index', value: '64%', change: '+5%', icon: TrendingUp, color: 'text-warning-yellow' },
  { label: 'Active Incidents', value: '08', change: '-2', icon: AlertCircle, color: 'text-critical-red' },
];

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-1">Command Overview</h2>
          <h1 className="text-4xl font-bold tracking-tight">System Status: <span className="text-traffic-green">Optimal</span></h1>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-border px-4 py-2 rounded-xl">
          <Brain className="text-purple-glow animate-pulse" size={20} />
          <span className="text-sm font-medium">AI Model: <span className="text-slate-400">CivicSense-v4.2-L</span></span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.change.startsWith('+') ? "bg-critical-red/10 text-critical-red" : "bg-traffic-green/10 text-traffic-green"
              )}>
                {stat.change.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Traffic Trend Chart */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} />
              City-Wide Traffic Load
            </h3>
            <select className="bg-white/5 border border-border rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/50">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ color: '#3B82F6' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="traffic" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTraffic)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="glass p-6 rounded-2xl border-white/5 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Brain className="text-purple-glow" size={20} />
            AI Recommendations
          </h3>
          <div className="space-y-4">
            {[
              { title: 'Silk Board Junction', desc: 'Increase green light duration on South lane by 15s to clear bottleneck.', priority: 'High' },
              { title: 'Hebbal Flyover', desc: 'Accident detected. Divert traffic to Service Road 3.', priority: 'Critical' },
              { title: 'KR Puram Node', desc: 'Sensor latency detected in Node 42. Schedule maintenance.', priority: 'Medium' }
            ].map((rec, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary tracking-widest uppercase">{rec.title}</span>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                    rec.priority === 'Critical' ? "bg-critical-red/20 text-critical-red" : 
                    rec.priority === 'High' ? "bg-warning-yellow/20 text-warning-yellow" : "bg-primary/20 text-primary"
                  )}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed group-hover:text-white transition-colors">{rec.desc}</p>
              </div>
            ))}
          </div>
          <button className="w-full py-3 rounded-xl border border-primary/30 text-primary text-sm font-bold hover:bg-primary/10 transition-all flex items-center justify-center gap-2">
            VIEW ALL INSIGHTS
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map Preview */}
        <div className="glass p-6 rounded-2xl border-white/5 min-h-[350px] relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <MapIcon className="text-traffic-green" size={20} />
              Live Hotspots
            </h3>
            <button className="text-xs font-bold text-primary hover:underline">EXPAND MAP</button>
          </div>
          <div className="absolute inset-x-6 bottom-6 top-20 rounded-xl overflow-hidden bg-slate-900 border border-white/10 group">
            <div className="absolute inset-0 bg-slate-800 bg-[url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center grayscale brightness-50 contrast-125 group-hover:scale-110 transition-transform duration-[5s]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
            
            {/* Pulsing Hotspots */}
            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-critical-red rounded-full animate-ping" />
            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-critical-red rounded-full" />
            
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-warning-yellow rounded-full animate-ping" />
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-warning-yellow rounded-full" />

            <div className="absolute bottom-4 left-4 p-3 glass rounded-lg border-white/10">
              <p className="text-xs font-bold text-white mb-1">BENGALURU CENTRAL</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-critical-red" />
                  <span className="text-[10px] text-slate-400">High Congestion</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-warning-yellow" />
                  <span className="text-[10px] text-slate-400">Medium</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="glass p-6 rounded-2xl border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="text-critical-red" size={20} />
              Recent Incidents
            </h3>
            <button className="text-xs font-bold text-slate-400 hover:text-white">VIEW HISTORY</button>
          </div>
          <div className="space-y-4">
            {[
              { id: '#4291', type: 'Accident', location: 'Silk Board Flyover', time: '12 mins ago', severity: 'Critical' },
              { id: '#4290', type: 'Signal Jump', location: 'Indiranagar 100ft Rd', time: '24 mins ago', severity: 'Medium' },
              { id: '#4289', type: 'Overspeeding', location: 'Airport Road', time: '45 mins ago', severity: 'Low' },
              { id: '#4288', type: 'Congestion', location: 'Hebbal Node', time: '1 hour ago', severity: 'High' }
            ].map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    incident.severity === 'Critical' ? "bg-critical-red/10 text-critical-red" :
                    incident.severity === 'High' ? "bg-warning-yellow/10 text-warning-yellow" : "bg-primary/10 text-primary"
                  )}>
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{incident.type}</p>
                    <p className="text-xs text-slate-500">{incident.location} • {incident.time}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-600">{incident.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
