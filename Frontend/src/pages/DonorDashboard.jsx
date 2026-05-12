import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  History, 
  TrendingUp, 
  Award, 
  Package, 
  Clock, 
  Pill
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { month: 'Jan', value: 400 },
  { month: 'Feb', value: 300 },
  { month: 'Mar', value: 600 },
  { month: 'Apr', value: 800 },
  { month: 'May', value: 500 },
  { month: 'Jun', value: 900 },
];

const impactData = [
  { name: 'Mon', lives: 12 },
  { name: 'Tue', lives: 19 },
  { name: 'Wed', lives: 3 },
  { name: 'Thu', lives: 5 },
  { name: 'Fri', lives: 2 },
  { name: 'Sat', lives: 3 },
  { name: 'Sun', lives: 9 },
];

const recentDonations = [
  { id: 1, name: 'Amoxicillin 500mg', date: '2024-05-10', status: 'Delivered', value: '$120' },
  { id: 2, name: 'Metformin 850mg', date: '2024-05-08', status: 'In Transit', value: '$45' },
  { id: 3, name: 'Lisinopril 10mg', date: '2024-05-01', status: 'Verified', value: '$88' },
];

export function DonorDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-secondary">Welcome back, Sarah</h1>
          <p className="text-slate-500 font-medium">Your donations have saved approximately <span className="text-brand-primary font-bold">42 lives</span> this year.</p>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/donor-listings" 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
          >
            <History className="w-5 h-5" />
            Manage Listings
          </Link>
          <Link 
            to="/donate" 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Donation
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Value', value: '$3,420', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Medicines', value: '12 Items', icon: Package, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Impact Score', value: '850', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Active Goals', value: '2', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="clinical-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={stat.bg + " p-3 rounded-xl " + stat.color}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-2xl font-display font-bold text-brand-secondary">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Prominent CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 relative isolate overflow-hidden bg-brand-primary px-6 py-10 shadow-2xl rounded-3xl sm:px-12 flex flex-col md:flex-row items-center justify-between gap-6 group"
      >
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-2xl font-bold text-white mb-2 font-display">Have more medications to share?</h2>
          <p className="text-teal-50 font-medium opacity-90 max-w-lg">
            Every donation counts. Our streamlined process ensures your surplus reaches patients who need it most.
          </p>
        </div>
        <Link 
          to="/donate" 
          className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-brand-primary font-bold shadow-lg hover:bg-teal-50 transition-all group-hover:scale-105"
        >
          <Plus className="w-6 h-6" />
          Start a New Donation
        </Link>
        
        {/* Background Decoration */}
        <div className="absolute right-0 top-0 -z-10 opacity-10 translate-x-1/4 -translate-y-1/4 group-hover:translate-x-1/3 transition-transform duration-700">
          <Pill className="w-64 h-64 text-white" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 clinical-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-brand-secondary">Donation History</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-bold bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100">Monthly</button>
              <button className="px-3 py-1.5 text-xs font-bold bg-teal-50 text-brand-primary rounded-lg">Yearly</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="clinical-card p-8 bg-brand-secondary text-white">
          <h2 className="text-xl font-bold mb-6">Patient Impact</h2>
          <div className="h-[250px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impactData}>
                <Bar dataKey="lives" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ color: '#000' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Most Impacted NGO</span>
              <span className="text-xs font-bold">St. Jude Medical Relief</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Category Rank</span>
              <span className="text-xs font-bold text-teal-400">#4 Regionally</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 clinical-card">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-brand-secondary flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              Recent Activity
            </h2>
            <button className="text-brand-primary text-sm font-bold">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Medication</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDonations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{item.date}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{item.value}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset",
                        item.status === 'Delivered' ? "bg-green-50 text-green-700 ring-green-600/20" : 
                        item.status === 'In Transit' ? "bg-blue-50 text-blue-700 ring-blue-600/20" : 
                        "bg-amber-50 text-amber-700 ring-amber-600/20"
                      )}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="clinical-card p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-brand-primary" />
          </div>
          <h3 className="font-bold text-brand-secondary mb-2">Find Local NGOs</h3>
          <p className="text-sm text-slate-500 px-6 mb-6">
            Locate partner NGOs near your current location to deliver verified medications.
          </p>
          <button className="w-full py-3 border-2 border-brand-primary text-brand-primary font-bold rounded-xl hover:bg-brand-primary hover:text-white transition-all">
            Open Map Explorer
          </button>
        </div>
      </div>
    </div>
  );
}
