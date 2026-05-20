import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  Package, 
  UserCircle, 
  Settings, 
  LogOut,
  Bell,
  PlusCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/donor-dashboard' },
  { icon: Package, label: 'Active Tracking', path: '/donor/tracking' },
  { icon: History, label: 'Donation History', path: '/donor/history' },
  { icon: UserCircle, label: 'Profile Settings', path: '/donor/profile' },
];

export function DonorSidebar() {
  return (
    <aside className="fixed left-0 top-20 h-[calc(100vh-80px)] w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-40">
      <div className="flex-1 px-4 py-6 space-y-1">
        <div className="px-3 mb-6">
          <NavLink
            to="/donate"
            className="flex items-center justify-center gap-2 w-full py-3 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            New Donation
          </NavLink>
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all group",
              isActive 
                ? "bg-slate-100 text-brand-primary" 
                : "text-slate-500 hover:bg-slate-50 hover:text-brand-secondary"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              "group-hover:text-brand-primary"
            )} />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100 space-y-1">
        <NavLink
            to="/settings"
            className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-50 hover:text-brand-secondary transition-all"
          >
            <Settings className="w-5 h-5" />
            Settings
        </NavLink>
        <button
          className="flex items-center gap-3 px-3 py-3 w-full rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all text-left"
          onClick={() => window.location.href = '/'}
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
