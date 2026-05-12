import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Users, 
  LayoutDashboard, 
  Building2,
  FileText,
  Lock
} from 'lucide-react';
import { cn } from '../lib/utils';

const verificationQueue = [
  { id: 1, name: 'Global Help NGO', email: 'v-ngo@globalhelp.org', location: 'Nairobi, Kenya', regDate: '2024-05-10', status: 'Pending' },
  { id: 2, name: 'Relief International', email: 'verify@relief.un', location: 'London, UK', regDate: '2024-05-09', status: 'Pending' },
];

const blockedMeds = [
  { id: 1, name: 'Standard Opioids', reason: 'High Abuse Potential', tier: 'Forbidden' },
  { id: 2, name: 'Expired Vaccines', reason: 'Integrity Failure', tier: 'Safety Hazard' },
  { id: 3, name: 'Controlled Substances', reason: 'Regulated by Government', tier: 'Verification Required' },
];

export function AdminPortal() {
  const [activeTab, setActiveTab] = React.useState('ngos');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-secondary uppercase tracking-tight">System Administration</h1>
          <p className="text-slate-500 font-medium">FindMeds Global Governance & Oversight</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'ngos', label: 'NGO Verification', icon: Building2 },
          { id: 'listings', label: 'Listings Moderation', icon: LayoutDashboard },
          { id: 'security', label: 'Blocked List', icon: ShieldAlert },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
              activeTab === tab.id ? "bg-brand-secondary text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            )}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'ngos' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clinical-card">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Verification Queue</h2>
                <div className="px-2 py-1 bg-amber-50 rounded text-amber-700 text-[10px] font-bold uppercase">2 Pending</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Organization</th>
                      <th className="px-6 py-4">Submitted</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {verificationQueue.map(ngo => (
                      <tr key={ngo.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{ngo.name}</div>
                          <div className="text-xs text-slate-500">{ngo.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{ngo.regDate}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                            <FileText className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clinical-card">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Restricted Medicine Database</h2>
                <button className="text-xs font-bold text-brand-primary bg-teal-50 px-3 py-1 rounded-lg">Add Exception</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Substance/Class</th>
                      <th className="px-6 py-4">Reason</th>
                      <th className="px-6 py-4">Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {blockedMeds.map(med => (
                      <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{med.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{med.reason}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            med.tier === 'Forbidden' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {med.tier}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'listings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clinical-card p-12 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <LayoutDashboard className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-brand-secondary">All Active Listings</h3>
              <p className="text-slate-500 mt-2 mb-8">System-wide monitoring of currently listed medicines.</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Live', val: '1,242' },
                  { label: 'Flagged', val: '12' },
                  { label: 'Reported', val: '04' },
                ].map(s => (
                  <div key={s.label} className="p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-bold text-brand-secondary">{s.val}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-8">
          <div className="clinical-card p-8 bg-indigo-900 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <ShieldAlert className="text-amber-400" /> Security Pulse
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-200">System Integrity</span>
                  <span className="font-bold text-green-400">99.9%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full">
                  <div className="w-[99.9%] h-full bg-green-400 rounded-full"></div>
                </div>
                <p className="text-xs text-indigo-300 leading-relaxed">
                  All encryption nodes are healthy. No unauthorized access attempts detected in past 24h.
                </p>
              </div>
            </div>
            <Users className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5" />
          </div>

          <div className="clinical-card p-6">
            <h3 className="font-bold text-brand-secondary mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-3 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 flex items-center justify-center gap-2">
                Bulk Purge Expired
              </button>
              <button className="w-full py-3 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100">Export System Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
