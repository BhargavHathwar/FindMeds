import React from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Lock, 
  Bell, 
  TrendingUp, 
  Award,
  Heart,
  Save,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function DonorProfile() {
  const [profile, setProfile] = React.useState({
    name: 'Metropolis Hospital Group',
    email: 'donor@example.com',
    location: 'Central Avenue, NY 10001',
    bio: 'Pioneering healthcare excellence through surplus management.',
  });
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('findmeds_profile'));
      if (stored) {
        setProfile({
          name: stored.fullName || 'Metropolis Hospital Group',
          email: stored.email || 'donor@example.com',
          location: stored.location || (stored.pincode ? `Pincode: ${stored.pincode}` : 'Central Avenue, NY 10001'),
          bio: stored.bio || 'Pioneering healthcare excellence through surplus management.',
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSaveChanges = (e) => {
    e.preventDefault();
    try {
      const stored = JSON.parse(localStorage.getItem('findmeds_profile')) || {};
      const updated = {
        ...stored,
        fullName: profile.name,
        location: profile.location,
        bio: profile.bio
      };
      localStorage.setItem('findmeds_profile', JSON.stringify(updated));
      
      // Also update matching fallback database entry so it is persisted for future logins!
      const fallbackDb = JSON.parse(localStorage.getItem('fm_users_db')) || [];
      const userIndex = fallbackDb.findIndex(u => u.email.toLowerCase() === profile.email.toLowerCase());
      if (userIndex !== -1) {
        fallbackDb[userIndex] = {
          ...fallbackDb[userIndex],
          fullName: profile.name,
          pincode: profile.location.replace(/pincode:\s*/i, '').trim() || fallbackDb[userIndex].pincode
        };
        localStorage.setItem('fm_users_db', JSON.stringify(fallbackDb));
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const stats = [
    { label: 'Lives Impacted', value: '14,200', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Medicine Saved', value: '850kg', icon: TrendingUp, color: 'text-brand-primary', bg: 'bg-teal-50' },
    { label: 'NGO Partners', value: '24', icon: Award, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-secondary">Profile Settings</h1>
          <p className="text-slate-500">Manage your identity and impact on the FindMeds network.</p>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="clinical-card p-6 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              <div className="text-xl font-bold text-brand-secondary">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="clinical-card p-8">
            <h3 className="text-lg font-bold text-brand-secondary mb-6 flex items-center gap-2">
              <User className="text-brand-primary" /> Personal Information
            </h3>
            <form onSubmit={handleSaveChanges} className="space-y-6">
              {saveSuccess && (
                <div id="save-success-banner" className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Your profile changes have been saved successfully and synced with the active database!
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Location / HQ Office</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all cursor-pointer"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </form>
          </div>

          <div className="clinical-card p-8 border-red-100 bg-red-50/10">
            <h3 className="text-lg font-bold text-red-600 mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5" /> Security & Password
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
              </div>
              <button
                type="button"
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar / Options */}
        <div className="space-y-6">
          <div className="clinical-card p-6">
            <h4 className="font-bold text-brand-secondary mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
              <Bell className="w-4 h-4" /> Notifications
            </h4>
            <div className="space-y-4">
              {[
                { label: 'NGO Claim Alerts', desc: 'When your medicine is claimed', enabled: true },
                { label: 'Expiry Reminders', desc: 'Alerts for upcoming expiries', enabled: true },
                { label: 'Impact Reports', desc: 'Monthly contribution reports', enabled: false },
              ].map((notif, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-brand-secondary">{notif.label}</div>
                    <div className="text-xs text-slate-500">{notif.desc}</div>
                  </div>
                  <div className={cn(
                    "w-10 h-5 rounded-full relative transition-colors cursor-pointer",
                    notif.enabled ? "bg-brand-primary" : "bg-slate-200"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                      notif.enabled ? "right-1" : "left-1"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Verified Platinum
            </h4>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Your donations have reached Tier 5 reliability. NGOs prioritize your listings automatically.
            </p>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div className="w-[85%] h-full bg-brand-primary" />
            </div>
            <div className="text-[10px] font-bold text-slate-500 flex justify-between">
              <span>TIER 5</span>
              <span className="text-brand-primary">TIER 6 (150 More Units)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
