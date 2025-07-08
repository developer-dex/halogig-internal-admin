// src/services/http.js
import axios from "axios";
import { config } from "../config/config";
import { UNAUTHORIZED } from "../config/httpStatusCodes";
import { clearSession } from "../config/localStorage";

const instance = axios.create({
  baseURL: config.apiBaseUrl,
});

// Request interceptor to add authorization header
instance.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    
    // Don't add authorization header for login requests
    if (config.url && !config.url.includes('/login') && adminToken) {
      config.headers.authorization = `Bearer ${adminToken}`;
    }
    
    // Set default headers
    config.headers.Accept = "application/json";
    config.headers["Accept-Language"] = "en";
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response } = error;
    if (response && response.status === UNAUTHORIZED) {
      // Clear all session data including admin data
      clearSession();
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      localStorage.removeItem('isAdminLogIn');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    if (response && response.status === 409) {
      window.location.href = config.baseName || '';
    }
    throw error;
  }
);

export default instance;