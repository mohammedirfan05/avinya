import { useEffect, useState } from 'react';
import { 
  Bell, 
  Search, 
  Wifi, 
  Clock, 
  AlertCircle,
} from 'lucide-react';

const Navbar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-20 glass border-b border-border sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Left: Search & Info */}
      <div className="flex items-center gap-8">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search city nodes..." 
            className="bg-white/5 border border-border rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 w-64 transition-all"
          />
        </div>
        
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-traffic-green animate-pulse shadow-[0_0_8px_#22C55E]" />
            <span className="text-xs font-medium text-slate-400">AI ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="text-primary w-4 h-4" />
            <span className="text-xs font-medium text-slate-400">1,248 SENSORS ONLINE</span>
          </div>
        </div>
      </div>

      {/* Center: System Status (Optional/Floating) */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden xl:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-border">
        <Clock className="text-primary w-4 h-4" />
        <span className="text-sm font-mono tracking-wider">
          {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
        <div className="w-px h-4 bg-border" />
        <span className="text-xs text-slate-400 uppercase tracking-widest">System Uptime: 99.98%</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-white/5 rounded-full transition-colors group">
          <Bell size={20} className="text-slate-400 group-hover:text-white" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical-red rounded-full shadow-[0_0_8px_#EF4444]" />
        </button>
        
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors group">
          <AlertCircle size={20} className="text-warning-yellow" />
        </button>

        <div className="w-px h-6 bg-border mx-2" />

        <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="text-right flex flex-col justify-center">
            <p className="text-xs font-bold text-white uppercase tracking-wider leading-none mb-1">ADMIN</p>
            <p className="text-[10px] text-slate-500 font-medium leading-none">Operations Command</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary/30 p-0.5 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
              alt="Avatar" 
              className="w-full h-full rounded-full bg-slate-800"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
