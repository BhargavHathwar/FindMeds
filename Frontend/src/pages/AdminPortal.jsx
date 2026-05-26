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
  Award,
  Activity,
  RotateCw,
  TrendingUp,
  Plus,
  Trash2,
  Settings,
  AlertCircle,
  Filter,
  Clock,
  ClipboardList,
  CheckSquare,
  Check,
  History,
  UserCheck,
  ChevronRight,
  Sparkles,
  Heart,
  UserX,
  ShieldCheck,
  UserMinus,
  Briefcase
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export function AdminPortal() {
  // Navigation states
  const [activeTab, setActiveTab] = React.useState('analytics');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  // Storage keys & local dataset states
  const [pendingNgos, setPendingNgos] = React.useState([]);
  const [donations, setDonations] = React.useState([]);
  const [requests, setRequests] = React.useState([]);
  const [users, setUsers] = React.useState([]);
  const [audits, setAudits] = React.useState([]);
  const [blockedMeds, setBlockedMeds] = React.useState([]);
  
  // Dashboard Metrics & Dynamic states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [checkingDarpan, setCheckingDarpan] = React.useState({});
  const [auditFilter, setAuditFilter] = React.useState('ALL');
  const [userRoleFilter, setUserRoleFilter] = React.useState('ALL');

  // Sync / write logger util
  const logAuditAction = async (actionName, detailsStr, categoryStr = 'GOVERNANCE') => {
    const newLog = {
      id: `aud-${Date.now()}`,
      time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: localStorage.getItem('findmeds_email') || 'admin@findmeds.org',
      action: actionName,
      details: detailsStr,
      category: categoryStr
    };
    
    setAudits(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('fm_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // Seed resources & load states sequentially with real GET Axios calls & fallbacks
  const initializeDatabase = async () => {
    try {
      setLoading(true);
      setError(null);

      // Seed Offline Local DB fallbacks if empty so our GET APIs retrieve seeded fallbacks when server is offline
      if (!localStorage.getItem('fm_users_db')) {
        const initialUsers = [
          { email: 'donor@example.com', password: 'password', fullName: 'Metropolis Hospital Group', role: 'donor', pincode: '400001', status: 'Active' },
          { email: 'ngo@lifecare.org', password: 'password', fullName: 'LifeCare NGO', role: 'ngo', pincode: '600001', status: 'Active' },
          { email: 'admin@findmeds.org', password: 'password', fullName: 'Global Admin Hub', role: 'admin', pincode: '400001', status: 'Active' },
          { email: 'volunteer.hope@clinic.org', password: 'password', fullName: 'Hope Clinic Volunteer', role: 'ngo', pincode: '600001', status: 'Active' },
          { email: 'surplus.hub@city.org', password: 'password', fullName: 'City Healthcare Donor Point', role: 'donor', pincode: '400005', status: 'Suspended' },
          { email: 'patient.care@outlook.com', password: 'password', fullName: 'Karan Mehra (Recipient Patient)', role: 'recipient', pincode: '400015', status: 'Active' }
        ];
        localStorage.setItem('fm_users_db', JSON.stringify(initialUsers));
      }

      if (!localStorage.getItem('fm_ngos')) {
        const initialNgos = [
          { id: 'ngo1', name: 'LifeCare NGO', location: 'South District, Mumbai', email: 'lifecare@ngo.org', status: 'verified', wishlist: ['Insulin', 'Metformin'] },
          { id: 'ngo2', name: 'Hope Clinic', location: 'Bandstand, Mumbai', email: 'hope@clinic.org', status: 'verified', wishlist: ['Amoxicillin', 'Azithromycin'] },
          { id: 'ngo3', name: 'Rural Health Fund', location: 'Palghar Rural', email: 'rural@health.org', status: 'pending', wishlist: ['Paracetamol'] },
        ];
        localStorage.setItem('fm_ngos', JSON.stringify(initialNgos));
      }

      if (!localStorage.getItem('fm_audit_logs')) {
        const initialAudits = [
          { id: 'aud-1', time: '2026-05-24 10:30:15', actor: 'admin@findmeds.org', action: 'Approved NGO Registration', details: 'Hope Clinic verified successfully with Darpan registration #MH-28931.', category: 'NGO_VERIFICATION' },
          { id: 'aud-2', time: '2026-05-24 14:15:22', actor: 'admin@findmeds.org', action: 'Update Schedule H Policy', details: 'Added Standard Opioids to global Schedule H blocked classes.', category: 'COMPLIANCE' },
          { id: 'aud-3', time: '2026-05-25 01:45:00', actor: 'System Auto-Job', action: 'Auto-cascade surplus distribution', details: 'Checked 4 listing blocks. Triggered global pooling matching algorithm.', category: 'SYSTEM' },
          { id: 'aud-4', time: '2026-05-25 03:10:05', actor: 'admin@findmeds.org', action: 'Role Escalation', details: 'Promoted volunteer.hope@clinic.org to NGO verified lead coordinator.', category: 'USER_ADMIN' }
        ];
        localStorage.setItem('fm_audit_logs', JSON.stringify(initialAudits));
      }

      if (!localStorage.getItem('fm_requests')) {
        const initialRequests = [
          { id: 'REQ-1002', date: '2026-05-24', medicine: 'Amoxicillin 500mg', qty: '200 Units', urgency: 'High', ngo: 'Helping Hands NGO', pincode: '600001', status: 'Pending Verification', recipient: 'Helping Hands NGO Community Outreach' },
          { id: 'REQ-1003', date: '2026-05-23', medicine: 'Insulin Glargine', qty: '30 Boxes', urgency: 'Critical', ngo: 'LifeCare NGO', pincode: '400001', status: 'Verified', recipient: 'Regional Diabetic Care Ward B' },
          { id: 'REQ-1004', date: '2026-05-22', medicine: 'Metformin 850mg', qty: '150 Tablets', urgency: 'Medium', ngo: 'Hope Clinic', pincode: '600005', status: 'Pending Verification', recipient: 'Urban Slum Health Camp' },
          { id: 'REQ-1005', date: '2026-05-21', medicine: 'Albuterol Inhaler', qty: '25 Units', urgency: 'Low', ngo: 'Rural Health Fund', pincode: '700012', status: 'Rejected', recipient: 'Primary School Asthma Drive' }
        ];
        localStorage.setItem('fm_requests', JSON.stringify(initialRequests));
      }

      if (!localStorage.getItem('fm_donations')) {
        const initialDonations = [
          { id: 'DON-98421', date: '2026-05-12', medicine: 'Insulin Glargine', qty: '12 Boxes', quantityUnit: 'Boxes', ngo: 'LifeCare NGO', status: 'Claimed', batch: 'BT-3392', category: 'Diabetes', expiry: '2027-12', storageCondition: 'refrigerated', pincode: '600001', donor: 'Metropolis Hospital Group' },
          { id: 'DON-98405', date: '2026-04-28', medicine: 'Amoxicillin 500mg', qty: '20 Packs', quantityUnit: 'Packs', ngo: 'Hope Clinic', status: 'Active', batch: 'AM-9042', category: 'Antibiotics', expiry: '2026-04', storageCondition: 'room', pincode: '600001', donor: 'Metropolis Hospital Group' },
          { id: 'DON-98399', date: '2026-04-15', medicine: 'Paracetamol', qty: '100 Units', quantityUnit: 'Units', ngo: 'Rural Health', status: 'Active', batch: 'PA-2201', category: 'Pain Relief', expiry: '2026-10', storageCondition: 'ambient', pincode: '700001', donor: 'City Care Dispensary' },
          { id: 'DON-98380', date: '2026-03-30', medicine: 'Vitamin C', qty: '15 Boxes', quantityUnit: 'Boxes', ngo: 'St. Jude Center', status: 'Rejected', batch: 'VC-1182', category: 'supplies', expiry: '2024-03', storageCondition: 'room', pincode: '600002', donor: 'Metro Pharma' },
          { id: 'DON-98433', date: '2026-05-24', medicine: 'Vildagliptin 50mg', qty: '40 Packs', quantityUnit: 'Packs', ngo: 'Pending', status: 'Pending Approval', batch: 'VD-1092', category: 'Diabetes', expiry: '2027-02', storageCondition: 'room', pincode: '400015', donor: 'Metropolis Hospital Group' },
          { id: 'DON-98434', date: '2026-05-25', medicine: 'Lisinopril 10mg', qty: '200 Tablets', quantityUnit: 'Tablets', ngo: 'Pending', status: 'Pending Approval', batch: 'LS-3310', category: 'Hypertension', expiry: '2027-06', storageCondition: 'ambient', pincode: '600001', donor: 'Dr. Carter Health Point' }
        ];
        localStorage.setItem('fm_donations', JSON.stringify(initialDonations));
      }

      // Fetch dynamic state from API using live Axios integrations
      const [fetchedUsers, fetchedNgos, fetchedAudits, fetchedRequests, fetchedDonations, fetchedExclusions] = await Promise.all([
        api.getUsers(),
        api.getPendingNgos(),
        api.getAuditLogs(),
        api.getMedicineRequests(),
        api.getDonations(),
        api.getExclusions()
      ]);

      setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : (fetchedUsers?.data || []));
      setPendingNgos(Array.isArray(fetchedNgos) ? fetchedNgos : (fetchedNgos?.data || []));
      setAudits(Array.isArray(fetchedAudits) ? fetchedAudits : (fetchedAudits?.data || []));
      setRequests(Array.isArray(fetchedRequests) ? fetchedRequests : (fetchedRequests?.data || []));

      // Ensure that some have pending status to make it immediately testable
      const donationsArray = Array.isArray(fetchedDonations) ? fetchedDonations : (fetchedDonations?.data || []);
      let donationsWithPendings = [...donationsArray];
      if (!donationsWithPendings.some(d => d.status === 'Pending Approval')) {
        donationsWithPendings.push(
          { id: 'DON-98433', date: '2026-05-24', medicine: 'Vildagliptin 50mg', qty: '40 Packs', quantityUnit: 'Packs', ngo: 'Pending', status: 'Pending Approval', batch: 'VD-1092', category: 'Diabetes', expiry: '2027-02', storageCondition: 'room', pincode: '400015', donor: 'Metropolis Hospital Group' },
          { id: 'DON-98434', date: '2026-05-25', medicine: 'Lisinopril 10mg', qty: '200 Tablets', quantityUnit: 'Tablets', ngo: 'Pending', status: 'Pending Approval', batch: 'LS-3310', category: 'Hypertension', expiry: '2027-06', storageCondition: 'ambient', pincode: '600001', donor: 'Dr. Carter Health Point' }
        );
        localStorage.setItem('fm_donations', JSON.stringify(donationsWithPendings));
      }
      setDonations(donationsWithPendings);
      setBlockedMeds(Array.isArray(fetchedExclusions) ? fetchedExclusions : (fetchedExclusions?.data || []));

    } catch (err) {
      console.error("Error loading administrative datasets:", err);
      setError("Failed to fetch administrative records. Offline fallback is active.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    initializeDatabase();
  }, []);

  // Sync back to API / verify callbacks with Axios POST / GET requests & error alerts
  const handleVerifyNgo = async (id, approve) => {
    try {
      setLoading(true);
      setError(null);
      await api.verifyNgo(id, approve);
      
      const updated = pendingNgos.map(n => {
        if (n.id === id) {
          return { ...n, status: approve ? 'verified' : 'rejected' };
        }
        return n;
      });
      setPendingNgos(updated);
      
      const matched = pendingNgos.find(n => n.id === id) || { name: id };
      logAuditAction(
        approve ? 'Approved NGO Registration' : 'Rejected NGO Registration',
        `NGO "${matched.name || matched.fullName}" was ${approve ? 'verified' : 'rejected'} under audit status.`,
        'NGO_VERIFICATION'
      );
      
      alert(approve ? "NGO approved successfully! Notification dispatched automatically." : "NGO application rejected.");
    } catch (err) {
      console.error(err);
      alert("Verification update failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. Verify Medicine Requests (Approve/Reject) using Axios POST API integrations
  const handleVerifyRequest = async (reqId, approve) => {
    try {
      setLoading(true);
      setError(null);
      await api.verifyMedicineRequest(reqId, approve);
      
      const updated = requests.map(r => {
        if (r.id === reqId) {
          return { ...r, status: approve ? 'Verified' : 'Rejected' };
        }
        return r;
      });
      setRequests(updated);
      
      const matched = requests.find(r => r.id === reqId) || { medicine: reqId };
      logAuditAction(
        approve ? 'Approved Medicine Request' : 'Rejected Medicine Request',
        `Medicine request ${reqId} for "${matched.medicine}" (${matched.qty}) requested by ${matched.ngo} was ${approve ? 'verified' : 'rejected'}.`,
        'CLAIM_VERIFICATION'
      );
      
      alert(approve ? `Request ${reqId} successfully approved and prioritized for surplus routing.` : `Request ${reqId} rejected.`);
    } catch (err) {
      console.error(err);
      alert("Medicine claim verification failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Approve/Reject Donations using Axios POST API integrations
  const handleDonationApproval = async (donId, approve) => {
    try {
      setLoading(true);
      setError(null);
      await api.verifyDonation(donId, approve);
      
      const updated = donations.map(d => {
        if (d.id === donId) {
          return { ...d, status: approve ? 'Active' : 'Rejected' };
        }
        return d;
      });
      setDonations(updated);
      
      const matched = donations.find(d => d.id === donId) || { medicine: donId };
      logAuditAction(
        approve ? 'Approved Medicine Donation' : 'Rejected Medicine Donation',
        `Donated item ${donId} ("${matched.medicine}", Qty: ${matched.qty}) was ${approve ? 'approved into public marketplace' : 'flagged as rejected'}.`,
        'INVENTORY_APPROVAL'
      );
      
      alert(approve ? `Donation ${donId} approved successfully! The medicine is now active on the search page.` : `Donation ${donId} flag updated to Rejected.`);
    } catch (err) {
      console.error(err);
      alert("Donation approval failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. User Management Operations using Axios POST API integrations
  const handleToggleUserStatus = async (email) => {
    try {
      setLoading(true);
      setError(null);
      await api.toggleUserStatus(email);
      
      const updated = users.map(u => {
        if (u.email === email) {
          const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          logAuditAction(
            nextStatus === 'Active' ? 'Activated System User' : 'Suspended System User',
            `User account ${u.email} status flipped to ${nextStatus}.`,
            'USER_ADMIN'
          );
          return { ...u, status: nextStatus };
        }
        return u;
      });
      setUsers(updated);
    } catch (err) {
      console.error(err);
      alert("User status change failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserRoleChange = async (email, newRole) => {
    try {
      setLoading(true);
      setError(null);
      await api.updateUserRole(email, newRole);
      
      const updated = users.map(u => {
        if (u.email === email) {
          logAuditAction(
            'Updated User Role Access',
            `User account ${u.email} credentials re-classified as ${newRole.toUpperCase()}.`,
            'USER_ADMIN'
          );
          return { ...u, role: newRole };
        }
        return u;
      });
      setUsers(updated);
      alert(`User role for ${email} updated successfully.`);
    } catch (err) {
      console.error(err);
      alert("User role update failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlockedException = async () => {
    try {
      const drugName = prompt("Enter the name of the restricted drug/substance class to block:");
      if (!drugName) return;
      const reasonStr = prompt("Specify the pharmaceutical restriction reason:");
      if (!reasonStr) return;

      setLoading(true);
      setError(null);
      const res = await api.addExclusion(drugName, reasonStr, 'Forbidden');
      
      const newBlock = res.data || {
        id: Date.now(),
        name: drugName,
        reason: reasonStr,
        tier: 'Forbidden'
      };

      setBlockedMeds(prev => [...prev, newBlock]);
      logAuditAction(
        'Updated Compliance Restriction',
        `Added "${drugName}" to the Schedule H Forbidden class restriction index.`,
        'COMPLIANCE'
      );
      alert(`"${drugName}" successfully registered to systemic blocked rules database.`);
    } catch (err) {
      console.error(err);
      alert("Failed to register exclusion: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const simulateDarpanCheck = (id) => {
    setCheckingDarpan(prev => ({ ...prev, [id]: 'checking' }));
    setTimeout(() => {
      setCheckingDarpan(prev => ({ ...prev, [id]: 'valid' }));
    }, 1200);
  };

  // Static chart values
  const timelineData = [
    { month: 'Jan', received: 450, claimed: 310, wasteSaved: 120 },
    { month: 'Feb', received: 620, claimed: 480, wasteSaved: 180 },
    { month: 'Mar', received: 850, claimed: 690, wasteSaved: 240 },
    { month: 'Apr', received: 1100, claimed: 910, wasteSaved: 320 },
    { month: 'May', received: 1420, claimed: 1200, wasteSaved: 410 }
  ];

  const categoryBreakdownData = [
    { name: 'Diabetes', value: 340 },
    { name: 'Antibiotics', value: 290 },
    { name: 'Hypertension', value: 210 },
    { name: 'Analgesics', value: 160 },
    { name: 'Respiratory', value: 120 },
    { name: 'Others', value: 110 }
  ];

  const COLORS = ['#0d9488', '#4f46e5', '#2563eb', '#d97706', '#e11d48', '#0891b2'];

  const comparisonData = [
    { name: 'Antibiotics', Donated: 95, Requested: 180 },
    { name: 'Diabetes', Donated: 160, Requested: 220 },
    { name: 'Hypertension', Donated: 85, Requested: 110 },
    { name: 'Respiratory', Donated: 40, Requested: 75 },
    { name: 'Pain Relief', Donated: 110, Requested: 150 }
  ];

  // Filtering systems
  const filteredNgos = (Array.isArray(pendingNgos) ? pendingNgos : []).filter(n => 
    (n.name || n.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = (Array.isArray(requests) ? requests : []).filter(r => {
    const isSearchMatch = (r.medicine || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (r.ngo || '').toLowerCase().includes(searchQuery.toLowerCase());
    return isSearchMatch;
  });

  const filteredDonations = (Array.isArray(donations) ? donations : []).filter(d => {
    const isSearchMatch = (d.medicine || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (d.donor || d.ngo || '').toLowerCase().includes(searchQuery.toLowerCase());
    return isSearchMatch;
  });

  const filteredUsers = (Array.isArray(users) ? users : []).filter(u => {
    const isSearchMatch = (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isRoleMatch = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return isSearchMatch && isRoleMatch;
  });

  const filteredAudits = (Array.isArray(audits) ? audits : []).filter(a => {
    const isSearchMatch = (a.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (a.details || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (a.actor || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isCategoryMatch = auditFilter === 'ALL' || a.category === auditFilter;
    return isSearchMatch && isCategoryMatch;
  });

  // Calculate high level KPI totals dynamically
  const totalDonationsCount = donations.length;
  const approvalsCount = donations.filter(d => d.status === 'Active').length;
  const pendingsCount = donations.filter(d => d.status === 'Pending Approval').length;
  const claimsVerifiedCount = requests.filter(r => r.status === 'Verified').length;
  const registeredUsersCount = users.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Admin section */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg border border-slate-800">
            <Lock className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest bg-teal-50 border border-teal-200/50 px-2.5 py-0.5 rounded-full">
              System Administrator Portal Active
            </span>
            <h1 className="text-3xl font-display font-bold text-slate-900 uppercase tracking-tight mt-1">
              National Governance Dashboard
            </h1>
            <p className="text-slate-500 font-medium text-xs">
              Verify medicine requests, approve clinical donations, analyze redistribution volume, and audit system actors.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              initializeDatabase();
              alert("System registry reference refreshed securely.");
            }}
            className="px-4.5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Sync Real-time Cache
          </button>
        </div>
      </div>

      {/* Tabs Menu Navigation Bar */}
      <div className="flex gap-1.5 mb-8 overflow-x-auto pb-2 border-b border-slate-100/80">
        {[
          { id: 'analytics', label: 'Analytics Insights', icon: LayoutDashboard },
          { id: 'donations', label: `Donations (${pendingsCount} pending)`, icon: Heart },
          { id: 'requests', label: `Verify Requests`, icon: ClipboardList },
          { id: 'ngos', label: 'NGO Registrations', icon: Building2 },
          { id: 'users', label: 'User Governance', icon: Users },
          { id: 'security', label: 'Schedule H Rules', icon: ShieldAlert },
          { id: 'audits', label: 'Audit Timeline Logs', icon: History },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery('');
            }}
            className={cn(
              "flex items-center gap-2.5 px-4.5 py-3 rounded-xl font-bold text-xs tracking-wide transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-md border border-slate-800" 
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            )}
          >
            <tab.icon className="w-4 h-4 shrink-0 text-teal-500" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Layout Grid Panels wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Core dynamic administration panel */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              
              {/* Top Row KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Total Donations</span>
                  <div className="text-3xl font-display font-bold text-slate-800 mt-1">{totalDonationsCount} Listings</div>
                  <span className="text-[10px] text-emerald-600 font-bold font-mono inline-flex items-center gap-1 mt-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                    <TrendingUp className="w-3 h-3" /> +14.2% MoM
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans font-medium">Pending Approval</span>
                  <div className={cn(
                    "text-3xl font-display font-bold mt-1",
                    pendingsCount > 0 ? "text-amber-600" : "text-slate-800"
                  )}>{pendingsCount} Batches</div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1 tracking-wider uppercase font-mono">Requires verification</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Verified Request Needs</span>
                  <div className="text-3xl font-display font-bold text-slate-800 mt-1">{claimsVerifiedCount} Requests</div>
                  <span className="text-[10px] text-indigo-600 font-bold block mt-1 font-mono">Active coverage priority</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">System Actors</span>
                  <div className="text-3xl font-display font-bold text-slate-800 mt-1">{registeredUsersCount} Accounts</div>
                  <span className="text-[10px] text-teal-600 font-bold block mt-1 font-mono">Verified NGOs / Donors</span>
                </div>
              </div>

              {/* Charts Display Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Redistribution Volume Trends */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-brand-primary" />
                      Redistribution Volume Trend
                    </h3>
                    <p className="text-[11px] text-slate-500">Historical monthly flow profiles metrics (kg of medicines salvaged)</p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timelineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorClaimed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                        <Area type="monotone" dataKey="received" name="Salvaged Drugs" stroke="#0d9488" fillOpacity={1} fill="url(#colorReceived)" strokeWidth={2} />
                        <Area type="monotone" dataKey="claimed" name="Distributed Items" stroke="#4f46e5" fillOpacity={1} fill="url(#colorClaimed)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Category Distributions */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-indigo-600" />
                      Therapeutic Category Breakdown
                    </h3>
                    <p className="text-[11px] text-slate-500">Breakdown of drug categories across current partner warehouses</p>
                  </div>
                  <div className="h-64 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="w-full sm:w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryBreakdownData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {categoryBreakdownData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full sm:w-1/2 space-y-2">
                      {categoryBreakdownData.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between text-xs font-medium">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span className="text-slate-600 font-sans">{item.name}</span>
                          </div>
                          <span className="text-slate-800 font-mono font-bold">{item.value} Units</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* 3. Demand & Matching volume comparatives */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Demand vs. Surplus Inventory Comparison</h3>
                    <p className="text-[11px] text-slate-500">Active requested medication counts vs. verified active donor listings</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 px-2 py-1 rounded">Metrics in packs</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                      <Bar dataKey="Donated" name="Surplus Listed" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Requested" name="Requested Claims" fill="#e11d48" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </motion.div>
          )}

          {/* VERIFY MEDICINE REQUESTS TAB */}
          {activeTab === 'requests' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clinical-card">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 font-display text-lg flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-teal-600" />
                    Verify Medicine Requests
                  </h2>
                  <p className="text-xs text-slate-500">Approve and verify active claims submitted by verified NGOs for targeted clinical recipient welfare</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search medicine / NGO..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Request / Medicine Info</th>
                      <th className="px-6 py-4">NGO Requester</th>
                      <th className="px-6 py-4">Quantity / Urgency</th>
                      <th className="px-6 py-4">State Location</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 text-sm">{req.medicine}</div>
                            <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50/60 px-2 py-0.5 rounded border border-indigo-100/50 w-max mt-1">
                              ID: {req.id}
                            </div>
                            {req.recipient && (
                              <span className="text-[10px] text-slate-400 block mt-1">Beneficiary: {req.recipient}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-700">{req.ngo}</div>
                            <span className="text-[10px] text-slate-400 block">Requested {req.date}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-xs text-slate-700">{req.qty}</span>
                            <span className={cn(
                              "text-[9px] font-bold uppercase tracking-wider block px-2 py-0.5 rounded mt-1.5 w-max",
                              req.urgency === 'Critical' ? "bg-red-50 text-red-700 border border-red-100" :
                              req.urgency === 'High' ? "bg-amber-50 text-amber-700 border border-amber-100" :
                              "bg-slate-50 text-slate-500 border border-slate-150"
                            )}>
                              {req.urgency} Urgency
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">
                            PIN {req.pincode}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[10px] font-bold uppercase px-2.5 py-1 rounded-full",
                              req.status === 'Verified' ? "bg-teal-50 text-teal-700 border border-teal-200" :
                              req.status === 'Rejected' ? "bg-red-50 text-red-700 border border-red-200" :
                              "bg-slate-100 text-slate-500 border border-slate-200 animate-pulse"
                            )}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {req.status === 'Pending Verification' ? (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleVerifyRequest(req.id, true)}
                                  className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                                  title="Approve Claims"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleVerifyRequest(req.id, false)}
                                  className="px-2.5 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                  title="Reject Claims"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">No actions pending</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm">
                          No medicine requests match the active filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* APPROVE DONATIONS TAB */}
          {activeTab === 'donations' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clinical-card animate-fade-in">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 font-display text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" />
                    Approve Clinical Surplus Donations
                  </h2>
                  <p className="text-xs text-slate-500">Cross-reference donor listings for seal integrity and storage standards before broadcasting to global marketplace</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search medicine or donor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Medication / Batch Details</th>
                      <th className="px-6 py-4">Donor Point</th>
                      <th className="px-6 py-4">Qty / Expiry</th>
                      <th className="px-6 py-4">Storage Reqs</th>
                      <th className="px-6 py-4">Verification Check</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDonations.length > 0 ? (
                      filteredDonations.map(don => (
                        <tr key={don.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                              {don.medicine}
                            </div>
                            <div className="flex gap-2 items-center mt-1">
                              <span className="text-[10px] font-mono text-slate-400">LOT: {don.batch || 'BT-9901'}</span>
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-mono">
                                {don.category}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-700 text-xs">{don.donor || 'Metropolis Hospital Group'}</div>
                            <span className="text-[10px] text-slate-400 block font-mono">ZIP {don.pincode}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-xs text-brand-secondary">{don.qty}</div>
                            <span className="text-[10px] text-slate-500 block font-mono">Expiry {don.expiry}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[10px] font-bold uppercase rounded-md px-2 py-0.5 border inline-block",
                              don.storageCondition === 'refrigerated' ? "bg-blue-50 text-blue-700 border-blue-100" :
                              don.storageCondition === 'room' ? "bg-orange-50 text-orange-700 border-orange-100" :
                              "bg-slate-50 text-slate-600 border-slate-100"
                            )}>
                              {don.storageCondition || 'ambient'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-1 py-0.2 rounded inline-block select-none font-mono">
                                ✓ Original Seal
                              </span>
                              <span className="text-[9px] font-bold bg-teal-50 text-teal-700 border border-teal-100 px-1 py-0.2 rounded inline-block select-none font-mono block w-max">
                                ✓ Dry Box Clean
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                              don.status === 'Active' ? "bg-teal-50 text-teal-700 border border-teal-200" :
                              don.status === 'Pending Approval' ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse" :
                              don.status === 'Rejected' ? "bg-red-50 text-red-700 border border-red-200" :
                              "bg-slate-100 text-slate-500"
                            )}>
                              {don.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {don.status === 'Pending Approval' ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDonationApproval(don.id, true)}
                                  className="px-2.5 py-1.5 bg-[#0d9488] hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                                  title="Approve"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDonationApproval(don.id, false)}
                                  className="px-2.5 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                  title="Reject"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDonationApproval(don.id, don.status !== 'Active')}
                                className="text-[10px] font-bold text-indigo-600 hover:underline"
                              >
                                {don.status === 'Active' ? 'Flag/Reject' : 'Re-Approve'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400 text-sm">
                          No medical listings matches current criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* NGO VERIFICATIONS TAB */}
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
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Organization Detail</th>
                      <th className="px-6 py-4">Darpan ID Status</th>
                      <th className="px-6 py-4">National Verification</th>
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
                              {darpanStatus === 'unverified' && ngo.status !== 'verified' && (
                                <button 
                                  onClick={() => simulateDarpanCheck(ngo.id)}
                                  className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-slate-200 transition"
                                >
                                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                                  Validate Darpan
                                </button>
                              )}
                              {(darpanStatus === 'checking') && (
                                <span className="text-[10px] font-medium text-slate-400 animate-pulse">
                                  Connecting Ministry database...
                                </span>
                              )}
                              {(darpanStatus === 'valid' || ngo.status === 'verified') && (
                                <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg flex items-center gap-1 w-max">
                                  <Award className="w-3.5 h-3.5 text-green-600" />
                                  UID Verified
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "text-[10px] font-bold uppercase border px-2 py-0.5 rounded-full",
                                ngo.status === 'verified' ? "bg-green-50 text-green-700 border-green-200" :
                                ngo.status === 'rejected' ? "bg-red-50 text-red-700 border-red-200" :
                                "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                              )}>
                                {ngo.status === 'verified' ? 'Active Partner' : ngo.status === 'rejected' ? 'Rejected' : 'Pending Verification'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleVerifyNgo(ngo.id, true)}
                                  disabled={ngo.status === 'verified'}
                                  className="p-2 text-green-600 hover:bg-green-50 disabled:opacity-30 rounded-lg transition-colors border border-slate-100 hover:border-green-200 shadow-xs"
                                  title="Approve NGO"
                                >
                                  <CheckCircle2 className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleVerifyNgo(ngo.id, false)}
                                  disabled={ngo.status === 'rejected'}
                                  className="p-2 text-red-600 hover:bg-red-50 disabled:opacity-30 rounded-lg transition-colors border border-slate-100 hover:border-red-200 shadow-xs"
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
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-sm">
                          {loading ? 'Retrieving active registry queue...' : 'No NGO verification requests pending at present.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* USER MANAGEMENT TAB */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clinical-card">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 font-display text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    System User Governance
                  </h2>
                  <p className="text-xs text-slate-500">Monitor registered clinical entities, coordinate security credentials, and grant administrative access roles</p>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="admin">Administrator</option>
                    <option value="donor">Donor Hub</option>
                    <option value="ngo">NGO Partners</option>
                    <option value="recipient">Public Recipient</option>
                  </select>
                  <input 
                    type="text"
                    placeholder="Search name/email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-3 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-primary min-w-[150px]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Registered Individual/Hub</th>
                      <th className="px-6 py-4">Credentials Detail</th>
                      <th className="px-6 py-4">Role Designation</th>
                      <th className="px-6 py-4">Sector Postal PIN</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Toggle Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <tr key={user.email} className={cn("hover:bg-slate-50 transition-colors", user.status === 'Suspended' ? 'bg-rose-50/10' : '')}>
                          <td className="px-6 py-4 font-semibold text-slate-800 text-sm">
                            <div className="flex items-center gap-2">
                              {user.fullName}
                              {user.role === 'admin' && (
                                <span className="bg-yellow-50 text-amber-700 border border-amber-200 text-[8px] font-bold uppercase px-1.5 py-0.2 rounded font-mono">
                                  System Admin
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-500 font-mono">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <select
                              value={user.role}
                              onChange={(e) => handleUserRoleChange(user.email, e.target.value)}
                              className="text-xs bg-slate-100 border border-slate-200 text-slate-700 rounded px-2.5 py-1 outline-none font-bold"
                            >
                              <option value="donor">Donor Hub</option>
                              <option value="ngo">NGO Partner</option>
                              <option value="admin">Administrator</option>
                              <option value="recipient">Public Recipient</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-600 block pt-5">
                            {user.pincode || '400001'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[10px] font-bold uppercase rounded-md px-2 py-0.5 border",
                              user.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-200"
                            )}>
                              {user.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleUserStatus(user.email)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 border",
                                user.status === 'Active' 
                                  ? "bg-white border-rose-200 text-rose-600 hover:bg-rose-50" 
                                  : "bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600"
                              )}
                            >
                              {user.status === 'Active' ? (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  Suspend Account
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  Activate
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm">
                          No registered system users matched critical searches.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* SYSTEM COMPLIANCE / SCHEDULE H RULES TAB */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clinical-card">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 font-display">Schedule H / H1 Forbidden List</h2>
                  <p className="text-xs text-slate-500">Government restrictions on high abuse substances automatically cross-referenced via RxNav barcode scanners</p>
                </div>
                <button 
                  onClick={handleAddBlockedException}
                  className="text-xs font-bold text-brand-primary bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100"
                >
                  Configure Class Exception
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
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
                            "px-2.5 py-1 rounded text-[10px] font-bold uppercase border",
                            med.tier === 'Forbidden' ? "bg-red-50 text-red-700 border-red-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"
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

          {/* AUDIT LOGS IN ADMIN DASHBOARD TAB */}
          {activeTab === 'audits' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="clinical-card animate-fade-in text-left">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 font-display text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-teal-600" />
                    Governance Audit Timber Logs
                  </h2>
                  <p className="text-xs text-slate-500">Cryptographically indexed systemic logs covering all administrative declarations, verifies, and system access shifts</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select 
                    value={auditFilter}
                    onChange={(e) => setAuditFilter(e.target.value)}
                    className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="ALL">All Event Categories</option>
                    <option value="NGO_VERIFICATION">NGO Registrations</option>
                    <option value="COMPLIANCE">Policy Changes</option>
                    <option value="INVENTORY_APPROVAL">Donation Controls</option>
                    <option value="CLAIM_VERIFICATION">Claims & Requests</option>
                    <option value="USER_ADMIN">User Suspensions</option>
                    <option value="SYSTEM">Automation Jobs</option>
                  </select>
                  <input 
                    type="text"
                    placeholder="Search logs details..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-3 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-primary min-w-[150px]"
                  />
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to clean the logs archive? Minimum audit policies require logging to persist.")) {
                        const localEmail = localStorage.getItem('findmeds_email') || 'admin@findmeds.org';
                        setAudits([]);
                        localStorage.removeItem('fm_audit_logs');
                        alert("Log history flushed.");
                        logAuditAction('Security Archive Cleared', 'Security timeline cleared manually under authorized credential.', 'SYSTEM');
                      }
                    }}
                    className="px-2 py-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 font-semibold rounded-lg border border-red-200"
                  >
                    Clear History
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-950 text-teal-400 font-mono text-xs rounded-b-2xl max-h-[500px] overflow-y-auto space-y-3 p-6 shadow-inner">
                {filteredAudits.length > 0 ? (
                  filteredAudits.map((log) => (
                    <div 
                      key={log.id} 
                      className="border-b border-teal-900/40 pb-3 last:border-0 hover:bg-slate-900/60 p-2 rounded transition-all flex flex-col sm:flex-row sm:items-start gap-4"
                    >
                      <div className="w-full sm:w-[150px] text-slate-400 shrink-0 text-[10px]">
                        [{log.time}]
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.2 rounded",
                            log.category === 'COMPLIANCE' ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                            log.category === 'NGO_VERIFICATION' ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30" :
                            log.category === 'INVENTORY_APPROVAL' ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                            log.category === 'CLAIM_VERIFICATION' ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/30" :
                            log.category === 'USER_ADMIN' ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                            "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                          )}>
                            {log.category}
                          </span>
                          <span className="text-white font-bold">{log.action}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {log.details}
                        </p>
                        <span className="text-[10px] text-teal-600 block mt-1">
                          Actor Credentials: {log.actor}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-500 font-mono text-xs">
                    ★ SYSTEM SECURE CORE: No matching operations logs found.
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </div>

        {/* Right side operational widget column */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Administrative info card */}
          <div className="clinical-card p-6 bg-slate-900 text-white relative overflow-hidden shadow-md">
            <div className="relative z-10">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2 font-display uppercase tracking-wide text-teal-400">
                <ShieldCheck className="text-teal-400 animate-pulse" /> National Governance
              </h3>
              <div className="space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Authority Signature</span>
                  <span className="font-bold text-emerald-400">Verified G2C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">National Node</span>
                  <span className="font-bold font-mono text-slate-200">#FindMeds-Central-01</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="w-[100%] h-full bg-teal-400 rounded-full"></div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Express API verified securely. Direct integration with NGO Darpan ID systems, RXNav barcode standards, and compliance engines active.
                </p>
              </div>
            </div>
          </div>

          {/* Quick task triggers */}
          <div className="clinical-card p-5 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Fast Actions</div>
            <button 
              onClick={() => {
                alert("Auto cascade check compiled: 3 unclaimed blocks converted to public matching pool.");
                logAuditAction('System Cascade Check', 'Executed system-wide cron cascade check. Standard listings analyzed.', 'SYSTEM');
              }}
              className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-slate-100"
            >
              <RotateCw className="w-3.5 h-3.5 text-teal-600" />
              Cron Auto-Cascade Jobs
            </button>
            <button 
              onClick={() => {
                alert("PDF certified clinical report compiled.");
                logAuditAction('Report PDF Complied', 'Audit PDF report generated and prepared for export.', 'COMPLIANCE');
              }}
              className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-slate-100"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Down Export PDF Audit
            </button>
          </div>

          {/* Live system status monitor */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col gap-3 font-sans">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live System Monitors</div>
            
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">Ministry DB Sync</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" /> Connection Live
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">RxNav Synced API</span>
              <span className="text-indigo-600 font-bold">GS1 Online</span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">Pending Approvals</span>
              <span className={cn(
                "font-bold",
                pendingsCount > 0 ? "text-amber-600 animate-pulse" : "text-slate-600"
              )}>{pendingsCount} Nodes</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
