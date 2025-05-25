import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import AppRoutes from './routes';
import './assets/styles/global.scss';
import { Provider } from 'react-redux';
import store from './app/store';

// Wrapper to access location for conditional layout rendering
const AppContent = () => {
  const location = useLocation();
  const isAdminLoggedIn = localStorage.getItem('isAdminLogIn') === 'true';

  // Show Layout only if logged in and not on the login page
  const showLayout = isAdminLoggedIn && location.pathname !== '/login';

  return (
    showLayout ? (
      <Layout>
        <AppRoutes />
      </Layout>
    ) : (
      <AppRoutes />
    )
  );
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
