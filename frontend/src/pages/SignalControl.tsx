
import { Settings2 } from 'lucide-react';

const SignalControl = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">Signal Systems</h2>
          <h1 className="text-3xl font-semibold tracking-tight">Signal Control</h1>
        </div>
        
        <button className="p-2.5 glass rounded-lg hover:bg-white/10 transition-colors">
          <Settings2 size={18} />
        </button>
      </div>

      <div className="glass p-6 rounded-xl border-white/5">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Signal Control Panel</h3>
          <p className="text-slate-500 text-sm">Configure signal timings and settings</p>
        </div>
      </div>
    </div>
  );
};

export default SignalControl;
