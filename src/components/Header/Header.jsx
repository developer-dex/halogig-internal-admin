import React, { useState } from 'react';
import { AppBar, Toolbar, InputBase, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.scss';

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLogIn');
    navigate('/login');
    handleMenuClose();
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
          <nav className="top-nav">
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Access Dashboard</Link>
            <Link to="/clients" className={location.pathname === '/clients' ? 'active' : ''}>Client</Link>
            <Link to="/freelancer" className={location.pathname === '/freelancer' ? 'active' : ''}>FreeLancer</Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contacts</Link>
            <Link to="/site-analytics" className={location.pathname === '/site-analytics' ? 'active' : ''}>Site Analytics</Link>
          </nav>
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