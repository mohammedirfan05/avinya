import { Mail, Shield, LogOut, Edit2 } from 'lucide-react';

const Profile = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass p-6 rounded-xl border-white/5">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-xl bg-slate-800 border border-border" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Admin</h1>
                <p className="text-primary text-xs font-medium uppercase tracking-widest">System Operations</p>
              </div>
              <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium transition-all flex items-center gap-2">
                <Edit2 size={12} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="glass p-6 rounded-xl border-white/5 space-y-4">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="text-primary" size={16} />
                <span className="text-sm">admin@avinya.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="text-traffic-green" size={16} />
                <span className="text-sm font-medium">Admin Access</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass p-6 rounded-xl border-white/5">
            <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No recent activity</p>
            </div>
          </div>

          <button className="w-full py-3 bg-white/5 hover:bg-critical-red/10 border border-white/10 hover:border-critical-red/30 rounded-xl text-slate-400 hover:text-critical-red font-medium text-xs flex items-center justify-center gap-2 transition-all">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
