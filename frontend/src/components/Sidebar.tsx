import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  Settings2, 
  AlertTriangle, 
  BarChart3, 
  Leaf, 
  Stethoscope, 
  FileText, 
  Settings, 
  User, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Activity, label: 'Live Traffic', path: '/traffic-monitoring' },
  { icon: Settings2, label: 'AI Signal Control', path: '/signal-control' },
  { icon: ShieldAlert, label: 'Emergency Corridor', path: '/emergency-corridor' },
  { icon: Leaf, label: 'Sustainability', path: '/sustainability' },
  { icon: AlertTriangle, label: 'Incident Reports', path: '/incident-reports' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Stethoscope, label: 'Sensor Health', path: '/sensor-health' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="h-screen glass border-r border-border sticky top-0 left-0 flex flex-col z-50 transition-all duration-300"
    >
      <div className="p-6 flex items-center justify-between min-h-[100px]">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">
              <Activity className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight tracking-tight text-white">Civic Sense</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none"></span>
            </div>
          </motion.div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/20 text-primary border border-primary/30" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={22} className={cn(isActive ? "text-primary" : "group-hover:text-white")} />
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link 
          to="/profile"
          className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-400 hover:bg-white/5 hover:text-white",
            location.pathname === '/profile' && "bg-primary/20 text-primary border border-primary/30"
          )}
        >
          <User size={22} />
          {!isCollapsed && <span className="font-medium">Admin Profile</span>}
        </Link>
      </div>
    </motion.div>
  );
};

export default Sidebar;
