import React from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Map as MapIcon, 
  List, 
  Filter, 
  Navigation, 
  Pill, 
  Clock, 
  Building2,
  ChevronRight,
  Info
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

// Fix for leaflet icons in React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const sampleMeds = [
  { id: 1, name: 'Amoxicillin 500mg', category: 'Antibiotics', ngo: 'Helping Hands NGO', distance: '0.8 miles', expiry: '2024-11-20', qty: 45, lat: 41.8781, lng: -87.6298 },
  { id: 2, name: 'Metformin 850mg', category: 'Diabetes', ngo: 'St. Jude Relief', distance: '2.4 miles', expiry: '2024-09-15', qty: 120, lat: 41.8819, lng: -87.6231 },
  { id: 3, name: 'Lisinopril 10mg', category: 'Hypertension', ngo: 'City Health Surplus', distance: '5.1 miles', expiry: '2025-01-10', qty: 15, lat: 41.8850, lng: -87.6350 },
  { id: 4, name: 'Albuterol Inhaler', category: 'Respiratory', ngo: 'Helping Hands NGO', distance: '0.8 miles', expiry: '2024-08-05', qty: 3, lat: 41.8781, lng: -87.6298 },
];

const categories = ['All', 'Antibiotics', 'Diabetes', 'Hypertension', 'Respiratory', 'Pain Relief'];

export function BrowseMedicine() {
  const [view, setView] = React.useState('list');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredMeds = sampleMeds.filter(med => 
    (selectedCategory === 'All' || med.category === selectedCategory) &&
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-secondary">Find Medication</h1>
          <p className="text-slate-500 font-medium pt-1">Browse available surplus inventory in your local network.</p>
        </div>
        <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-200 p-1">
          <button 
            onClick={() => setView('list')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
              view === 'list' ? "bg-brand-primary text-white" : "text-slate-500 hover:text-brand-secondary"
            )}
          >
            <List className="w-4 h-4" />
            List View
          </button>
          <button 
            onClick={() => setView('map')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
              view === 'map' ? "bg-brand-primary text-white" : "text-slate-500 hover:text-brand-secondary"
            )}
          >
            <MapIcon className="w-4 h-4" />
            Map View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="clinical-card p-6">
            <h3 className="font-bold text-brand-secondary mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              Quick Search
            </h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Medicine name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="clinical-card p-6">
            <h3 className="font-bold text-brand-secondary mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    selectedCategory === cat ? "bg-teal-50 text-brand-primary font-bold" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-brand-secondary rounded-2xl text-white">
            <Info className="w-6 h-6 text-teal-400 mb-3" />
            <h4 className="font-bold text-sm mb-2">Need Help?</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              All displayed items are verified by pharmacists and held by certified NGOs.
            </p>
            <Link to="/how-it-works" className="text-xs font-bold text-teal-400 hover:underline">
              Read Safety Protocol →
            </Link>
          </div>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-12">
          {view === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMeds.map((med, idx) => (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="clinical-card p-6 hover:border-brand-primary/30 transition-all flex flex-col group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-slate-50 rounded-xl text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                      <Pill className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                      {med.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-brand-secondary mb-1">{med.name}</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {med.ngo}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Navigation className="w-4 h-4 text-slate-400" />
                      {med.distance} away
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Expires: <span className="font-bold text-slate-700">{med.expiry}</span>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="text-sm font-bold text-brand-secondary">
                      {med.qty} units available
                    </div>
                    <button className="flex items-center gap-1 text-sm font-bold text-brand-primary hover:translate-x-1 transition-transform">
                      View details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
              {filteredMeds.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-secondary">No medicines found</h3>
                  <p className="text-slate-500 mt-2">Try adjusting your search query or filters.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="clinical-card h-[600px] overflow-hidden">
              <MapContainer center={[41.8781, -87.6298]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filteredMeds.map(med => (
                  <Marker key={med.id} position={[med.lat, med.lng]}>
                    <Popup>
                      <div className="p-2 min-w-[150px]">
                        <h4 className="font-bold text-brand-secondary mb-1">{med.name}</h4>
                        <p className="text-xs text-slate-500 mb-2">{med.ngo}</p>
                        <div className="flex justify-between items-center text-[10px] font-bold text-brand-primary uppercase">
                          <span>{med.qty} Units</span>
                          <span className="text-slate-400">{med.distance}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {/* NGO Registry Section */}
          <section id="ngos" className="pt-12 border-t border-slate-200">
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-brand-secondary">NGO Registry</h2>
              <p className="text-slate-500 text-sm font-medium">Verified organizations managing the redistribution network.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Helping Hands NGO', location: 'West District', stock: '240 Units', impact: '12k Lives' },
                { name: 'St. Jude Relief', location: 'Downtown', stock: '450 Units', impact: '25k Lives' },
                { name: 'City Health Surplus', location: 'North Side', stock: '180 Units', impact: '8k Lives' },
              ].map((ngo, idx) => (
                <div key={idx} className="clinical-card p-6 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer">
                  <div>
                    <h4 className="font-bold text-brand-secondary">{ngo.name}</h4>
                    <p className="text-xs text-slate-500">{ngo.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-brand-primary">{ngo.stock} stock</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{ngo.impact} impact</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
