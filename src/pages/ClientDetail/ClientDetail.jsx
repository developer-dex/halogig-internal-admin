import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientDetailsApi } from '../../features/admin/clientManagementSlice';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Business,
  School,
  Work,
  Apps,
  Person,
  CalendarToday,
  Language,
  VideoLibrary,
  CardGiftcard,
  ExpandMore,
  Info,
  Badge,
  AccountBox,
  Description,
  Star,
  Assignment,
  Home,
} from '@mui/icons-material';
import './ClientDetail.scss';
import Breadcrumb from '../../components/Breadcrumb';

const ClientDetail = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  
  // Local state for client details
  const [clientDetails, setClientDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // State for accordion panels
  const [expandedPanel, setExpandedPanel] = useState('personal'); // First panel open by default

  useEffect(() => {
    const fetchClientDetails = async () => {
      if (clientId) {
        setIsLoading(true);
        setIsError(false);
        
        try {
          const response = await getClientDetailsApi(clientId);
          setClientDetails(response.data.data);
        } catch (error) {
          console.error('Error fetching client details:', error);
          setIsError(true);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchClientDetails();
  }, [clientId]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  // Breadcrumb items for client details page
  const breadcrumbItems = [
    { label: 'Home', path: '/clients', icon: <Home /> },
    { label: 'Clients', path: '/clients', icon: <Person /> },
    { label: 'Client Details', path: null, icon: <AccountBox /> }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'otpverified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'under review':
      case 'incomplete':
        return 'info';
      default:
        return 'default';
    }
  };

  const renderProfessionalField = (icon, label, value, fullWidth = false) => (
    <Grid item xs={12} sm={fullWidth ? 12 : 6} md={fullWidth ? 12 : 4}>
      <Box className="professional-field">
        <Box className="field-header">
          <Box className="field-icon">
            {icon}
          </Box>
          <Typography variant="caption" className="field-label">
            {label}
          </Typography>
        </Box>
        <Typography variant="body1" className="field-value">
          {value || 'N/A'}
        </Typography>
      </Box>
    </Grid>
  );

  const renderListField = (icon, label, value) => (
    <ListItem className="professional-list-item">
      <ListItemIcon className="list-icon">
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" className="list-label">
            {label}
          </Typography>
        }
        secondary={
          <Typography variant="body1" className="list-value">
            {value || 'N/A'}
          </Typography>
        }
      />
    </ListItem>
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  if (isError || !clientDetails) {
    return (
      <div className="client-detail">
      <div className="error-container">
        <Typography variant="h6" color="error">
          Failed to load client details
        </Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
            There was an error loading the client information. Please try again.
          </Typography>
          <Button onClick={() => navigate('/clients')} variant="contained" sx={{ mt: 2 }}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="client-detail">
      <div className="header-client-detail">
        <Breadcrumb items={breadcrumbItems} />
        <Typography variant="h4" component="h1" gutterBottom>
          Client Details
        </Typography>
      </div>

      <Box className="accordion-container">
        {/* Personal Information Accordion */}
        <Accordion 
          expanded={expandedPanel === 'personal'} 
          onChange={handleAccordionChange('personal')}
          className="client-accordion"
        >
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            className="accordion-header"
          >
            <Box className="accordion-title-container">
              <AccountBox className="accordion-icon" />
              <Typography variant="h6" className="accordion-title">
                Personal Information
                    </Typography>
                    <Chip
                      label={clientDetails.status}
                      color={getStatusColor(clientDetails.status)}
                      size="small"
                className="status-chip"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails className="accordion-content">
            <Box className="personal-info-section">
              <Box className="profile-header">
                <Avatar
                  src={clientDetails.profile_image}
                  className="profile-avatar"
                >
                  {clientDetails.first_name?.charAt(0) || 'U'}
                </Avatar>
                <Box className="profile-details">
                  <Typography variant="h5" className="profile-name">
                    {clientDetails.first_name} {clientDetails.last_name}
                  </Typography>
                  <Typography variant="subtitle1" className="profile-subtitle">
                    {clientDetails.designation || 'Client'}
                  </Typography>
                  </Box>
                </Box>

              <List className="personal-info-list">
                {renderListField(<Email />, 'Email Address', clientDetails.email)}
                {renderListField(<Phone />, 'Mobile Number', clientDetails.mobile)}
                {renderListField(<Business />, 'Company', clientDetails.company_name)}
                {renderListField(<LocationOn />, 'Location', `${clientDetails.city || ''} ${clientDetails.country || ''}`.trim())}
                {renderListField(<Person />, 'Gender', clientDetails.gender)}
                {renderListField(<CalendarToday />, 'Registration Date', formatDate(clientDetails.createdAt))}
                </List>
          </Box>
          </AccordionDetails>
        </Accordion>

        {/* Additional Information Accordion */}
        <Accordion 
          expanded={expandedPanel === 'additional'} 
          onChange={handleAccordionChange('additional')}
          className="client-accordion"
        >
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            className="accordion-header"
          >
            <Box className="accordion-title-container">
              <Info className="accordion-icon" />
              <Typography variant="h6" className="accordion-title">
                  Additional Information
                </Typography>
              <Typography variant="caption" className="section-subtitle">
                Extended profile details and verification data
                    </Typography>
                  </Box>
          </AccordionSummary>
          <AccordionDetails className="accordion-content">
            <Grid container spacing={3}>
              {renderProfessionalField(<AccountBox />, 'Username', clientDetails.username)}
              {renderProfessionalField(<Badge />, 'GST Number', clientDetails.gst_number)}
              {renderProfessionalField(<Badge />, 'PAN Card', clientDetails.pan_card_no)}
              {renderProfessionalField(<Assignment />, 'Government ID', clientDetails.govtID)}
              {renderProfessionalField(<Assignment />, 'ID Proof Number', clientDetails.idProofNo)}
              {renderProfessionalField(<LocationOn />, 'Postal Code', clientDetails.postal)}
              {renderProfessionalField(<LocationOn />, 'State', clientDetails.user_state)}
              {renderProfessionalField(<CalendarToday />, 'Date of Issue', formatDate(clientDetails.doi))}
              {renderProfessionalField(<Person />, 'Pseudo Name', clientDetails.pseudoName)}
              {renderProfessionalField(<Work />, 'Experience', clientDetails.experience)}
              {renderProfessionalField(<Star />, 'Key Skills', clientDetails.key_skills)}
              {renderProfessionalField(<Star />, 'Rating', clientDetails.rating)}
              {renderProfessionalField(<Work />, 'Designation', clientDetails.designation)}
              {renderProfessionalField(<Person />, 'Register As', clientDetails.register_as)}
              {renderProfessionalField(<CalendarToday />, 'Last Login', formatDate(clientDetails.last_login))}
              {renderProfessionalField(<Language />, 'Last Login IP', clientDetails.last_login_ip)}
              {renderProfessionalField(<Badge />, 'OTP', clientDetails.otp)}
              {renderProfessionalField(<Person />, 'Role', clientDetails.role)}
              {renderProfessionalField(<Assignment />, 'Profile Published', clientDetails.is_profile_published ? 'Yes' : 'No')}
              {renderProfessionalField(<Person />, 'Anonymous', clientDetails.anonymous ? 'Yes' : 'No')}
              {renderProfessionalField(<LocationOn />, 'Address', clientDetails.address, true)}
              {renderProfessionalField(<Description />, 'About Me', clientDetails.aboutme, true)}
              {renderProfessionalField(<Description />, 'Bio', clientDetails.bio, true)}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Professional Details Accordion */}
        {clientDetails.ProfessionalDetails && clientDetails.ProfessionalDetails.length > 0 && (
          <Accordion 
            expanded={expandedPanel === 'professional'} 
            onChange={handleAccordionChange('professional')}
            className="client-accordion"
          >
            <AccordionSummary 
              expandIcon={<ExpandMore />}
              className="accordion-header"
            >
              <Box className="accordion-title-container">
                <Work className="accordion-icon" />
                <Typography variant="h6" className="accordion-title">
                  Professional Details
                    </Typography>
                <Chip
                  label={`${clientDetails.total_professional_details} Experience${clientDetails.total_professional_details !== 1 ? 's' : ''}`}
                  variant="outlined"
                  size="small"
                  className="count-chip"
                />
                  </Box>
            </AccordionSummary>
            <AccordionDetails className="accordion-content">
              <Grid container spacing={3}>
                {clientDetails.ProfessionalDetails.map((professional, index) => (
                  <Grid item xs={12} md={6} key={professional.id}>
                    <Paper className="professional-card">
                      <Box className="card-header">
                        <Business className="card-icon" />
                        <Typography variant="h6" className="card-title">
                          {professional.company_name || 'Company Name N/A'}
                    </Typography>
                  </Box>
                      <Box className="card-content">
                        <Box className="detail-row">
                          <Typography variant="caption">Position</Typography>
                          <Typography variant="body1">{professional.position || 'N/A'}</Typography>
                  </Box>
                        <Box className="detail-row">
                          <Typography variant="caption">Duration</Typography>
                          <Typography variant="body1">{professional.duration || 'N/A'}</Typography>
                  </Box>
                        <Box className="detail-row">
                          <Typography variant="caption">Description</Typography>
                          <Typography variant="body2">{professional.description || 'N/A'}</Typography>
          </Box>
        </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Certificates Accordion */}
        {clientDetails.Certificates && clientDetails.Certificates.length > 0 && (
          <Accordion 
            expanded={expandedPanel === 'certificates'} 
            onChange={handleAccordionChange('certificates')}
            className="client-accordion"
          >
            <AccordionSummary 
              expandIcon={<ExpandMore />}
              className="accordion-header"
            >
              <Box className="accordion-title-container">
                <CardGiftcard className="accordion-icon" />
                <Typography variant="h6" className="accordion-title">
                  Certificates & Achievements
              </Typography>
                <Chip
                  label={`${clientDetails.total_certificates} Certificate${clientDetails.total_certificates !== 1 ? 's' : ''}`}
                  variant="outlined"
                  size="small"
                  className="count-chip"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails className="accordion-content">
              <Grid container spacing={3}>
                {clientDetails.Certificates.map((certificate, index) => (
                  <Grid item xs={12} md={6} key={certificate.id}>
                    <Paper className="professional-card">
                      <Box className="card-header">
                        <CardGiftcard className="card-icon" />
                        <Typography variant="h6" className="card-title">
                        {certificate.certificate_name || 'Certificate Name N/A'}
                      </Typography>
                      </Box>
                      <Box className="card-content">
                        <Box className="detail-row">
                          <Typography variant="caption">Issuing Organization</Typography>
                          <Typography variant="body1">{certificate.issuing_organization || 'N/A'}</Typography>
                        </Box>
                        <Box className="detail-row">
                          <Typography variant="caption">Issue Date</Typography>
                          <Typography variant="body1">{formatDate(certificate.issue_date)}</Typography>
                        </Box>
                        <Box className="detail-row">
                          <Typography variant="caption">Expiry Date</Typography>
                          <Typography variant="body1">{formatDate(certificate.expiry_date)}</Typography>
                        </Box>
                        <Box className="detail-row">
                          <Typography variant="caption">Credential ID</Typography>
                          <Typography variant="body2">{certificate.credential_id || 'N/A'}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Education Accordion */}
        {clientDetails.Education && clientDetails.Education.length > 0 && (
          <Accordion 
            expanded={expandedPanel === 'education'} 
            onChange={handleAccordionChange('education')}
            className="client-accordion"
          >
            <AccordionSummary 
              expandIcon={<ExpandMore />}
              className="accordion-header"
            >
              <Box className="accordion-title-container">
                <School className="accordion-icon" />
                <Typography variant="h6" className="accordion-title">
                  Education Background
              </Typography>
                <Chip
                  label={`${clientDetails.total_education} Qualification${clientDetails.total_education !== 1 ? 's' : ''}`}
                  variant="outlined"
                  size="small"
                  className="count-chip"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails className="accordion-content">
              <Grid container spacing={3}>
                {clientDetails.Education.map((education, index) => (
                  <Grid item xs={12} md={6} key={education.id}>
                    <Paper className="professional-card">
                      <Box className="card-header">
                        <School className="card-icon" />
                        <Typography variant="h6" className="card-title">
                        {education.university_name || 'University Name N/A'}
                      </Typography>
                      </Box>
                      <Box className="card-content">
                        <Box className="detail-row">
                          <Typography variant="caption">Education Type</Typography>
                          <Typography variant="body1">{education.education_type || 'N/A'}</Typography>
                        </Box>
                        <Box className="detail-row">
                          <Typography variant="caption">Graduation Type</Typography>
                          <Typography variant="body1">{education.graduation_type || 'N/A'}</Typography>
                        </Box>
                        <Box className="detail-row">
                          <Typography variant="caption">Degree</Typography>
                          <Typography variant="body1">{education.degree || 'N/A'}</Typography>
                        </Box>
                        <Box className="detail-row">
                          <Typography variant="caption">Completion Date</Typography>
                          <Typography variant="body1">{education.month || 'N/A'} {education.year || ''}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Projects Accordion */}
        {clientDetails.Projects && clientDetails.Projects.length > 0 && (
          <Accordion 
            expanded={expandedPanel === 'projects'} 
            onChange={handleAccordionChange('projects')}
            className="client-accordion"
          >
            <AccordionSummary 
              expandIcon={<ExpandMore />}
              className="accordion-header"
            >
              <Box className="accordion-title-container">
                <Assignment className="accordion-icon" />
                <Typography variant="h6" className="accordion-title">
                  Project Portfolio
              </Typography>
                <Chip
                  label={`${clientDetails.total_projects} Project${clientDetails.total_projects !== 1 ? 's' : ''}`}
                  variant="outlined"
                  size="small"
                  className="count-chip"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails className="accordion-content">
              <Grid container spacing={3}>
                {clientDetails.Projects.map((project, index) => (
                  <Grid item xs={12} lg={6} key={project.id}>
                    <Paper className="professional-card">
                      <Box className="card-header">
                        <Assignment className="card-icon" />
                        <Typography variant="h6" className="card-title">
                        {project.project_name}
                      </Typography>
                      </Box>
                      <Box className="card-content">
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box className="detail-row">
                              <Typography variant="caption">Project Type</Typography>
                              <Typography variant="body1">{project.project_type || 'N/A'}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box className="detail-row">
                              <Typography variant="caption">Duration</Typography>
                              <Typography variant="body1">{project.duration || 'N/A'}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box className="detail-row">
                              <Typography variant="caption">Technology</Typography>
                              <Typography variant="body1">{project.technologty_pre || 'N/A'}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box className="detail-row">
                              <Typography variant="caption">Industry</Typography>
                              <Typography variant="body1">{project.industry || 'N/A'}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box className="detail-row">
                              <Typography variant="caption">Platform Support</Typography>
                              <Box className="platform-tags">
                                {project.is_mobile_platform && <Chip label="Mobile" size="small" variant="outlined" />}
                                {project.is_web_platform && <Chip label="Web" size="small" variant="outlined" />}
                                {project.is_desktop_platform && <Chip label="Desktop" size="small" variant="outlined" />}
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box className="detail-row">
                              <Typography variant="caption">Project Details</Typography>
                              <Typography variant="body2">{project.project_details || 'N/A'}</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Ready Made Apps Accordion */}
        {clientDetails.readyMadeApps && clientDetails.readyMadeApps.length > 0 && (
          <Accordion 
            expanded={expandedPanel === 'apps'} 
            onChange={handleAccordionChange('apps')}
            className="client-accordion"
          >
            <AccordionSummary 
              expandIcon={<ExpandMore />}
              className="accordion-header"
            >
              <Box className="accordion-title-container">
                <Apps className="accordion-icon" />
                <Typography variant="h6" className="accordion-title">
                  Ready Made Applications
              </Typography>
                <Chip
                  label={`${clientDetails.total_ready_made_apps} App${clientDetails.total_ready_made_apps !== 1 ? 's' : ''}`}
                  variant="outlined"
                  size="small"
                  className="count-chip"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails className="accordion-content">
              <Grid container spacing={3}>
                {clientDetails.readyMadeApps.map((app, index) => (
                  <Grid item xs={12} lg={6} key={app.id}>
                    <Paper className="professional-card app-card">
                      <Box className="card-header">
                        <Apps className="card-icon" />
                        <Typography variant="h6" className="card-title">
                        {app.appName}
                      </Typography>
                        <Typography variant="h6" className="price-tag">
                          {app.price} {app.currency_type}
                      </Typography>
                      </Box>
                      {app.Thumbnail && app.Thumbnail.thumbnailImages && app.Thumbnail.thumbnailImages.length > 0 && (
                        <Box className="app-thumbnail">
                          <img
                            src={app.Thumbnail.thumbnailImages[0].imageUrl}
                            alt={app.appName}
                            className="thumbnail-image"
                          />
                        </Box>
                      )}
                      <Box className="card-content">
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box className="detail-row">
                              <Typography variant="caption">Industry</Typography>
                              <Typography variant="body1">{app.industry || 'N/A'}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box className="detail-row">
                              <Typography variant="caption">Technology</Typography>
                              <Typography variant="body1">{app.technology || 'N/A'}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box className="detail-row">
                              <Typography variant="caption">Delivery Time</Typography>
                              <Typography variant="body1">{app.deliveryTime || 'N/A'}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box className="detail-row">
                              <Typography variant="caption">Source Code</Typography>
                              <Typography variant="body1">{app.sourceCode || 'N/A'}</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box className="detail-row">
                              <Typography variant="caption">Platform Support</Typography>
                              <Box className="platform-tags">
                                {app.is_mobile_platform && <Chip label="Mobile" size="small" variant="outlined" />}
                                {app.is_web_platform && <Chip label="Web" size="small" variant="outlined" />}
                                {app.is_desktop_platform && <Chip label="Desktop" size="small" variant="outlined" />}
                                {app.is_customizable && <Chip label="Customizable" size="small" variant="outlined" color="primary" />}
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box className="detail-row">
                              <Typography variant="caption">Description</Typography>
                              <Typography variant="body2">{app.description || 'N/A'}</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Ready Made Apps Videos Accordion */}
        {clientDetails.readyMapAppsVideo && clientDetails.readyMapAppsVideo.length > 0 && (
          <Accordion 
            expanded={expandedPanel === 'videos'} 
            onChange={handleAccordionChange('videos')}
            className="client-accordion"
          >
            <AccordionSummary 
              expandIcon={<ExpandMore />}
              className="accordion-header"
            >
              <Box className="accordion-title-container">
                <VideoLibrary className="accordion-icon" />
                <Typography variant="h6" className="accordion-title">
                  Application Videos
              </Typography>
                <Chip
                  label={`${clientDetails.total_videos} Video${clientDetails.total_videos !== 1 ? 's' : ''}`}
                  variant="outlined"
                  size="small"
                  className="count-chip"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails className="accordion-content">
              <Grid container spacing={3}>
                {clientDetails.readyMapAppsVideo.map((video, index) => (
                  <Grid item xs={12} md={6} key={video.id}>
                    <Paper className="professional-card">
                      <Box className="card-header">
                        <VideoLibrary className="card-icon" />
                        <Typography variant="h6" className="card-title">
                        {video.title || 'Video Title N/A'}
                      </Typography>
                      </Box>
                      <Box className="card-content">
                        <Box className="detail-row">
                          <Typography variant="caption">Description</Typography>
                          <Typography variant="body2">{video.description || 'N/A'}</Typography>
                        </Box>
                        <Box className="detail-row">
                          <Typography variant="caption">Video URL</Typography>
                          <Typography variant="body2" className="video-url">{video.video_url || 'N/A'}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    </div>
  );
};

export default ClientDetail; 