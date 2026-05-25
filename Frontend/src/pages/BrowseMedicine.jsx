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
  Info,
  Barcode,
  Locate,
  Eye,
  Sliders,
  Check,
  Compass,
  AlertCircle,
  HelpCircle,
  Activity,
  User,
  ShieldAlert,
  MapPin,
  Sparkles,
  Heart
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
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

import { api } from '../lib/api';

// Haversine distance helper function
export function getDistanceInMiles(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const radlat1 = Math.PI * lat1/180;
  const radlat2 = Math.PI * lat2/180;
  const theta = lon1-lon2;
  const radtheta = Math.PI * theta/180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = dist * 180/Math.PI;
  dist = dist * 60 * 1.1515;
  return Number(dist.toFixed(2));
}

// Leaflet DivIcon constructor for beautiful custom marker designs
export const createCustomIcon = (bgColor, textColor, typeSymbol) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-flex h-8 w-8 rounded-full ${bgColor} opacity-20 animate-ping"></span>
        <div class="relative w-8 h-8 rounded-full border-2 border-white text-white flex items-center justify-center text-[10px] font-bold shadow-lg ${bgColor} hover:scale-110 transition-transform">
          ${typeSymbol}
        </div>
      </div>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -12]
  });
};

export const MAP_ENTITIES = {
  donors: [
    { id: 'd1', name: 'Downtown Medical Surplus Hub', type: 'Donor', contact: 'Dr. Evelyn Carter', tel: '312-555-0143', lat: 41.8845, lng: -87.6410, address: '850 W Madison St, Chicago, IL', items: 'Insulin Glargine, Syringes', activeDonations: 4 },
    { id: 'd2', name: 'Pilsen Community Aid Clinic', type: 'Donor', contact: 'Luis Mendez, PharmD', tel: '312-555-0189', lat: 41.8503, lng: -87.6500, address: '1810 S Blue Island Ave, Chicago, IL', items: 'Metformin, Albuterol', activeDonations: 2 },
    { id: 'd3', name: 'Lincoln Park Donor Point', type: 'Donor', contact: 'Sarah Peterson', tel: '773-555-0122', lat: 41.9250, lng: -87.6550, address: '2200 N Halsted St, Chicago, IL', items: 'Amoxicillin, Multi-vitamins', activeDonations: 3 },
    { id: 'd4', name: 'West Chicago Dispatch Hub', type: 'Donor', contact: 'Marcus Brody', tel: '773-555-0155', lat: 41.8890, lng: -87.7200, address: '4200 W Lake St, Chicago, IL', items: 'Lisinopril, Aspirin', activeDonations: 1 },
  ],
  ngos: [
    { id: 'n1', name: 'Helping Hands NGO', type: 'NGO', director: 'Marta Diaz', tel: '312-555-0199', lat: 41.8781, lng: -87.6298, address: '100 S State St, Chicago, IL', capacity: '1,200 Packs / mo', color: 'text-indigo-600' },
    { id: 'n2', name: 'St. Jude Relief', type: 'NGO', director: 'Father Thomas', tel: '312-555-0111', lat: 41.8819, lng: -87.6231, address: '200 E Randolph St, Chicago, IL', capacity: '3,500 Packs / mo', color: 'text-pink-600' },
    { id: 'n3', name: 'City Health Surplus Distribution', type: 'NGO', director: 'Dr. Albert Wu', tel: '312-555-0120', lat: 41.8850, lng: -87.6350, address: '300 W Wacker Dr, Chicago, IL', capacity: '2,000 Packs / mo', color: 'text-cyan-600' },
    { id: 'n4', name: 'Hope Medical Outreach', type: 'NGO', director: 'Clara Oswald', tel: '312-555-0180', lat: 41.8310, lng: -87.6210, address: '3200 S Michigan Ave, Chicago, IL', capacity: '800 Packs / mo', color: 'text-amber-500' },
    { id: 'n5', name: 'Suburban Relief Network', type: 'NGO', director: 'Reginald Vance', tel: '847-555-0144', lat: 42.0100, lng: -87.8000, address: '5600 N River Rd, Rosemont, IL', capacity: '5,000 Packs / mo', color: 'text-emerald-500' },
  ],
  centers: [
    { id: 'c1', name: 'Lakeview Apothecary Hub', type: 'Center', lead: 'Samantha Reynolds', tel: '773-555-0219', lat: 41.9400, lng: -87.6530, address: '3100 N Broadway, Chicago, IL', hours: '9 AM - 6 PM', capabilities: 'Cold Storage, Rapid Scan' },
    { id: 'c2', name: 'Cook County Medical Supply', type: 'Center', lead: 'Franklin Pierce', tel: '312-555-0233', lat: 41.8740, lng: -87.6710, address: '1900 W Harrison St, Chicago, IL', hours: '24 Hours Open', capabilities: 'IV Fluids, Biologics Intake' },
    { id: 'c3', name: 'Loop Care Pharmacy Point', type: 'Center', lead: 'Diana Prince', tel: '312-555-0275', lat: 41.8805, lng: -87.6321, address: '1 N State St, Chicago, IL', hours: '8 AM - 10 PM', capabilities: 'Generics Registry, QC Laboratory' },
    { id: 'c4', name: 'Midway Regional Health Depot', type: 'Center', lead: 'Arthur Curry', tel: '773-555-0288', lat: 41.7860, lng: -87.7500, address: '5700 W 55th St, Chicago, IL', hours: '10 AM - 7 PM', capabilities: 'Surplus Sorting, Multi-language' },
  ],
};

const defaultSampleMeds = [
  { id: '1', name: 'Amoxicillin 500mg', category: 'Antibiotics', ngo: 'Helping Hands NGO', distance: '0.8 miles', expiry: '2024-11-20', qty: '45 Packs', quantity: 45, quantityUnit: 'Packs', lat: 41.8781, lng: -87.6298, status: 'Active' },
  { id: '2', name: 'Metformin 850mg', category: 'Diabetes', ngo: 'St. Jude Relief', distance: '2.4 miles', expiry: '2024-09-15', qty: '120 Tablets', quantity: 120, quantityUnit: 'Tablets', lat: 41.8819, lng: -87.6231, status: 'Active' },
  { id: '3', name: 'Lisinopril 10mg', category: 'Hypertension', ngo: 'City Health Surplus', distance: '5.1 miles', expiry: '2025-01-10', qty: '15 Strips', quantity: 15, quantityUnit: 'Strips', lat: 41.8850, lng: -87.6350, status: 'Active' },
  { id: '4', name: 'Albuterol Inhaler', category: 'Respiratory', ngo: 'Helping Hands NGO', distance: '0.8 miles', expiry: '2024-08-05', qty: '3 Inhalers', quantity: 3, quantityUnit: 'Inhalers', lat: 41.8781, lng: -87.6298, status: 'Active' },
];

const categories = ['All', 'Antibiotics', 'Diabetes', 'Hypertension', 'Respiratory', 'Pain Relief'];

// Dynamic viewport panning helper for Leaflet Map
function ChangeMapView({ coords }) {
  const map = useMap();
  React.useEffect(() => {
    if (coords && Array.isArray(coords) && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      map.setView(coords, map.getZoom());
    }
  }, [coords, map]);
  return null;
}

export function BrowseMedicine() {
  const [view, setView] = React.useState('list');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [medsList, setMedsList] = React.useState([]);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // New map and radius-matching states
  const [searchRadius, setSearchRadius] = React.useState(5); // in miles
  const [anchorType, setAnchorType] = React.useState('ngo'); // 'donor', 'ngo', or 'custom'
  const [anchorId, setAnchorId] = React.useState('n1'); // defaults to Help Hands NGO
  const [showDonorsToggle, setShowDonorsToggle] = React.useState(true);
  const [showNgosToggle, setShowNgosToggle] = React.useState(true);
  const [showCentersToggle, setShowCentersToggle] = React.useState(true);
  const [customLatLng, setCustomLatLng] = React.useState({ lat: 41.8781, lng: -87.6298 });

  // Get active anchor coordinates and info
  const activeAnchor = React.useMemo(() => {
    if (anchorType === 'ngo') {
      return MAP_ENTITIES.ngos.find(n => n.id === anchorId) || MAP_ENTITIES.ngos[0];
    } else if (anchorType === 'donor') {
      return MAP_ENTITIES.donors.find(d => d.id === anchorId) || MAP_ENTITIES.donors[0];
    } else {
      return { id: 'custom', name: 'Custom Marker Point', lat: customLatLng.lat, lng: customLatLng.lng, address: 'Interactive Location Coordinate' };
    }
  }, [anchorType, anchorId, customLatLng]);

  React.useEffect(() => {
    async function loadMeds() {
      try {
        setLoading(true);
        const profile = JSON.parse(localStorage.getItem('findmeds_profile')) || null;
        setCurrentUser(profile);

        const fetched = await api.getDonations();
        const apiMeds = (fetched?.data || fetched || []);
        
        // Combine our custom api list with default samples to keep marketplace populated
        const combined = [...apiMeds, ...defaultSampleMeds];
        
        // Remove duplicate items by medicine name
        const unique = [];
        const seenNames = new Set();
        for (const item of combined) {
          const normalName = (item.medicine || item.name || '').toLowerCase();
          if (!seenNames.has(normalName)) {
            seenNames.add(normalName);
            unique.push(item);
          }
        }
        
        setMedsList(unique);
      } catch (err) {
        console.warn("Could not load dynamic drug listings.", err);
        setMedsList(defaultSampleMeds);
      } finally {
        setLoading(false);
      }
    }
    loadMeds();
  }, []);

  const handleClaim = async (id, nameOfMed) => {
    const profile = currentUser || { fullName: 'Lifecare Community Ngo' };
    const confirm = window.confirm(`Are you sure you want to claim ${nameOfMed} for redistribution?`);
    if (!confirm) return;

    try {
      await api.claimDonation(id, { name: profile.fullName });
      alert(`Successfully claimed ${nameOfMed}! A push notification has been sent to the matching entities and SMS backup triggered.`);
      
      // Update local state
      setMedsList(prev => prev.map(m => {
        const itemId = m.id || m._id;
        if (itemId === id) {
          return { ...m, status: 'Claimed', ngo: profile.fullName };
        }
        return m;
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to register the claim. Make sure the Node server is running.');
    }
  };

  const filteredMeds = medsList.filter(med => {
    const medCategory = (med.category || '').toLowerCase();
    const activeCat = selectedCategory.toLowerCase();
    const isCatMatch = activeCat === 'all' || medCategory === activeCat || (activeCat === 'diabetes' && medCategory.includes('diab'));
    
    const medName = (med.medicine || med.name || '').toLowerCase();
    const isSearchMatch = medName.includes(searchQuery.toLowerCase());
    
    return isCatMatch && isSearchMatch;
  });

  // Calculate matching entities and metrics within selected radius
  const matchedEntities = React.useMemo(() => {
    const list = [];
    
    if (showDonorsToggle) {
      MAP_ENTITIES.donors.forEach(d => {
        const dist = getDistanceInMiles(activeAnchor.lat, activeAnchor.lng, d.lat, d.lng);
        list.push({ ...d, distance: dist, isMatched: dist <= searchRadius });
      });
    }
    
    if (showNgosToggle) {
      MAP_ENTITIES.ngos.forEach(n => {
        const dist = getDistanceInMiles(activeAnchor.lat, activeAnchor.lng, n.lat, n.lng);
        list.push({ ...n, distance: dist, isMatched: dist <= searchRadius });
      });
    }
    
    if (showCentersToggle) {
      MAP_ENTITIES.centers.forEach(c => {
        const dist = getDistanceInMiles(activeAnchor.lat, activeAnchor.lng, c.lat, c.lng);
        list.push({ ...c, distance: dist, isMatched: dist <= searchRadius });
      });
    }
    
    // Sort primarily by matched first, then distance
    return list.sort((a, b) => {
      if (a.isMatched && !b.isMatched) return -1;
      if (!a.isMatched && b.isMatched) return 1;
      return a.distance - b.distance;
    });
  }, [activeAnchor, searchRadius, showDonorsToggle, showNgosToggle, showCentersToggle]);

  const stats = React.useMemo(() => {
    const total = matchedEntities.length;
    const activeMatch = matchedEntities.filter(e => e.isMatched).length;
    const matchRate = total > 0 ? Math.round((activeMatch / total) * 100) : 0;
    return { total, activeMatch, matchRate };
  }, [matchedEntities]);

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
                    {med.image ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                        <img 
                          src={med.image} 
                          alt={med.medicine || med.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-xl text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                        <Pill className="w-6 h-6" />
                      </div>
                    )}
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                      {med.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-brand-secondary mb-1">{med.medicine || med.name}</h3>
                  {med.barcode && (
                    <div className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full mb-3 uppercase tracking-wider select-none border border-teal-200/50">
                      <Barcode className="w-3 h-3 text-teal-600" />
                      GS1 Scanned: {med.barcode}
                    </div>
                  )}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {med.ngo || 'Original Donor'}
                    </div>
                    {med.pincode && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Navigation className="w-4 h-4 text-slate-400" />
                        Pincode: {med.pincode}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Expires: <span className="font-bold text-slate-700">{med.expiry || med.expiryDate}</span>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="text-sm font-bold text-brand-secondary">
                      {(() => {
                        if (typeof med.qty === 'string' && isNaN(Number(med.qty))) {
                          return med.qty;
                        }
                        const num = med.qty || med.quantity || 0;
                        const unit = med.quantityUnit || 'units';
                        return `${num} ${unit}`;
                      })()}
                    </div>
                    
                    {med.status === 'Claimed' ? (
                      <span className="text-xs bg-amber-50 text-amber-700 font-bold px-3 py-1.5 rounded-lg border border-amber-200">
                        Claimed
                      </span>
                    ) : currentUser?.role === 'ngo' ? (
                      <button 
                        onClick={() => handleClaim(med.id || med._id, med.medicine || med.name)}
                        className="bg-brand-primary text-white hover:bg-teal-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        Claim Surplus
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button className="flex items-center gap-1 text-sm font-bold text-brand-primary hover:translate-x-1 transition-transform">
                        Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
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
            <div className="space-y-6">
              {/* Interactive Visualizer Dashboard Controls */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Anchor point selector */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-brand-primary" />
                      Set Focus Anchor Center
                    </label>
                    <select
                      value={`${anchorType}:${anchorId}`}
                      onChange={(e) => {
                        const [type, id] = e.target.value.split(':');
                        setAnchorType(type);
                        setAnchorId(id);
                        // Center custom coordinates
                        const selected = type === 'ngo' 
                          ? MAP_ENTITIES.ngos.find(n => n.id === id) 
                          : MAP_ENTITIES.donors.find(d => d.id === id);
                        if (selected) {
                          setCustomLatLng({ lat: selected.lat, lng: selected.lng });
                        }
                      }}
                      className="w-full text-sm font-medium bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
                    >
                      <optgroup label="🩺 NGO Centers (Anchor Points)">
                        {MAP_ENTITIES.ngos.map(n => (
                          <option key={n.id} value={`ngo:${n.id}`}>{n.name} (NGO)</option>
                        ))}
                      </optgroup>
                      <optgroup label="🏢 Donor Facilities">
                        {MAP_ENTITIES.donors.map(d => (
                          <option key={d.id} value={`donor:${d.id}`}>{d.name} (Donor)</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Matching Radius Slider */}
                  <div className="md:col-span-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-teal-600" />
                        Match Radius Boundary
                      </label>
                      <span className="text-xs font-mono font-bold text-brand-primary bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                        {searchRadius} Miles
                      </span>
                    </div>
                    <div className="flex items-center gap-3 py-1">
                      <span className="text-xs font-semibold text-slate-400">1m</span>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        step="1"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                      />
                      <span className="text-xs font-semibold text-slate-400">15m</span>
                    </div>
                  </div>

                  {/* Layer Checkboxes */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      Dynamic Layer Toggles
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => setShowDonorsToggle(!showDonorsToggle)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                          showDonorsToggle 
                            ? "bg-rose-500 border-rose-600 text-white shadow-sm" 
                            : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <span className="w-2 h-2 rounded-full bg-white block"></span>
                        Donors ({MAP_ENTITIES.donors.length})
                      </button>

                      <button
                        onClick={() => setShowNgosToggle(!showNgosToggle)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                          showNgosToggle 
                            ? "bg-cyan-600 border-cyan-700 text-white shadow-sm" 
                            : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <span className="w-2 h-2 rounded-full bg-white block"></span>
                        NGOs ({MAP_ENTITIES.ngos.length})
                      </button>

                      <button
                        onClick={() => setShowCentersToggle(!showCentersToggle)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                          showCentersToggle 
                            ? "bg-emerald-500 border-emerald-600 text-white shadow-sm" 
                            : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <span className="w-2 h-2 rounded-full bg-white block"></span>
                        Centers ({MAP_ENTITIES.centers.length})
                      </button>
                    </div>
                  </div>

                </div>

                {/* Match Statistics Bar */}
                <div className="mt-4 pt-4 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-lg text-brand-primary">
                      <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Match Rate</div>
                      <div className="text-lg font-bold text-slate-800 leading-tight pt-0.5">{stats.matchRate}%</div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">In Target Area</div>
                      <div className="text-lg font-bold text-indigo-600 leading-tight pt-0.5">{stats.activeMatch} / {stats.total}</div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Matched Donors</div>
                      <div className="text-lg font-bold text-pink-600 leading-tight pt-0.5">
                        {matchedEntities.filter(e => e.type === 'Donor' && e.isMatched).length} Nodes
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Scope Area</div>
                      <div className="text-lg font-bold text-amber-600 leading-tight pt-0.5">
                        {Math.round(Math.PI * searchRadius * searchRadius)} sq mi
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Two Column Maps Visualizer Split Screen */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Map Display Frame */}
                <div className="lg:col-span-8 relative rounded-2xl border border-slate-200 shadow-md h-[550px] overflow-hidden bg-slate-100 flex flex-col">
                  <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white text-xs select-none">
                    <div className="flex items-center gap-2 font-mono">
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                      SECURE MATCH ENGINE: ACTIVE (ANCHOR: {activeAnchor.name})
                    </div>
                    <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                      GS1 & LEAFLET ENGINE
                    </div>
                  </div>

                  <div className="flex-1 w-full h-full relative z-0">
                    <MapContainer center={[activeAnchor.lat, activeAnchor.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
                      <ChangeMapView coords={[activeAnchor.lat, activeAnchor.lng]} />
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />

                      {/* Matching Radius Circle Outer Visualizer */}
                      <Circle 
                        center={[activeAnchor.lat, activeAnchor.lng]} 
                        radius={searchRadius * 1609.34} 
                        pathOptions={{ 
                          color: '#0d9488', 
                          fillColor: '#0d9488', 
                          fillOpacity: 0.08, 
                          weight: 2, 
                          dashArray: '5, 8' 
                        }} 
                      />

                      {/* Anchor Focal Point Marker */}
                      <Marker 
                        position={[activeAnchor.lat, activeAnchor.lng]} 
                        icon={createCustomIcon('bg-indigo-600 border-4 border-indigo-200 scale-110', 'A', '⚓')}
                      >
                        <Popup>
                          <div className="p-3 max-w-[200px]">
                            <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 select-none">
                              Active Anchor point
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm mt-2">{activeAnchor.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">{activeAnchor.address}</p>
                            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-mono font-semibold text-slate-400">
                              Lat: {activeAnchor.lat.toFixed(4)}, Lng: {activeAnchor.lng.toFixed(4)}
                            </div>
                          </div>
                        </Popup>
                      </Marker>

                      {/* Map Entity Layers */}
                      {showDonorsToggle && MAP_ENTITIES.donors.filter(d => d.id !== activeAnchor.id).map(donor => {
                        const dist = getDistanceInMiles(activeAnchor.lat, activeAnchor.lng, donor.lat, donor.lng);
                        const isMatched = dist <= searchRadius;
                        return (
                          <Marker 
                            key={donor.id} 
                            position={[donor.lat, donor.lng]}
                            icon={createCustomIcon(
                              isMatched ? 'bg-rose-500 shadow-rose-300' : 'bg-rose-400 opacity-60',
                              'D',
                              '🏠'
                            )}
                          >
                            <Popup>
                              <div className="p-3 max-w-[220px]">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[9px] font-bold uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                    {donor.type}
                                  </span>
                                  <span className={cn(
                                    "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                                    isMatched ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-slate-100 text-slate-400"
                                  )}>
                                    {isMatched ? 'In Radius Match' : 'Out of Reach'}
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-xs mt-2">{donor.name}</h4>
                                <p className="text-[11px] text-slate-500 mt-1">{donor.address}</p>
                                <div className="mt-2 text-[11px] font-semibold text-indigo-700">
                                  💊 Supplies: <span className="text-slate-600 font-medium">{donor.items}</span>
                                </div>
                                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                                  <span className="font-mono text-slate-400">{dist} miles</span>
                                  <span className="font-medium text-slate-500">{donor.contact}</span>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}

                      {showNgosToggle && MAP_ENTITIES.ngos.filter(n => n.id !== activeAnchor.id).map(ngo => {
                        const dist = getDistanceInMiles(activeAnchor.lat, activeAnchor.lng, ngo.lat, ngo.lng);
                        const isMatched = dist <= searchRadius;
                        return (
                          <Marker 
                            key={ngo.id} 
                            position={[ngo.lat, ngo.lng]}
                            icon={createCustomIcon(
                              isMatched ? 'bg-cyan-600 shadow-cyan-300' : 'bg-cyan-400 opacity-60',
                              'N',
                              '🩺'
                            )}
                          >
                            <Popup>
                              <div className="p-3 max-w-[220px]">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[9px] font-bold uppercase text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                                    {ngo.type}
                                  </span>
                                  <span className={cn(
                                    "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                                    isMatched ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-slate-100 text-slate-400"
                                  )}>
                                    {isMatched ? 'In Radius Match' : 'Out of Reach'}
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-xs mt-2">{ngo.name}</h4>
                                <p className="text-[11px] text-slate-500 mt-1">{ngo.address}</p>
                                <div className="mt-2 text-[11px] font-semibold text-cyan-800">
                                  📦 Capacity: <span className="text-slate-600 font-medium">{ngo.capacity}</span>
                                </div>
                                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                                  <span className="font-mono text-slate-400">{dist} miles</span>
                                  <span className="font-medium text-slate-500">Director: {ngo.director}</span>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}

                      {showCentersToggle && MAP_ENTITIES.centers.filter(c => c.id !== activeAnchor.id).map(center => {
                        const dist = getDistanceInMiles(activeAnchor.lat, activeAnchor.lng, center.lat, center.lng);
                        const isMatched = dist <= searchRadius;
                        return (
                          <Marker 
                            key={center.id} 
                            position={[center.lat, center.lng]}
                            icon={createCustomIcon(
                              isMatched ? 'bg-emerald-500 shadow-emerald-300' : 'bg-emerald-400 opacity-60',
                              'C',
                              '🏢'
                            )}
                          >
                            <Popup>
                              <div className="p-3 max-w-[220px]">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[9px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    Medicine Center
                                  </span>
                                  <span className={cn(
                                    "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                                    isMatched ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-slate-100 text-slate-400"
                                  )}>
                                    {isMatched ? 'In Radius Match' : 'Out of Reach'}
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-xs mt-2">{center.name}</h4>
                                <p className="text-[11px] text-slate-500 mt-1">{center.address}</p>
                                <div className="mt-2 text-[11px] font-semibold text-emerald-800">
                                  🕐 Hours: <span className="text-slate-600 font-medium">{center.hours}</span>
                                </div>
                                <div className="mt-1 text-[10px] text-emerald-600 bg-emerald-50/50 p-1 rounded font-medium">
                                  ⚡ Capabilities: {center.capabilities}
                                </div>
                                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                                  <span className="font-mono text-slate-400">{dist} miles</span>
                                  <span className="font-medium text-slate-500">{center.lead}</span>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}

                      {/* Render dynamic medicines in marketplace onto the map */}
                      {filteredMeds.filter(med => med && typeof med.lat === 'number' && typeof med.lng === 'number' && !isNaN(med.lat) && !isNaN(med.lng)).map(med => {
                        const dist = getDistanceInMiles(activeAnchor.lat, activeAnchor.lng, med.lat, med.lng);
                        const isMatched = dist <= searchRadius;
                        return (
                          <Marker 
                            key={`med-${med.id}`} 
                            position={[med.lat, med.lng]}
                            icon={createCustomIcon(
                              isMatched ? 'bg-amber-500 shadow-amber-300' : 'bg-slate-400 opacity-60',
                              'P',
                              '💊'
                            )}
                          >
                            <Popup>
                              <div className="p-3 min-w-[200px]">
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                                  Stock Medicine
                                </span>
                                <h4 className="font-bold text-slate-800 text-xs mt-2">{med.name || med.medicine}</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5">Held at: {med.ngo || 'Unknown NGO'}</p>
                                <div className="mt-2 flex justify-between text-[10px] font-mono font-bold text-brand-primary">
                                  <span>Qty: {med.qty || med.quantity || 1}</span>
                                  <span>Expires: {med.expiry || med.expiryDate}</span>
                                </div>
                                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                                  <span className="text-slate-400 font-mono">{dist} miles away</span>
                                  <button 
                                    onClick={() => handleClaim(med.id || med._id, med.name || med.medicine)}
                                    className="bg-brand-primary text-white text-[9px] px-2 py-1 rounded font-bold hover:bg-teal-700"
                                  >
                                    Claim
                                  </button>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}

                    </MapContainer>
                  </div>
                </div>

                {/* Radius Match Ledger Column */}
                <div className="lg:col-span-4 flex flex-col h-[550px]">
                  <div className="bg-slate-900 rounded-t-2xl p-4 text-white shrink-0">
                    <h3 className="font-bold text-sm tracking-wide flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <List className="w-4 h-4 text-teal-400" />
                        RADIUS MATCH LEDGER
                      </span>
                      <span className="bg-teal-500 text-slate-900 border border-teal-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {stats.activeMatch} Matches
                      </span>
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Showing nearby entities sorted by proximity to your active anchor.
                    </p>
                  </div>

                  <div className="flex-1 bg-white border-x border-b border-slate-200 rounded-b-2xl overflow-y-auto p-4 space-y-3">
                    
                    {/* Anchor Visual indicator Card */}
                    <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm select-none shrink-0 border-2 border-white shadow">
                        ⚓
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider">ACTIVE ANCHOR CENTER</div>
                        <h4 className="font-bold text-slate-800 text-xs truncate mt-0.5">{activeAnchor.name}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{activeAnchor.address}</p>
                      </div>
                    </div>

                    {/* Matching list loop */}
                    {matchedEntities.map((ent) => (
                      <div 
                        key={ent.id}
                        onClick={() => {
                          setCustomLatLng({ lat: ent.lat, lng: ent.lng });
                          // Set center matching to render viewport
                          if (ent.type === 'NGO') {
                            setAnchorType('ngo');
                            setAnchorId(ent.id);
                          } else if (ent.type === 'Donor') {
                            setAnchorType('donor');
                            setAnchorId(ent.id);
                          }
                        }}
                        className={cn(
                          "p-3.5 rounded-xl border transition-all cursor-pointer group flex items-start gap-3 hover:shadow-md",
                          ent.isMatched 
                            ? "bg-teal-50/40 border-teal-200 hover:bg-teal-50" 
                            : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 opacity-70"
                        )}
                      >
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full shrink-0 mt-1 select-none",
                          ent.type === 'Donor' ? 'bg-rose-500 font-bold text-white' : ent.type === 'NGO' ? 'bg-cyan-600' : 'bg-emerald-500'
                        )}></div>

                        <div className="flex-1 min-w-0 font-sans">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[9px] font-bold uppercase text-slate-400">
                              {ent.type || 'Center'}
                            </span>
                            <span className={cn(
                              "text-[9px] font-mono font-bold rounded px-1.5 py-0.5",
                              ent.isMatched ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-400"
                            )}>
                              {ent.distance} miles
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-800 mt-1 truncate group-hover:text-brand-primary">
                            {ent.name}
                          </h4>
                          
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                            {ent.address}
                          </p>

                          {ent.isMatched ? (
                            <div className="mt-2.5 flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700">
                                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping"></span>
                                Matched Coverage
                              </span>
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Routing initiated! A secure dispatch path has been calculated between "${activeAnchor.name}" and "${ent.name}" (${ent.distance} miles). Ready to submit manifest secure keys.`);
                                }}
                                className="text-[9px] font-bold uppercase transition-all bg-stone-950 text-white px-2 py-1 rounded hover:bg-brand-primary"
                              >
                                Connect Location
                              </button>
                            </div>
                          ) : (
                            <div className="mt-2.5 text-[9px] font-medium text-slate-400">
                              ⚠️ Outside target matches (>{searchRadius} miles)
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {matchedEntities.length === 0 && (
                      <div className="py-12 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <div className="text-xs font-bold font-mono">NO LAYERS SELECTED</div>
                        <p className="text-[10px] mt-1">Please toggle at least one visual map layer above.</p>
                      </div>
                    )}

                  </div>
                </div>

              </div>
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
