import React from 'react';
import { Avatar } from '@mui/material';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import GridViewIcon from '@mui/icons-material/GridView';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.scss';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className={`sidebar-container ${!isOpen ? 'closed' : ''}`}>
      {/* Slim Sidebar */}
      <div className="slim-sidebar">
        <div className="top-icons">
          <div className="icon-item primary">
            <RadioButtonCheckedIcon />
          </div>
          <div className="icon-item">
            <StarBorderIcon />
          </div>
          <div className="icon-item">
            <ShowChartIcon />
          </div>
        </div>

        <div className="bottom-avatars">
          <Avatar className="user-avatar" alt="User 1" src="/path-to-avatar1.jpg" />
          <Avatar className="user-avatar" alt="User 2" src="/path-to-avatar2.jpg" />
          <Avatar className="user-avatar" alt="User 3" src="/path-to-avatar3.jpg" />
          <Avatar className="user-avatar" alt="User 4" src="/path-to-avatar4.jpg" />
          <div className="icon-item">
            <RadioButtonCheckedIcon />
          </div>
        </div>
      </div>

      {/* Main Sidebar */}
      <div className="main-sidebar">
        <div className="profile-section">
          <Avatar 
            className="profile-avatar"
            sx={{ width: 100, height: 100, bgcolor: '#FFE4C8' }}
          >
            <img src="/path-to-avatar.jpg" alt="" />
          </Avatar>
          <div className="profile-info">
            <h3>Hello Alfred Bryant</h3>
            <p>admin.seller@yahoo.com</p>
          </div>
        </div>

        {/* <div className="menu-grid">
          <div className="menu-row">
            <div className="menu-item" onClick={() => handleNavigation('/partners')}>
              <GridViewIcon />
              <span>Partners</span>
            </div>
            <div className="menu-item" onClick={() => handleNavigation('/clients')}>
              <PeopleOutlineIcon />
              <span>Clients</span>
            </div>
          </div>

          <div className="menu-row">
            <div className="menu-item">
              <CloudUploadOutlinedIcon />
              <span>Tasks</span>
            </div>
            <div className="menu-item">
              <EmailOutlinedIcon />
              <span>Files</span>
            </div>
          </div>

          <div className="menu-row">
            <div className="menu-item">
              <EmailOutlinedIcon />
              <span>Emails</span>
            </div>
            <div className="menu-item active">
              <DescriptionOutlinedIcon />
              <span>Notes</span>
            </div>
          </div>

          <div className="menu-row">
            <div className="menu-item">
              <CalendarTodayOutlinedIcon />
              <span>Calendar</span>
            </div>
            <div className="menu-item">
              <SettingsOutlinedIcon />
              <span>Settings</span>
            </div>
          </div>
        </div> */}

        <div className="seller-support">
          <h4>Seller Support</h4>
          <div className="support-icons">
            <div className="support-icon">
              <PhoneIcon />
            </div>
            <div className="support-icon">
              <EmailIcon />
            </div>
            <div className="support-icon">
              <ChatIcon />
            </div>
            <div className="support-icon">
              <TelegramIcon />
            </div>
            <div className="support-icon">
              <WhatsAppIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 