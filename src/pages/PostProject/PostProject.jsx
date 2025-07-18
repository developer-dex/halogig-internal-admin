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
  Switch,
} from '@mui/material';
import { projectData, updateProject, updateProjectStatus } from '../../features/admin/projectManagementSlice';
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
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [statusProject, setStatusProject] = useState(null);
  
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
    project_amount: '',
    project_duration_min: '',
    project_duration_max: '',
    project_summary: '',
    type_of_project: '',
    customer_industry: '',
    currency_type: 'INR',
    currency_symbol: '₹'
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
        project_amount: selectedProject.project_amount || '',
        project_duration_min: selectedProject.project_duration_min || '',
        project_duration_max: selectedProject.project_duration_max || '',
        project_summary: selectedProject.project_summary || '',
        type_of_project: projectType,
        customer_industry: selectedProject.customer_industry || '',
        currency_type: selectedProject.currency_type || 'INR',
        currency_symbol: selectedProject.currency_symbol || '₹'
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
      project_amount: project.project_amount || '',
      project_duration_min: project.project_duration_min || '',
      project_duration_max: project.project_duration_max || '',
      project_summary: project.project_summary || '',
      type_of_project: projectType,
      customer_industry: project.customer_industry || '',
      currency_type: project.currency_type || 'INR',
      currency_symbol: project.currency_symbol || '₹'
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
      project_amount: '',
      project_duration_min: '',
      project_duration_max: '',
      project_summary: '',
      type_of_project: '',
      customer_industry: '',
      currency_type: 'INR',
      currency_symbol: '₹'
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
        sales_amount: selectedProject.sales_amount || "0",
        sales_amount_to: selectedProject.sales_amount_to || "0",
        project_amount: formData.project_amount,
        project_amount_to: formData.project_amount, // Using same value for both min and max
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

  // Helper function to get approval status text
  const getApprovalStatusText = (approvedByAdmin) => {
    return approvedByAdmin ? 'Approved' : 'Pending';
  };

  // Handle approval status toggle
  const handleApprovalToggle = (project) => {
    setStatusProject(project);
    setStatusModal(true);
  };

  // Handle approval status confirmation
  const handleApprovalConfirm = async () => {
    if (!statusProject) return;

    try {
      await dispatch(updateProjectStatus({
        projectId: statusProject.id,
        currentApprovedStatus: statusProject.approved_by_admin
      }));

      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === statusProject.id 
            ? { ...project, approved_by_admin: !project.approved_by_admin }
            : project
        )
      );

      setStatusModal(false);
      setStatusProject(null);
    } catch (error) {
      console.error('Error updating approval status:', error);
    }
  };

  // Handle approval modal close
  const handleApprovalModalClose = () => {
    setStatusModal(false);
    setStatusProject(null);
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
      <h2>Posted Projects</h2>

      <div className="table-wrapper">
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="20%">PROJECT TITLE</TableCell>
                <TableCell width="15%">FIRST NAME</TableCell>
                <TableCell width="15%">LAST NAME</TableCell>
                <TableCell width="15%">EMAIL</TableCell>
                <TableCell width="15%">PRICING MODEL</TableCell>
                <TableCell width="10%">STATUS</TableCell>
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
                    <TableCell width="15%">
                      {project.User?.first_name ? project.User.first_name : '--'}
                    </TableCell>
                    <TableCell width="15%">
                      {project.User?.last_name ? project.User.last_name : '--'}
                    </TableCell>
                      <TableCell width="20%">
                    {project.User?.email ? project.User.email : '--'}
                  </TableCell>
                                        <TableCell width="15%">
                        {getPricingModelName(project.model_engagement)}
                      </TableCell>
                      <TableCell width="10%">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Switch
                            checked={project.approved_by_admin}
                            onChange={() => handleApprovalToggle(project)}
                            color="primary"
                            size="small"
                          />
                          <span style={{ fontSize: '12px', color: project.approved_by_admin ? '#4caf50' : '#ff9800' }}>
                            {getApprovalStatusText(project.approved_by_admin)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell width="15%">
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleEditClick(project)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
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

            {/* Rate Per Hour */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <TextField
                label="Min"
                type="number"
                value={formData.project_amount}
                onChange={(e) => handleInputChange('project_amount', e.target.value)}
                style={{ flex: 1 }}
              />
              <TextField
                label="Max"
                type="number"
                value={formData.project_amount}
                onChange={(e) => handleInputChange('project_amount', e.target.value)}
                style={{ flex: 1 }}
              />
              <FormControl style={{ minWidth: 120 }}>
                <Select
                  value={formData.currency_type}
                  onChange={(e) => handleInputChange('currency_type', e.target.value)}
                >
                  <MenuItem value="INR">INR-₹</MenuItem>
                  <MenuItem value="USD">USD-$</MenuItem>
                  <MenuItem value="EUR">EUR-€</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Project Duration */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <TextField
                label="Min Hours"
                type="number"
                value={formData.project_duration_min}
                onChange={(e) => handleInputChange('project_duration_min', e.target.value)}
                style={{ flex: 1 }}
              />
              <TextField
                label="Max Hours"
                type="number"
                value={formData.project_duration_max}
                onChange={(e) => handleInputChange('project_duration_max', e.target.value)}
                style={{ flex: 1 }}
              />
            </div>

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
          <Button onClick={handleCloseModal} disabled={isSaving}>Cancel</Button>
          <Button 
            onClick={handleSaveChanges} 
            variant="contained" 
            color="primary"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Confirmation Modal */}
      <Dialog 
        open={statusModal} 
        onClose={handleApprovalModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Approval Change</DialogTitle>
        <DialogContent>
          <p>
            Are you sure you want to {statusProject?.approved_by_admin ? 'reject' : 'approve'} this project?
          </p>
          <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
            Project: {statusProject?.project_title}
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleApprovalModalClose}>Cancel</Button>
          <Button onClick={handleApprovalConfirm} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PostProject; 