import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Ambulance, 
  Flame, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

const EmergencyCorridor = () => {
  const [isActive, setIsActive] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'ambulance' | 'fire' | 'police'>('ambulance');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-critical-red uppercase tracking-[0.2em] mb-1">Priority Systems</h2>
          <h1 className="text-4xl font-bold tracking-tight">Emergency Green Corridor</h1>
        </div>
        
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="px-6 py-2 bg-critical-red text-white rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse"
            >
              <ShieldAlert size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">ACTIVE CORRIDOR PROTOCOL</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Mode Selection & Status */}
        <div className="space-y-8">
          <div className="glass p-8 rounded-3xl border-white/5 space-y-8">
            <h3 className="text-lg font-bold">Protocol Selection</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'ambulance', label: 'Ambulance Mode', icon: Ambulance, color: 'text-primary' },
                { id: 'fire', label: 'Fire Response', icon: Flame, color: 'text-warning-yellow' },
                { id: 'police', label: 'Police Priority', icon: ShieldCheck, color: 'text-purple-glow' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id as any)}
                  disabled={isActive}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all relative overflow-hidden",
                    selectedMode === mode.id 
                      ? "bg-white/5 border-primary/50 text-white" 
                      : "border-transparent text-slate-500 hover:bg-white/5",
                    isActive && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn("p-3 rounded-xl bg-white/5", selectedMode === mode.id ? mode.color : "")}>
                    <mode.icon size={24} />
                  </div>
                  <span className="font-bold uppercase tracking-wider">{mode.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsActive(!isActive)}
              className={cn(
                "w-full py-6 rounded-2xl font-bold text-lg tracking-widest transition-all shadow-2xl",
                isActive 
                  ? "bg-white/5 border border-white/10 text-white hover:bg-white/10" 
                  : "bg-critical-red text-white hover:bg-critical-red/90 shadow-critical-red/20"
              )}
            >
              {isActive ? 'TERMINATE CORRIDOR' : 'INITIALIZE EMERGENCY'}
            </button>
          </div>

          <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Dispatch Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Vehicle ID</span>
                <span className="text-xs font-mono text-white">AMB-9921-BLR</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Origin</span>
                <span className="text-xs text-white">Silk Board Hub</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Destination</span>
                <span className="text-xs text-white">St. Johns Hospital</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Path & Progress */}
        <div className="lg:col-span-2 glass rounded-3xl border-white/5 relative overflow-hidden min-h-[600px]">
          {/* Mock Map Background */}
          <div className="absolute inset-0 bg-[#0B1220] opacity-50">
             <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] bg-[size:30px_30px]" />
          </div>

          {/* Animated Route Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <motion.path
              d="M 100 500 L 250 400 L 400 450 L 550 300 L 700 350 L 850 150"
              fill="none"
              stroke="#1F2937"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <AnimatePresence>
              {isActive && (
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  d="M 100 500 L 250 400 L 400 450 L 550 300 L 700 350 L 850 150"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                />
              )}
            </AnimatePresence>
          </svg>

          {/* Markers */}
          <div className="absolute top-[130px] left-[830px] flex flex-col items-center">
            <div className="p-2 bg-critical-red rounded-lg shadow-lg mb-2">
              <MapPin size={20} className="text-white" />
            </div>
            <span className="text-[10px] font-bold bg-background/80 px-2 py-1 rounded border border-white/10 uppercase">HOSPITAL</span>
          </div>

          <div className="absolute bottom-[80px] left-[80px] flex flex-col items-center">
            <motion.div 
              animate={isActive ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className="p-3 bg-primary rounded-full shadow-lg mb-2"
            >
              <Ambulance size={24} className="text-white" />
            </motion.div>
            <span className="text-[10px] font-bold bg-background/80 px-2 py-1 rounded border border-white/10 uppercase">VEHICLE</span>
          </div>

          {/* HUD Overlay */}
          <div className="absolute top-8 left-8 right-8 flex justify-between">
            <div className="glass p-4 rounded-2xl border-white/10 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Estimated ETA</span>
                <span className="text-2xl font-bold text-primary">04:12 <span className="text-xs font-normal">min</span></span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Signals Synced</span>
                <span className="text-2xl font-bold text-traffic-green">12/12</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { label: 'Signal Node 4A', status: 'GREEN', color: 'text-traffic-green' },
                { label: 'Signal Node 5C', status: 'SYNCING', color: 'text-warning-yellow' },
                { label: 'Signal Node 8B', status: 'LOCKED', color: 'text-slate-500' },
              ].map((node, i) => (
                <div key={i} className="glass px-4 py-2 rounded-xl border-white/10 flex items-center gap-4 min-w-[180px]">
                  <div className={cn("w-2 h-2 rounded-full", node.status === 'GREEN' ? 'bg-traffic-green' : node.status === 'SYNCING' ? 'bg-warning-yellow animate-pulse' : 'bg-slate-700')} />
                  <span className="text-[10px] font-bold text-slate-400 flex-1 uppercase tracking-wider">{node.label}</span>
                  <span className={cn("text-[10px] font-bold", node.color)}>{node.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom HUD */}
          <div className="absolute bottom-8 right-8">
            <div className="glass p-6 rounded-3xl border-white/10 space-y-4 max-w-xs">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Zap size={18} className="text-primary" />
                AI Route Optimization
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clearing North-bound traffic on <span className="text-white">Outer Ring Road</span> to maintain 60km/h average velocity for the emergency vehicle.
              </p>
              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                <CheckCircle2 size={14} className="text-traffic-green" />
                <span className="text-[10px] font-bold text-traffic-green uppercase tracking-widest">Route Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyCorridor;
