import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ClientList from './pages/ClientList/ClientList';
import FreeLancerList from './pages/FreeLancerList/FreeLancerList';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/clients" replace />} />
      <Route path="/freelancer" element={<FreeLancerList />} />
      <Route path="/clients" element={<ClientList />} />
    </Routes>
  );
};

export default AppRoutes;
