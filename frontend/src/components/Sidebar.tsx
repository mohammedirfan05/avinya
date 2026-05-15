import React from 'react';
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
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import useUIStore from '../store/useUIStore';
import { useClickOutside } from '../hooks/useClickOutside';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Activity, label: 'Traffic Monitoring', path: '/traffic-monitoring' },
  { icon: Settings2, label: 'Signal Control', path: '/signal-control' },
  { icon: ShieldAlert, label: 'Emergency Corridor', path: '/emergency-corridor' },
  { icon: Leaf, label: 'Sustainability', path: '/sustainability' },
  { icon: AlertTriangle, label: 'Incident Reports', path: '/incident-reports' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Stethoscope, label: 'Sensor Health', path: '/sensor-health' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  const location = useLocation();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const setCollapsed = useUIStore((s) => s.setCollapsed);
  const ref = React.useRef<HTMLElement | null>(null);
  useClickOutside(ref as any, () => {
    if (window.innerWidth < 768) setCollapsed(true)
  })

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCollapsed(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setCollapsed])

  return (
    <aside ref={ref as any} id="sidebar" className={cn(
      'h-screen glass border-r border-white/5 sticky top-0 left-0 flex flex-col z-50 transition-all duration-200',
      collapsed ? 'w-20' : 'w-64'
    )} aria-label="Main navigation">
      <div className={cn('p-4 md:p-7 flex items-center gap-3 border-b border-white/5', collapsed ? 'justify-center' : '')}>
        <div className={cn('w-8 h-8 bg-primary rounded-lg flex items-center justify-center') }>
          <Activity className="text-white w-4 h-4" />
        </div>
        {!collapsed && <span className="font-semibold text-base text-white">Avinya</span>}
      </div>

      <nav className="flex-1 px-2 md:px-4 py-3 space-y-1 overflow-y-auto" role="navigation">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive 
                  ? 'bg-white/10 text-white border border-white/20' 
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              )}
              aria-current={isActive ? 'page' : undefined}
              title={item.label}
            >
              <item.icon size={18} aria-hidden />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 md:p-4 border-t border-white/5">
        <Link 
          to="/profile"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
            location.pathname === '/profile' 
              ? 'bg-white/10 text-white border border-white/20' 
              : 'text-neutral-400 hover:bg-white/5 hover:text-white'
          )}
        >
          <User size={18} aria-hidden />
          {!collapsed && <span className="font-medium text-sm">Profile</span>}
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
