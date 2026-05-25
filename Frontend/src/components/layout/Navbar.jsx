import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Browse Meds', href: '/browse' },
  { name: 'NGO Registry', href: '/browse#ngos' },
  { name: 'Impact', href: '/#impact' },
  { name: 'How it Works', href: '/#how-it-works' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState(null);
  const location = useLocation();

  React.useEffect(() => {
    const handleCheckAuth = () => {
      const profileStr = localStorage.getItem('findmeds_profile');
      if (profileStr) {
        try {
          setUserProfile(JSON.parse(profileStr));
        } catch (e) {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
    };

    handleCheckAuth();
    window.addEventListener('storage', handleCheckAuth);
    return () => {
      window.removeEventListener('storage', handleCheckAuth);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('findmeds_profile');
    localStorage.removeItem('findmeds_email');
    localStorage.removeItem('findmeds_token');
    setUserProfile(null);
    window.location.href = '/';
  };

  const dynamicNav = [...navigation];
  if (userProfile && userProfile.role === 'admin') {
    dynamicNav.push({ name: 'Admin Portal', href: '/admin-portal' });
  } else if (userProfile && userProfile.role === 'ngo') {
    dynamicNav.push({ name: 'NGO Dashboard', href: '/ngo-dashboard' });
  } else if (userProfile && userProfile.role === 'donor') {
    dynamicNav.push({ name: 'Donor Dashboard', href: '/donor-dashboard' });
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 glass-morphism">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center">
            <Logo size="sm" />
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          {dynamicNav.map((item) => (
            <Link
              key={item.href + item.name}
              to={item.href}
              className="text-sm font-semibold leading-6 text-slate-700 hover:text-brand-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
          {userProfile ? (
            <>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
                {userProfile.email} ({userProfile.role.toUpperCase()})
              </span>
              <button 
                onClick={handleLogout}
                className="text-sm font-semibold leading-6 text-slate-900 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold leading-6 text-slate-900 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition-all font-display"
              >
                Join FindMeds
              </Link>
            </>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 z-50 bg-white px-6 py-6 lg:hidden"
          >
            <div className="flex items-center justify-between">
              <Link to="/" className="-m-1.5 p-1.5 flex items-center" onClick={() => setMobileMenuOpen(false)}>
                <Logo size="sm" />
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-slate-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-slate-500/10">
                <div className="space-y-2 py-6">
                  {dynamicNav.map((item) => (
                    <Link
                      key={item.href + item.name}
                      to={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6 flex flex-col gap-4">
                  {userProfile ? (
                    <>
                      <div className="text-xs font-mono text-slate-500 bg-slate-100 p-3 rounded-lg">
                        Logged in as: {userProfile.email} ({userProfile.role.toUpperCase()})
                      </div>
                      <button
                        onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                        className="block rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-3 text-center text-base font-semibold text-slate-900"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        className="block rounded-lg bg-brand-primary px-4 py-3 text-center text-base font-semibold text-white shadow-sm hover:bg-teal-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Join FindMeds
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
