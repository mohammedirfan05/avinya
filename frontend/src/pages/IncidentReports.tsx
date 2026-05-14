import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Car, 
  ShieldAlert, 
  Filter, 
  Search, 
  Download, 
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
} from 'lucide-react';
import { cn } from '../lib/utils';

const incidents = [
  { id: 'INC-8821', type: 'Major Accident', location: 'Silk Board Flyover', time: '12 mins ago', severity: 'Critical', status: 'Responding', junction: 'Node 4A' },
  { id: 'INC-8820', type: 'Signal Jump', location: 'Indiranagar 100ft', time: '24 mins ago', severity: 'Medium', status: 'Logged', junction: 'Node 12C' },
  { id: 'INC-8819', type: 'Wrong Way', location: 'Airport Road', time: '45 mins ago', severity: 'High', status: 'Alert Sent', junction: 'Node 2B' },
  { id: 'INC-8818', type: 'Stalled Vehicle', location: 'Hebbal Node', time: '1 hour ago', severity: 'Low', status: 'Cleared', junction: 'Node 7D' },
  { id: 'INC-8817', type: 'Illegal Parking', location: 'MG Road', time: '1.5 hours ago', severity: 'Low', status: 'Logged', junction: 'Node 1A' },
  { id: 'INC-8816', type: 'Overspeeding', location: 'Electronic City', time: '2 hours ago', severity: 'Medium', status: 'Logged', junction: 'Node 9F' },
];

const IncidentReports = () => {
  const [filter, setFilter] = useState('All');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-sm font-bold text-critical-red uppercase tracking-[0.2em] mb-1">Violation Monitoring</h2>
          <h1 className="text-4xl font-bold tracking-tight">Incident Intelligence</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID or Location..." 
              className="bg-white/5 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 w-64 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-border rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
            <Filter size={16} />
            FILTERS
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
            <Download size={16} />
            EXPORT DATA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Summary Cards */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Alerts</h3>
            <div className="space-y-4">
              {[
                { label: 'Critical', count: 0, color: 'text-critical-red', bg: 'bg-critical-red/10' },
                { label: 'High', count: 4, color: 'text-warning-yellow', bg: 'bg-warning-yellow/10' },
                { label: 'Medium', count: 12, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Low', count: 28, color: 'text-slate-400', bg: 'bg-white/5' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", item.color.replace('text', 'bg'))} />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                  </div>
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded", item.bg, item.color)}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-white/5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">AI Vision Status</h3>
            <div className="space-y-6">
              {[
                { label: 'License Detection', value: 99.4 },
                { label: 'Vehicle Class', value: 98.2 },
                { label: 'Lane Tracking', value: 96.5 },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-primary">{item.value}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Incident Table */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-4">
            {['All', 'Critical', 'High', 'Resolved'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-bold transition-all border",
                  filter === tab 
                    ? "bg-primary/10 border-primary/50 text-primary" 
                    : "bg-transparent border-transparent text-slate-500 hover:text-white"
                )}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="glass rounded-3xl border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Incident Details</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location / Node</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Severity</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {incidents.map((inc) => (
                  <motion.tr 
                    key={inc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                    className="group transition-all"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          inc.severity === 'Critical' ? 'bg-critical-red/10 text-critical-red shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white/5 text-slate-400'
                        )}>
                          {inc.severity === 'Critical' ? <ShieldAlert size={20} /> : <Car size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{inc.type}</p>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{inc.id} • {inc.time}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-300">{inc.location}</span>
                        <span className="text-[10px] text-primary font-bold">{inc.junction}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest",
                        inc.severity === 'Critical' ? "bg-critical-red/20 text-critical-red" :
                        inc.severity === 'High' ? "bg-warning-yellow/20 text-warning-yellow" : "bg-primary/20 text-primary"
                      )}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {inc.status === 'Cleared' ? <CheckCircle2 size={14} className="text-traffic-green" /> : <Clock size={14} className="text-slate-500" />}
                        <span className="text-xs font-medium text-slate-400">{inc.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all">
                          <Camera size={16} />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all">
                          <MapPin size={16} />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/5">
              <span className="text-xs text-slate-500">Showing 6 of 142 total incidents detected today</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all">PREVIOUS</button>
                <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all">NEXT</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentReports;
