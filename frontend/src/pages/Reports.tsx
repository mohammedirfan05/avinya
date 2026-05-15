import { FileText, Filter, Calendar } from 'lucide-react';

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">Data Exports</h2>
          <h1 className="text-3xl font-semibold tracking-tight">Reports</h1>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium text-xs hover:bg-primary/90 transition-all">
          <FileText size={16} />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="glass p-6 rounded-xl border-white/5 space-y-4">
            <h3 className="text-lg font-medium">Report Presets</h3>
            <div className="text-center py-4">
              <p className="text-slate-500 text-sm">No report presets</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass rounded-xl border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h3 className="text-base font-medium flex items-center gap-2">
              Recent Reports
            </h3>
            <div className="flex gap-2">
              <button className="p-2 glass rounded-lg text-slate-400 hover:text-white"><Filter size={14} /></button>
              <button className="p-2 glass rounded-lg text-slate-400 hover:text-white"><Calendar size={14} /></button>
            </div>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm text-slate-500">No reports generated</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
