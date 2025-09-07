import React, { useState } from 'react';
import { AppBar, Toolbar, InputBase, IconButton, Avatar, Menu, MenuItem, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.scss';

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [navigationAnchorEl, setNavigationAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigationMenuOpen = (event) => {
    setNavigationAnchorEl(event.currentTarget);
  };

  const handleNavigationMenuClose = () => {
    setNavigationAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLogIn');
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigationClick = (path) => {
    navigate(path);
    handleNavigationMenuClose();
  };

  // Navigation menu items
  const navigationItems = [
    { label: 'Access Dashboard', path: '/dashboard' },
    { label: 'Client', path: '/clients' },
    { label: 'FreeLancer', path: '/freelancer' },
    { label: 'Projects', path: '/projects' },
    { label: 'Project Bids', path: '/project-bids' },
    { label: 'Contacts', path: '/contact' },
    { label: 'Website Data', path: '/website-data' },
    { label: 'Chat Rooms', path: '/chat' },
    { label: 'Site Analytics', path: '/site-analytics' },
    { label: 'Log Manager', path: '/logs' },
  ];

  // Get current active navigation item
  const getCurrentActiveItem = () => {
    const activeItem = navigationItems.find(item => item.path === location.pathname);
    return activeItem ? activeItem.label : 'Access Dashboard';
  };

  return (
    <AppBar position="static" className="header">
      <Toolbar>
        <div className="header-left">
          <IconButton 
            className="menu-button"
            onClick={toggleSidebar}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Navigation Dropdown */}
          <div className="navigation-dropdown">
            <Button
              className="navigation-button"
              onClick={handleNavigationMenuOpen}
              endIcon={<KeyboardArrowDownIcon />}
              variant="text"
            >
              {getCurrentActiveItem()}
            </Button>
            <Menu
              anchorEl={navigationAnchorEl}
              open={Boolean(navigationAnchorEl)}
              onClose={handleNavigationMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              getContentAnchorEl={null}
              className="navigation-menu"
            >
              {navigationItems.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => handleNavigationClick(item.path)}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          </div>
        </div>

        <div className="header-right">
          {/* <div className="search-box">
            <SearchIcon />
            <InputBase
              placeholder="Search Products, Orders and Clients"
              className="search-input"
            />
          </div>
          <IconButton className="icon-button">
            <NotificationsOutlinedIcon />
          </IconButton>
          <IconButton className="icon-button">
            <SettingsOutlinedIcon />
          </IconButton> */}
          <div className="user-info" onClick={handleMenuOpen} style={{ cursor: 'pointer' }}>
            <Avatar sx={{ bgcolor: '#1976d2' }}>AG</Avatar>
            <span>Ankur Gupta</span>
          </div>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            getContentAnchorEl={null}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 