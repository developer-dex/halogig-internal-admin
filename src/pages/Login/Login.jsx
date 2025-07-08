import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, CircularProgress } from '@mui/material';
import { adminLogin } from '../../features/auth/loginSlice';
import './Login.scss';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isSuccess, isError, responseData } = useSelector(
    (state) => state.loginDataReducer
  );

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isAdminLogIn');
    if (isLoggedIn === 'true') {
      navigate('/clients');
    }
  }, [navigate]);

  useEffect(() => {
    if (isSuccess && responseData?.token) {
      // Store token and admin data in localStorage
      localStorage.setItem('adminToken', responseData.token);
      localStorage.setItem('adminData', JSON.stringify(responseData.admin));
      localStorage.setItem('isAdminLogIn', 'true');
      
      // Navigate to dashboard
      navigate('/clients');
    }
  }, [isSuccess, responseData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`); // Debug log
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    console.log('Validating form with data:', formData); // Debug log
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    console.log('Validation errors:', newErrors); // Debug log
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    console.log('=== FORM SUBMIT STARTED ==='); // Debug log
    e.preventDefault();
    
    console.log('Form data being submitted:', formData); // Debug log
    
    if (!validateForm()) {
      console.log('Form validation failed, stopping submission'); // Debug log
      return;
    }

    console.log('Form validation passed, dispatching adminLogin'); // Debug log
    
    try {
      console.log('About to dispatch adminLogin with:', {
        email: formData.email,
        password: formData.password
      }); // Debug log
      
      const result = dispatch(adminLogin({
        email: formData.email,
        password: formData.password
      }));
      
      console.log('adminLogin dispatch result:', result); // Debug log
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  console.log('Component render - Current state:', { isLoading, isSuccess, isError, responseData }); // Debug log

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Admin Login</h2>
        {/* <p>Welcome back! Please sign in to your admin account.</p> */}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              variant="outlined"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="input-group">
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              variant="outlined"
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} color="inherit" />
                <span style={{ marginLeft: '10px' }}>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
          
          {isError && (
          <div className="error-message">
            Invalid credentials. Please try again.
          </div>
        )}
        </form>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          © 2024 Halogig Admin Panel. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login; 