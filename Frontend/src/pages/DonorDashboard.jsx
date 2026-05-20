import React from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  TrendingUp, 
  Package, 
  Activity, 
  MapPin, 
  Clock, 
  ChevronRight,
  Heart,
  TrendingDown,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export function DonorDashboard() {
  const [userProfile, setUserProfile] = React.useState({ fullName: 'Metropolis Pharma Group' });
  const [statsData, setStatsData] = React.useState({
    totalDonations: 1280,
    ngosServed: 42,
    impactValue: 84500,
    pendingClaims: 18,
    livesImpacted: 14200,
    medicineSavedKg: '850kg'
  });
  const [latestDonation, setLatestDonation] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Load User profile
        const profile = JSON.parse(localStorage.getItem('findmeds_profile')) || {};
        setUserProfile(profile);

        // Load stats from backend api
        const fetchedStats = await api.getDonorStats();
        if (fetchedStats) {
          setStatsData(fetchedStats);
        }

        // Get listings to highlight the latest active item
        const listings = await api.getMyListings();
        if (listings && listings.length > 0) {
          setLatestDonation(listings[0]);
        }
      } catch (err) {
        console.warn('Could not load live analytics, using local state.', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const stats = [
    { label: 'Total Donations', value: statsData?.totalDonations || '1,280', change: '+12%', icon: Package, trend: 'up' },
    { label: 'NGOs Served', value: statsData?.ngosServed || '42', change: '+3', icon: Heart, trend: 'up' },
    { label: 'Impact Value', value: `$${statsData?.impactValue?.toLocaleString() || '84,500'}`, change: '-4%', icon: TrendingUp, trend: 'down' },
    { label: 'Pending Claims', value: statsData?.pendingClaims || '18', change: 'Live', icon: Activity, trend: 'none' },
  ];

  const recentActivity = [
    { type: 'claim', ngo: 'Hope Clinic', medicine: latestDonation ? latestDonation.medicine : 'Amoxicillin', time: 'Just now', status: 'verified' },
    { type: 'verification', ngo: 'Hub Center', medicine: 'Vitamin C', time: '1d ago', status: 'completed' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-brand-secondary rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
        <div className="relative z-10">
          <h1 className="text-3xl font-display font-bold mb-2">Welcome Back, {userProfile.fullName || 'Metropolis Pharma'}</h1>
          <p className="text-slate-400 font-medium max-w-lg mb-8">
            Your contributions help extend critical medical aid to {userProfile.pincode ? `citizens near ${userProfile.pincode}` : 'patients across underserved regional hubs'}.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/donate" 
              className="px-6 py-3 bg-brand-primary rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <PlusCircle className="w-5 h-5" />
              New Surplus Listing
            </Link>
            <Link 
              to="/donor/history" 
              className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-bold transition-all"
            >
              View Analytics
            </Link>
          </div>
        </div>
        {/* Background Graphic */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-primary/20 to-transparent flex items-center justify-center opacity-50">
           <Activity className="w-48 h-48 text-brand-primary rotate-12" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="clinical-card p-6 border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-primary">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                stat.trend === 'up' ? "bg-emerald-100 text-emerald-700" : 
                stat.trend === 'down' ? "bg-red-100 text-red-700" :
                "bg-blue-100 text-blue-700"
              )}>
                {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                 stat.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-brand-secondary">{stat.value}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Donations Preview */}
        <div className="lg:col-span-2 clinical-card p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-brand-secondary flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-primary" /> Active Item Status
            </h3>
            <Link to="/donor/tracking" className="text-xs font-bold text-brand-primary hover:underline">View All Active</Link>
          </div>
          <div className="p-8 space-y-8">
            {latestDonation ? (
              <div className="flex gap-6 relative">
                 <div className="relative z-10 w-6 h-6 rounded-full bg-brand-primary ring-4 ring-teal-50 flex items-center justify-center text-white shrink-0">
                    <Package className="w-3 h-3" />
                 </div>
                 <div className="flex-1 -mt-1">
                   <div className="flex justify-between items-start mb-2">
                     <div>
                       <h4 className="font-bold text-brand-secondary font-display text-lg">{latestDonation.medicine || latestDonation.name} ({latestDonation.qty || latestDonation.quantity} {latestDonation.quantityUnit || 'units'})</h4>
                       <p className="text-xs text-slate-400">ID: {latestDonation.id} • Batch: {latestDonation.batch || latestDonation.batchNumber}</p>
                     </div>
                     <span className={cn(
                       "text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
                       latestDonation.status === 'Claimed' ? "bg-amber-100 text-amber-800" : "bg-teal-100 text-teal-800"
                     )}>
                       {latestDonation.status || 'Active'}
                     </span>
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1"><MapPin className="w-3" /> Pincode: {latestDonation.pincode || '600001'}</span>
                      {latestDonation.ngo && <span className="flex items-center gap-1">Assigned NGO: <span className="font-bold text-slate-700">{latestDonation.ngo}</span></span>}
                   </div>
                 </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm">
                No active surplus listings. Create a new listing to start!
              </div>
            )}
          </div>
        </div>

        {/* Notifications / Activity */}
        <div className="clinical-card p-6">
          <h3 className="font-bold text-brand-secondary mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" /> Recent Activity
          </h3>
          <div className="space-y-6">
            {recentActivity.map((act, idx) => (
              <div key={idx} className="flex gap-4">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                  act.status === 'completed' ? "bg-emerald-500" :
                  act.status === 'verified' ? "bg-blue-500" : "bg-yellow-500"
                )} />
                <div className="flex-1">
                  <div className="text-sm font-bold text-brand-secondary">
                    {act.medicine} <span className="text-slate-400 font-medium">claimed by</span> {act.ngo}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-400">{act.time}</span>
                    <button className="text-[10px] font-bold text-brand-primary flex items-center gap-1">
                      DETAILS <ExternalLink className="w-2 h-2" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-50 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all uppercase tracking-wider">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
