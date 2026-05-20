import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, User, Landmark, ShieldCheck, Activity, Mail, Lock, ArrowRight, MapPin, Database } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { api, getApiBaseUrl, setApiBaseUrl, isBackendConnected, DEFAULT_API_BASE } from '../lib/api';

const roles = [
  { 
    id: 'donor', 
    title: 'Medical Donor', 
    description: 'Individuals or organizations with surplus medication to gift.',
    icon: User,
    color: 'bg-teal-50',
    iconColor: 'text-brand-primary',
    target: '/donor-dashboard'
  },
  { 
    id: 'ngo', 
    title: 'Certified NGO', 
    description: 'Non-profit organizations seeking verified stock to serve underserved communities.',
    icon: Landmark,
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
    target: '/ngo-dashboard'
  },
  { 
    id: 'admin', 
    title: 'System Admin', 
    description: 'Governance and logistics oversight for regional hubs.',
    icon: ShieldCheck,
    color: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    target: '/admin-portal'
  },
];

export function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  
  const [selectedRole, setSelectedRole] = React.useState(null);
  const [registrationFormRole, setRegistrationFormRole] = React.useState(null);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pincode, setPincode] = React.useState('');
  const [apiUrl, setApiUrl] = React.useState(getApiBaseUrl());
  const [showApiSettings, setShowApiSettings] = React.useState(false);
  const [devModeClicks, setDevModeClicks] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState('');

  React.useEffect(() => {
    if (!isLogin) {
      setRegistrationFormRole(null);
      setFullName('');
      setEmail('');
      setPassword('');
      setPincode('');
    }
    setApiError('');
  }, [location.pathname, isLogin]);

  const handleRoleSelect = (role) => {
    setRegistrationFormRole(role);
  };

  const clearRegistration = () => {
    setRegistrationFormRole(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setPincode('');
    setApiError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError('');
    try {
      const response = await api.login(email, password);
      console.log('Login result:', response);
      
      // Determine route by role
      const profile = JSON.parse(localStorage.getItem('findmeds_profile')) || {};
      const userRole = profile.role || 'donor';
      
      let targetPath = '/donor-dashboard';
      if (userRole === 'ngo') targetPath = '/ngo-dashboard';
      if (userRole === 'admin') targetPath = '/admin-portal';
      
      navigate(targetPath);
    } catch (err) {
      console.error(err);
      setApiError('Authentication failed. Check your connection or credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registrationFormRole) return;
    setIsLoading(true);
    setApiError('');
    try {
      await api.register(fullName, email, password, registrationFormRole.id, pincode || '400001');
      navigate(registrationFormRole.target);
    } catch (err) {
      console.error(err);
      setApiError('Registration failed. Check backend service status.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    setApiBaseUrl(apiUrl);
    setShowApiSettings(false);
    // Reload database state
    window.location.reload();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className={cn("w-full transition-all duration-500", (isLogin || registrationFormRole) ? "max-w-md" : "max-w-4xl")}>
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-3 bg-brand-primary rounded-2xl shadow-lg mb-6"
          >
            <Activity className="h-8 w-8 text-white" />
          </motion.div>
          <h2 
            onClick={() => {
              if (isLogin) {
                setDevModeClicks(prev => {
                  const val = prev + 1;
                  if (val >= 5) {
                    setShowApiSettings(true);
                  }
                  return val;
                });
              }
            }}
            className="text-4xl font-display font-bold text-brand-secondary select-none cursor-pointer"
          >
            {isLogin ? 'Welcome Back' : (registrationFormRole ? `Register as ${registrationFormRole.title.split(' ')[1]}` : 'Join the Registry')}
          </h2>
          <p className="mt-2 text-slate-500 font-medium">
            {isLogin 
              ? 'Access your secure FindMeds dashboard' 
              : (registrationFormRole ? 'Complete your information to join the network' : 'Select your role to access the FindMeds network')
            }
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="clinical-card p-8 shadow-xl"
            >
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-xs font-semibold">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-6">
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Demo Credentials</span>
                    {devModeClicks >= 5 && (
                      <button 
                        type="button"
                        onClick={() => setShowApiSettings(!showApiSettings)}
                        className="text-[10px] font-bold text-brand-primary underline tracking-normal"
                      >
                        Configure API
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-blue-600 space-y-1">
                    <div>Donor: <span className="font-bold">donor@example.com</span></div>
                    <div>NGO: <span className="font-bold font-mono">ngo@lifecare.org</span></div>
                    <div>Admin: <span className="font-bold">admin@findmeds.org</span></div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-blue-100">Password is any value.</div>
                  </div>
                </div>

                {showApiSettings && (
                  <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3 mb-4 text-xs">
                    <div className="font-bold flex items-center gap-1.5 text-teal-400">
                      <Database className="w-4 h-4" /> Define API Endpoint Node
                    </div>
                    <p className="text-[10px] text-slate-400">Points the UI to your running Member 2 Express & Firebase backend:</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={apiUrl} 
                        onChange={(e) => setApiUrl(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white p-2 rounded w-full font-mono text-[11px]"
                        placeholder="http://localhost:5001/api"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={handleSaveApiUrl}
                        className="bg-brand-primary text-white font-bold py-1.5 px-3 rounded text-[10px]"
                      >
                        Save & Reload
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setApiUrl(DEFAULT_API_BASE); localStorage.removeItem('findmeds_api_url'); window.location.reload(); }}
                        className="bg-slate-700 hover:bg-slate-600 font-bold py-1.5 px-3 rounded text-[10px]"
                      >
                        Reset Localhost
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.com"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700">Password</label>
                    <a href="#" className="text-xs font-bold text-brand-primary hover:underline">Forgot?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Connecting to Backend...' : 'Log In to Dashboard'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  New to FindMeds? <Link to="/register" onClick={clearRegistration} className="text-brand-primary font-bold hover:underline">Create an account</Link>
                </p>
              </div>
            </motion.div>
          ) : registrationFormRole ? (
            <motion.div
              key="registration-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="clinical-card p-8 shadow-xl"
            >
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-xs font-semibold">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name / Organization</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.com"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Create Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">ZIP / Pincode</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="600001"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Creating secure account...' : 'Complete Registration'}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={clearRegistration}
                  className="w-full text-sm font-bold text-slate-500 hover:text-brand-secondary transition-colors text-center"
                >
                  Back to Role Selection
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {roles.map((role, idx) => (
                <motion.button
                  key={role.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleRoleSelect(role)}
                  onMouseEnter={() => setSelectedRole(role.id)}
                  onMouseLeave={() => setSelectedRole(null)}
                  className={cn(
                    "clinical-card p-8 text-center transition-all duration-300 relative group",
                    selectedRole === role.id ? "scale-[1.02] border-brand-primary shadow-xl" : "hover:border-slate-300 shadow-md"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 transition-transform duration-300",
                    role.color,
                    role.iconColor,
                    selectedRole === role.id && "scale-110"
                  )}>
                    <role.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-secondary mb-3">{role.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    {role.description}
                  </p>
                  <div className={cn(
                    "font-bold text-sm flex items-center justify-center gap-1 transition-colors",
                    role.iconColor,
                    selectedRole === role.id ? "opacity-100" : "opacity-0"
                  )}>
                    Sign Up as {role.title.split(' ')[1]}
                    <Shield className="w-4 h-4 ml-1" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {(!isLogin && !registrationFormRole) && (
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Already have an account? <Link to="/login" className="text-brand-primary font-bold hover:underline">Log in here</Link>
            </p>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-slate-200 flex justify-center items-center gap-8 opacity-40">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5a/WHO_logo.svg" alt="WHO" className="h-8 grayscale" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c2/UNICEF_logo.svg" alt="UNICEF" className="h-6 grayscale" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Red_Cross_icon.svg" alt="Red Cross" className="h-6 grayscale" />
        </div>
      </div>
    </div>
  );
}
