import React from 'react';
import { AppBar, Toolbar, InputBase, IconButton, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import './Header.scss';

const Header = ({ toggleSidebar }) => {
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
            <a href="#" className="active">Access Dashboard</a>
            <a href="#">About Us</a>
            <a href="#">Registration</a>
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