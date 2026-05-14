import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Settings2, 
  Play, 
  Square, 
  RotateCcw, 
  Brain, 
  Zap,
  TrendingUp,
  BarChart2,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const lanes = [
  { id: 1, direction: 'Northbound', vehicles: 42, greenTime: 45, congestion: 'Low', status: 'Optimal' },
  { id: 2, direction: 'Southbound', vehicles: 89, greenTime: 65, congestion: 'High', status: 'Priority' },
  { id: 3, direction: 'Eastbound', vehicles: 31, greenTime: 30, congestion: 'Low', status: 'Optimal' },
  { id: 4, direction: 'Westbound', vehicles: 56, greenTime: 50, congestion: 'Medium', status: 'Adjusting' },
];

const SignalControl = () => {
  const [activeLane, setActiveLane] = useState(2);
  const [timer, setTimer] = useState(65);
  const [isAuto, setIsAuto] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 65));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeLane]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-1">Signal Systems</h2>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-4">
            AI Green Allocation
            <div className="px-3 py-1 bg-traffic-green/10 border border-traffic-green/30 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-traffic-green animate-pulse" />
              <span className="text-xs text-traffic-green font-bold uppercase tracking-widest">LIVE AI SYNC</span>
            </div>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 border border-border p-1 rounded-xl">
            <button 
              onClick={() => setIsAuto(true)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                isAuto ? "bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "text-slate-400 hover:text-white"
              )}
            >
              AI AUTO
            </button>
            <button 
              onClick={() => setIsAuto(false)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                !isAuto ? "bg-warning-yellow text-background" : "text-slate-400 hover:text-white"
              )}
            >
              MANUAL
            </button>
          </div>
          <button className="p-3 glass rounded-xl hover:bg-white/10 transition-all text-primary border-primary/20">
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Signal Display */}
        <div className="lg:col-span-2 space-y-8">
          {/* Signal Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lanes.map((lane) => (
              <motion.div
                key={lane.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveLane(lane.id)}
                className={cn(
                  "glass p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group",
                  activeLane === lane.id ? "border-primary/50 ring-1 ring-primary/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]" : "border-white/5"
                )}
              >
                {/* Background Glow */}
                {activeLane === lane.id && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16" />
                )}

                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{lane.direction}</h4>
                    <p className="text-2xl font-bold">{lane.vehicles} <span className="text-xs text-slate-500 font-medium uppercase">Vehicles</span></p>
                  </div>
                  <div className={cn(
                    "w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-lg",
                    activeLane === lane.id ? "border-traffic-green text-traffic-green shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "border-white/5 text-slate-600"
                  )}>
                    {activeLane === lane.id ? timer : lane.greenTime}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      lane.congestion === 'High' ? "bg-critical-red animate-pulse" : 
                      lane.congestion === 'Medium' ? "bg-warning-yellow" : "bg-traffic-green"
                    )} />
                    <span className="text-xs font-bold uppercase tracking-wider">{lane.congestion} Congestion</span>
                  </div>
                  <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-tighter">
                    {lane.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Recommendation Engine */}
          <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden group">
            <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
              <Brain size={180} className="text-primary" />
            </div>
            
            <h3 className="text-xl font-bold flex items-center gap-3 mb-6">
              <Zap className="text-warning-yellow" size={24} />
              AI Lane Prioritization
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed">
                  System has detected a <span className="text-white font-bold">24% increase</span> in southbound traffic over the last 15 minutes.
                </p>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Recommendation</p>
                  <p className="text-sm font-medium">Extend Southbound green time by <span className="text-traffic-green">15 seconds</span> for the next 3 cycles.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                  <span>Confidence Score</span>
                  <span className="text-white">98.4%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '98.4%' }}
                    className="h-full bg-gradient-to-r from-primary to-purple-glow rounded-full"
                  />
                </div>
                <button className="w-full py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all uppercase tracking-widest">
                  APPLY AI ADJUSTMENTS
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Stats & Control */}
        <div className="space-y-8">
          {/* Signal Control Panel */}
          <div className="glass p-6 rounded-3xl border-white/5 space-y-6">
            <h3 className="text-lg font-bold">Manual Override</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <Play className="text-traffic-green mb-2 group-hover:scale-110 transition-transform" size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest">FORCE GREEN</span>
              </button>
              <button className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <Square className="text-critical-red mb-2 group-hover:scale-110 transition-transform" size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest">FORCE RED</span>
              </button>
              <button className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group col-span-2">
                <RotateCcw className="text-primary mb-2 group-hover:rotate-180 transition-transform duration-500" size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest">RESET CYCLE</span>
              </button>
            </div>
          </div>

          {/* Predictive Traffic Graph */}
          <div className="glass p-6 rounded-3xl border-white/5 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} />
              Predictive Flow
            </h3>
            <div className="h-[200px] w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { time: '10:00', value: 40 },
                  { time: '10:15', value: 55 },
                  { time: '10:30', value: 85 },
                  { time: '10:45', value: 70 },
                  { time: '11:00', value: 60 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '8px' }}
                    itemStyle={{ color: '#3B82F6' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">Expected peak in <span className="text-white">22 minutes</span></p>
          </div>

          {/* Active Alerts */}
          <div className="bg-critical-red/10 border border-critical-red/20 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-critical-red" size={20} />
              <h3 className="text-sm font-bold text-critical-red uppercase tracking-widest">Critical Alert</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sensor failure in <span className="text-white font-bold">Node 4B</span>. AI is using historical data for timing.
            </p>
            <button className="w-full py-2 bg-critical-red text-white rounded-lg text-xs font-bold uppercase tracking-widest">
              DISPATCH MAINTENANCE
            </button>
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

export default SignalControl;
