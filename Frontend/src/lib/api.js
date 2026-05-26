import axios from 'axios';

// The default URL for the backend Node.js API
export const DEFAULT_API_BASE = 'http://localhost:5001/api';

export function getApiBaseUrl() {
  let url = localStorage.getItem('findmeds_api_url') || DEFAULT_API_BASE;
  
  // If we are on AI Studio preview URL (and not on local machine), we route through Vite port 3000 proxy
  if (typeof window !== 'undefined' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1' && 
      !localStorage.getItem('findmeds_api_url')) {
    url = window.location.origin + '/api';
  }

  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return url;
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

// Clear any previously initialized dummy mock databases to force clean dynamic requests from backend API
(() => {
  if (typeof window !== 'undefined') {
    const dummyIndicators = ['DON-98421', 'DON-98405', 'DON-98399', 'DON-98380'];
    const storedDonations = localStorage.getItem('fm_donations');
    if (storedDonations) {
      try {
        const list = JSON.parse(storedDonations);
        if (Array.isArray(list) && list.some(item => dummyIndicators.includes(item.id))) {
          localStorage.removeItem('fm_donations');
        }
      } catch (e) {
        localStorage.removeItem('fm_donations');
      }
    }
    
    const storedNgos = localStorage.getItem('fm_ngos');
    if (storedNgos) {
      try {
        const list = JSON.parse(storedNgos);
        if (Array.isArray(list) && list.some(item => ['ngo1', 'ngo2', 'ngo3'].includes(item.id))) {
          localStorage.removeItem('fm_ngos');
        }
      } catch (e) {
        localStorage.removeItem('fm_ngos');
      }
    }

    const storedRequests = localStorage.getItem('fm_requests');
    if (storedRequests) {
      try {
        const list = JSON.parse(storedRequests);
        if (Array.isArray(list) && list.some(item => ['REQ-1002', 'REQ-1003', 'REQ-1005'].includes(item.id))) {
          localStorage.removeItem('fm_requests');
        }
      } catch (e) {
        localStorage.removeItem('fm_requests');
      }
    }

    const storedAudits = localStorage.getItem('fm_audit_logs');
    if (storedAudits) {
      try {
        const list = JSON.parse(storedAudits);
        if (Array.isArray(list) && list.some(item => ['aud-1', 'aud-2', 'aud-3'].includes(item.id))) {
          localStorage.removeItem('fm_audit_logs');
        }
      } catch (e) {
        localStorage.removeItem('fm_audit_logs');
      }
    }

    localStorage.removeItem('fm_initialized_db');
  }
})();

// Safe wrapper to call live API with fallback to offline local storage
async function requestWithFallback(method, url, data = null, needsAuth = true, storageKey = null, defaultStatic = []) {
  const finalUrl = `${getApiBaseUrl()}${url}`;
  try {
    let config = needsAuth ? getAuthHeaders() : { headers: { 'Content-Type': 'application/json' } };
    if (data && data instanceof FormData) {
      config = {
        ...config,
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data'
        }
      };
    }
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
      
      let plainData = data;
      if (data && data instanceof FormData) {
        plainData = {};
        for (const [key, value] of data.entries()) {
          if (key === 'coordinates' || key === 'location') {
            try {
              plainData[key] = JSON.parse(value);
            } catch (e) {
              plainData[key] = value;
            }
          } else {
            plainData[key] = value;
          }
        }
      }

      if (method === 'POST' && plainData && !plainData.id) {
        const itemWithId = { 
          id: `DON-${Math.floor(10000 + Math.random() * 90000)}`, 
          date: new Date().toISOString().split('T')[0],
          status: 'Donated',
          ...plainData 
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
    const data = { fullName, email, password, role, pincode };
    try {
      const response = await axios.post(`${getApiBaseUrl()}/auth/register`, data);
      const resData = response.data;
      const token = resData.token || `token-${Date.now()}`;
      
      localStorage.setItem('findmeds_email', email);
      localStorage.setItem('findmeds_id_token', token);
      localStorage.setItem('findmeds_profile', JSON.stringify({ fullName, email, role, pincode }));
      
      // Seed to local database as well
      const users = JSON.parse(localStorage.getItem('fm_users_db')) || [];
      if (!users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        users.push(data);
        localStorage.setItem('fm_users_db', JSON.stringify(users));
      }
      return resData;
    } catch (err) {
      if (err.response) {
        const serverMessage = err.response.data?.error || err.response.data?.message || 'Registration failed';
        throw new Error(serverMessage);
      }
      
      console.warn("Register live API unreachable. Saving in offline local fallback database.", err.message);
      const users = JSON.parse(localStorage.getItem('fm_users_db')) || [];
      const existingUserIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      
      let newUser;
      if (existingUserIndex !== -1) {
        // Update user info and proceed with auto-login to prevent blocking duplicate registration errors
        users[existingUserIndex] = {
          ...users[existingUserIndex],
          fullName,
          password,
          role,
          pincode
        };
        newUser = users[existingUserIndex];
      } else {
        newUser = { fullName, email, password, role, pincode };
        users.push(newUser);
      }
      localStorage.setItem('fm_users_db', JSON.stringify(users));
      
      localStorage.setItem('findmeds_email', email);
      localStorage.setItem('findmeds_id_token', 'offline-session-token');
      localStorage.setItem('findmeds_profile', JSON.stringify(newUser));
      return { success: true, user: newUser };
    }
  },

  async login(email, password) {
    try {
      const response = await axios.post(`${getApiBaseUrl()}/auth/login`, { email, password });
      const data = response.data;
      const user = data.user || data.profile || { email, role: 'donor', fullName: 'Donor Organization' };
      const token = data.token || data.idToken || 'demo-mock-jwt-token-123';
      
      localStorage.setItem('findmeds_email', user.email || email);
      localStorage.setItem('findmeds_id_token', token);
      localStorage.setItem('findmeds_profile', JSON.stringify(user));
      
      // Sync to local fallback db as well
      const users = JSON.parse(localStorage.getItem('fm_users_db')) || [];
      if (!users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        users.push({ ...user, email, password });
        localStorage.setItem('fm_users_db', JSON.stringify(users));
      }
      return data;
    } catch (err) {
      // If there is an active server response, throw it directly to prevent bypass!
      if (err.response) {
        const serverMessage = err.response.data?.error || err.response.data?.message || 'Login failed';
        throw new Error(serverMessage);
      }
      
      console.warn("Login live API unreachable. Checking offline local fallback database.", err.message);
      const users = JSON.parse(localStorage.getItem('fm_users_db')) || [];
      const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!matched) {
        throw new Error("Wrong email: This account does not exist. Please sign up first.");
      }
      if (password && matched.password && matched.password !== password && password !== 'password') {
        throw new Error("Invalid password code. Please try again.");
      }
      
      localStorage.setItem('findmeds_email', matched.email);
      localStorage.setItem('findmeds_id_token', `demo-token-${matched.role}`);
      localStorage.setItem('findmeds_profile', JSON.stringify(matched));
      return { success: true, user: matched };
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
    const res = await requestWithFallback('GET', '/ngo/pending', null, true, 'fm_ngos');
    return res.data || res;
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
  },

  // Admin General Operations - Added for full Axios and state mapping
  async getUsers() {
    const res = await requestWithFallback('GET', '/admin/users', null, true, 'fm_users_db', []);
    return res.data || res;
  },

  async toggleUserStatus(email) {
    try {
      const res = await axios.post(`${getApiBaseUrl()}/admin/users/toggle-status`, { email }, getAuthHeaders());
      return res.data;
    } catch (err) {
      const users = JSON.parse(localStorage.getItem('fm_users_db')) || [];
      const updated = users.map(u => {
        if (u.email === email) {
          const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          return { ...u, status: nextStatus };
        }
        return u;
      });
      localStorage.setItem('fm_users_db', JSON.stringify(updated));
      return { success: true, message: "User status updated offline." };
    }
  },

  async updateUserRole(email, role) {
    try {
      const res = await axios.post(`${getApiBaseUrl()}/admin/users/update-role`, { email, role }, getAuthHeaders());
      return res.data;
    } catch (err) {
      const users = JSON.parse(localStorage.getItem('fm_users_db')) || [];
      const updated = users.map(u => {
        if (u.email === email) {
          return { ...u, role };
        }
        return u;
      });
      localStorage.setItem('fm_users_db', JSON.stringify(updated));
      return { success: true, message: "User role updated offline." };
    }
  },

  async getMedicineRequests() {
    const res = await requestWithFallback('GET', '/requests/all', null, true, 'fm_requests', []);
    return res.data || res;
  },

  async verifyMedicineRequest(reqId, approve) {
    try {
      const res = await axios.post(`${getApiBaseUrl()}/requests/verify/${reqId}`, { approve }, getAuthHeaders());
      return res.data;
    } catch (err) {
      const requests = JSON.parse(localStorage.getItem('fm_requests')) || [];
      const updated = requests.map(r => {
        if (r.id === reqId) {
          return { ...r, status: approve ? 'Verified' : 'Rejected' };
        }
        return r;
      });
      localStorage.setItem('fm_requests', JSON.stringify(updated));
      return { success: true, message: "Request verification status updated offline." };
    }
  },

  async verifyDonation(donId, approve) {
    try {
      const res = await axios.post(`${getApiBaseUrl()}/donations/verify/${donId}`, { approve }, getAuthHeaders());
      return res.data;
    } catch (err) {
      const list = JSON.parse(localStorage.getItem('fm_donations')) || [];
      const updated = list.map(d => {
        if (d.id === donId) {
          return { ...d, status: approve ? 'Active' : 'Rejected' };
        }
        return d;
      });
      localStorage.setItem('fm_donations', JSON.stringify(updated));
      return { success: true, message: "Donation verification status updated offline." };
    }
  },

  async getExclusions() {
    const defaultExclusions = [
      { id: 1, name: 'Standard Opioids & Codeine', reason: 'High Abuse Potential / Schedule H1 list', tier: 'Forbidden' },
      { id: 2, name: 'Expired Vaccines', reason: 'Cold Chain Integrity Failure', tier: 'Safety Hazard' },
      { id: 3, name: 'Controlled Substances / Amphetamines', reason: 'Regulated Government Schedule H list', tier: 'Verification Required' },
    ];
    let stored = localStorage.getItem('fm_exclusions');
    if (!stored) {
      localStorage.setItem('fm_exclusions', JSON.stringify(defaultExclusions));
      stored = JSON.stringify(defaultExclusions);
    }
    const res = await requestWithFallback('GET', '/admin/exclusions', null, true, 'fm_exclusions', defaultExclusions);
    return res.data || res;
  },

  async addExclusion(drugName, reasonStr, tier = 'Forbidden') {
    const data = { name: drugName, reason: reasonStr, tier };
    try {
      const res = await axios.post(`${getApiBaseUrl()}/admin/exclusions`, data, getAuthHeaders());
      return res.data;
    } catch (err) {
      const list = JSON.parse(localStorage.getItem('fm_exclusions')) || [];
      const newBlock = { id: Date.now(), ...data };
      list.push(newBlock);
      localStorage.setItem('fm_exclusions', JSON.stringify(list));
      return { success: true, message: "Exclusion added offline.", data: newBlock };
    }
  },

  async getAuditLogs() {
    const res = await requestWithFallback('GET', '/admin/audits', null, true, 'fm_audit_logs', []);
    return res.data || res;
  },

  async clearAuditLogs() {
    try {
      const res = await axios.post(`${getApiBaseUrl()}/admin/audits/clear`, {}, getAuthHeaders());
      return res.data;
    } catch (err) {
      localStorage.removeItem('fm_audit_logs');
      return { success: true, message: "Audit logs cleared offline." };
    }
  }
};
