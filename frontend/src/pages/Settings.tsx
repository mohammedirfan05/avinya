
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Cpu, 
  Globe, 
  Database,
} from 'lucide-react';
import { cn } from '../lib/utils';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">System Configuration</h2>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass p-3 rounded-xl border-white/5 h-fit">
          <nav className="space-y-1">
            {[
              { label: 'General', icon: SettingsIcon, active: true },
              { label: 'AI Parameters', icon: Cpu },
              { label: 'Security', icon: Shield },
              { label: 'Notifications', icon: Bell },
              { label: 'Network', icon: Globe },
              { label: 'Storage', icon: Database },
            ].map((item, i) => (
              <button
                key={i}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  item.active 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-xl border-white/5 space-y-6">
            <h3 className="text-xl font-medium border-b border-white/5 pb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Autonomous Mode</p>
                  <p className="text-xs text-slate-500">Allow AI to adjust signal timings</p>
                </div>
                <div className="w-11 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
