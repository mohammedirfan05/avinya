import React from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  MapPin, 
  Clock, 
  Award, 
  LogOut,
  ChevronRight,
  Edit2,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header / Banner */}
      <div className="relative h-48 rounded-3xl overflow-hidden glass border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-glow/20 to-primary/20 animate-pulse-slow" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
        
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div className="w-32 h-32 rounded-3xl border-4 border-background p-1 glass overflow-hidden shadow-2xl">
             <img 
               src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
               alt="Admin Avatar" 
               className="w-full h-full rounded-2xl bg-slate-800"
             />
          </div>
          <div className="pb-4">
             <h1 className="text-3xl font-bold tracking-tight">ADMIN Felix</h1>
             <p className="text-primary font-bold text-xs uppercase tracking-widest">Head of System Operations</p>
          </div>
        </div>

        <button className="absolute bottom-4 right-8 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
           <Edit2 size={14} />
           EDIT PROFILE
        </button>
      </div>

      <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Info */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Contact Identity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="text-primary" size={18} />
                <span className="text-sm">admin@civicsense.gov</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="text-traffic-green" size={18} />
                <span className="text-sm font-bold">Clearance Level 5</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-warning-yellow" size={18} />
                <span className="text-sm">Central Command, BLR</span>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Session Stats</h3>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-bold">142</span>
                <span className="text-[10px] text-slate-500 uppercase">Actions Today</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-xl font-bold">98%</span>
                <span className="text-[10px] text-slate-500 uppercase">Efficiency</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Activity & Badges */}
        <div className="md:col-span-2 space-y-8">
          <div className="glass p-8 rounded-3xl border-white/5 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-3">
              <Activity className="text-primary" size={20} />
              Recent Command History
            </h3>
            <div className="space-y-4">
              {[
                { action: 'Emergency Corridor Initiated', time: '2 hours ago', node: 'Silk Board Hub' },
                { action: 'AI Threshold Adjustment', time: '5 hours ago', node: 'Global Config' },
                { action: 'Manual Override: Signal Node 4B', time: 'Yesterday', node: 'Hebbal Node' },
                { action: 'Report Generation: Weekly Mobility', time: '2 days ago', node: 'System' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-bold">{item.action}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.node}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-600 font-bold">{item.time}</span>
                </div>
              ))}
            </div>
            <button className="w-full py-3 text-xs font-bold text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2">
              VIEW FULL COMMAND LOG
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 py-4 bg-white/5 hover:bg-critical-red/10 border border-white/10 hover:border-critical-red/30 rounded-2xl text-slate-400 hover:text-critical-red font-bold text-xs flex items-center justify-center gap-2 transition-all">
              <LogOut size={18} />
              TERMINATE COMMAND SESSION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
