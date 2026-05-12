import React from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Edit3, 
  XSquare,
  History,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const myListings = [
  { id: 1, name: 'Amoxicillin 500mg', date: '2024-05-10', status: 'In Review', qty: 2, recipient: 'Awaiting Match' },
  { id: 2, name: 'Lisinopril 10mg', date: '2024-05-01', status: 'Verified', qty: 1, recipient: 'St. Jude Relief' },
  { id: 3, name: 'Metformin 850mg', date: '2024-04-15', status: 'Completed', qty: 3, recipient: 'Helping Hands NGO' },
];

export function DonorListings() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            Manage Donations
          </div>
          <h1 className="text-3xl font-display font-bold text-brand-secondary underline decoration-brand-primary decoration-4 underline-offset-8">
            My Medicine Contributions
          </h1>
        </div>
        <Link 
          to="/donate"
          className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center gap-2"
        >
          <Package className="w-5 h-5" />
          List New Item
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {myListings.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="clinical-card group hover:shadow-xl transition-all"
            >
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-12",
                  item.status === 'Completed' ? "bg-green-50 text-green-600" :
                  item.status === 'Verified' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                )}>
                  <Package className="w-8 h-8" />
                </div>
                
                <div className="flex-grow text-center sm:text-left">
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-brand-secondary">{item.name}</h3>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ring-1 ring-inset",
                      item.status === 'Completed' ? "bg-green-50 text-green-700 ring-green-600/20" :
                      item.status === 'Verified' ? "bg-blue-50 text-blue-700 ring-blue-600/20" : 
                      "bg-amber-50 text-amber-700 ring-amber-600/20"
                    )}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 underline decoration-slate-200">
                      <Clock className="w-4 h-4" /> Listed: {item.date}
                    </div>
                    <div className="flex items-center gap-1.5 underline decoration-slate-200">
                      <MapPin className="w-4 h-4" /> NGO: {item.recipient}
                    </div>
                    <div className="font-bold text-brand-secondary">Qty: {item.qty} Packs</div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                  {item.status === 'In Review' && (
                    <button className="flex-1 sm:w-32 py-2.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 flex items-center justify-center gap-2">
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                  )}
                  {item.status !== 'Completed' && (
                    <button className="flex-1 sm:w-32 py-2.5 bg-white border border-slate-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 flex items-center justify-center gap-2">
                      <XSquare className="w-4 h-4" /> Cancel
                    </button>
                  )}
                  <button className="flex-1 sm:w-32 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
                    Details <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <aside className="space-y-8">
          <div className="clinical-card p-6 bg-slate-900 text-white">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <History className="text-teal-400" /> Stats Overview
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Total Donated', val: '12 Items' },
                { label: 'Lives Affected', val: '42 Patients' },
                { label: 'Regional Rank', val: 'Top 5%' },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{s.label}</div>
                  <div className="text-2xl font-bold text-teal-400">{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="clinical-card p-6 border-l-4 border-amber-500">
            <div className="flex items-center gap-2 text-amber-600 font-bold mb-2">
              <AlertCircle className="w-5 h-5" /> Safety Update
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              New guidelines for injectable insulin storage have been released. Please ensure all future donations follow the cold-chain logic.
            </p>
            <button className="mt-4 text-xs font-bold text-brand-primary hover:underline">View Guidelines</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
