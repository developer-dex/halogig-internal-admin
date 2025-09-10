import React from 'react';
import { Box, Typography } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './Breadcrumb.scss';

/**
 * Professional Breadcrumb Navigation Component
 * 
 * Usage Example:
 * import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
 * import { Home, Person, AccountBox } from '@mui/icons-material';
 * 
 * const breadcrumbItems = [
 *   { label: 'Home', path: '/dashboard', icon: <Home /> },
 *   { label: 'Clients', path: '/clients', icon: <Person /> },
 *   { label: 'Client Details', path: null, icon: <AccountBox /> } // null path = current page
 * ];
 * 
 * <Breadcrumb items={breadcrumbItems} />
 */
const Breadcrumb = ({ items }) => {
  const navigate = useNavigate();

  return (
    <Box className="breadcrumb-container">
      {items.map((item, index) => (
        <Box key={index} className="breadcrumb-item-wrapper">
          <Box 
            className={`breadcrumb-item ${item.path ? 'clickable' : 'current'}`}
            onClick={item.path ? () => navigate(item.path) : undefined}
          >
            {item.icon}
            <Typography variant="body2" className="breadcrumb-text">
              {item.label}
            </Typography>
          </Box>
          {index < items.length - 1 && (
            <NavigateNext className="breadcrumb-separator" />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default Breadcrumb;
