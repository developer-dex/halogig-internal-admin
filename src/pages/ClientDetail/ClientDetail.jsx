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
} from '@mui/material';
import {
  ArrowBack,
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
} from '@mui/icons-material';
import './ClientDetail.scss';

const ClientDetail = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  
  // Local state for client details
  const [clientDetails, setClientDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

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

  const handleBack = () => {
    navigate('/clients');
  };

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

  if (isLoading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  if (isError || !clientDetails) {
    return (
      <div className="error-container">
        <Typography variant="h6" color="error">
          Failed to load client details
        </Typography>
        <Button onClick={handleBack} variant="contained" sx={{ mt: 2 }}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="client-detail">
      <div className="header-client-detail">
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Back to Client List
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Client Details
        </Typography>
      </div>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Personal Information Card */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: { md: '0 0 33.333%' } }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    src={clientDetails.profile_image}
                    sx={{ width: 80, height: 80, mr: 2 }}
                  >
                    {clientDetails.first_name?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {clientDetails.first_name} {clientDetails.last_name}
                    </Typography>
                    <Chip
                      label={clientDetails.status}
                      color={getStatusColor(clientDetails.status)}
                      size="small"
                    />
                  </Box>
                </Box>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={clientDetails.email || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText
                      primary="Mobile"
                      secondary={clientDetails.mobile || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Business />
                    </ListItemIcon>
                    <ListItemText
                      primary="Company"
                      secondary={clientDetails.company_name || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText
                      primary="Location"
                      secondary={`${clientDetails.city || ''} ${clientDetails.country || ''}`.trim() || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="Gender"
                      secondary={clientDetails.gender || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Date of Registration"
                      secondary={formatDate(clientDetails.createdAt)}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* Additional Details Card */}
          <Box sx={{ flex: { md: '0 0 66.667%' } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Username
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.username || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      GST Number
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.gst_number || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      PAN Card
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.pan_card_no || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Government ID
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.govtID || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      ID Proof Number
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.idProofNo || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Postal Code
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.postal || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      State
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.user_state || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Date of Issue
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(clientDetails.doi)}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Pseudo Name
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.pseudoName || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Experience
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.experience || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Key Skills
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.key_skills || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Bio
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.bio || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Rating
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.rating || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Designation
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.designation || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Register As
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.register_as || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Last Login
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(clientDetails.last_login)}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Last Login IP
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.last_login_ip || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      OTP
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.otp || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Role
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.role || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Profile Published
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.is_profile_published ? 'Yes' : 'No'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)' } }}>
                    <Typography variant="body2" color="textSecondary">
                      Anonymous
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.anonymous ? 'Yes' : 'No'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 100%' }}>
                    <Typography variant="body2" color="textSecondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.address || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 100%' }}>
                    <Typography variant="body2" color="textSecondary">
                      About Me
                    </Typography>
                    <Typography variant="body1">
                      {clientDetails.aboutme || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Professional Details Section */}
        {clientDetails.ProfessionalDetails && clientDetails.ProfessionalDetails.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                Professional Details ({clientDetails.total_professional_details})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {clientDetails.ProfessionalDetails.map((professional) => (
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)', md: '0 0 calc(33.333% - 8px)' } }} key={professional.id}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {professional.company_name || 'Company Name N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Position: {professional.position || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Duration: {professional.duration || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Description: {professional.description || 'N/A'}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Certificates Section */}
        {clientDetails.Certificates && clientDetails.Certificates.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CardGiftcard sx={{ mr: 1, verticalAlign: 'middle' }} />
                Certificates ({clientDetails.total_certificates})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {clientDetails.Certificates.map((certificate) => (
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)', md: '0 0 calc(33.333% - 8px)' } }} key={certificate.id}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {certificate.certificate_name || 'Certificate Name N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Issuing Organization: {certificate.issuing_organization || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Issue Date: {formatDate(certificate.issue_date)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Expiry Date: {formatDate(certificate.expiry_date)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Credential ID: {certificate.credential_id || 'N/A'}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Education Section */}
        {clientDetails.Education && clientDetails.Education.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                Education ({clientDetails.total_education})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {clientDetails.Education.map((education, index) => (
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)', md: '0 0 calc(33.333% - 8px)' } }} key={education.id}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {education.university_name || 'University Name N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Education Type: {education.education_type || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Graduation Type: {education.graduation_type || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Degree: {education.degree || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Month: {education.month || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Year: {education.year || 'N/A'}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        {clientDetails.Projects && clientDetails.Projects.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                Projects ({clientDetails.total_projects})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {clientDetails.Projects.map((project) => (
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)', md: '0 0 calc(33.333% - 8px)' } }} key={project.id}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {project.project_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Type: {project.project_type || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Duration: {project.duration || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Technology Preference: {project.technologty_pre || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Industry: {project.industry || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Project Link: {project.project_link || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Mobile Platform: {project.is_mobile_platform ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Web Platform: {project.is_web_platform ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Desktop Platform: {project.is_desktop_platform ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ wordBreak: 'break-word' }}>
                        Details: {project.project_details || 'N/A'}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Ready Made Apps Section */}
        {clientDetails.readyMadeApps && clientDetails.readyMadeApps.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Apps sx={{ mr: 1, verticalAlign: 'middle' }} />
                Ready Made Apps ({clientDetails.total_ready_made_apps})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {clientDetails.readyMadeApps.map((app) => (
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)', md: '0 0 calc(33.333% - 8px)' } }} key={app.id}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {app.appName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Industry: {app.industry || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Technology: {app.technology || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Software Version: {app.softwareVersion || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Features: {app.features || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Delivery Time: {app.deliveryTime || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Source Code: {app.sourceCode || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Price: {app.price} {app.currency_type}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Headline: {app.headline || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Mobile Platform: {app.is_mobile_platform ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Web Platform: {app.is_web_platform ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Desktop Platform: {app.is_desktop_platform ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Customizable: {app.is_customizable ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Published: {app.is_published ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ wordBreak: 'break-word' }}>
                        Description: {app.description || 'N/A'}
                      </Typography>
                      {app.Thumbnail && app.Thumbnail.thumbnailImages && app.Thumbnail.thumbnailImages.length > 0 && (
                        <Box mt={1}>
                          <img
                            src={app.Thumbnail.thumbnailImages[0].imageUrl}
                            alt={app.appName}
                            style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                          />
                        </Box>
                      )}
                    </Paper>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Ready Made Apps Videos Section */}
        {clientDetails.readyMapAppsVideo && clientDetails.readyMapAppsVideo.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <VideoLibrary sx={{ mr: 1, verticalAlign: 'middle' }} />
                Ready Made Apps Videos ({clientDetails.total_videos})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {clientDetails.readyMapAppsVideo.map((video) => (
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 calc(50% - 8px)', md: '0 0 calc(33.333% - 8px)' } }} key={video.id}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {video.title || 'Video Title N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Description: {video.description || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Video URL: {video.video_url || 'N/A'}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </div>
  );
};

export default ClientDetail; 