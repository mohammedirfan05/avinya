import { useEffect, useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { Input } from './ui';
import useUIStore from '../store/useUIStore';

const Navbar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // update clock once per minute since display is HH:MM
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="h-16 glass border-b border-white/5 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          aria-label="Toggle navigation"
          aria-controls="sidebar"
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <Menu size={18} className="text-white" />
        </button>

        <div className="hidden md:block w-64">
          <Input
            aria-label="Search"
            placeholder="Search..."
            inputClassName="pl-3"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-mono text-neutral-400" aria-live="polite">
          {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
        </span>

        <button aria-label="Notifications" className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
          <Bell size={18} className="text-neutral-400 hover:text-white" />
        </button>

        <div className="w-px h-6 bg-white/5" />

        <div className="flex items-center gap-3 cursor-pointer" role="button" tabIndex={0} aria-label="Open profile">
          <div className="text-right">
            <p className="text-sm font-medium text-white">Admin</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-neutral-800 border border-white/10" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
