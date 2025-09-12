import React, { useState } from 'react';
import { AppBar, Toolbar, InputBase, IconButton, Avatar, Menu, MenuItem, Button, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import FolderIcon from '@mui/icons-material/Folder';
import ContactsIcon from '@mui/icons-material/Contacts';
import WebIcon from '@mui/icons-material/Web';
import ChatIcon from '@mui/icons-material/Chat';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import GavelIcon from '@mui/icons-material/Gavel';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminLogout } from '../../helpers/messageHelper';
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
    // Close the menu first
    handleMenuClose();
    
    // Use the utility function for consistent logout behavior
    adminLogout();
  };

  const handleNavigationClick = (path) => {
    navigate(path);
    handleNavigationMenuClose();
  };

  // Professional navigation menu items with icons and grouping
  const navigationItems = [
    { 
      label: 'Access Dashboard', 
      path: '/dashboard', 
      icon: <DashboardIcon />,
      group: 'main'
    },
    { 
      label: 'Clients', 
      path: '/clients', 
      icon: <PeopleIcon />,
      group: 'management'
    },
    { 
      label: 'Freelancers', 
      path: '/freelancer', 
      icon: <WorkIcon />,
      group: 'management'
    },
    { 
      label: 'Projects', 
      path: '/projects', 
      icon: <FolderIcon />,
      group: 'management'
    },
    { 
      label: 'Project Bids', 
      path: '/project-bids', 
      icon: <GavelIcon />,
      group: 'management'
    },
    { 
      label: 'Contacts', 
      path: '/contact', 
      icon: <ContactsIcon />,
      group: 'communication'
    },
    { 
      label: 'Website Data', 
      path: '/website-data', 
      icon: <WebIcon />,
      group: 'data'
    },
    { 
      label: 'Chat Rooms', 
      path: '/chat', 
      icon: <ChatIcon />,
      group: 'communication'
    },
    { 
      label: 'Site Analytics', 
      path: '/site-analytics', 
      icon: <AnalyticsIcon />,
      group: 'data'
    },
    { 
      label: 'Log Manager', 
      path: '/logs', 
      icon: <ManageHistoryIcon />,
      group: 'system'
    },
  ];

  // Group navigation items for better organization
  const groupedNavigation = {
    main: navigationItems.filter(item => item.group === 'main'),
    management: navigationItems.filter(item => item.group === 'management'),
    communication: navigationItems.filter(item => item.group === 'communication'),
    data: navigationItems.filter(item => item.group === 'data'),
    system: navigationItems.filter(item => item.group === 'system'),
  };

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
              {/* Main Section */}
              {groupedNavigation.main.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => handleNavigationClick(item.path)}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </MenuItem>
              ))}
              
              <Divider className="menu-divider" />
              
              {/* Management Section */}
              {groupedNavigation.management.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => handleNavigationClick(item.path)}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </MenuItem>
              ))}
              
              <Divider className="menu-divider" />
              
              {/* Communication Section */}
              {groupedNavigation.communication.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => handleNavigationClick(item.path)}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </MenuItem>
              ))}
              
              {/* Data & Analytics Section */}
              {groupedNavigation.data.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => handleNavigationClick(item.path)}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </MenuItem>
              ))}
              
              <Divider className="menu-divider" />
              
              {/* System Section */}
              {groupedNavigation.system.map((item) => (
                <MenuItem
                  key={item.path}
                  onClick={() => handleNavigationClick(item.path)}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </MenuItem>
              ))}
            </Menu>
          </div>
        </div>

        <div className="header-right">
          <div className="search-box">
            <SearchIcon />
            <InputBase
              placeholder="Search admin panel..."
              className="search-input"
            />
          </div>
          <IconButton className="icon-button" title="Notifications">
            <NotificationsOutlinedIcon />
          </IconButton>
          <IconButton className="icon-button" title="Settings">
            <SettingsOutlinedIcon />
          </IconButton>
          <div className="user-info" onClick={handleMenuOpen} style={{ cursor: 'pointer' }}>
            <Avatar sx={{ 
              bgcolor: '#c3362a',
              width: 36,
              height: 36,
              fontWeight: 600,
              fontSize: '14px'
            }}>AG</Avatar>
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