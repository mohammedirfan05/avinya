import { RefreshCcw } from 'lucide-react';

const SensorHealth = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">Infrastructure Ops</h2>
          <h1 className="text-3xl font-semibold tracking-tight">Sensor Health</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 bg-white/5 border border-border px-4 py-2 rounded-lg">
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-medium mb-1">Total</span>
                <span className="text-lg font-semibold">0</span>
             </div>
             <div className="w-px h-6 bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-medium mb-1">Online</span>
                <span className="text-lg font-semibold text-traffic-green">0</span>
             </div>
             <div className="w-px h-6 bg-white/10" />
             <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-medium mb-1">Offline</span>
                <span className="text-lg font-semibold text-critical-red">0</span>
             </div>
          </div>
          <button className="p-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all">
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      <div className="glass p-6 rounded-xl border-white/5">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Sensor Network</h3>
          <p className="text-slate-500 text-sm">Monitor sensor health and status</p>
        </div>
      </div>
    </div>
  );
};

export default SensorHealth;
