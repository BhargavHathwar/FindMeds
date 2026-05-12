import React from 'react';
import { motion } from 'motion/react';
import { 
  PackageSearch, 
  ArrowDownLeft, 
  AlertTriangle, 
  Users, 
  Map as MapIcon,
  Search,
  Filter,
  MoreVertical,
  Activity
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cn } from '../lib/utils';

// Fix for leaflet icons in React - using Unpkg URLs to avoid Vite import issues
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;


const inventoryItems = [
  { id: 1, name: 'Insulin Glargine', batch: 'IG-2024-001', expiry: '2024-12-15', qty: 45, status: 'Healthy' },
  { id: 2, name: 'Metformin HCl', batch: 'MT-2024-088', expiry: '2024-06-30', qty: 120, status: 'Expiring Soon' },
  { id: 3, name: 'Lisinopril', batch: 'LS-2023-452', expiry: '2024-08-20', qty: 85, status: 'Healthy' },
  { id: 4, name: 'Atorvastatin', batch: 'AT-2024-012', expiry: '2024-06-12', qty: 8, status: 'Critical Level' },
];

const donors = [
  { id: 1, lat: 41.8781, lng: -87.6298, name: 'Downtown Wellness Center', donation: 'Diabetes Meds' },
  { id: 2, lat: 41.8819, lng: -87.6231, name: 'Central Hospital Surplus', donation: 'Hypertension Kits' },
  { id: 3, lat: 41.8850, lng: -87.6350, name: 'Private Donor #122', donation: 'Cardiac Meds' },
];

export function NGODashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-secondary">Helping Hands NGO</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
              Verified NGO
            </span>
            <span className="text-slate-400 text-sm font-medium">Regional Relief Hub</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all">
            <PackageSearch className="w-5 h-5" />
            Stock Inventory
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all">
            <ArrowDownLeft className="w-5 h-5" />
            Request Supply
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Available Stock', value: '452 Units', icon: PackageSearch, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Pending Requests', value: '12', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Donors', value: '88', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Supply Alerts', value: '03', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="clinical-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={stat.bg + " p-3 rounded-xl " + stat.color}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-2xl font-display font-bold text-brand-secondary">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 clinical-card flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-bold text-brand-secondary text-lg">Medicine Inventory</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter inventory..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-primary w-full sm:w-48"
                />
              </div>
              <button className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Medication Name</th>
                  <th className="px-6 py-4">Batch ID</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Security Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.batch}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{item.expiry}</td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{item.qty} units</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold",
                        item.status === 'Healthy' ? "bg-green-50 text-green-700" :
                        item.status === 'Expiring Soon' ? "bg-amber-50 text-amber-700" :
                        "bg-red-50 text-red-700"
                      )}>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          item.status === 'Healthy' ? "bg-green-500" :
                          item.status === 'Expiring Soon' ? "bg-amber-500" :
                          "bg-red-500"
                        )}></div>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 mt-auto">
            <button className="w-full py-2 bg-slate-50 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-100">
              View Detailed Audit Log
            </button>
          </div>
        </div>

        <div className="clinical-card flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-brand-secondary flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-slate-400" />
              Incoming Donors
            </h2>
            <span className="text-xs font-bold text-brand-primary bg-teal-50 px-2 py-0.5 rounded-full">3 Live</span>
          </div>
          <div className="h-[400px] w-full bg-slate-100">
            <MapContainer center={[41.8781, -87.6298]} zoom={12} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {donors.map(donor => (
                <Marker key={donor.id} position={[donor.lat, donor.lng]}>
                  <Popup>
                    <div className="p-1">
                      <h4 className="font-bold text-brand-secondary">{donor.name}</h4>
                      <p className="text-xs text-brand-primary font-medium">{donor.donation}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="p-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Awaiting Verification</h4>
            <div className="space-y-3">
              {[
                { name: 'Dr. Michael Chen', items: '3 Insulin vials', time: '10m ago' },
                { name: 'PharmaCorp Inc.', items: 'Bulk Antibiotics', time: '2h ago' },
              ].map((awaiting, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{awaiting.name}</div>
                    <div className="text-xs text-slate-500">{awaiting.items}</div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">{awaiting.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
