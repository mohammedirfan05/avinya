import { 
  TrendingUp, 
  Brain, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Activity,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

const radarData = [
  { subject: 'Accuracy', A: 98, fullMark: 100 },
  { subject: 'Latency', A: 92, fullMark: 100 },
  { subject: 'Throughput', A: 85, fullMark: 100 },
  { subject: 'Reliability', A: 95, fullMark: 100 },
  { subject: 'Efficiency', A: 88, fullMark: 100 },
];

const forecastData = [
  { time: '08:00', actual: 850, predicted: 820 },
  { time: '10:00', actual: 720, predicted: 740 },
  { time: '12:00', actual: 680, predicted: 670 },
  { time: '14:00', actual: 710, predicted: 730 },
  { time: '16:00', actual: 950, predicted: 920 },
  { time: '18:00', actual: 1100, predicted: 1080 },
  { time: '20:00', predicted: 850 },
  { time: '22:00', predicted: 600 },
];

const Analytics = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-sm font-bold text-purple-glow uppercase tracking-[0.2em] mb-1">Advanced Intelligence</h2>
          <h1 className="text-4xl font-bold tracking-tight">AI Insights & Forecasting</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 border border-border p-1 rounded-xl">
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-lg shadow-primary/20">PREDICTIVE</button>
            <button className="px-4 py-2 text-slate-500 hover:text-white rounded-lg text-xs font-bold transition-all">HISTORICAL</button>
          </div>
          <button className="p-3 glass rounded-xl hover:bg-white/10 transition-all text-slate-400 hover:text-white">
            <Calendar size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Forecast Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-3xl border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-3">
              <TrendingUp className="text-primary" size={24} />
              Traffic Volume Forecasting
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] text-slate-400 uppercase font-bold">Actual Flow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-glow" />
                <span className="text-[10px] text-slate-400 uppercase font-bold">AI Prediction</span>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '16px' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="predicted" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorPredicted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Performance Radar */}
        <div className="glass p-8 rounded-3xl border-white/5 flex flex-col items-center justify-center space-y-8">
          <div className="text-center">
            <h3 className="text-lg font-bold flex items-center justify-center gap-3">
              <Brain className="text-purple-glow" size={24} />
              AI System Performance
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Global Confidence Score: 96.2%</p>
          </div>

          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#1F2937" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis hide />
                <Radar
                  name="AI Capability"
                  dataKey="A"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Learning Rate</span>
              <span className="text-lg font-bold text-white">0.0042</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Neurons Active</span>
              <span className="text-lg font-bold text-white">4.2M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { 
            title: 'Congestion Forecasting', 
            desc: 'Predicted 12% spike at Silk Board between 17:30 - 18:45 due to local event.',
            trend: 'up',
            icon: Target
          },
          { 
            title: 'Risk Analysis', 
            desc: 'Hebbal Flyover has a 4.2% higher accident probability today due to low visibility.',
            trend: 'down',
            icon: AlertTriangle
          },
          { 
            title: 'Behavior Patterns', 
            desc: 'Commuter patterns shifting 15 mins earlier on Tuesdays. Adjusting signal cycles.',
            trend: 'stable',
            icon: Activity
          }
        ].map((insight, i) => (
          <div key={i} className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-white/5 text-primary group-hover:scale-110 transition-transform">
                <insight.icon size={20} />
              </div>
              {insight.trend === 'up' ? <ArrowUpRight className="text-critical-red" size={20} /> : <ArrowDownRight className="text-traffic-green" size={20} />}
            </div>
            <h4 className="text-sm font-bold mb-2">{insight.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">{insight.desc}</p>
            <button className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
              EXPLORE DATA
              <ChevronRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
