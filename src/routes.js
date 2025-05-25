import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ClientList from './pages/ClientList/ClientList';
import ContactList from './pages/ContactList/ContactList';
import FreeLancerList from './pages/FreeLancerList/FreeLancerList';
import SiteAnalytics from './pages/SiteAnalytics/SiteAnalytics';
import LoginPage from './pages/Login/Login';

// Helper component for protected routes
const ProtectedRoute = () => {
  const isAdminLoggedIn = localStorage.getItem('isAdminLogIn') === 'true';
  return isAdminLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const isAdminLoggedIn = localStorage.getItem('isAdminLogIn') === 'true';

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/" 
        element={isAdminLoggedIn ? <Navigate to="/clients" replace /> : <Navigate to="/login" replace />}
      />
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/freelancer" element={<FreeLancerList />} />
        <Route path="/clients" element={<ClientList />} />
        <Route path="/contact" element={<ContactList />} />
        <Route path="/site-analytics" element={<SiteAnalytics />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
