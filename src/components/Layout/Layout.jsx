import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.scss';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const isAdminLoggedIn = localStorage.getItem('isAdminLogIn') === 'true';
  const isLoginPage = location.pathname === '/login';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // If on login page, render children without header/sidebar
  if (isLoginPage) {
    return (
      <div className="layout">
        {children}
      </div>
    );
  }

  // If logged in, render with header and sidebar
  if (isAdminLoggedIn) {
    return (
      <div className="layout">
        <Header toggleSidebar={toggleSidebar} />
        <div className="layout-container">
          {/* <Sidebar isOpen={sidebarOpen} /> */}
          <main className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
            {children}
          </main>
        </div>
      </div>
    );
  }

  // If not logged in and not on login page, render without header/sidebar
  return (
    <div className="layout">
      {children}
    </div>
  );
};

export default Layout; 