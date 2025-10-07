import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ClientList from './pages/ClientList/ClientList';
import ClientDetail from './pages/ClientDetail/ClientDetail';
import ContactList from './pages/ContactList/ContactList';
import FreeLancerList from './pages/FreeLancerList/FreeLancerList';
import FreeLancerDetail from './pages/FreeLancerDetail/FreeLancerDetail';
import PostProject from './pages/PostProject/PostProject';
import CreateClientProject from './pages/CreateClientProject/CreateClientProject';
import SiteAnalytics from './pages/SiteAnalytics/SiteAnalytics';
import LoginPage from './pages/Login/Login';
import ChatRoom from './pages/ChatRoom/ChatRoom';
import ProjectBids from './pages/ProjectBids/ProjectBids';
import ProjectBidDetail from './pages/ProjectBidDetail/ProjectBidDetail';
import LogManager from './pages/LogManager/LogManager';
import WebsiteData from './pages/WebsiteData/WebsiteData';
import WebsiteDataDetails from './pages/WebsiteData/WebsiteDataDetails';
import Invoice from './pages/Invoice/Invoice';
import SalesOrder from './pages/SalesOrder/SalesOrder';

// Helper component for protected routes
const ProtectedRoute = () => {
  const isAdminLoggedIn = localStorage.getItem('isAdminLogIn') === 'true';
  return isAdminLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const isAdminLoggedIn = localStorage.getItem('isAdminLogIn') === 'true';

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAdminLoggedIn ? <Navigate to="/clients" replace /> : <LoginPage />}
      />
      <Route 
        path="/" 
        element={isAdminLoggedIn ? <Navigate to="/clients" replace /> : <Navigate to="/login" replace />}
      />
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/freelancer" element={<FreeLancerList />} />
        <Route path="/freelancer/:freelancerId/details" element={<FreeLancerDetail />} />
        <Route path="/clients" element={<ClientList />} />
        <Route path="/clients/:clientId" element={<ClientDetail />} />
        <Route path="/contact" element={<ContactList />} />
        <Route path="/projects" element={<PostProject />} />
        <Route path="/post-project" element={<PostProject />} />
        <Route path="/project-bids" element={<ProjectBids />} />
        <Route path="/project-bids/:bidId" element={<ProjectBidDetail />} />
        <Route path="/create-client-project" element={<CreateClientProject />} />
        <Route path="/site-analytics" element={<SiteAnalytics />} />
        <Route path="/logs" element={<LogManager />} />
        <Route path="/website-data" element={<WebsiteData />} />
        <Route path="/invoice/:milestoneId/:projectbidId" element={<Invoice />} />
        <Route path="/salesorder/:milestoneId/:projectbidId" element={<SalesOrder />} />
        <Route path="/website-data/:id/details" element={<WebsiteDataDetails />} />
      </Route>
      <Route path="/chat" element={<ChatRoom />} />
    </Routes>
  );
};

export default AppRoutes;
