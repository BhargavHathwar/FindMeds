import { motion } from 'motion/react';
import { ChevronRight, ShieldCheck, HeartPulse, Recycle, Globe, BarChart3, Pill, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stats = [
  { label: 'Medicine Donated', value: '$25M+', icon: Pill },
  { label: 'Lives Impacted', value: '1.2M+', icon: HeartPulse },
  { label: 'Partner NGOs', value: '450+', icon: Globe },
  { label: 'Carbon Reduced', value: '14 Tons', icon: Recycle },
];

const features = [
  {
    title: 'Precision Monitoring',
    description: 'Advanced monitoring from donation to verification, ensuring every pill reaches its intended destination.',
    icon: Activity,
  },
  {
    title: 'Verified Safety',
    description: 'Rigorous 3-step verification process by certified pharmacists to ensure medication integrity.',
    icon: ShieldCheck,
  },
  {
    title: 'Real-time Analytics',
    description: 'NGOs get instant insights into available inventory and donor demand in their local community.',
    icon: BarChart3,
  },
];

export function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-52">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-primary to-blue-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-center">
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-brand-primary text-xs font-bold uppercase tracking-wider mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                </span>
                Transforming Surplus into Life
              </div>
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-brand-secondary leading-[1.1] mb-6">
                Bridging the Gap in <span className="text-brand-primary">Healthcare Equity</span>.
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-lg">
                FindMeds is a high-precision medicine redistribution network connecting surplus inventory from donors to NGOs in underserved communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/donate"
                  className="inline-flex items-center justify-center px-8 py-4 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-teal-500/25 hover:bg-teal-700 transition-all group"
                >
                  Start Donating
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/browse"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition-all font-display"
                >
                  Browse Marketplace
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mt-16 lg:mt-0 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=2070" 
                  alt="Clinical professionals working" 
                  className="w-full h-[500px] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/40 to-transparent"></div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-brand-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Certified Surplus</h4>
                    <p className="text-xs text-slate-500 font-medium">Batch #992-AX Verified</p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-brand-primary rounded-full"></div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 bg-brand-secondary p-5 rounded-2xl shadow-xl text-white max-w-[180px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-xs font-bold uppercase tracking-tighter">Live Impact</span>
                </div>
                <div className="text-2xl font-bold font-display">$1.2M</div>
                <p className="text-[10px] text-slate-400 font-medium leading-tight mt-1">Medication distributed in current quarter</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="impact" className="bg-white py-24 sm:py-32 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
            {stats.map((stat, idx) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center text-center gap-4 group"
              >
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                  <stat.icon className="h-7 w-7" />
                </div>
                <div>
                  <dt className="text-base leading-7 text-slate-600 font-medium">{stat.label}</dt>
                  <dd className="text-4xl font-display font-extrabold tracking-tight text-brand-secondary">{stat.value}</dd>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-24 sm:py-32 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-bold leading-7 text-brand-primary uppercase tracking-widest">Our Platform</h2>
            <p className="mt-2 text-4xl font-display font-bold tracking-tight text-brand-secondary sm:text-5xl">
              Precision Medicine Management
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              We've digitized the medicine donation lifecycle, bringing transparency and efficiency to every step of the process.
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="clinical-card p-10 hover:border-brand-primary/30 transition-colors group">
                <div className="mb-6 inline-block p-3 rounded-xl bg-slate-50 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-brand-secondary mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                <Link to="/features" className="mt-6 inline-flex items-center text-brand-primary font-bold text-sm">
                  Learn more
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-brand-secondary px-6 py-24 shadow-2xl rounded-3xl sm:px-24 xl:py-32">
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-display font-bold tracking-tight text-white sm:text-4xl">
              Ready to save lives through donation?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-8 text-slate-300">
              Join our network of healthcare survivors, medical professionals, and charitable NGOs today.
            </p>
            <div className="mt-10 flex justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-xl bg-white px-8 py-4 text-sm font-bold text-brand-secondary shadow-sm hover:bg-slate-100 transition-all"
              >
                Get Started Now
              </Link>
              <Link to="/contact" className="text-sm font-bold leading-6 text-white self-center">
                Contact Sales <span aria-hidden="true">→</span>
              </Link>
            </div>
            <svg
              viewBox="0 0 1024 1024"
              className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
              aria-hidden="true"
            >
              <circle cx="512" cy="512" r="512" fill="url(#gradient)" fillOpacity="0.7" />
              <defs>
                <radialGradient id="gradient">
                  <stop stopColor="#0D9488" />
                  <stop offset={1} stopColor="#1E40AF" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
}
