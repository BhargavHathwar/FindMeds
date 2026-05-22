import React from 'react';
import { Outlet } from 'react-router-dom';
import { DonorSidebar } from '../donor/DonorSidebar';
import { Bell, Search, User } from 'lucide-react';

export function DonorLayout() {
  const [profile, setProfile] = React.useState({ fullName: 'Metropolis Pharma', role: 'Premium Donor' });

  React.useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('findmeds_profile'));
      if (stored) {
        setProfile({
          fullName: stored.fullName || 'Metropolis Pharma',
          role: stored.role === 'donor' ? 'Premium Donor' : (stored.role || 'Premium Donor')
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex">
      <DonorSidebar />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Top bar for dashboard */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-20 z-30">
          <div className="hidden md:flex items-center gap-2 text-slate-400">
             <Search className="w-5 h-5" />
             <input 
               type="text" 
               placeholder="Universal Search (Ctrl + K)" 
               className="bg-transparent border-none outline-none text-sm font-medium w-64 text-slate-600"
             />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-brand-primary transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-brand-secondary">{profile.fullName}</div>
                <div className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">{profile.role === 'donor' || profile.role === 'Premium Donor' ? 'Premium Donor' : profile.role}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border-2 border-white shadow-sm overflow-hidden">
                <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=100&h=100" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
