import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ClientList from './pages/ClientList/ClientList';
import ContactList from './pages/ContactList/ContactList';
import FreeLancerList from './pages/FreeLancerList/FreeLancerList';
import SiteAnalytics from './pages/SiteAnalytics/SiteAnalytics';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/clients" replace />} />
      <Route path="/freelancer" element={<FreeLancerList />} />
      <Route path="/clients" element={<ClientList />} />
      <Route path="/contact" element={<ContactList />} />
      <Route path="/site-analytics" element={<SiteAnalytics />} />
    </Routes>
  );
};

export default AppRoutes;
