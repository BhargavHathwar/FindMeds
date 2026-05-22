import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PackageSearch, 
  ArrowDownLeft, 
  AlertTriangle, 
  Users, 
  Map as MapIcon,
  Search,
  Filter,
  MoreVertical,
  Activity,
  Heart,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

// Fix for leaflet icons in React - using Unpkg URLs to avoid Vite import issues
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const defaultInventoryItems = [
  { id: '1', name: 'Insulin Glargine', batch: 'IG-2024-001', expiry: '2026-12-15', qty: 45, status: 'Healthy' },
  { id: '2', name: 'Metformin HCl', batch: 'MT-2024-088', expiry: '2026-06-30', qty: 120, status: 'Expiring Soon' },
  { id: '3', name: 'Lisinopril', batch: 'LS-2023-452', expiry: '2027-01-20', qty: 85, status: 'Healthy' },
  { id: '4', name: 'Atorvastatin', batch: 'AT-2024-012', expiry: '2026-09-12', qty: 8, status: 'Critical Level' },
];

// Focus on Chennai/South District India coordinates for authentic feel (600001 pincode)
const defaultDonors = [
  { id: 1, lat: 13.0827, lng: 80.2707, name: 'Apollo Health Hub', donation: 'Diabetes Meds (Insulin)' },
  { id: 2, lat: 13.0601, lng: 80.2450, name: 'Fortis Medicine Depot', donation: 'Hypertension Kits' },
  { id: 3, lat: 13.0400, lng: 80.2200, name: 'Metro Pharma Surplus', donation: 'Cardiac Meds (Atenolol)' },
];

export function NGODashboard() {
  const [profile, setProfile] = React.useState({ fullName: 'Helping Hands NGO', pincode: '600001' });
  const [inventory, setInventory] = React.useState(defaultInventoryItems);
  const [filterText, setFilterText] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('inventory'); // 'inventory' | 'wishlist' | 'map'
  
  // Wishlist state
  const [wishlist, setWishlist] = React.useState([
    { id: 'w1', name: 'Amoxicillin 500mg', requestedQty: '200 units', urgency: 'High' },
    { id: 'w2', name: 'Vildagliptin 50mg', requestedQty: '150 boxes', urgency: 'Critical' }
  ]);
  const [newWishItem, setNewWishItem] = React.useState('');
  const [newWishQty, setNewWishQty] = React.useState('');
  const [newWishUrgency, setNewWishUrgency] = React.useState('Medium');

  const [stats, setStats] = React.useState({
    availableStock: '452 Units',
    pendingRequests: '2',
    activeDonors: '3',
    supplyAlerts: '01'
  });

  const loadNgoDashboard = async () => {
    try {
      const storedProfile = JSON.parse(localStorage.getItem('findmeds_profile')) || {};
      if (storedProfile.fullName) {
        setProfile(storedProfile);
      }

      const remoteMeds = await api.getDonations();
      const dataMeds = remoteMeds?.data || remoteMeds || [];
      
      // Filter elements claimed by this active NGO name
      const ourClaims = dataMeds.filter(item => 
        item.status === 'Claimed' && 
        (!item.ngo || item.ngo.toLowerCase() === (storedProfile.fullName || 'Helping Hands NGO').toLowerCase())
      );

      const mappedClaimed = ourClaims.map((c, idx) => ({
        id: c.id || c._id || `claimed-${idx}`,
        name: c.medicine || c.name,
        batch: c.batch || 'CL-BATCH-001',
        expiry: c.expiry || c.expiryDate || '2026-11-15',
        qty: c.quantity || 60,
        status: 'Healthy'
      }));

      const merged = [...mappedClaimed, ...defaultInventoryItems];
      setInventory(merged);

      const totalQty = merged.reduce((acc, current) => acc + Number(current.qty || 0), 0);
      setStats({
        availableStock: `${totalQty} Units`,
        pendingRequests: `${wishlist.length}`,
        activeDonors: `${defaultDonors.length + ourClaims.length}`,
        supplyAlerts: '01'
      });
    } catch (err) {
      console.warn('Dashboard loading fallback.', err);
    }
  };

  React.useEffect(() => {
    loadNgoDashboard();
  }, [wishlist.length]);

  const handleAddWishlist = (e) => {
    e.preventDefault();
    if (!newWishItem.trim()) return;
    const newItem = {
      id: `wish-${Date.now()}`,
      name: newWishItem,
      requestedQty: newWishQty || '100 units',
      urgency: newWishUrgency
    };
    setWishlist(prev => [newItem, ...prev]);
    setNewWishItem('');
    setNewWishQty('');
    setNewWishUrgency('Medium');
    alert(`Wishlist item added! Real-time GeoFirestore match triggers will notify if a matching donor posts within your district.`);
  };

  const handleDeleteWishlist = (id) => {
    setWishlist(prev => prev.filter(w => w.id !== id));
  };

  const filteredInventory = inventory.filter(item => 
    (item.name || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (item.batch || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Upper header segment */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-secondary">{profile.fullName}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
              Verified District NGO {profile.pincode ? `• Pin ${profile.pincode}` : ''}
            </span>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Regional Relief Hub</span>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link to="/browse" className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all text-xs">
            <PackageSearch className="w-4 h-4 text-brand-primary" />
            Browse Live Surplus
          </Link>
          <button 
            onClick={() => setActiveTab('wishlist')}
            className="flex items-center gap-2 px-5 py-3 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all text-xs"
          >
            <Heart className="w-4 h-4 text-white" />
            Edit Wishlist
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Claimed Inventory', value: stats.availableStock, icon: PackageSearch, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Wishlist Entries', value: stats.pendingRequests, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Surplus Match Hubs', value: stats.activeDonors, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Expiry Alerts', value: stats.supplyAlerts, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="clinical-card p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={stat.bg + " p-2.5 rounded-xl " + stat.color}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-2xl font-display font-bold text-brand-secondary">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 mb-8 gap-6 overflow-x-auto">
        {[
          { id: 'inventory', label: 'Surplus Inventory Log' },
          { id: 'wishlist', label: 'Ngo Wishlist Monitor' },
          { id: 'map', label: 'Regional Donors Map' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "py-4 px-1 font-bold text-sm border-b-2 transition-all whitespace-nowrap",
              activeTab === t.id ? "border-brand-primary text-brand-primary font-bold" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'inventory' && (
          <motion.div 
            key="inventory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main inventory table */}
            <div className="lg:col-span-2 clinical-card flex flex-col">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-brand-secondary text-lg font-display">Active Claimed Stock</h2>
                  <p className="text-xs text-slate-500">Inventory secured for local clinic distribution</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      placeholder="Filter inventory..." 
                      className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-primary w-full sm:w-48"
                    />
                  </div>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInventory.length > 0 ? (
                      filteredInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-xs">{item.batch}</td>
                          <td className="px-6 py-4 text-slate-600 text-sm">{item.expiry}</td>
                          <td className="px-6 py-4 text-slate-900 font-medium">{item.qty || item.quantity} units</td>
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
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm">
                          No matching inventory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick analytics card side list */}
            <div className="space-y-6">
              <div className="clinical-card p-6">
                <h3 className="font-bold text-brand-secondary font-display mb-4">Urgent Clinic Alerts</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex gap-2 text-amber-800 font-bold text-xs items-center mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      Expiry Alert
                    </div>
                    <p className="text-xs text-amber-700 leading-normal">
                      Metformin HCl (Batch MT-2024-088) is approaching the threshold date of safety check in 30 days. Action recommended.
                    </p>
                  </div>
                  <div className="p-3 bg-brand-primary/5 rounded-xl border border-teal-100">
                    <div className="flex gap-2 text-teal-800 font-bold text-xs items-center mb-1">
                      <CheckCircle className="w-4 h-4 text-brand-primary" />
                      Verification Complete
                    </div>
                    <p className="text-xs text-teal-700 leading-normal">
                      Your requested Darpan API validation completed: Helping Hands verified under ministry status code #29831.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'wishlist' && (
          <motion.div 
            key="wishlist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Wishlist Editor */}
            <div className="lg:col-span-2 clinical-card p-6">
              <h2 className="font-bold text-brand-secondary text-lg font-display mb-2">Automated Matcher & Wishlist Editor</h2>
              <p className="text-xs text-slate-500 mb-6 font-medium">Add drug families you need. Our background match engine monitors regional pincodes and dispatches Twilio SMS alerts immediately when list matches are live.</p>
              
              <form onSubmit={handleAddWishlist} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Medication Focus</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Paracetamol 500mg" 
                    value={newWishItem}
                    onChange={(e) => setNewWishItem(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Needed Qty</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 200 units" 
                    value={newWishQty}
                    onChange={(e) => setNewWishQty(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5 justify-end">
                  <div className="flex gap-2">
                    <select 
                      value={newWishUrgency}
                      onChange={(e) => setNewWishUrgency(e.target.value)}
                      className="px-2 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-brand-primary"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High Urgency</option>
                      <option value="Critical">Critical</option>
                    </select>
                    <button type="submit" className="flex items-center gap-1 bg-brand-primary hover:bg-teal-700 text-white rounded-lg px-3 py-2 font-bold text-xs transition">
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-3">
                {wishlist.length > 0 ? (
                  wishlist.map(w => (
                    <div key={w.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition">
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-rose-500 fill-rose-50" />
                        <div>
                          <div className="text-sm font-bold text-slate-900">{w.name}</div>
                          <div className="text-xs text-slate-500">Target need: {w.requestedQty}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                          w.urgency === 'Critical' ? "bg-red-50 text-red-700 border border-red-200" :
                          w.urgency === 'High' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-slate-100 text-slate-700 border"
                        )}>
                          {w.urgency}
                        </span>
                        <button 
                          onClick={() => handleDeleteWishlist(w.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Your wishlist monitor is empty. Add drugs above to receive immediate SMS notifications.
                  </div>
                )}
              </div>
            </div>

            {/* Simulated matches engine */}
            <div className="clinical-card p-6">
              <h3 className="font-bold text-brand-secondary font-display mb-3">Live Broadcast Match Engine</h3>
              <p className="text-xs text-slate-400 mb-4 font-medium">Automatic system cross-referencing listings against your wishlist:</p>
              <div className="space-y-3">
                <div className="p-3.5 bg-green-50/50 border border-green-200 rounded-xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">MATCH FOUND</span>
                    <span className="text-[10px] text-slate-400 font-bold">1.2 km away</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">Amoxicillin 500mg (45 units)</h4>
                  <p className="text-xs text-slate-500 mb-3">Donor: Apollo Health Hub • Verified Seal</p>
                  <Link to="/browse" className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1">
                    Claim Surplus Package
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'map' && (
          <motion.div 
            key="map"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Map Area */}
            <div className="lg:col-span-2 clinical-card overflow-hidden h-[450px]">
              <MapContainer center={[13.0827, 80.2707]} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {defaultDonors.filter(donor => donor && typeof donor.lat === 'number' && typeof donor.lng === 'number' && !isNaN(donor.lat) && !isNaN(donor.lng)).map(donor => (
                  <Marker key={donor.id} position={[donor.lat, donor.lng]}>
                    <Popup>
                      <div className="p-1">
                        <h4 className="font-bold text-brand-secondary text-sm">{donor.name}</h4>
                        <p className="text-xs text-brand-primary font-bold">{donor.donation}</p>
                        <p className="text-[10px] text-slate-400">Pincode: 600001</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Donor location list */}
            <div className="clinical-card p-6 flex flex-col">
              <h3 className="font-bold text-brand-secondary font-display mb-3">Nearby Connected Donors</h3>
              <p className="text-xs text-slate-400 mb-4">Click map pins to find contact info or review directions routing.</p>
              <div className="space-y-4">
                {defaultDonors.map(d => (
                  <div key={d.id} className="flex gap-3 text-xs leading-normal">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{d.name}</h4>
                      <p className="text-slate-500">{d.donation}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">LAT: {d.lat} • LNG: {d.lng}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

