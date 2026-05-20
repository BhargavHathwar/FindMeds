import axios from 'axios';

// The default URL for the backend Node.js API
export const DEFAULT_API_BASE = 'http://localhost:5001/api';

export function getApiBaseUrl() {
  return localStorage.getItem('findmeds_api_url') || DEFAULT_API_BASE;
}

export function setApiBaseUrl(url) {
  if (url) {
    localStorage.setItem('findmeds_api_url', url);
  } else {
    localStorage.removeItem('findmeds_api_url');
  }
}

// Generate Authorization header with the JWT token
function getAuthHeaders() {
  const token = localStorage.getItem('findmeds_id_token') || 'demo-mock-jwt-token-123';
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
}

// Helper to determine whether we are using local fallback
let backendConnected = false;
export function isBackendConnected() {
  return backendConnected;
}

// Global logger helper
function logApiCall(method, endpoint, success, dataOrError) {
  console.log(`[API ${method}] ${endpoint} | Success: ${success}`, dataOrError);
}

// --- INITIALIZE STORAGE DEMO DATA ---
if (!localStorage.getItem('fm_initialized_db')) {
  localStorage.setItem('fm_donations', JSON.stringify([
    { id: 'DON-98421', date: '2026-05-12', medicine: 'Insulin Glargine', qty: '12 Boxes', quantityUnit: 'Boxes', ngo: 'LifeCare NGO', status: 'Claimed', batch: 'BT-3392', category: 'Diabetes', expiry: '2025-12', storageCondition: 'refrigerated', pincode: '600001' },
    { id: 'DON-98405', date: '2026-04-28', medicine: 'Amoxicillin 500mg', qty: '20 Packs', quantityUnit: 'Packs', ngo: 'Hope Clinic', status: 'Donated', batch: 'AM-9042', category: 'Antibiotics', expiry: '2026-04', storageCondition: 'room', pincode: '600001' },
    { id: 'DON-98399', date: '2026-04-15', medicine: 'Paracetamol', qty: '100 Units', quantityUnit: 'Units', ngo: 'Rural Health', status: 'Donated', batch: 'PA-2201', category: 'analgesics', expiry: '2026-10', storageCondition: 'ambient', pincode: '700001' },
    { id: 'DON-98380', date: '2026-03-30', medicine: 'Vitamin C', qty: '15 Boxes', quantityUnit: 'Boxes', ngo: 'St. Jude Center', status: 'Rejected', batch: 'VC-1182', category: 'supplies', expiry: '2024-03', storageCondition: 'room', pincode: '600002' },
  ]));

  localStorage.setItem('fm_ngos', JSON.stringify([
    { id: 'ngo1', name: 'LifeCare NGO', location: 'South District, Mumbai', email: 'lifecare@ngo.org', status: 'verified', wishlist: ['Insulin', 'Metformin'] },
    { id: 'ngo2', name: 'Hope Clinic', location: 'Bandstand, Mumbai', email: 'hope@clinic.org', status: 'verified', wishlist: ['Amoxicillin', 'Azithromycin'] },
    { id: 'ngo3', name: 'Rural Health Fund', location: 'Palghar Rural', email: 'rural@health.org', status: 'pending', wishlist: ['Paracetamol'] },
  ]));

  localStorage.setItem('fm_initialized_db', 'true');
}

// Safe wrapper to call live API with fallback to offline local storage
async function requestWithFallback(method, url, data = null, needsAuth = true, storageKey = null, defaultStatic = []) {
  const finalUrl = `${getApiBaseUrl()}${url}`;
  try {
    const config = needsAuth ? getAuthHeaders() : { headers: { 'Content-Type': 'application/json' } };
    let response;
    
    if (method === 'GET') {
      response = await axios.get(finalUrl, config);
    } else if (method === 'POST') {
      response = await axios.post(finalUrl, data, config);
    } else if (method === 'PUT') {
      response = await axios.put(finalUrl, data, config);
    } else if (method === 'DELETE') {
      response = await axios.delete(finalUrl, config);
    }
    
    backendConnected = true;
    logApiCall(method, url, true, response.data);
    return response.data;
  } catch (err) {
    backendConnected = false;
    console.warn(`[API FAILOVER] Unreachable live endpoint ${finalUrl}. Using client preview state instead.`, err.message);
    
    // Fallback actions on storage keys
    if (storageKey) {
      const offlineData = JSON.parse(localStorage.getItem(storageKey)) || defaultStatic;
      
      if (method === 'POST' && data && !data.id) {
        const itemWithId = { 
          id: `DON-${Math.floor(10000 + Math.random() * 90000)}`, 
          date: new Date().toISOString().split('T')[0],
          status: 'Donated',
          ...data 
        };
        offlineData.unshift(itemWithId);
        localStorage.setItem(storageKey, JSON.stringify(offlineData));
        return { success: true, message: "Registered offline under preview state.", data: itemWithId };
      }
      
      if (method === 'DELETE') {
        const parts = url.split('/');
        const idToDelete = parts[parts.length - 1];
        const updated = offlineData.filter(item => item.id !== idToDelete);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return { success: true, message: "Listing cancelled offline." };
      }

      return { success: true, fallback: true, data: offlineData };
    }

    // Generic fallbacks for specific known routes
    if (url.includes('/auth/me')) {
      const localProfile = JSON.parse(localStorage.getItem('findmeds_profile')) || {
        fullName: 'Metropolis Hospital Group',
        email: 'donor@example.com',
        role: 'donor',
        pincode: '400001'
      };
      return { success: true, user: localProfile };
    }

    if (url.includes('/analytics/donor')) {
      return {
        success: true,
        stats: {
          totalDonations: 1280,
          ngosServed: 42,
          impactValue: 84500,
          pendingClaims: 18,
          livesImpacted: 14200,
          medicineSavedKg: '850kg'
        }
      };
    }

    if (url.includes('/analytics/summary')) {
      return {
        success: true,
        summary: {
          totalDonated: 4920,
          activeClaims: 320,
          registeredNgos: 24,
          verifiedVolume: '2,920 kg',
          pendingVerificationNgos: 1
        }
      };
    }

    if (url.includes('/barcode')) {
      // Barcode mock response for demoing RxNav API gateway
      return {
        success: true,
        medicineName: 'Paracetamol 500mg',
        manufacturer: 'Cipla Ltd',
        expiry: '2026-12',
        batchNumber: 'BT-9921',
        category: 'analgesics'
      };
    }

    return { success: true, fallback: true, data: defaultStatic };
  }
}

// --- MODULE ENDPOINTS ---

export const api = {
  // Auth
  async register(fullName, email, password, role, pincode) {
    const data = { uid: `uid-${Date.now()}`, fullName, email, password, role, pincode };
    try {
      const response = await axios.post(`${getApiBaseUrl()}/auth/register`, data);
      localStorage.setItem('findmeds_id_token', `token-${data.uid}`);
      localStorage.setItem('findmeds_profile', JSON.stringify({ fullName, email, role, pincode }));
      return response.data;
    } catch (err) {
      console.warn("Register live fail. Storing local preview profile.", err.message);
      localStorage.setItem('findmeds_id_token', 'offline-session-token');
      localStorage.setItem('findmeds_profile', JSON.stringify({ fullName, email, role, pincode }));
      return { success: true, message: "Offline preview profile loaded." };
    }
  },

  async login(email, password) {
    // Simply fetch me as login simulator
    localStorage.setItem('findmeds_email', email);
    let demoRole = 'donor';
    if (email.includes('ngo')) demoRole = 'ngo';
    if (email.includes('admin')) demoRole = 'admin';

    localStorage.setItem('findmeds_id_token', `demo-token-${demoRole}`);
    localStorage.setItem('findmeds_profile', JSON.stringify({
      fullName: demoRole === 'donor' ? 'Metropolis Pharma Group' : demoRole === 'ngo' ? 'Community Medicine NGO' : 'Global Admin Hub',
      email,
      role: demoRole,
      pincode: '400001'
    }));

    try {
      const response = await axios.get(`${getApiBaseUrl()}/auth/me`, getAuthHeaders());
      return response.data;
    } catch (err) {
      return {
        success: true,
        user: { email, role: demoRole, fullName: demoRole === 'donor' ? 'Metropolis Pharma Group' : demoRole === 'ngo' ? 'Community Medicine NGO' : 'Global Admin Hub' }
      };
    }
  },

  async getMe() {
    return requestWithFallback('GET', '/auth/me');
  },

  async saveFcmToken(token) {
    return requestWithFallback('POST', '/auth/fcm-token', { token });
  },

  // Barcode Lookup
  async lookupBarcode(barcode) {
    return requestWithFallback('GET', `/barcode/${barcode}`);
  },

  // Donations Listing & Management
  async getDonations() {
    const res = await requestWithFallback('GET', '/donations/browse', null, false, 'fm_donations', []);
    return res.data || res;
  },

  async listDonation(donationData) {
    return requestWithFallback('POST', '/donations/list', donationData, true, 'fm_donations');
  },

  async getMyListings() {
    const res = await requestWithFallback('GET', '/donations/my-listings', null, true, 'fm_donations');
    return res?.data || res || [];
  },

  async deleteDonation(id) {
    return requestWithFallback('DELETE', `/donations/${id}`, null, true, 'fm_donations');
  },

  async getMatches(id) {
    return requestWithFallback('GET', `/donations/match/${id}`);
  },

  async claimDonation(id, ngoDetails = {}) {
    try {
      const res = await axios.post(`${getApiBaseUrl()}/donations/claim/${id}`, ngoDetails, getAuthHeaders());
      return res.data;
    } catch (err) {
      // Modify active item in offline db
      const list = JSON.parse(localStorage.getItem('fm_donations')) || [];
      const updated = list.map(item => {
        if (item.id === id) {
          return { ...item, status: 'Claimed', ngo: ngoDetails.name || 'Your NGO Recipient' };
        }
        return item;
      });
      localStorage.setItem('fm_donations', JSON.stringify(updated));
      return { success: true, message: "Claimed successfully under offline preview mode." };
    }
  },

  // NGO Endpoints
  async getAllNgos() {
    const res = await requestWithFallback('GET', '/ngo/all', null, false, 'fm_ngos', []);
    return res.data || res;
  },

  async getNgoDashboard() {
    return requestWithFallback('GET', '/ngo/dashboard', null, true);
  },

  async updateWishlist(wishlistArray) {
    try {
      const res = await axios.put(`${getApiBaseUrl()}/ngo/wishlist`, { wishlist: wishlistArray }, getAuthHeaders());
      return res.data;
    } catch (err) {
      const profile = JSON.parse(localStorage.getItem('findmeds_profile')) || {};
      profile.wishlist = wishlistArray;
      localStorage.setItem('findmeds_profile', JSON.stringify(profile));
      return { success: true, message: "Wishlist updated offline." };
    }
  },

  async getPendingNgos() {
    return requestWithFallback('GET', '/ngo/pending', null, true, 'fm_ngos');
  },

  async verifyNgo(ngoId, approve) {
    try {
      const res = await axios.post(`${getApiBaseUrl()}/ngo/verify/${ngoId}`, { approve }, getAuthHeaders());
      return res.data;
    } catch (err) {
      const ngos = JSON.parse(localStorage.getItem('fm_ngos')) || [];
      const updated = ngos.map(n => {
        if (n.id === ngoId) {
          return { ...n, status: approve ? 'verified' : 'rejected' };
        }
        return n;
      });
      localStorage.setItem('fm_ngos', JSON.stringify(updated));
      return { success: true, message: "NGO verification status updated on preview engine." };
    }
  },

  // Notifications Fallback
  async notifyNgos(payload) {
    return requestWithFallback('POST', '/notifications/notify-ngos', payload);
  },

  // Dashboard Analytics
  async getDonorStats() {
    const res = await requestWithFallback('GET', '/analytics/donor', null, true);
    return res.stats || res;
  },

  async getAdminStats() {
    const res = await requestWithFallback('GET', '/analytics/summary', null, true);
    return res.summary || res;
  }
};
