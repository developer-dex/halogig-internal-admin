import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Country } from 'country-state-city';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Link,
  Divider,
  Button,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Work,
  FolderOpen,
  School,
  CardMembership,
  Business,
  LocationOn,
  Email,
  Phone,
  Language,
  AttachMoney,
  CalendarToday,
  Link as LinkIcon,
  GetApp,
  Public,
  Description,
  Delete,
  Add,
  Settings,
} from '@mui/icons-material';
import { Home, WorkOutline } from '@mui/icons-material';
import { 
  freelancerCompleteData,
  getFreelancerCountryPreferences,
  addFreelancerCountryPreference,
  updateFreelancerCountryPreference,
  deleteFreelancerCountryPreference,
  updateMaxProposalValue,
  updateMaxDeliveryInProgress
} from '../../features/admin/freelancerManagementSlice';
import { statusChange } from '../../features/admin/clientManagementSlice';
import Breadcrumb from '../../components/Breadcrumb';
import './FreeLancerDetail.scss';

const FreeLancerDetail = () => {
  const { freelancerId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentTab, setCurrentTab] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Project Preferences state - only for UI state
  const [availableCountries, setAvailableCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [maxProposalValue, setMaxProposalValue] = useState('');
  const [maxDeliveryInProgress, setMaxDeliveryInProgress] = useState('');

  // Get data from Redux store
  const { 
    completeDataLoading, 
    completeData, 
    completeDataError,
    countryPreferences,
    countryPreferencesLoading,
    addingCountryPreference,
    updatingCountryPreference,
    deletingCountryPreference,
    updatingMaxProposalValue,
    updatingMaxDeliveryInProgress
  } = useSelector((state) => state.freelancerDataReducer);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', path: '/clients', icon: <Home /> },
    { label: 'Freelancers', path: '/freelancer', icon: <WorkOutline /> },
    { label: 'Details', path: null, icon: <Person /> }
  ];

  useEffect(() => {
    if (freelancerId) {
      dispatch(freelancerCompleteData({ userId: freelancerId }));
      dispatch(getFreelancerCountryPreferences({ userId: freelancerId }));
      // Load countries from country-state-city library
      const countries = Country.getAllCountries().map(country => ({
        name: country.name,
        value: country.name,
        isoCode: country.isoCode,
        phoneCode: country.phonecode
      }));
      setAvailableCountries(countries);
    }
  }, [dispatch, freelancerId]);

  // Populate max values when completeData is loaded
  useEffect(() => {
    if (completeData?.primaryIntroduction?.user) {
      const user = completeData.primaryIntroduction.user;
      setMaxProposalValue(user.max_proposal_value || '');
      setMaxDeliveryInProgress(user.max_delivery_in_progress || '');
    }
  }, [completeData]);

  // Redux action handlers for country preferences
  const handleAddCountryPreference = async () => {
    if (!selectedCountry) return;
    
    const countryData = {
      country: selectedCountry,
      add_by_admin: true,
    };

    const result = await dispatch(addFreelancerCountryPreference({ 
      userId: freelancerId, 
      countryData 
    }));
    
    if (result.type.endsWith('/fulfilled')) {
      setSelectedCountry('');
      // Refresh the country preferences list
      dispatch(getFreelancerCountryPreferences({ userId: freelancerId }));
    }
  };

  const handleDeleteCountryPreference = async (preferenceId) => {
    await dispatch(deleteFreelancerCountryPreference({ 
      userId: freelancerId, 
      preferenceId 
    }));
  };

  const handleUpdateCountryPreference = async (preferenceId, updateData) => {
    const result = await dispatch(updateFreelancerCountryPreference({ 
      userId: freelancerId, 
      updateData: {
        id: preferenceId,
        ...updateData
      }
    }));
    
    if (result.type.endsWith('/fulfilled')) {
      // Refresh the country preferences list
      dispatch(getFreelancerCountryPreferences({ userId: freelancerId }));
    }
  };

  // Handler functions for max values
  const handleUpdateMaxProposalValue = async () => {
    if (!maxProposalValue || maxProposalValue.trim() === '') return;
    
    const result = await dispatch(updateMaxProposalValue({ 
      userId: freelancerId, 
      maxProposalValue: parseFloat(maxProposalValue) 
    }));
    
    if (result.type.endsWith('/fulfilled')) {
      // Refresh the complete data to get updated values
      dispatch(freelancerCompleteData({ userId: freelancerId }));
    }
  };

  const handleUpdateMaxDeliveryInProgress = async () => {
    if (!maxDeliveryInProgress || maxDeliveryInProgress.trim() === '') return;
    
    const result = await dispatch(updateMaxDeliveryInProgress({ 
      userId: freelancerId, 
      maxDeliveryInProgress: parseInt(maxDeliveryInProgress, 10) 
    }));
    
    if (result.type.endsWith('/fulfilled')) {
      // Refresh the complete data to get updated values
      dispatch(freelancerCompleteData({ userId: freelancerId }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handler for updating freelancer status (Approved, Rejected, Pending, Under Review)
  const handleUpdateStatus = async (status) => {
    if (!freelancerId) return;
    setUpdatingStatus(true);
    try {
      await dispatch(statusChange({ id: freelancerId, apiData: { status } }));
      // Refresh details after status update
      dispatch(freelancerCompleteData({ userId: freelancerId }));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleBackClick = () => {
    navigate('/freelancer');
  };

  if (completeDataLoading) {
    return (
      <div className="freelancer-detail">
        <Breadcrumb items={breadcrumbItems} />
        <div className="loading-container">
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (completeDataError || !completeData) {
    return (
      <div className="freelancer-detail">
        <Breadcrumb items={breadcrumbItems} />
        <div className="error-container">
          <Typography variant="h6" color="error">
            Failed to load freelancer details. Please try again.
          </Typography>
          <Button onClick={handleBackClick} className="gradient-secondary">
            Back to Freelancers
          </Button>
        </div>
      </div>
    );
  }

  const { primaryIntroduction, professionalExperience, projects, certifications, education, billingDetails, summary } = completeData;

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`freelancer-tabpanel-${index}`}
      aria-labelledby={`freelancer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount, currency) => {
    if (!amount) return '--';
    return `${currency || '$'} ${amount}`;
  };

  // Helper function to render info item (matching ProjectBidDetail pattern)
  const renderInfoItem = (icon, label, value, fullWidth = false) => {
    if (!value && value !== 0 && value !== false) return null;
    
    return (
      <Grid item xs={12} sm={fullWidth ? 12 : 6} md={fullWidth ? 12 : 4}>
        <Box className="info-item">
          <Box className="info-header">
            {icon}
            <Typography variant="subtitle2" className="info-label">
              {label}
            </Typography>
          </Box>
          <Typography variant="body1" className="info-value">
            {value}
          </Typography>
        </Box>
      </Grid>
    );
  };

  const renderPrimaryIntroduction = () => {
    const { user, designation } = primaryIntroduction;
    if (!user) return <Typography>No primary introduction data available.</Typography>;

    return (
      <Grid container spacing={3}>
        {/* Profile Overview Section */}
        <Grid item xs={12}>
          <Card className="detail-section">
            <CardContent>
              <Box className="section-header">
                <Person className="section-icon" />
                <Typography variant="h6" className="section-title">
                  Profile Overview
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {/* Avatar and Basic Info */}
                <Grid item xs={12} md={4}>
                  <Box className="profile-summary">
                    <Avatar
                      src={user.profile_image}
                      className="profile-avatar"
                    >
                      {`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}
                    </Avatar>
                    <Typography variant="h5" className="profile-name">
                      {`${user.first_name || ''} ${user.last_name || ''}`}
                    </Typography>
                    <Chip 
                      label={user.status || 'Unknown'} 
                      color={user.status === 'approval' ? 'success' : 'warning'}
                      variant="filled"
                      className="profile-status"
                    />
                  </Box>
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    {renderInfoItem(<Email />, 'Email', user.email)}
                    {renderInfoItem(<Phone />, 'Mobile', user.mobile)}
                    {renderInfoItem(<Person />, 'Gender', user.gender)}
                    {renderInfoItem(<Business />, 'Designation', designation?.name)}
                    {renderInfoItem(<Business />, 'Company', user.company_name)}
                    {renderInfoItem(<LocationOn />, 'Location', 
                      [user.city, user.state, user.country].filter(Boolean).join(', ')
                    )}
                    {user.address && renderInfoItem(<LocationOn />, 'Address', user.address, true)}
                    {user.aboutme && renderInfoItem(<Person />, 'About', user.aboutme, true)}
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderProfessionalExperience = () => {
    const { data, category, subCategory } = professionalExperience;
    if (!data) return <Typography>No professional experience data available.</Typography>;

    return (
      <Grid container spacing={3}>
        {/* Professional Overview */}
        <Grid item xs={12}>
          <Card className="detail-section">
            <CardContent>
              <Box className="section-header">
                <Work className="section-icon" />
                <Typography variant="h6" className="section-title">
                  Professional Overview
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {data.profile_headline && renderInfoItem(<Work />, 'Profile Headline', data.profile_headline, true)}
                {renderInfoItem(<Business />, 'Category', category?.name)}
                {renderInfoItem(<Business />, 'Sub Category', subCategory?.name)}
                {renderInfoItem(<AttachMoney />, 'Rate per Hour', formatCurrency(data.rateperhour, data.currency?.split('-')[1]))}
                {renderInfoItem(<Language />, 'Languages', data.languages)}
                
                {data.technologty_pre && (
                  <Grid item xs={12}>
                    <Box className="info-item">
                      <Box className="info-header">
                        <Business className="section-icon" />
                        <Typography variant="subtitle2" className="info-label">
                          Technologies
                        </Typography>
                      </Box>
                      <Box className="chip-container">
                        {data.technologty_pre.split(',').map((tech, index) => (
                          <Chip key={index} label={tech.trim()} size="small" className="tech-chip" />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Platform Links */}
        <Grid item xs={12}>
          <Card className="detail-section">
            <CardContent>
              <Box className="section-header">
                <Public className="section-icon" />
                <Typography variant="h6" className="section-title">
                  Platform Links
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {[
                  { name: 'Upwork', active: data.upwork_platform, link: data.upwork_platform_profile_link },
                  { name: 'Fiverr', active: data.fiver_platform, link: data.fiver_platform_profile_link },
                  { name: 'Freelancer', active: data.freelancer_platform, link: data.freelancer_platform_profile_link },
                  { name: 'PeoplePerHour', active: data.pph_platform, link: data.pph_platform_profile_link },
                  { name: 'Truelancer', active: data.truelancer_platform, link: data.truelancer_platform_profile_link },
                  { name: data.other_platform || 'Other', active: !!data.other_platform, link: data.other_platform_profile_link }
                ].filter(platform => platform.active).map((platform, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box className="info-item">
                      <Box className="info-header">
                        <LinkIcon className="section-icon" />
                        <Typography variant="subtitle2" className="info-label">
                          {platform.name}
                        </Typography>
                      </Box>
                      {platform.link ? (
                        <Link 
                          href={platform.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="platform-link"
                        >
                          {platform.link}
                        </Link>
                      ) : (
                        <Typography variant="body1" className="info-value">Active (No link provided)</Typography>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderProjects = () => {
    const { data: projectsData, count } = projects;
    if (!projectsData || projectsData.length === 0) {
      return <Typography>No projects data available.</Typography>;
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card className="detail-section">
            <CardContent>
              <Box className="section-header">
                <FolderOpen className="section-icon" />
                <Typography variant="h6" className="section-title">
                  Projects ({count})
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {projectsData.map((project, index) => (
                  <Grid item xs={12} md={6} key={project.id || index}>
                    <Card className="project-card">
                      <CardContent>
                        <Typography variant="h6" className="project-title">
                          {project.project_name || `Project ${index + 1}`}
                        </Typography>
                        
                        <Grid container spacing={2} className="project-info">
                          {renderInfoItem(<CalendarToday />, 'Duration', project.duration ? `${project.duration} months` : null)}
                          {renderInfoItem(<LocationOn />, 'Location', project.project_location)}
                          
                          {project.technologty_pre && (
                            <Grid item xs={12}>
                              <Box className="info-item">
                                <Box className="info-header">
                                  <Business className="section-icon" />
                                  <Typography variant="subtitle2" className="info-label">
                                    Technologies
                                  </Typography>
                                </Box>
                                <Box className="chip-container">
                                  {project.technologty_pre.split(',').map((tech, techIndex) => (
                                    <Chip key={techIndex} label={tech.trim()} size="small" className="tech-chip" />
                                  ))}
                                </Box>
                              </Box>
                            </Grid>
                          )}

                          {/* Platform indicators */}
                          <Grid item xs={12}>
                            <Box className="info-item">
                              <Box className="info-header">
                                <Public className="section-icon" />
                                <Typography variant="subtitle2" className="info-label">
                                  Platforms
                                </Typography>
                              </Box>
                              <Box className="chip-container">
                                {[
                                  { name: 'Web', active: project.is_web_platform },
                                  { name: 'Mobile', active: project.is_mobile_platform },
                                  { name: 'Desktop', active: project.is_desktop_platform },
                                  { name: 'Embedding', active: project.is_embedding_platform }
                                ].filter(platform => platform.active).map((platform, platformIndex) => (
                                  <Chip key={platformIndex} label={platform.name} size="small" variant="outlined" className="platform-chip" />
                                ))}
                              </Box>
                            </Box>
                          </Grid>

                          {project.project_details && (
                            <Grid item xs={12}>
                              <Box className="info-item">
                                <Box className="info-header">
                                  <Description className="section-icon" />
                                  <Typography variant="subtitle2" className="info-label">
                                    Description
                                  </Typography>
                                </Box>
                                <Typography variant="body1" className="info-value project-description">
                                  {project.project_details.length > 200 ? 
                                    `${project.project_details.substring(0, 200)}...` : 
                                    project.project_details
                                  }
                                </Typography>
                              </Box>
                            </Grid>
                          )}

                          {(project.project_link || project.upload_file) && (
                            <Grid item xs={12}>
                              <Box className="project-links">
                                {project.project_link && (
                                  <Link 
                                    href={project.project_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="project-link"
                                  >
                                    <LinkIcon /> View Project
                                  </Link>
                                )}
                                {project.upload_file && (
                                  <Link 
                                    href={project.upload_file} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="project-link"
                                  >
                                    <GetApp /> Download File
                                  </Link>
                                )}
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderCertifications = () => {
    const { data: certsData, count } = certifications;
    if (!certsData || certsData.length === 0) {
      return <Typography>No certifications data available.</Typography>;
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card className="detail-section">
            <CardContent>
              <Box className="section-header">
                <CardMembership className="section-icon" />
                <Typography variant="h6" className="section-title">
                  Certifications ({count})
                </Typography>
              </Box>

              <TableContainer className="data-table">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Certificate Name</TableCell>
                      <TableCell>Institution</TableCell>
                      <TableCell>Certificate No.</TableCell>
                      <TableCell>From</TableCell>
                      <TableCell>Till</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {certsData.map((cert, index) => (
                      <TableRow key={cert.certificate_id || index}>
                        <TableCell>{cert.name || '--'}</TableCell>
                        <TableCell>{cert.institutename || '--'}</TableCell>
                        <TableCell>{cert.certificate_no || '--'}</TableCell>
                        <TableCell>{cert.from_date || '--'}</TableCell>
                        <TableCell>{cert.till_date || '--'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderEducation = () => {
    const { data: eduData, count, graduation, postGraduation } = education;
    if (!eduData || eduData.length === 0) {
      return <Typography>No education data available.</Typography>;
    }

    return (
      <Grid container spacing={3}>
        {graduation && graduation.length > 0 && (
          <Grid item xs={12}>
            <Card className="detail-section">
              <CardContent>
                <Box className="section-header">
                  <School className="section-icon" />
                  <Typography variant="h6" className="section-title">
                    Graduation
                  </Typography>
                </Box>
                <TableContainer className="data-table">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Degree</TableCell>
                        <TableCell>University</TableCell>
                        <TableCell>Education Type</TableCell>
                        <TableCell>Year</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {graduation.map((edu, index) => (
                        <TableRow key={edu.id || index}>
                          <TableCell>{edu.degree || '--'}</TableCell>
                          <TableCell>{edu.university_name || '--'}</TableCell>
                          <TableCell>{edu.education_type || '--'}</TableCell>
                          <TableCell>{edu.year || '--'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {postGraduation && postGraduation.length > 0 && (
          <Grid item xs={12}>
            <Card className="detail-section">
              <CardContent>
                <Box className="section-header">
                  <School className="section-icon" />
                  <Typography variant="h6" className="section-title">
                    Post Graduation
                  </Typography>
                </Box>
                <TableContainer className="data-table">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Degree</TableCell>
                        <TableCell>University</TableCell>
                        <TableCell>Education Type</TableCell>
                        <TableCell>Year</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {postGraduation.map((edu, index) => (
                        <TableRow key={edu.id || index}>
                          <TableCell>{edu.degree || '--'}</TableCell>
                          <TableCell>{edu.university_name || '--'}</TableCell>
                          <TableCell>{edu.education_type || '--'}</TableCell>
                          <TableCell>{edu.year || '--'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderProjectPreferences = () => {
    // Separate admin-added and user-added countries
    const adminCountries = countryPreferences.filter(pref => pref.add_by_admin === true);
    const userCountries = countryPreferences.filter(pref => pref.add_by_admin === false);

    return (
      <Grid container spacing={3}>
        {/* Prefer Countries Section */}
        <Grid item xs={12}>
          <Card className="detail-section">
            <CardContent>
              <Box className="section-header">
                <Public className="section-icon" />
                <Typography variant="h6" className="section-title">
                  Prefer Countries
                </Typography>
              </Box>
              
              {/* Admin-added Countries with Checkboxes */}
              {adminCountries.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Admin Added Countries
                  </Typography>
                  <Grid container spacing={2}>
                    {adminCountries.map((preference) => (
                      <Grid item xs={12} sm={6} md={4} key={preference.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={preference.is_currrently_active}
                              onChange={(e) => 
                                handleUpdateCountryPreference(preference.id, { 
                                  is_currrently_active: e.target.checked 
                                })
                              }
                              disabled={updatingCountryPreference}
                            />
                          }
                          label={preference.country}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCountryPreference(preference.id)}
                          disabled={deletingCountryPreference}
                          sx={{ ml: 1 }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Add New Country Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Add Country Preference
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Select Country</InputLabel>
                    <Select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      disabled={addingCountryPreference}
                    >
                      {availableCountries
                        .filter(country => !countryPreferences.some(pref => pref.country === country.value))
                        .map((country) => (
                          <MenuItem key={country.value} value={country.value}>
                            {country.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddCountryPreference}
                    disabled={addingCountryPreference || !selectedCountry}
                    className="gradient-primary"
                  >
                    {addingCountryPreference ? 'Adding...' : 'Add Country'}
                  </Button>
                </Box>
              </Box>

              {/* User-added Countries List */}
              {userCountries.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    User Added Countries
                  </Typography>
                  <List>
                    {userCountries.map((preference) => (
                      <ListItem key={preference.id} divider>
                        <ListItemText
                          primary={preference.country}
                          secondary={`Added: ${new Date(preference.created_at).toLocaleDateString()}`}
                        />
                        <ListItemSecondaryAction>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={preference.is_currrently_active}
                                onChange={(e) => 
                                  handleUpdateCountryPreference(preference.id, { 
                                    is_currrently_active: e.target.checked 
                                  })
                                }
                                disabled={updatingCountryPreference}
                              />
                            }
                            label="Active"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Max Proposal Value Section */}
        <Grid item xs={12} md={6}>
          <Card className="detail-section">
            <CardContent>
              <Box className="section-header">
                <AttachMoney className="section-icon" />
                <Typography variant="h6" className="section-title">
                  Max Proposal Value
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mt: 2 }}>
                <TextField
                  fullWidth
                  type="text"
                  inputMode="numeric"
                  label="Maximum Proposal Value"
                  value={maxProposalValue}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, '');
                    setMaxProposalValue(v);
                  }}
                  variant="outlined"
                  placeholder="Enter maximum proposal value"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleUpdateMaxProposalValue}
                  disabled={updatingMaxProposalValue || !maxProposalValue}
                  className="gradient-primary"
                  sx={{ minWidth: '100px', height: '56px' }}
                >
                  {updatingMaxProposalValue ? 'Updating...' : 'Update'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Max Delivery In Progress Section */}
        <Grid item xs={12} md={6}>
          <Card className="detail-section">
            <CardContent>
              <Box className="section-header">
                <Work className="section-icon" />
                <Typography variant="h6" className="section-title">
                  Max Delivery In Progress
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mt: 2 }}>
                <TextField
                  fullWidth
                  type="text"
                  inputMode="numeric"
                  label="Maximum Delivery In Progress"
                  value={maxDeliveryInProgress}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9]/g, '');
                    setMaxDeliveryInProgress(v);
                  }}
                  variant="outlined"
                  placeholder="Enter maximum delivery in progress"
                />
                <Button
                  variant="contained"
                  onClick={handleUpdateMaxDeliveryInProgress}
                  disabled={updatingMaxDeliveryInProgress || !maxDeliveryInProgress}
                  className="gradient-primary"
                  sx={{ minWidth: '100px', height: '56px' }}
                >
                  {updatingMaxDeliveryInProgress ? 'Updating...' : 'Update'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <div className="freelancer-detail">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="detail-container">
        {/* Page Header */}
     

        {/* Tabs Section */}
        <Card className="detail-section tabs-section">
          <Box className="tabs-container">
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={currentTab} onChange={handleTabChange} aria-label="freelancer detail tabs">
                <Tab label="Primary Introduction" icon={<Person />} />
                <Tab label="Professional Experience" icon={<Work />} />
                <Tab label="Projects" icon={<FolderOpen />} />
                <Tab label="Certifications" icon={<CardMembership />} />
                <Tab label="Education" icon={<School />} />
                <Tab label="Project Preferences" icon={<Settings />} />
              </Tabs>
            </Box>

            <TabPanel value={currentTab} index={0}>
              {renderPrimaryIntroduction()}
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              {renderProfessionalExperience()}
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
              {renderProjects()}
            </TabPanel>

            <TabPanel value={currentTab} index={3}>
              {renderCertifications()}
            </TabPanel>

            <TabPanel value={currentTab} index={4}>
              {renderEducation()}
            </TabPanel>

            <TabPanel value={currentTab} index={5}>
              {renderProjectPreferences()}
            </TabPanel>
          </Box>
        </Card>
        {/* Footer Actions: Status Update Buttons */}
        {(() => {
          const rawStatus = completeData?.primaryIntroduction?.user?.status || '';
          const normalizedStatus = (() => {
            const s = String(rawStatus).toLowerCase();
            if (s === 'approval') return 'approved';
            return s;
          })();
          return (
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button
            variant={normalizedStatus === 'pending' ? 'contained' : 'outlined'}
            onClick={() => handleUpdateStatus('Pending')}
            disabled={updatingStatus}
            className="status-button pending"
          >
            Pending
          </Button>
          <Button
            variant={normalizedStatus === 'under review' ? 'contained' : 'outlined'}
            onClick={() => handleUpdateStatus('Under Review')}
            disabled={updatingStatus}
            className="status-button under-review"
          >
            Under Review
          </Button>
          <Button
            variant={normalizedStatus === 'rejected' ? 'contained' : 'outlined'}
            onClick={() => handleUpdateStatus('Rejected')}
            disabled={updatingStatus}
            className="status-button rejected"
          >
            Rejected
          </Button>
          <Button
            variant={normalizedStatus === 'approved' ? 'contained' : 'outlined'}
            onClick={() => handleUpdateStatus('Approved')}
            disabled={updatingStatus}
            className="gradient-primary"
          >
            {updatingStatus ? 'Updating...' : 'Approved'}
          </Button>
        </Box>
          );
        })()}
      </div>
    </div>
  );
};

export default FreeLancerDetail;
