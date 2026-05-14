import React from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Droplets, 
  Wind, 
  Zap, 
  TrendingDown, 
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronRight,
  ArrowDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const data = [
  { day: 'Mon', co2: 120, fuel: 80, vehicles: 400 },
  { day: 'Tue', co2: 98, fuel: 75, vehicles: 350 },
  { day: 'Wed', co2: 86, fuel: 60, vehicles: 300 },
  { day: 'Thu', co2: 110, fuel: 85, vehicles: 380 },
  { day: 'Fri', co2: 130, fuel: 95, vehicles: 450 },
  { day: 'Sat', co2: 70, fuel: 50, vehicles: 200 },
  { day: 'Sun', co2: 60, fuel: 45, vehicles: 180 },
];

const pieData = [
  { name: 'Public Transport', value: 45, color: '#3B82F6' },
  { name: 'EVs', value: 25, color: '#22C55E' },
  { name: 'Fuel Vehicles', value: 30, color: '#FACC15' },
];

const Sustainability = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-traffic-green uppercase tracking-[0.2em] mb-1">Environmental Impact</h2>
          <h1 className="text-4xl font-bold tracking-tight">Sustainability Matrix</h1>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-border px-6 py-3 rounded-2xl">
          <Leaf className="text-traffic-green" size={24} />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Net Carbon Saved</span>
            <span className="text-xl font-bold text-white">1,242.8 <span className="text-xs font-normal text-slate-400">Tons</span></span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'CO₂ Emissions', value: '-12.4%', icon: Wind, color: 'text-traffic-green', desc: 'Avg reduction per month' },
          { label: 'Fuel Saved', value: '42,800L', icon: Droplets, color: 'text-primary', desc: 'Total fuel consumption saved' },
          { label: 'Idle Time Reduction', value: '38m', icon: Zap, color: 'text-warning-yellow', desc: 'Per vehicle/month avg' },
          { label: 'EV Adoption Rate', value: '+8.2%', icon: TrendingUp, color: 'text-purple-glow', desc: 'Growth in last quarter' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border-white/5 hover:border-traffic-green/30 transition-all group">
            <div className={`p-3 rounded-xl bg-white/5 ${stat.color} mb-4 w-fit group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold mb-2 tracking-tight">{stat.value}</h3>
            <p className="text-[10px] text-slate-600 font-medium">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main CO2 Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-3xl border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-3">
              <BarChart3 className="text-primary" size={24} />
              Emissions vs. Vehicle Flow
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] text-slate-400 uppercase font-bold">CO₂ (kg)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-traffic-green" />
                <span className="text-[10px] text-slate-400 uppercase font-bold">Flow Index</span>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '16px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="co2" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorCo2)" />
                <Area type="monotone" dataKey="fuel" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorFlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Mix Pie Chart */}
        <div className="glass p-8 rounded-3xl border-white/5 space-y-8 flex flex-col justify-center">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold flex items-center justify-center gap-3">
              <PieChartIcon className="text-purple-glow" size={24} />
              Vehicle Type Distribution
            </h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Real-time AI Classification</p>
          </div>

          <div className="h-[250px] w-full min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-3xl font-bold">70%</span>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Clean Energy</p>
            </div>
          </div>

          <div className="space-y-3">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-slate-400">{item.name}</span>
                </div>
                <span className="text-xs font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden group cursor-pointer">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <TrendingDown size={120} className="text-traffic-green" />
          </div>
          <h4 className="text-sm font-bold text-traffic-green uppercase tracking-[0.2em] mb-4">Optimization Win</h4>
          <h3 className="text-2xl font-bold mb-4">Signal Timing Reduction</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            AI-driven signal synchronization has reduced average vehicle idling by <span className="text-white font-bold">140 seconds</span> per junction, saving approximately <span className="text-white font-bold">1.2 tons of CO₂</span> today alone.
          </p>
          <button className="flex items-center gap-2 text-xs font-bold text-primary hover:underline">
            VIEW DETAILED REPORT
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden group cursor-pointer">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Zap size={120} className="text-warning-yellow" />
          </div>
          <h4 className="text-sm font-bold text-warning-yellow uppercase tracking-[0.2em] mb-4">Next Goal</h4>
          <h3 className="text-2xl font-bold mb-4">Zero-Idle Corridor</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            The Hebbal-Airport corridor is <span className="text-white font-bold">82%</span> of the way to becoming a zero-idle zone during non-peak hours.
          </p>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '82%' }}
               className="h-full bg-warning-yellow rounded-full"
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sustainability;
