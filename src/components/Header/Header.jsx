import React from 'react';
import { AppBar, Toolbar, InputBase, IconButton, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Link, useLocation } from 'react-router-dom';
import './Header.scss';

const Header = ({ toggleSidebar }) => {
  const location = useLocation();

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
            <a href="#">User Policy</a>
            <a href="#">Contacts</a>
          </nav>
        </div>

        <div className="header-right">
          <div className="search-box">
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
          </IconButton>
          <div className="user-info">
            <Avatar sx={{ bgcolor: '#1976d2' }}>CS</Avatar>
            <span>Clayton Santos</span>
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 