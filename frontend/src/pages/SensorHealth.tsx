import React from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Wifi, 
  WifiOff, 
  Battery, 
  Cpu, 
  HardDrive, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCcw,
  Search,
  ChevronRight
} from 'lucide-react';

const devices = [
  { id: 'CAM-01', name: '4K Traffic Camera', type: 'Vision', status: 'Healthy', uptime: '99.9%', latency: '12ms', battery: 'Main' },
  { id: 'SEN-42', name: 'Lidar Sensor', type: 'Density', status: 'Delayed', uptime: '94.2%', latency: '145ms', battery: '82%' },
  { id: 'SIG-08', name: 'Signal Controller', type: 'Control', status: 'Healthy', uptime: '100%', latency: '4ms', battery: 'Main' },
  { id: 'IOT-15', name: 'Air Quality Node', type: 'Environment', status: 'Offline', uptime: '0%', latency: '---', battery: '0%' },
  { id: 'CAM-02', name: '4K Traffic Camera', type: 'Vision', status: 'Healthy', uptime: '99.8%', latency: '18ms', battery: 'Main' },
  { id: 'SEN-43', name: 'Acoustic Sensor', type: 'Noise', status: 'Healthy', uptime: '98.5%', latency: '24ms', battery: 'Main' },
];

const SensorHealth = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-1">Infrastructure Ops</h2>
          <h1 className="text-4xl font-bold tracking-tight">Sensor Network Health</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 bg-white/5 border border-border px-6 py-3 rounded-2xl">
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Devices</span>
                <span className="text-xl font-bold">1,248</span>
             </div>
             <div className="w-px h-8 bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Online</span>
                <span className="text-xl font-bold text-traffic-green">1,242</span>
             </div>
             <div className="w-px h-8 bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Offline</span>
                <span className="text-xl font-bold text-critical-red">06</span>
             </div>
          </div>
          <button className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:rotate-180 transition-all duration-700">
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: System Diagnostics */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              Network Load
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Core Latency</span>
                <span className="text-traffic-green font-bold">8.2ms</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[15%] bg-traffic-green rounded-full" />
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Data Throughput</span>
                <span className="text-primary font-bold">4.2 GB/s</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[65%] bg-primary rounded-full" />
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <HardDrive size={16} className="text-purple-glow" />
              Storage Nodes
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-slate-500">Node Alpha</span>
                  <span className="text-white">82%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[82%] bg-purple-glow rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Device Table */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              {['All Nodes', 'Cameras', 'Sensors', 'Offline'].map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    "px-6 py-2 rounded-xl text-xs font-bold transition-all border",
                    tab === 'All Nodes' 
                      ? "bg-white/5 border-white/10 text-white" 
                      : "bg-transparent border-transparent text-slate-500 hover:text-white"
                  )}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Filter by ID..." 
                className="bg-white/5 border border-border rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 w-48 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {devices.map((device) => (
              <motion.div
                key={device.id}
                whileHover={{ y: -5 }}
                className="glass p-6 rounded-3xl border-white/5 space-y-6 group"
              >
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "p-3 rounded-2xl bg-white/5",
                    device.status === 'Healthy' ? 'text-traffic-green' : device.status === 'Delayed' ? 'text-warning-yellow' : 'text-critical-red'
                  )}>
                    {device.status === 'Healthy' ? <Wifi size={24} /> : device.status === 'Delayed' ? <RefreshCcw size={24} className="animate-spin-slow" /> : <WifiOff size={24} />}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{device.id}</span>
                    <p className="text-xs font-bold text-slate-300">{device.type}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{device.name}</h4>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      device.status === 'Healthy' ? 'bg-traffic-green' : device.status === 'Delayed' ? 'bg-warning-yellow' : 'bg-critical-red'
                    )} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{device.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Uptime</span>
                    <p className="text-sm font-bold">{device.uptime}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Latency</span>
                    <p className="text-sm font-bold">{device.latency}</p>
                  </div>
                </div>

                <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  RUN DIAGNOSTICS
                  <ChevronRight size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for class names
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default SensorHealth;
