import { Activity, Mail, Phone, MapPin, Twitter, Linkedin, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-brand-primary" />
              <span className="text-2xl font-display font-bold text-white tracking-tight">
                FindMeds<span className="text-brand-primary">.</span>
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-400 max-w-xs">
              Bridging the gap in healthcare through secure, transparent medicine donation and intelligent redistribution.
            </p>
            <div className="flex gap-x-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Solution</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link to="/donate" className="text-sm leading-6 text-slate-400 hover:text-brand-primary transition-colors">Donate Medicine</Link></li>
                  <li><Link to="/browse#ngos" className="text-sm leading-6 text-slate-400 hover:text-brand-primary transition-colors">NGO Registry</Link></li>
                  <li><Link to="/browse" className="text-sm leading-6 text-slate-400 hover:text-brand-primary transition-colors">Browse Marketplace</Link></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link to="/about" className="text-sm leading-6 text-slate-400 hover:text-brand-primary transition-colors">About Us</Link></li>
                  <li><Link to="/careers" className="text-sm leading-6 text-slate-400 hover:text-brand-primary transition-colors">Careers</Link></li>
                  <li><Link to="/privacy" className="text-sm leading-6 text-slate-400 hover:text-brand-primary transition-colors">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">Contact</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li className="flex items-center gap-3 text-sm text-slate-400">
                    <Mail className="h-4 w-4 text-brand-primary" />
                    contact@findmeds.org
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-400">
                    <Phone className="h-4 w-4 text-brand-primary" />
                    +1 (555) HEALTH-00
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-400">
                    <MapPin className="h-4 w-4 text-brand-primary" />
                    Medical District, Chicago, IL
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 border-t border-slate-800 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-slate-500">
            &copy; {new Date().getFullYear()} FindMeds Foundation. Licensed charitable organization.
          </p>
        </div>
      </div>
    </footer>
  );
}
