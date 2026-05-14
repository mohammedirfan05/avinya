import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  FileSpreadsheet, 
  FileJson,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Reports = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-1">Data Exports</h2>
          <h1 className="text-4xl font-bold tracking-tight">Government Reporting</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-2 uppercase tracking-widest">
            <FileText size={18} />
            GENERATE NEW REPORT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Quick Actions */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl border-white/5 space-y-6">
            <h3 className="text-lg font-bold">Report Presets</h3>
            <div className="space-y-4">
              {[
                { label: 'Daily Traffic Summary', desc: 'Auto-generated every 24h', icon: Clock },
                { label: 'Weekly Violation Audit', desc: 'Detailed legal compliance', icon: AlertCircle },
                { label: 'Environmental Impact', desc: 'CO2 & Fuel metrics', icon: FileSpreadsheet },
              ].map((preset, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/5 text-primary">
                      <preset.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{preset.label}</p>
                      <p className="text-[10px] text-slate-500">{preset.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border-white/5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Export Formats</h3>
            <div className="grid grid-cols-3 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                <FileText size={24} className="text-primary" />
                <span className="text-[10px] font-bold">PDF</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                <FileSpreadsheet size={24} className="text-traffic-green" />
                <span className="text-[10px] font-bold">XLSX</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                <FileJson size={24} className="text-warning-yellow" />
                <span className="text-[10px] font-bold">JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Recent Reports List */}
        <div className="lg:col-span-2 glass rounded-3xl border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="text-slate-400" size={20} />
              Recent Generations
            </h3>
            <div className="flex gap-2">
              <button className="p-2 glass rounded-lg text-slate-400 hover:text-white"><Filter size={16} /></button>
              <button className="p-2 glass rounded-lg text-slate-400 hover:text-white"><Calendar size={16} /></button>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {[
              { name: 'monthly_mobility_audit_may_2026.pdf', date: 'May 14, 2026', size: '4.2 MB', status: 'Completed' },
              { name: 'daily_congestion_node_4a.xlsx', date: 'May 14, 2026', size: '1.8 MB', status: 'Completed' },
              { name: 'emergency_corridor_log_amb99.pdf', date: 'May 13, 2026', size: '840 KB', status: 'Completed' },
              { name: 'sustainability_q2_projection.json', date: 'May 12, 2026', size: '2.1 MB', status: 'Archived' },
              { name: 'incident_intelligence_weekly.pdf', date: 'May 10, 2026', size: '12.4 MB', status: 'Completed' },
              { name: 'sensor_health_diagnostics_global.xlsx', date: 'May 08, 2026', size: '3.5 MB', status: 'Completed' },
            ].map((report, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">{report.name}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      <span>{report.date}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-traffic-green" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{report.status}</span>
                  </div>
                  <button className="p-3 glass rounded-xl text-primary hover:bg-primary hover:text-white transition-all">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 text-center">
            <button className="text-xs font-bold text-slate-500 hover:text-white transition-all flex items-center gap-2 mx-auto">
              VIEW ARCHIVED REPORTS
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
