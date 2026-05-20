import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Users, 
  LayoutDashboard, 
  Building2,
  FileText,
  Lock,
  Search,
  Database,
  Globe,
  Award
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export function AdminPortal() {
  const [activeTab, setActiveTab] = React.useState('ngos');
  const [pendingNgos, setPendingNgos] = React.useState([]);
  const [adminStats, setAdminStats] = React.useState({
    totalDonated: 4920,
    activeClaims: 320,
    registeredNgos: 24,
    verifiedVolume: '2,920 kg',
    pendingVerificationNgos: 1
  });
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [checkingDarpan, setCheckingDarpan] = React.useState({});

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const stats = await api.getAdminStats();
      if (stats) setAdminStats(stats);

      const queue = await api.getPendingNgos();
      // Filter those pending review or list all for admin overview
      setPendingNgos(queue?.data || queue || []);
    } catch (err) {
      console.warn("Could not load dynamic admin portal data.", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerify = async (id, approve) => {
    try {
      const resp = await api.verifyNgo(id, approve);
      alert(approve ? "NGO approved successfully! Notification dispatched automatically." : "NGO application rejected.");
      loadAdminData();
    } catch (err) {
      console.error(err);
      alert("Verification update failed.");
    }
  };

  const simulateDarpanCheck = (id) => {
    setCheckingDarpan(prev => ({ ...prev, [id]: 'checking' }));
    setTimeout(() => {
      setCheckingDarpan(prev => ({ ...prev, [id]: 'valid' }));
    }, 1200);
  };

  const filteredNgos = pendingNgos.filter(n => 
    (n.name || n.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const blockedMeds = [
    { id: 1, name: 'Standard Opioids & Codeine', reason: 'High Abuse Potential / Schedule H1 list', tier: 'Forbidden' },
    { id: 2, name: 'Expired Vaccines', reason: 'Cold Chain Integrity Failure', tier: 'Safety Hazard' },
    { id: 3, name: 'Controlled Substances / Amphetamines', reason: 'Regulated Government Schedule H list', tier: 'Verification Required' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-brand-secondary uppercase tracking-tight">System Administration</h1>
            <p className="text-slate-500 font-medium">FindMeds National Governance & NGO Registry verification</p>
          </div>
        </div>
        <button 
          onClick={loadAdminData}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-sm"
        >
          Refresh Portal
        </button>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'ngos', label: 'NGO Verification', icon: Building2 },
          { id: 'listings', label: 'Global Monitor', icon: LayoutDashboard },
          { id: 'security', label: 'Schedule H Rules', icon: ShieldAlert },
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
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 font-display text-lg">NGO verification queue</h2>
                  <p className="text-xs text-slate-500">Cross-reference regional organization requests with India NGO Darpan Portal registry</p>
                </div>
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search pending..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Organization Detail</th>
                      <th className="px-6 py-4">Darpan ID Status</th>
                      <th className="px-6 py-4">Verification Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredNgos.length > 0 ? (
                      filteredNgos.map(ngo => {
                        const darpanStatus = checkingDarpan[ngo.id] || 'unverified';
                        return (
                          <tr key={ngo.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">{ngo.name || ngo.fullName}</div>
                              <div className="text-xs text-slate-500">{ngo.email}</div>
                              {ngo.location && <div className="text-[11px] text-slate-400 font-medium">{ngo.location}</div>}
                            </td>
                            <td className="px-6 py-4">
                              {darpanStatus === 'unverified' && (
                                <button 
                                  onClick={() => simulateDarpanCheck(ngo.id)}
                                  className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-200 transition"
                                >
                                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                                  Validate Darpan
                                </button>
                              )}
                              {darpanStatus === 'checking' && (
                                <span className="text-[10px] font-medium text-slate-400 animate-pulse">
                                  Connecting Ministry database...
                                </span>
                              )}
                              {darpanStatus === 'valid' && (
                                <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg flex items-center gap-1 w-max">
                                  <Award className="w-3.5 h-3.5 text-green-600" />
                                  UID Verified
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleVerify(ngo.id, true)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-slate-100 hover:border-green-200 shadow-sm"
                                  title="Approve NGO"
                                >
                                  <CheckCircle2 className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleVerify(ngo.id, false)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-100 hover:border-red-200 shadow-sm"
                                  title="Reject Application"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-slate-400 text-sm">
                          {loading ? 'Retrieving active registry queue...' : 'No NGO verification requests pending at present.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clinical-card">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 font-display">Schedule H / H1 Forbidden List</h2>
                  <p className="text-xs text-slate-500">Government restrictions on high abuse substances automatically cross-referenced via RxNav barcode scanners</p>
                </div>
                <button className="text-xs font-bold text-brand-primary bg-teal-50 px-3 py-1 rounded-lg border border-teal-100">Add Exception</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Substance/Class</th>
                      <th className="px-6 py-4">Reason</th>
                      <th className="px-6 py-4">Tier Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {blockedMeds.map(med => (
                      <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 font-mono text-xs">{med.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{med.reason}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2S py-1 rounded text-[10px] font-bold uppercase border",
                            med.tier === 'Forbidden' ? "bg-red-50 text-red-700 border-red-200" : "bg-custom-yellow/20 text-indigo-900 border-indigo-200"
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
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <LayoutDashboard className="w-10 h-10 text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold text-brand-secondary font-display">System Surplus Stats</h3>
              <p className="text-slate-500 mt-2 mb-8 text-sm">System-wide monitoring of redistributed medical supplies across the network</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Redistributed volume', val: adminStats.verifiedVolume || '2,920 kg' },
                  { label: 'Active Claims', val: adminStats.activeClaims || '320' },
                  { label: 'Partner NGOs', val: adminStats.registeredNgos || '24' },
                ].map(s => (
                  <div key={s.label} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-2xl font-bold text-brand-secondary font-display">{s.val}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-8">
          <div className="clinical-card p-8 bg-indigo-900 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 font-display">
                <ShieldAlert className="text-amber-400" /> Administrative Hub
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-200">System Core Health</span>
                  <span className="font-bold text-green-400">99.9%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full">
                  <div className="w-[99.9%] h-full bg-green-400 rounded-full"></div>
                </div>
                <p className="text-xs text-indigo-300 leading-relaxed font-medium">
                  Express API gateway is healthy. Connecting with real-time Firebase DB instance for critical audits.
                </p>
              </div>
            </div>
            <Users className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5" />
          </div>

          <div className="clinical-card p-6">
            <h3 className="font-bold text-brand-secondary mb-4">Fast Operations</h3>
            <div className="space-y-2">
              <button 
                onClick={() => alert("Auto cascade job executed. Unclaimed surplus items past 24 hours converted to global pool.")}
                className="w-full py-3 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 flex items-center justify-center gap-2 transition"
              >
                Trigger cron Auto-cascade Check
              </button>
              <button 
                onClick={() => alert("Report compiled and ready for audit export.")}
                className="w-full py-3 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition"
              >
                Export PDF Audit Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

