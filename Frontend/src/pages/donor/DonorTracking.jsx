import React from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Building2, 
  ShieldCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

const activeDonations = [
  {
    id: 'DON-98421',
    medicine: 'Insulin Glargine',
    batch: 'BT-3392',
    qty: '12 Boxes',
    expiry: '2025-12',
    status: 'Claimed',
    ngo: {
      name: 'LifeCare NGO',
      location: 'South District, Mumbai',
      claimedAt: '2026-05-10',
    },
    timeline: [
      { status: 'Donated', time: 'May 08, 10:30 AM', completed: true },
      { status: 'Verified', time: 'May 08, 04:15 PM', completed: true },
      { status: 'Claimed by NGO', time: 'May 10, 09:00 AM', completed: true },
      { status: 'Received', time: 'Pending NGO Confirmation', completed: false }
    ]
  }
];

export function DonorTracking() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-secondary">Item Status Tracking</h1>
        <p className="text-slate-500">Monitor your healthcare contributions as they are processed and distributed.</p>
      </div>

      {activeDonations.map((donation) => (
        <div key={donation.id} className="clinical-card overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-brand-primary flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-brand-secondary">{donation.medicine}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="font-mono">{donation.id}</span>
                  <span>•</span>
                  <span>Batch: {donation.batch}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3 h-3" />
              {donation.status}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Timeline */}
            <div className="lg:col-span-2 p-8 border-r border-slate-100">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Donation Progress</h4>
              <div className="relative space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {donation.timeline.map((item, idx) => (
                  <div key={idx} className="relative pl-10">
                    <div className={cn(
                      "absolute left-0 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white z-10 transition-all",
                      item.completed ? "border-brand-primary text-brand-primary" : "border-slate-200 text-slate-300"
                    )}>
                      {item.completed ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <div>
                      <h5 className={cn("font-bold", item.completed ? "text-brand-secondary" : "text-slate-400")}>
                        {item.status}
                      </h5>
                      <span className="text-sm text-slate-400">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Details & NGO */}
            <div className="p-8 bg-slate-50/30 flex flex-col gap-8">
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quantity & Quality</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Net Quantity</span>
                    <span className="font-bold text-brand-secondary">{donation.qty}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Storage</span>
                    <span className="font-bold text-brand-secondary">Refrigerated</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg text-teal-700 text-xs font-bold ring-1 ring-teal-100">
                    <ShieldCheck className="w-4 h-4" />
                    Laboratory Verified
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">NGO Recipient</h4>
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className="w-5 h-5 text-brand-primary" />
                    <span className="font-bold text-brand-secondary">{donation.ngo.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {donation.ngo.location}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
