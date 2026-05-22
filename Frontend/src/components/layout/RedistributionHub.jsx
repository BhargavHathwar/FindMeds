import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Pill, 
  Search, 
  Check, 
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Heart
} from 'lucide-react';

const mockMeds = [
  {
    id: 1,
    name: 'Amoxicillin Trihydrate',
    strength: '500mg',
    quantity: '2,400 caps',
    donor: 'MetroCare Pharmaceuticals',
    ngo: 'Global Health Outreach',
    status: 'Verified & Matched',
    daysToExpiry: 180,
    progress: 100,
    category: 'Antibiotics'
  },
  {
    id: 2,
    name: 'Metformin Hydrochloride',
    strength: '850mg',
    quantity: '4,500 tablets',
    donor: 'Apex Logistics Corp',
    ngo: 'Children Relief Fund',
    status: 'In Transit',
    daysToExpiry: 240,
    progress: 65,
    category: 'Diabetic Care'
  },
  {
    id: 3,
    name: 'Atorvastatin Calcium',
    strength: '20mg',
    quantity: '1,800 tablets',
    donor: 'St. Jude Medical Center',
    ngo: 'Vulnerable Care Trust',
    status: 'Safety Inspecting',
    daysToExpiry: 120,
    progress: 35,
    category: 'Cardiovascular'
  },
  {
    id: 4,
    name: 'Insulin Glargine',
    strength: '100 U/mL',
    quantity: '150 vials',
    donor: 'Eli-Bio Labs Surplus',
    ngo: 'Red Cross Karnataka',
    status: 'Cold-chain Approved',
    daysToExpiry: 95,
    progress: 90,
    category: 'Cold-Chain Insulin'
  }
];

export function RedistributionHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMed, setSelectedMed] = useState(mockMeds[0]);
  const [time, setTime] = useState(new Date());

  // Keep a ticking clock for a modern system feel
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredMeds = mockMeds.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Info Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Live Intelligent Matcher
          </div>
          <h3 className="font-display font-bold text-xl text-slate-900 leading-tight">
            Surplus Redistribution Center
          </h3>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl font-mono text-xs text-slate-500 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>UTC {time.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Grid: Left List, Right Active Match Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Search and Listings */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search surplus drugs (eg. Insulin, Amoxicillin)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredMeds.length > 0 ? (
              filteredMeds.map((med) => (
                <button
                  key={med.id}
                  onClick={() => setSelectedMed(med)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                    selectedMed.id === med.id 
                      ? 'bg-brand-primary/5 border-brand-primary/30 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      selectedMed.id === med.id ? 'bg-brand-primary text-white' : 'bg-slate-50 text-slate-400'
                    }`}>
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-brand-primary transition-colors">
                        {med.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {med.strength} • <span className="text-brand-primary">{med.category}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded">
                      {med.quantity}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {med.daysToExpiry}d expiry
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-100">
                <p className="text-sm text-slate-500">No matching surplus drugs found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Smart Matching Details Card */}
        <div className="col-span-1 lg:col-span-6 bg-slate-50/50 rounded-2xl border border-slate-100 p-5 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMed.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Target Medicine Info */}
              <div className="flex justify-between items-start border-b border-white pb-3">
                <div>
                  <h4 className="font-display font-bold text-lg text-slate-900">
                    {selectedMed.name}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Batch Allocation Details & Logistics
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {selectedMed.status}
                </span>
              </div>

              {/* Redistribution Match Path Visualizer */}
              <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex-1">
                    <span className="text-[10px] font-display uppercase tracking-widest text-slate-400 font-bold block mb-0.5">Surplus Donor</span>
                    <strong className="text-slate-800 font-bold text-xs truncate block">{selectedMed.donor}</strong>
                  </div>
                  <div className="flex items-center justify-center px-2">
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4 text-brand-primary" />
                    </motion.div>
                  </div>
                  <div className="flex-1 text-right">
                    <span className="text-[10px] font-display uppercase tracking-widest text-slate-400 font-bold block mb-0.5">Receiver NGO</span>
                    <strong className="text-slate-800 font-bold text-xs truncate block">{selectedMed.ngo}</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>Safety Verification Pipeline</span>
                    <span>{selectedMed.progress}% Completed</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-brand-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedMed.progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Safety Checklist indicators */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm font-medium text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Expiry {selectedMed.daysToExpiry} Days Safe</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm font-medium text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Batch Chem Verified</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm font-medium text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>FDA Registered Surplus</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm font-medium text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Logistics Managed</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Prompt banner */}
          <div className="mt-5 pt-4 border-t border-white/50 flex justify-between items-center gap-3">
            <span className="text-[11px] text-slate-500 font-medium leading-tight">
              Surplus medicine batches are cold-chain logged and safety check-gated instantly before delivery.
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
