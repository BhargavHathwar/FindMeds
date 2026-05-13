// src/pages/DonorDashboard.jsx
import React from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  TrendingUp, 
  Package, 
  Activity, 
  MapPin, 
  Clock, 
  Heart,
  TrendingDown,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function DonorDashboard() {
  const stats = [
    { label: 'Total Donations', value: '1,280', change: '+12%', icon: Package, trend: 'up' },
    { label: 'NGOs Served', value: '42', change: '+3', icon: Heart, trend: 'up' },
    { label: 'Impact Value', value: '$84,500', change: '-4%', icon: TrendingUp, trend: 'down' },
    { label: 'Pending Claims', value: '18', change: 'Live', icon: Activity, trend: 'none' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-brand-secondary rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
        <div className="relative z-10">
          <h1 className="text-3xl font-display font-bold mb-2">Welcome Back, Metropolis Pharma</h1>
          <p className="text-slate-400 font-medium max-w-lg mb-8">
            Your contributions this month have reached 2,400 patients in the South District.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/donate" className="px-6 py-3 bg-brand-primary rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20">
              <PlusCircle className="w-5 h-5" /> New Surplus Listing
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={idx} className="clinical-card p-6 border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-primary">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                stat.trend === 'up' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
              )}>
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-brand-secondary">{stat.value}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>
      
      {/* Active Status Section */}
      <div className="clinical-card p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-brand-secondary flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-primary" /> Active Item Status
          </h3>
          <Link to="/donor/tracking" className="text-xs font-bold text-brand-primary hover:underline">View All Active</Link>
        </div>
        <div className="p-8">
           <div className="flex gap-6 items-center">
             <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-brand-primary">
               <Package className="w-5 h-5" />
             </div>
             <div>
               <h4 className="font-bold text-brand-secondary">Insulin Glargine (12 Boxes)</h4>
               <p className="text-xs text-slate-400">Assigned to Rural Health NGO • Claimed: Today, 10:30 AM</p>
             </div>
             <span className="ml-auto text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Claimed</span>
           </div>
        </div>
      </div>
    </div>
  );
}