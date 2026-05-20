import React from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  ExternalLink,
  Calendar,
  Pill,
  CheckCircle2,
  XCircle,
  Clock,
  Building2
} from 'lucide-react';
import { cn } from '../../lib/utils';

const historyData = [
  { id: 'DON-98421', date: '2026-05-12', medicine: 'Insulin Glargine', qty: '12 Boxes', ngo: 'LifeCare NGO', status: 'Claimed' },
  { id: 'DON-98405', date: '2026-04-28', medicine: 'Amoxicillin 500mg', qty: '20 Packs', ngo: 'Hope Clinic', status: 'Donated' },
  { id: 'DON-98399', date: '2026-04-15', medicine: 'Paracetamol', qty: '100 Units', ngo: 'Rural Health', status: 'Donated' },
  { id: 'DON-98380', date: '2026-03-30', medicine: 'Vitamim C', qty: '15 Boxes', ngo: 'St. Jude Center', status: 'Rejected' },
  { id: 'DON-98372', date: '2026-03-12', medicine: 'Metformin', qty: '50 Packs', ngo: 'City NGO', status: 'Donated' },
];

export function DonorHistory() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('All');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Donated': return 'bg-emerald-100 text-emerald-700';
      case 'Claimed': return 'bg-blue-100 text-blue-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Donated': return CheckCircle2;
      case 'Claimed': return Building2;
      case 'Rejected': return XCircle;
      default: return Clock;
    }
  };

  const filteredHistory = historyData.filter(item => {
    const matchesSearch = item.medicine.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.ngo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-secondary">Donation History</h1>
          <p className="text-slate-500">Track and manage your past medicine contributions.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-brand-secondary hover:bg-slate-50 transition-all shadow-sm">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by medicine or NGO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400 mr-2" />
          <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            {['All', 'Donated', 'Claimed', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  filterStatus === status 
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20" 
                    : "text-slate-500 hover:text-brand-secondary"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">ID / Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Medicine & Qty</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Recipient NGO</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((item) => {
                const StatusIcon = getStatusIcon(item.status);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-bold text-brand-secondary">{item.id}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-brand-primary flex items-center justify-center">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-brand-secondary">{item.medicine}</div>
                          <div className="text-xs text-slate-500">{item.qty}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-600">{item.ngo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                        getStatusColor(item.status)
                      )}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {item.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-brand-primary transition-colors opacity-0 group-hover:opacity-100">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredHistory.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-brand-secondary">No results found</h3>
            <p className="text-sm text-slate-500">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
