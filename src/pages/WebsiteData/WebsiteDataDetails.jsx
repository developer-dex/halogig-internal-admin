import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Paper,
  IconButton,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import {
  getWebsiteDataById,
  updateWebsiteData,
} from '../../features/admin/websiteDataSlice';
import { patchApi } from '../../services/api';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Home, Web, Edit } from '@mui/icons-material';
import './WebsiteDataDetails.scss';

const WebsiteDataDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Redux state
  const { isLoading, responseData } = useSelector((state) => state.websiteData);
  
  // Local state
  const [formData, setFormData] = useState({
    categoryName: '',
    serviceName: '',
    slugLink: '',
    primaryKeyword: '',
    secondaryKeyword: '',
    bannerTitle: '',
    bannerDescription: '',
    serviceTitle: '',
    serviceDescription: '',
    serviceLists: [{ title: '', description: '' }],
    industryTitle: '',
    industryLists: [''],
    mainApplicationTitle: '',
    mainApplicationDescription: '',
    mainApplicationLists: [{ title: '', description: '' }],
    interlinkPages: [{ slug: '', altername_skill_name: '' }],
    usercaseListes: [''],
    metaTitle: '',
    metaDescription: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncField, setSyncField] = useState('');
  const [syncValue, setSyncValue] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [saveConfirmDialogOpen, setSaveConfirmDialogOpen] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', path: '/website-data', icon: <Home /> },
    { label: 'Website Data', path: '/website-data', icon: <Web /> },
    { label: 'Details', path: null, icon: <Edit /> }
  ];

  // Fetch website data by ID
  const fetchWebsiteData = async () => {
    try {
      const response = await dispatch(getWebsiteDataById(id));
      if (response.payload?.data?.success) {
        const data = response.payload.data.data;
        setOriginalData(data);
        
        // Populate form data
        setFormData({
          categoryName: data.category_name || '',
          serviceName: data.service_name || '',
          slugLink: data.slug_link || '',
          primaryKeyword: data.primary_keyword || '',
          secondaryKeyword: data.secondary_keyword || '',
          bannerTitle: data.banner_title || '',
          bannerDescription: data.banner_description || '',
          serviceTitle: data.service_title || '',
          serviceDescription: data.service_description || '',
          serviceLists: data.service_lists && data.service_lists.length > 0 
            ? data.service_lists 
            : [{ title: '', description: '' }],
          industryTitle: data.industry_title || '',
          industryLists: data.industry_lists 
            ? data.industry_lists.split(',').map(item => item.trim())
            : [''],
          mainApplicationTitle: data.main_application_title || '',
          mainApplicationDescription: data.main_application_description || '',
          mainApplicationLists: data.main_application_lists && data.main_application_lists.length > 0 
            ? data.main_application_lists 
            : [{ title: '', description: '' }],
          interlinkPages: data.interlink_pages && data.interlink_pages.length > 0 
            ? data.interlink_pages 
            : [{ slug: '', altername_skill_name: '' }],
          usercaseListes: data.usercase_listes 
            ? data.usercase_listes.split(',').map(item => item.trim())
            : [''],
          metaTitle: data.meta_title || '',
          metaDescription: data.meta_description || '',
        });
      }
    } catch (error) {
      console.error('Error fetching website data:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchWebsiteData();
    }
  }, [id]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle service lists changes
  const handleServiceListChange = (index, field, value) => {
    const newServiceLists = formData.serviceLists.map((service, i) => 
      i === index 
        ? { ...service, [field]: value }
        : service
    );
    setFormData(prev => ({
      ...prev,
      serviceLists: newServiceLists
    }));
  };

  const addServiceList = () => {
    if (formData.serviceLists.length < 5) {
      setFormData(prev => ({
        ...prev,
        serviceLists: [...prev.serviceLists, { title: '', description: '' }]
      }));
    }
  };

  const removeServiceList = (index) => {
    if (formData.serviceLists.length > 1) {
      const newServiceLists = formData.serviceLists.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        serviceLists: newServiceLists
      }));
    }
  };

  // Handle main application lists changes
  const handleMainApplicationChange = (index, field, value) => {
    const newMainApplicationLists = formData.mainApplicationLists.map((app, i) => 
      i === index 
        ? { ...app, [field]: value }
        : app
    );
    setFormData(prev => ({
      ...prev,
      mainApplicationLists: newMainApplicationLists
    }));
  };

  const addMainApplication = () => {
    if (formData.mainApplicationLists.length < 5) {
      setFormData(prev => ({
        ...prev,
        mainApplicationLists: [...prev.mainApplicationLists, { title: '', description: '' }]
      }));
    }
  };

  const removeMainApplication = (index) => {
    if (formData.mainApplicationLists.length > 1) {
      const newMainApplicationLists = formData.mainApplicationLists.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        mainApplicationLists: newMainApplicationLists
      }));
    }
  };

  // Handle interlink pages changes
  const handleInterlinkPageChange = (index, field, value) => {
    const newInterlinkPages = formData.interlinkPages.map((page, i) => 
      i === index 
        ? { ...page, [field]: value }
        : page
    );
    setFormData(prev => ({
      ...prev,
      interlinkPages: newInterlinkPages
    }));
  };

  const addInterlinkPage = () => {
    setFormData(prev => ({
      ...prev,
      interlinkPages: [...prev.interlinkPages, { slug: '', altername_skill_name: '' }]
    }));
  };

  const removeInterlinkPage = (index) => {
    if (formData.interlinkPages.length > 1) {
      const newInterlinkPages = formData.interlinkPages.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        interlinkPages: newInterlinkPages
      }));
    }
  };

  // Handle industry lists changes
  const handleIndustryListChange = (index, value) => {
    const newIndustryLists = [...formData.industryLists];
    newIndustryLists[index] = value;
    setFormData(prev => ({
      ...prev,
      industryLists: newIndustryLists
    }));
  };

  const addIndustryList = () => {
    setFormData(prev => ({
      ...prev,
      industryLists: [...prev.industryLists, '']
    }));
  };

  const removeIndustryList = (index) => {
    if (formData.industryLists.length > 1) {
      const newIndustryLists = formData.industryLists.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        industryLists: newIndustryLists
      }));
    }
  };

  // Handle usecase lists changes
  const handleUsecaseListChange = (index, value) => {
    const newUsercaseListes = [...formData.usercaseListes];
    newUsercaseListes[index] = value;
    setFormData(prev => ({
      ...prev,
      usercaseListes: newUsercaseListes
    }));
  };

  const addUsecaseList = () => {
    setFormData(prev => ({
      ...prev,
      usercaseListes: [...prev.usercaseListes, '']
    }));
  };

  const removeUsecaseList = (index) => {
    if (formData.usercaseListes.length > 1) {
      const newUsercaseListes = formData.usercaseListes.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        usercaseListes: newUsercaseListes
      }));
    }
  };

  // Handle save - show confirmation modal
  const handleSave = () => {
    // Validate required fields
    if (!formData.serviceName.trim()) {
      alert('Service name is required');
      return;
    }
    
    setSaveConfirmDialogOpen(true);
  };

  // Handle save confirmation - actually call the API
  const handleSaveConfirm = async () => {
    try {
      setIsSaving(true);
      setSaveConfirmDialogOpen(false);
      
      // Filter out empty service lists and main application lists
      const filteredServiceLists = formData.serviceLists.filter(service => 
        service.title.trim() || service.description.trim()
      );
      
      const filteredMainApplicationLists = formData.mainApplicationLists.filter(app => 
        app.title.trim() || app.description.trim()
      );

      const filteredInterlinkPages = formData.interlinkPages.filter(page => 
        page.slug.trim() || page.altername_skill_name.trim()
      );

      // Filter out empty industry and usecase lists
      const filteredIndustryLists = formData.industryLists.filter(industry => industry.trim());
      const filteredUsercaseListes = formData.usercaseListes.filter(usecase => usecase.trim());

      const submitData = {
        ...formData,
        serviceLists: filteredServiceLists,
        mainApplicationLists: filteredMainApplicationLists,
        interlinkPages: filteredInterlinkPages,
        industryLists: filteredIndustryLists.join(', '),
        usercaseListes: filteredUsercaseListes.join(', '),
      };

      await dispatch(updateWebsiteData({ 
        id: id, 
        data: submitData 
      }));
      
      setIsEditing(false);
      // Refresh data after successful update
      fetchWebsiteData();
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save cancel - close modal
  const handleSaveCancel = () => {
    setSaveConfirmDialogOpen(false);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (originalData) {
      // Reset form data to original values
      setFormData({
        categoryName: originalData.category_name || '',
        serviceName: originalData.service_name || '',
        slugLink: originalData.slug_link || '',
        primaryKeyword: originalData.primary_keyword || '',
        secondaryKeyword: originalData.secondary_keyword || '',
        bannerTitle: originalData.banner_title || '',
        bannerDescription: originalData.banner_description || '',
        serviceTitle: originalData.service_title || '',
        serviceDescription: originalData.service_description || '',
        serviceLists: originalData.service_lists && originalData.service_lists.length > 0 
          ? originalData.service_lists 
          : [{ title: '', description: '' }],
        industryTitle: originalData.industry_title || '',
        industryLists: originalData.industry_lists 
          ? originalData.industry_lists.split(',').map(item => item.trim())
          : [''],
        mainApplicationTitle: originalData.main_application_title || '',
        mainApplicationDescription: originalData.main_application_description || '',
        mainApplicationLists: originalData.main_application_lists && originalData.main_application_lists.length > 0 
          ? originalData.main_application_lists 
          : [{ title: '', description: '' }],
        interlinkPages: originalData.interlink_pages && originalData.interlink_pages.length > 0 
          ? originalData.interlink_pages 
          : [{ slug: '', altername_skill_name: '' }],
        usercaseListes: originalData.usercase_listes 
          ? originalData.usercase_listes.split(',').map(item => item.trim())
          : [''],
        metaTitle: originalData.meta_title || '',
        metaDescription: originalData.meta_description || '',
      });
    }
    setIsEditing(false);
  };

  // Handle sync all button click
  const handleSyncAll = (fieldName, fieldValue) => {
    setSyncField(fieldName);
    setSyncValue(fieldValue);
    setSyncDialogOpen(true);
  };

  // Handle sync confirmation
  const handleSyncConfirm = async () => {
    try {
      setIsSyncing(true);
      
      // Prepare the API payload
      const payload = {
        fields: {
          [syncField]: syncValue
        }
      };

      // Call the bulk update API
      const response = await patchApi('admin/website-data/bulk-update', payload);
      
      if (response.data.success) {
        // alert(`Successfully synced ${response.data.data.updatedRecords} records with ${syncField}: ${syncValue}`);
        // Refresh the current record data
        fetchWebsiteData();
      } else {
        alert('Failed to sync data: ' + response.data.message);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Error syncing data: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSyncing(false);
      setSyncDialogOpen(false);
    }
  };

  // Handle sync dialog close
  const handleSyncDialogClose = () => {
    setSyncDialogOpen(false);
    setSyncField('');
    setSyncValue('');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!originalData) {
    return (
      <Box>
        <Breadcrumb items={breadcrumbItems} />
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          Website data not found or failed to load.
        </Alert>
      </Box>
    );
  }

  return (
    <div className="website-data-details">
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" gutterBottom>
                Website Data Details
              </Typography>
              <Typography variant="body1" color="textSecondary">
                ID: {id} | Service: {originalData.service_name || 'N/A'}
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/website-data')}
                className="gradient-outlined"
              >
                Back to List
              </Button>
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  className="gradient-primary"
                >
                  Edit
                </Button>
              ) : (
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="gradient-outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gradient-primary"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category Name"
                value={formData.categoryName}
                onChange={(e) => handleInputChange('categoryName', e.target.value)}
                variant="outlined"
                disabled={!isEditing}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Service Name *"
                value={formData.serviceName}
                onChange={(e) => handleInputChange('serviceName', e.target.value)}
                variant="outlined"
                required
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Slug Link"
                value={formData.slugLink}
                onChange={(e) => handleInputChange('slugLink', e.target.value)}
                variant="outlined"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Meta Title"
                value={formData.metaTitle}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                variant="outlined"
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meta Description"
                value={formData.metaDescription}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                variant="outlined"
                multiline
                rows={3}
                minRows={3}
                disabled={!isEditing}
                sx={{ '& .MuiInputBase-root': { minHeight: '120px' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Primary Keyword"
                value={formData.primaryKeyword}
                onChange={(e) => handleInputChange('primaryKeyword', e.target.value)}
                variant="outlined"
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Secondary Keywords"
                value={formData.secondaryKeyword}
                onChange={(e) => handleInputChange('secondaryKeyword', e.target.value)}
                variant="outlined"
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Banner Title"
                value={formData.bannerTitle}
                onChange={(e) => handleInputChange('bannerTitle', e.target.value)}
                variant="outlined"
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Banner Description"
                value={formData.bannerDescription}
                onChange={(e) => handleInputChange('bannerDescription', e.target.value)}
                variant="outlined"
                multiline
                rows={3}
                minRows={3}
                disabled={!isEditing}
                sx={{ '& .MuiInputBase-root': { minHeight: '120px' } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  fullWidth
                  label="Service Title"
                  value={formData.serviceTitle}
                  onChange={(e) => handleInputChange('serviceTitle', e.target.value)}
                  variant="outlined"
                  disabled={!isEditing}
                />
                {isEditing && formData.serviceTitle && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SyncIcon />}
                    onClick={() => handleSyncAll('service_title', formData.serviceTitle)}
                    className="gradient-outlined"
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      whiteSpace: 'nowrap',
                      fontSize: '0.75rem',
                    }}
                    title="Sync this value to all records"
                  >
                    Sync All
                  </Button>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Service Description"
                value={formData.serviceDescription}
                onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                variant="outlined"
                multiline
                rows={3}
                minRows={3}
                disabled={!isEditing}
                sx={{ '& .MuiInputBase-root': { minHeight: '120px' } }}
              />
            </Grid>

               {/* Service Lists Section */}
               <Grid item xs={12}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" gutterBottom color="primary">
                  Service Lists (Max 5)
                </Typography>
                {isEditing && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addServiceList}
                    variant="contained"
                    size="small"
                    disabled={formData.serviceLists.length >= 5}
                    className="gradient-primary"
                  >
                    Add Service
                  </Button>
                )}
              </Box>
              
              {formData.serviceLists.map((service, index) => (
                <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="subtitle1">Service {index + 1}</Typography>
                    {isEditing && formData.serviceLists.length > 1 && (
                      <IconButton 
                        onClick={() => removeServiceList(index)}
                        color="error"
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Service Title"
                        value={service.title}
                        onChange={(e) => handleServiceListChange(index, 'title', e.target.value)}
                        variant="outlined"
                        size="small"
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Service Description"
                        value={service.description}
                        onChange={(e) => handleServiceListChange(index, 'description', e.target.value)}
                        variant="outlined"
                        size="small"
                        multiline
                        rows={3}
                        minRows={3}
                        disabled={!isEditing}
                        sx={{ '& .MuiInputBase-root': { minHeight: '100px' } }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>

            {/* Industry Title */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Industry Title"
                  value={formData.industryTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, industryTitle: e.target.value }))}
                  variant="outlined"
                  size="small"
                  disabled={!isEditing}
                />
                {isEditing && formData.industryTitle && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SyncIcon />}
                    onClick={() => handleSyncAll('industry_title', formData.industryTitle)}
                    className="gradient-outlined"
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      whiteSpace: 'nowrap',
                      fontSize: '0.75rem',
                    }}
                    title="Sync this value to all records"
                  >
                    Sync All
                  </Button>
                )}
              </Box>
            </Grid>

            {/* Industry Lists */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Industry Lists
              </Typography>
              {formData.industryLists.map((industry, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    label={`Industry ${index + 1}`}
                    value={industry}
                    onChange={(e) => handleIndustryListChange(index, e.target.value)}
                    variant="outlined"
                    size="small"
                    disabled={!isEditing}
                  />
                  {isEditing && formData.industryLists.length > 1 && (
                    <IconButton 
                      onClick={() => removeIndustryList(index)}
                      color="error"
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              {isEditing && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={addIndustryList}
                  variant="outlined"
                  size="small"
                  className="gradient-outlined"
                >
                  Add Industry
                </Button>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  fullWidth
                  label="Main Application Title"
                  value={formData.mainApplicationTitle}
                  onChange={(e) => handleInputChange('mainApplicationTitle', e.target.value)}
                  variant="outlined"
                  disabled={!isEditing}
                />
                {isEditing && formData.mainApplicationTitle && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SyncIcon />}
                    onClick={() => handleSyncAll('main_application_title', formData.mainApplicationTitle)}
                    className="gradient-outlined"
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      whiteSpace: 'nowrap',
                      fontSize: '0.75rem',
                    }}
                    title="Sync this value to all records"
                  >
                    Sync All
                  </Button>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Main Application Description"
                value={formData.mainApplicationDescription}
                onChange={(e) => handleInputChange('mainApplicationDescription', e.target.value)}
                variant="outlined"
                multiline
                rows={3}
                minRows={3}
                disabled={!isEditing}
                sx={{ '& .MuiInputBase-root': { minHeight: '120px' } }}
              />
            </Grid>

            {/* Main Application Lists Section */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" gutterBottom color="primary">
                  Main Application Lists (Max 5)
                </Typography>
                {isEditing && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addMainApplication}
                    variant="contained"
                    size="small"
                    disabled={formData.mainApplicationLists.length >= 5}
                    className="gradient-primary"
                  >
                    Add Application
                  </Button>
                )}
              </Box>
              
              {formData.mainApplicationLists.map((app, index) => (
                <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="subtitle1">Application {index + 1}</Typography>
                    {isEditing && formData.mainApplicationLists.length > 1 && (
                      <IconButton 
                        onClick={() => removeMainApplication(index)}
                        color="error"
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Application Title"
                        value={app.title}
                        onChange={(e) => handleMainApplicationChange(index, 'title', e.target.value)}
                        variant="outlined"
                        size="small"
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Application Description"
                        value={app.description}
                        onChange={(e) => handleMainApplicationChange(index, 'description', e.target.value)}
                        variant="outlined"
                        size="small"
                        multiline
                        rows={3}
                        minRows={3}
                        disabled={!isEditing}
                        sx={{ '& .MuiInputBase-root': { minHeight: '100px' } }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>


            {/* Use Case Lists */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Use Case Lists
              </Typography>
              {formData.usercaseListes.map((usecase, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                  <TextField
                    fullWidth
                    label={`Use Case ${index + 1}`}
                    value={usecase}
                    onChange={(e) => handleUsecaseListChange(index, e.target.value)}
                    variant="outlined"
                    size="small"
                    disabled={!isEditing}
                  />
                  {isEditing && formData.usercaseListes.length > 1 && (
                    <IconButton 
                      onClick={() => removeUsecaseList(index)}
                      color="error"
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              {isEditing && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={addUsecaseList}
                  variant="outlined"
                  size="small"
                  className="gradient-outlined"
                >
                  Add Use Case
                </Button>
              )}
            </Grid>

            {/* Interlink Pages Section */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" gutterBottom color="primary">
                  Interlink Pages
                </Typography>
                {isEditing && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addInterlinkPage}
                    variant="contained"
                    size="small"
                    className="gradient-primary"
                  >
                    Add Page
                  </Button>
                )}
              </Box>
              
              {formData.interlinkPages.map((page, index) => (
                <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="subtitle1">Interlink Page {index + 1}</Typography>
                    {isEditing && formData.interlinkPages.length > 1 && (
                      <IconButton 
                        onClick={() => removeInterlinkPage(index)}
                        color="error"
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Slug"
                        value={page.slug}
                        onChange={(e) => handleInterlinkPageChange(index, 'slug', e.target.value)}
                        variant="outlined"
                        size="small"
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Alternate Skill Name"
                        value={page.altername_skill_name}
                        onChange={(e) => handleInterlinkPageChange(index, 'altername_skill_name', e.target.value)}
                        variant="outlined"
                        size="small"
                        disabled={!isEditing}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>

          </Grid>
        </CardContent>
      </Card>

      {/* Save Confirmation Dialog */}
      <Dialog open={saveConfirmDialogOpen} onClose={handleSaveCancel}>
        <DialogTitle>Confirm Save Changes</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to save the changes to this website data?
          </Typography>
          <Box mt={2} p={2}  borderRadius={1}>
            <Typography variant="body2" color="text.secondary" fontWeight="bold">
              ⚠️ WARNING: This action will update the record!
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              <strong>Service:</strong> {formData.serviceName || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              This will update the website data record with all your changes and cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleSaveCancel}
            disabled={isSaving}
            className="gradient-outlined"
          >
            No, Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveConfirm}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
            className="gradient-primary"
          >
            {isSaving ? 'Saving...' : 'Yes, Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sync Confirmation Dialog */}
      <Dialog open={syncDialogOpen} onClose={handleSyncDialogClose}>
        <DialogTitle>Confirm Sync All</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to sync this value to ALL records in the database?
          </Typography>
          <Box mt={2} p={2}  borderRadius={1}>
            <Typography variant="body2" color="text.secondary" fontWeight="bold">
              ⚠️ WARNING: This action will update ALL records!
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              <strong>Field:</strong> {syncField}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Value:</strong> {syncValue}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              This action cannot be undone and will affect all website data records.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleSyncDialogClose}
            disabled={isSyncing}
            className="gradient-outlined"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSyncConfirm}
            disabled={isSyncing}
            startIcon={isSyncing ? <CircularProgress size={16} /> : <SyncIcon />}
            className="gradient-primary"
            sx={{
              backgroundColor: 'text.secondary',
              '&:hover': {
                backgroundColor: 'text.secondary',
              }
            }}
          >
            {isSyncing ? 'Syncing...' : 'Sync All Records'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default WebsiteDataDetails;
