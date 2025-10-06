import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Chip,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Home, Assignment } from '@mui/icons-material';
import { projectData, updateProject, updateProjectStatus } from '../../features/admin/projectManagementSlice';
import Breadcrumb from '../../components/Breadcrumb';
import { 
  fetchCategories, 
  fetchSubcategories, 
  fetchTechnologies, 
  fetchIndustries,
  clearSubcategories 
} from '../../features/admin/dropdownDataSlice';
import './PostProject.scss';

const PostProject = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  // Breadcrumb items for posted projects page
  const breadcrumbItems = [
    { label: 'Home', path: '/clients', icon: <Home /> },
    { label: 'Posted Projects', path: null, icon: <Assignment /> }
  ];
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [statusProject, setStatusProject] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusOptions = ['Pending', 'Approved', 'Rejected'];
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [copiedLinkId, setCopiedLinkId] = useState(null);
  
  // Get dropdown data from Redux store
  const dropdownData = useSelector((state) => state.dropdownDataReducer);
  const categories = dropdownData?.categories || [];
  const subcategories = dropdownData?.subcategories || [];
  const technologies = dropdownData?.technologies || [];
  const industries = dropdownData?.industries || [];
  
  // Debug logging
  console.log('Full dropdown state:', dropdownData);
  console.log('Categories:', categories, 'Type:', typeof categories, 'Is Array:', Array.isArray(categories));
  console.log('Categories length:', categories?.length);
  console.log('Categories data:', categories);
  const [formData, setFormData] = useState({
    project_category: '',
    project_sub_category: '',
    project_title: '',
    technologty_pre: '',
    model_engagement: '',
    project_amount_min: '',
    project_amount_max: '',
    project_duration_min: '',
    project_duration_max: '',
    notice_period_min: '',
    notice_period_max: '',
    project_summary: '',
    type_of_project: '',
    customer_industry: '',
    currency_type: 'USD',
    currency_symbol: '$'
  });
  const pageLimit = 50;

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await dispatch(projectData({
        page: currentPage,
        limit: pageLimit
      }));
      console.log('Projects loaded successfully');
      
      if (response.payload && response.payload.data && response.payload.data.data && response.payload.data.data.projects) {
        setProjects(response.payload.data.data.projects);
        setTotalCount(response.payload.data.data.total_count || 0);
      } else if (response.payload && response.payload.data && response.payload.data.projects) {
        setProjects(response.payload.data.projects);
        setTotalCount(response.payload.data.total_count || 0);
      } else if (response.payload && response.payload.projects) {
        setProjects(response.payload.projects);
        setTotalCount(response.payload.total_count || 0);
      } else {
        setProjects([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      setTotalCount(0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [dispatch, currentPage]);

  // Fetch dropdown data when modal opens
  useEffect(() => {
    if (openModal) {
      console.log('Modal opened, fetching dropdown data...');
      console.log('Dispatching fetchCategories...');
      dispatch(fetchCategories()).then((result) => {
        console.log('Categories fetch result:', result);
      }).catch((error) => {
        console.error('Categories fetch error:', error);
      });
      dispatch(fetchTechnologies());
      dispatch(fetchIndustries());
    }
  }, [dispatch, openModal]);

  // Handle form pre-filling when dropdown data is loaded
  useEffect(() => {
    if (openModal && selectedProject && categories.length > 0 && technologies.length > 0 && industries.length > 0) {
      console.log('Dropdown data loaded, updating form with project data:', selectedProject);
      
      // Map model_engagement string values to radio button values
      let pricingModel = '';
      if (selectedProject.model_engagement === 'hourly') {
        pricingModel = 'hourly';
      } else if (selectedProject.model_engagement === 'retainer') {
        pricingModel = 'retainer';
      } else {
        pricingModel = 'fixed';
      }
      
      // Map type_of_project string values to radio button values
      let projectType = '';
      if (selectedProject.type_of_project === 'maintainance') {
        projectType = 'maintenance';
      } else if (selectedProject.type_of_project === 'new-development') {
        projectType = 'new_development';
      } else if (selectedProject.type_of_project === 'maintainance-cum-new-development') {
        projectType = 'maintenance_cum_new';
      }
      
      const updatedFormData = {
        project_category: selectedProject.project_category || '',
        project_sub_category: selectedProject.project_sub_category || '',
        project_title: selectedProject.project_title || '',
        technologty_pre: selectedProject.technologty_pre || '',
        model_engagement: pricingModel,
        project_amount_min: selectedProject.project_amount_min || '',
        project_amount_max: selectedProject.project_amount_max || '',
        project_duration_min: selectedProject.project_duration_min || '',
        project_duration_max: selectedProject.project_duration_max || '',
        notice_period_min: selectedProject.notice_period_min || '',
        notice_period_max: selectedProject.notice_period_max || '',
        project_summary: selectedProject.project_summary || '',
        type_of_project: projectType,
        customer_industry: selectedProject.customer_industry || '',
        currency_type: selectedProject.currency_type || 'USD',
        currency_symbol: selectedProject.currency_symbol || '$'
      };
      
      console.log('Setting form data with project values:', updatedFormData);
      setFormData(updatedFormData);
    }
  }, [openModal, selectedProject, categories, technologies, industries]);

  // Handle subcategories when they're loaded
  useEffect(() => {
    if (openModal && selectedProject && subcategories.length > 0) {
      console.log('Subcategories loaded, updating form');
      setFormData(prev => ({
        ...prev,
        project_sub_category: selectedProject.project_sub_category || ''
      }));
    }
  }, [openModal, selectedProject, subcategories]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditClick = (project) => {
    setSelectedProject(project);
    
    // Map model_engagement string values to radio button values
    let pricingModel = '';
    if (project.model_engagement === 'hourly') {
      pricingModel = 'hourly';
    } else if (project.model_engagement === 'retainer') {
      pricingModel = 'retainer';
    } else {
      pricingModel = 'fixed';
    }
    
    // Map type_of_project string values to radio button values
    let projectType = '';
    if (project.type_of_project === 'maintainance') {
      projectType = 'maintenance';
    } else if (project.type_of_project === 'new-development') {
      projectType = 'new_development';
    } else if (project.type_of_project === 'maintainance-cum-new-development') {
      projectType = 'maintenance_cum_new';
    }
    
    setFormData({
      project_category: project.project_category || '',
      project_sub_category: project.project_sub_category || '',
      project_title: project.project_title || '',
      technologty_pre: project.technologty_pre || '',
      model_engagement: pricingModel,
      project_amount_min: project.project_amount_min || '',
      project_amount_max: project.project_amount_max || '',
      project_duration_min: project.project_duration_min || '',
      project_duration_max: project.project_duration_max || '',
      notice_period_min: project.notice_period_min || '',
      notice_period_max: project.notice_period_max || '',
      project_summary: project.project_summary || '',
      type_of_project: projectType,
      customer_industry: project.customer_industry || '',
      currency_type: project.currency_type || 'USD',
      currency_symbol: project.currency_symbol || '$'
    });
    setOpenModal(true);
    
    // Fetch subcategories if category is selected
    if (project.project_category) {
      dispatch(fetchSubcategories(project.project_category));
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProject(null);
    setFormData({
      project_category: '',
      project_sub_category: '',
      project_title: '',
      technologty_pre: '',
      model_engagement: '',
      project_amount_min: '',
      project_amount_max: '',
      project_duration_min: '',
      project_duration_max: '',
      notice_period_min: '',
      notice_period_max: '',
      project_summary: '',
      type_of_project: '',
      customer_industry: '',
      currency_type: 'USD',
      currency_symbol: '$'
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedProject) return;

    setIsSaving(true);

    try {
      // Map form data to API format
      const updateData = {
        posted_by_user_id: selectedProject.posted_by_user_id,
        project_title: formData.project_title,
        project_category: formData.project_category,
        project_sub_category: formData.project_sub_category,
        project_summary: formData.project_summary,
        type_of_project: formData.type_of_project,
        project_duration_min: formData.project_duration_min,
        project_duration_max: formData.project_duration_max,
        customer_industry: formData.customer_industry,
        technologty_pre: formData.technologty_pre,
        notice_period: selectedProject.notice_period,
        notice_period_min: formData.notice_period_min,
        notice_period_max: formData.notice_period_max,
        sales_amount: selectedProject.sales_amount || "0",
        sales_amount_to: selectedProject.sales_amount_to || "0",
        project_amount_min: formData.project_amount_min,
        project_amount_max: formData.project_amount_max,
        model_engagement: formData.model_engagement,
        currency_type: formData.currency_type,
        currency_symbol: formData.currency_symbol,
        status: selectedProject.status
      };

      console.log('Sending update data:', updateData);
      
      await dispatch(updateProject({
        projectId: selectedProject.id,
        projectData: updateData
      }));

      // Close modal and refresh projects
      handleCloseModal();
      fetchProjects();
      
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    handleInputChange('project_category', categoryId);
    handleInputChange('project_sub_category', ''); // Reset subcategory
    dispatch(clearSubcategories()); // Clear existing subcategories
    if (categoryId) {
      dispatch(fetchSubcategories(categoryId));
    }
  };

  // Helper function to get pricing model name
  const getPricingModelName = (modelEngagement) => {
    if (modelEngagement === 'hourly') {
      return 'Hourly';
    } else if (modelEngagement === 'retainer') {
      return 'Retainership';
    } else {
      return 'Fixed';
    }
  };

  // Helper function to get dynamic labels based on pricing model
  const getDynamicLabels = (modelEngagement) => {
    switch (modelEngagement) {
      case 'hourly':
        return {
          rateLabel: 'Rate Per Hour',
          durationLabel: 'Contract Duration (In Hours)',
          minDurationField: 'project_duration_min',
          maxDurationField: 'project_duration_max'
        };
      case 'retainer':
        return {
          rateLabel: 'Rate Per Month',
          durationLabel: 'Notice Period (In Days)',
          minDurationField: 'notice_period_min',
          maxDurationField: 'notice_period_max'
        };
      case 'fixed':
        return {
          rateLabel: 'Total Project Amount',
          durationLabel: 'Contract Duration (In Days)',
          minDurationField: 'project_duration_min',
          maxDurationField: 'project_duration_max'
        };
      default:
        return {
          rateLabel: 'Rate',
          durationLabel: 'Duration',
          minDurationField: 'project_duration_min',
          maxDurationField: 'project_duration_max'
        };
    }
  };

  // Helper function to get status button style
  const getStatusButtonStyle = (approved) => {
    const status = approved ? 'approved' : 'pending';
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          backgroundColor: '#fff3e0',
          color: '#e65100',
          border: '1px solid #ffcc02',
          '&:hover': {
            backgroundColor: '#ffe0b2',
          }
        };
      case 'approved':
        return {
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          border: '1px solid #4caf50',
          '&:hover': {
            backgroundColor: '#c8e6c9',
          }
        };
      case 'rejected':
        return {
          backgroundColor: '#ffebee',
          color: '#c62828',
          border: '1px solid #f44336',
          '&:hover': {
            backgroundColor: '#ffcdd2',
          }
        };
      default:
        return {
          backgroundColor: '#f5f5f5',
          color: '#757575',
        };
    }
  };


  // Helper function to format project link display
  const formatProjectLink = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname.substring(0, 20) + (urlObj.pathname.length > 20 ? '...' : '');
    } catch (error) {
      // If URL parsing fails, return truncated version
      return url.length > 30 ? `${url.substring(0, 30)}...` : url;
    }
  };

  // Handle status button click
  const handleStatusClick = (project) => {
    setStatusProject(project);
    setSelectedStatus(project.approved_by_admin ? 'Approved' : 'Pending');
    setStatusModal(true);
  };

  // Handle status change confirmation
  const handleStatusChange = async () => {
    if (!statusProject) return;

    try {
      const newApprovedStatus = selectedStatus === 'Approved';
      
      await dispatch(updateProjectStatus({
        projectId: statusProject.id,
        currentApprovedStatus: statusProject.approved_by_admin
      }));

      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === statusProject.id 
            ? { ...project, approved_by_admin: newApprovedStatus }
            : project
        )
      );

      setStatusModal(false);
      setStatusProject(null);
      setSelectedStatus('');
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  // Handle status modal close
  const handleStatusModalClose = () => {
    setStatusModal(false);
    setStatusProject(null);
    setSelectedStatus('');
  };

  const handleCopyLink = (url, projectId) => {
    // Try using the modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        setSnackbarMessage('Project link copied to clipboard!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setCopiedLinkId(projectId);
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopiedLinkId(null);
        }, 2000);
      }).catch(() => {
        // Fallback to older method
        fallbackCopyTextToClipboard(url, projectId);
      });
    } else {
      // Fallback for older browsers or non-secure contexts
      fallbackCopyTextToClipboard(url, projectId);
    }
  };

  const fallbackCopyTextToClipboard = (text, projectId) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setSnackbarMessage('Project link copied to clipboard!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setCopiedLinkId(projectId);
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopiedLinkId(null);
        }, 2000);
      } else {
        setSnackbarMessage('Failed to copy project link.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarMessage('Failed to copy project link.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
    
    document.body.removeChild(textArea);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="project-list">
      <Breadcrumb items={breadcrumbItems} />

      <div className="table-wrapper">
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="20%">PROJECT TITLE</TableCell>
                <TableCell width="12%">FIRST NAME</TableCell>
                <TableCell width="10%">LAST NAME</TableCell>
                <TableCell width="20%">EMAIL</TableCell>
                <TableCell width="15%">PRICING MODEL</TableCell>
                <TableCell width="10%">STATUS</TableCell>
                <TableCell width="15%">PROJECT LINK</TableCell>
                <TableCell width="15%">ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(projects || []).length > 0 ? (
                (projects || []).map((project) => (
                  <TableRow key={project.id}>
                    <TableCell width="20%">
                      {project.project_title ? project.project_title : '--'}
                    </TableCell>
                    <TableCell width="12%">
                      {project.User?.first_name ? project.User.first_name : '--'}
                    </TableCell>
                    <TableCell width="10%">
                      {project.User?.last_name ? project.User.last_name : '--'}
                    </TableCell>
                      <TableCell width="20%">
                    {project.User?.email ? project.User.email : '--'}
                  </TableCell>
                                        <TableCell width="15%">
                        {getPricingModelName(project.model_engagement)}
                      </TableCell>
                      <TableCell width="10%">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleStatusClick(project)}
                          sx={getStatusButtonStyle(project.approved_by_admin)}
                          className={`status-button ${project.approved_by_admin ? 'approved' : 'pending'}`}
                        >
                          {project.approved_by_admin ? 'Approved' : 'Pending'}
                        </Button>
                      </TableCell>
                      <TableCell width="15%">
                        {project.client_project_link ? (
                          <Tooltip title={copiedLinkId === project.id ? "Link copied!" : "Click to copy link"}>
                            <Chip 
                              label={copiedLinkId === project.id ? "Copied!" : (formatProjectLink(project.client_project_link))}
                              icon={copiedLinkId === project.id ? <ContentCopyIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />} 
                              variant={copiedLinkId === project.id ? "filled" : "outlined"}
                              color={copiedLinkId === project.id ? "success" : "default"}
                              size="small"
                              title={project.client_project_link}
                              onClick={() => handleCopyLink(project.client_project_link, project.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          </Tooltip>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell width="15%">
                        <Button 
                          variant="outlined" 
                          size="small"
                          className="gradient-primary"
                          onClick={() => handleEditClick(project)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                    No projects found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="table-footer">
          <div className="entries-info">
            Showing <span>{projects?.length || 0}</span> of {totalCount}
          </div>
          <div className="pagination">
            <button
              className="prev"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            <div className="page-numbers">
              {Array.from({ length: Math.ceil((totalCount || 0) / pageLimit) }, (_, i) => i + 1)
                .map((page) => (
                  <span
                    key={page}
                    className={currentPage === page ? 'active' : ''}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </span>
                ))
              }
            </div>
            <button
              className="next"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil((totalCount || 0) / pageLimit)}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '10px' }}>
            
            {/* Project Category */}
            <FormControl fullWidth>
              <InputLabel>Project Category</InputLabel>
              <Select
                value={formData.project_category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                label="Project Category"
              >
                {console.log('Rendering categories dropdown with:', categories)}
                {Array.isArray(categories) && categories.length > 0 ? (
                  categories.map((category) => {
                    console.log('Rendering category:', category);
                    return (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    );
                  })
                ) : (
                  <MenuItem disabled>
                    {Array.isArray(categories) ? 'No categories available' : 'Loading categories...'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            {/* Project Sub Category */}
            <FormControl fullWidth>
              <InputLabel>Project Sub Category</InputLabel>
              <Select
                value={formData.project_sub_category}
                onChange={(e) => handleInputChange('project_sub_category', e.target.value)}
                label="Project Sub Category"
                disabled={!formData.project_category}
              >
                {Array.isArray(subcategories) && subcategories.length > 0 ? (
                  subcategories.map((subcategory) => (
                    <MenuItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    {formData.project_category ? 'Loading subcategories...' : 'Select a category first'}
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            {/* Project Title */}
            <TextField
              fullWidth
              label="Project Title"
              value={formData.project_title}
              onChange={(e) => handleInputChange('project_title', e.target.value)}
              multiline
              rows={2}
            />

            {/* Technology Preference */}
            <FormControl fullWidth>
              <InputLabel>Technology Preference</InputLabel>
              <Select
                value={formData.technologty_pre}
                onChange={(e) => handleInputChange('technologty_pre', e.target.value)}
                label="Technology Preference"
              >
                {Array.isArray(technologies) && technologies.length > 0 ? (
                  technologies.map((tech, index) => (
                    <MenuItem key={index} value={typeof tech === 'string' ? tech : tech.name}>
                      {typeof tech === 'string' ? tech : tech.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Loading technologies...</MenuItem>
                )}
              </Select>
            </FormControl>

            {/* Pricing Model */}
            <FormControl component="fieldset">
              <FormLabel component="legend">Pricing Model</FormLabel>
              <RadioGroup
                row
                value={formData.model_engagement}
                onChange={(e) => handleInputChange('model_engagement', e.target.value)}
              >
                <FormControlLabel value="hourly" control={<Radio />} label="Hourly" />
                <FormControlLabel value="retainer" control={<Radio />} label="Retainership" />
                <FormControlLabel value="fixed" control={<Radio />} label="Fixed Price" />
              </RadioGroup>
            </FormControl>

            {/* Dynamic Rate Fields */}
            {formData.model_engagement && (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <strong>{getDynamicLabels(formData.model_engagement).rateLabel}</strong>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <TextField
                    label="Min"
                    type="number"
                    value={formData.project_amount_min}
                    onChange={(e) => handleInputChange('project_amount_min', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <TextField
                    label="Max"
                    type="number"
                    value={formData.project_amount_max}
                    onChange={(e) => handleInputChange('project_amount_max', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <FormControl style={{ minWidth: 120 }}>
                    <Select
                      value={formData.currency_type}
                      onChange={(e) => handleInputChange('currency_type', e.target.value)}
                    >
                      <MenuItem value="USD">USD-$</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </>
            )}

            {/* Dynamic Duration/Notice Period Fields */}
            {formData.model_engagement && (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <strong>{getDynamicLabels(formData.model_engagement).durationLabel}</strong>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <TextField
                    label="Min"
                    type="number"
                    value={formData[getDynamicLabels(formData.model_engagement).minDurationField]}
                    onChange={(e) => handleInputChange(getDynamicLabels(formData.model_engagement).minDurationField, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <TextField
                    label="Max"
                    type="number"
                    value={formData[getDynamicLabels(formData.model_engagement).maxDurationField]}
                    onChange={(e) => handleInputChange(getDynamicLabels(formData.model_engagement).maxDurationField, e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </>
            )}

            {/* Project Summary */}
            <TextField
              fullWidth
              label="Project Summary"
              value={formData.project_summary}
              onChange={(e) => handleInputChange('project_summary', e.target.value)}
              multiline
              rows={4}
            />

            {/* Type of Project */}
            <FormControl component="fieldset">
              <FormLabel component="legend">Type of Project</FormLabel>
              <RadioGroup
                row
                value={formData.type_of_project}
                onChange={(e) => handleInputChange('type_of_project', e.target.value)}
              >
                <FormControlLabel value="maintenance" control={<Radio />} label="Maintenance" />
                <FormControlLabel value="new_development" control={<Radio />} label="New Development" />
                <FormControlLabel value="maintenance_cum_new" control={<Radio />} label="Maintenance Cum New Development" />
              </RadioGroup>
            </FormControl>

            {/* Customer Industry */}
            <FormControl fullWidth>
              <InputLabel>Customer Industry</InputLabel>
              <Select
                value={formData.customer_industry}
                onChange={(e) => handleInputChange('customer_industry', e.target.value)}
                label="Customer Industry"
              >
                {Array.isArray(industries) && industries.length > 0 ? (
                  industries.map((industry) => (
                    <MenuItem key={industry.id} value={industry.id}>
                      {industry.industry}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Loading industries...</MenuItem>
                )}
              </Select>
            </FormControl>

          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={isSaving} className="gradient-secondary">Cancel</Button>
          <Button 
            onClick={handleSaveChanges} 
            variant="contained" 
            color="primary"
            className="gradient-primary"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Selection Modal */}
      <Dialog 
        open={statusModal} 
        onClose={handleStatusModalClose}
        maxWidth="sm"
        PaperProps={{
          style: {
            minWidth: '450px',
            maxWidth: '520px',
            width: '480px'
          }
        }}
      >
        <DialogTitle style={{ 
          fontSize: '18px', 
          fontWeight: '600',
          padding: '20px 24px 12px 24px',
          textAlign: 'center'
        }}>
          Update Project Status
        </DialogTitle>
        <DialogContent style={{ 
          padding: '12px 24px 20px 24px'
        }}>
          <div style={{ 
            marginBottom: '20px', 
            fontSize: '15px',
            color: '#555',
            textAlign: 'center',
            background: '#f8f9fa',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <strong>{statusProject?.project_title}</strong>
          </div>
          <RadioGroup
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ gap: '6px', marginLeft: '8px' }}
          >
            {statusOptions.map((status) => (
              <FormControlLabel
                key={status}
                value={status}
                control={<Radio />}
                label={status}
                style={{ 
                  margin: '4px 0',
                  fontSize: '15px'
                }}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions style={{ 
          padding: '12px 24px 20px 24px',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <Button 
            onClick={handleStatusModalClose} 
            className="gradient-secondary"
            style={{ minWidth: '100px', padding: '8px 20px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStatusChange} 
            variant="contained" 
            color="primary" 
            className="gradient-primary"
            style={{ minWidth: '100px', padding: '8px 20px' }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for link copying */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PostProject; 