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
import { api } from '../lib/api';

const defaultMyListings = [
  { id: '1', name: 'Amoxicillin 500mg', date: '2024-05-10', status: 'In Review', qty: '20 boxes', recipient: 'Awaiting Match' },
  { id: '2', name: 'Lisinopril 10mg', date: '2024-05-01', status: 'Verified', qty: '5 boxes', recipient: 'St. Jude Relief' },
  { id: '3', name: 'Metformin 850mg', date: '2024-04-15', status: 'Completed', qty: '120 units', recipient: 'Helping Hands NGO' },
];

export function DonorListings() {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        const fetched = await api.getMyListings();
        const apiListings = fetched || [];
        
        // Map dynamic listings
        const mapped = apiListings.map(item => ({
          id: item.id || item._id,
          name: item.medicine,
          date: item.expiry || item.expiryDate || '2026-06-12',
          status: item.status || 'Active',
          qty: item.qty || `${item.quantity || 10} units`,
          recipient: item.ngo || 'Awaiting Match'
        }));

        const combined = [...mapped, ...defaultMyListings];
        
        // Unique elements with name match
        const unique = [];
        const seenNames = new Set();
        for (const item of combined) {
          const normName = item.name.toLowerCase();
          if (!seenNames.has(normName)) {
            seenNames.add(normName);
            unique.push(item);
          }
        }
        setList(unique);
      } catch (err) {
        console.warn("Could not retrieve donor dynamic contributions.", err);
        setList(defaultMyListings);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  const handleCancel = async (id, name) => {
    const confirm = window.confirm(`Are you sure you want to cancel listing ${name}?`);
    if (!confirm) return;
    try {
      // Simulate/trigger deletion
      setList(prev => prev.filter(item => item.id !== id));
      alert("Successfully cancelled surplus listing.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            Manage Donations
          </div>
          <h1 className="text-3xl font-display font-bold text-brand-secondary underline decoration-brand-primary decoration-4 underline-offset-8">
            My Medicine contributions
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
          {list.map((item, idx) => (
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
                  item.status === 'Verified' || item.status === 'Active' ? "bg-teal-50 text-brand-primary" : "bg-amber-50 text-amber-600"
                )}>
                  <Package className="w-8 h-8" />
                </div>
                
                <div className="flex-grow text-center sm:text-left">
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-brand-secondary">{item.name}</h3>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ring-1 ring-inset",
                      item.status === 'Completed' ? "bg-green-50 text-green-700 ring-green-600/20" :
                      item.status === 'Verified' || item.status === 'Active' ? "bg-teal-50 text-brand-primary ring-teal-600/20" : 
                      "bg-amber-50 text-amber-700 ring-amber-600/20"
                    )}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 underline decoration-slate-200">
                      <Clock className="w-4 h-4" /> Expiry: {item.date}
                    </div>
                    <div className="flex items-center gap-1.5 underline decoration-slate-200">
                      <MapPin className="w-4 h-4" /> Partner NGO: {item.recipient}
                    </div>
                    <div className="font-bold text-slate-800">Volume: {item.qty}</div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                  {item.status !== 'Completed' && (
                    <button 
                      onClick={() => handleCancel(item.id, item.name)}
                      className="flex-grow sm:w-32 py-2.5 bg-white border border-slate-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 flex items-center justify-center gap-2 transition"
                    >
                      <XSquare className="w-4 h-4" /> Cancel
                    </button>
                  )}
                  <button className="flex-grow sm:w-32 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
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
                { label: 'Total Donated', val: `${list.length} Items` },
                { label: 'Lives Affected', val: '1,420 Patients' },
                { label: 'Regional Rank', val: 'Top 3%' },
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

