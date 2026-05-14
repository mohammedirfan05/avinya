import React from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Cpu, 
  Globe, 
  Database, 
  User, 
  Lock,
  Eye,
  ChevronRight
} from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-1">System Configuration</h2>
        <h1 className="text-4xl font-bold tracking-tight">Command Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation */}
        <div className="glass p-4 rounded-3xl border-white/5 h-fit">
          <nav className="space-y-1">
            {[
              { label: 'General', icon: SettingsIcon, active: true },
              { label: 'AI Parameters', icon: Cpu },
              { label: 'Security Protocols', icon: Shield },
              { label: 'Notification Logic', icon: Bell },
              { label: 'Network & API', icon: Globe },
              { label: 'Database & Storage', icon: Database },
            ].map((item, i) => (
              <button
                key={i}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all",
                  item.active 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-slate-500 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={20} />
                <span className="text-sm font-bold uppercase tracking-wider">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-3xl border-white/5 space-y-8">
            <h3 className="text-xl font-bold border-b border-white/5 pb-4">General Configuration</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="space-y-1">
                  <p className="text-sm font-bold">Autonomous AI Mode</p>
                  <p className="text-xs text-slate-500">Allow AI to adjust signal timings without manual approval.</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="space-y-1">
                  <p className="text-sm font-bold">Predictive Heatmaps</p>
                  <p className="text-xs text-slate-500">Enable real-time flow prediction overlays on main maps.</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 opacity-50">
                <div className="space-y-1">
                  <p className="text-sm font-bold">Legacy Backup Sync</p>
                  <p className="text-xs text-slate-500">Synchronize data with old non-AI traffic controllers.</p>
                </div>
                <div className="w-12 h-6 bg-slate-700 rounded-full relative p-1 cursor-not-allowed">
                  <div className="w-4 h-4 bg-slate-500 rounded-full absolute left-1" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform Visuals</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-2">
                     <p className="text-xs font-bold">Interface Brightness</p>
                     <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[80%] bg-primary" />
                     </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-2">
                     <p className="text-xs font-bold">Glow Intensity</p>
                     <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[45%] bg-purple-glow" />
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border-white/5">
            <h3 className="text-xl font-bold border-b border-white/5 pb-4 mb-8">Security Audit</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <Lock className="text-primary" size={20} />
                  <span className="text-sm font-bold">Update Access Credentials</span>
                </div>
                <ChevronRight size={18} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <Eye className="text-warning-yellow" size={20} />
                  <span className="text-sm font-bold">View System Logs</span>
                </div>
                <ChevronRight size={18} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
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

export default Settings;
