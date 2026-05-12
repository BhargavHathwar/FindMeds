/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { DonorDashboard } from './pages/DonorDashboard';
import { NGODashboard } from './pages/NGODashboard';
import { Donate } from './pages/Donate';
import { Auth } from './pages/Auth';
import { BrowseMedicine } from './pages/BrowseMedicine';
import { AdminPortal } from './pages/AdminPortal';
import { DonorListings } from './pages/DonorListings';

function ScrollToHash() {
  const { pathname, hash } = useLocation();

  React.useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToHash />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<BrowseMedicine />} />
            <Route path="/donor-dashboard" element={<DonorDashboard />} />
            <Route path="/donor-listings" element={<DonorListings />} />
            <Route path="/ngo-dashboard" element={<NGODashboard />} />
            <Route path="/admin-portal" element={<AdminPortal />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
