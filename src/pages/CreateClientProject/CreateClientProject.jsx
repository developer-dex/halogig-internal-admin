import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Box,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Select from 'react-select';
import { getApi, postApi } from '../../services/api';
import { apiEndPoints } from '../../config/path';
import './CreateClientProject.scss';

const CreateClientProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get client data from navigation state
  const clientInfo = location.state || {};

  // Form state
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectCategory: null,
    projectSubCategories: [],
    technologyPreference: [],
    customerIndustry: null,
    pricingModel: 'hourly',
    rateMin: '',
    rateMax: '',
    durationMin: '',
    durationMax: '',
    projectSummary: '',
    typeOfProject: 'maintainance',
    currency: 'INR-₹'
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Options state
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [industries, setIndustries] = useState([]);

  // Pricing model visibility
  const [hourlyVisible, setHourlyVisible] = useState(true);
  const [retainershipVisible, setRetainershipVisible] = useState(false);
  const [fixedPriceVisible, setFixedPriceVisible] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      // Try using the same endpoint as frontend
      const response = await getApi('category');
      console.log('Categories API response:', response);
      
      // Extract data from the response structure
      const responseData = response.data || response;
      console.log('Response data:', responseData);
      
      // Check if the response has the expected structure
      if (responseData && responseData.success && Array.isArray(responseData.data)) {
        const options = responseData.data.map(item => ({
          label: item.name,
          value: item.id
        }));
        console.log('Categories options:', options);
        setCategories(options);
      } else if (Array.isArray(responseData)) {
        // Fallback: if response is directly an array
        const options = responseData.map(item => ({
          label: item.name,
          value: item.id
        }));
        console.log('Categories options (fallback):', options);
        setCategories(options);
      } else {
        console.error('Categories data structure is not as expected:', responseData);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // Fetch sub-categories
  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) return;
    try {
      console.log('Fetching sub-categories for categoryId:', categoryId);
      // Try using the same endpoint as frontend
      const response = await getApi(`user/sub-category/${categoryId}`);
      console.log('Sub-categories API response:', response);
      
      // Extract data from the response structure
      const responseData = response.data || response;
      console.log('Sub-categories response data:', responseData);
      
      // Check if the response has the expected structure
      if (responseData && responseData.success && Array.isArray(responseData.data)) {
        const options = responseData.data.map(item => ({
          label: item.name,
          value: item.id
        }));
        console.log('Sub-categories options:', options);
        setSubCategories(options);
      } else if (Array.isArray(responseData)) {
        // Fallback: if response is directly an array
        const options = responseData.map(item => ({
          label: item.name,
          value: item.id
        }));
        console.log('Sub-categories options (fallback):', options);
        setSubCategories(options);
      } else {
        console.error('Sub-categories data structure is not as expected:', responseData);
        setSubCategories([]);
      }
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      setSubCategories([]);
    }
  };

  // Fetch technologies
  const fetchTechnologies = async () => {
    try {
      console.log('Fetching technologies...');
      const response = await getApi('technology');
      console.log('Technologies API response:', response);
      
      const responseData = response.data || response;
      console.log('Technologies response data:', responseData);
      
      // Check if the response has the expected structure
      if (responseData && responseData.success && Array.isArray(responseData.data)) {
        const options = responseData.data.map(item => ({
          label: item.name,
          value: item.id
        }));
        console.log('Technologies options:', options);
        setTechnologies(options);
      } else if (Array.isArray(responseData)) {
        // Fallback: if response is directly an array
        const options = responseData.map(item => ({
          label: item.name,
          value: item.id
        }));
        console.log('Technologies options (fallback):', options);
        setTechnologies(options);
      } else {
        console.error('Technologies data structure is not as expected:', responseData);
        setTechnologies([]);
      }
    } catch (error) {
      console.error('Error fetching technologies:', error);
      setTechnologies([]);
    }
  };

  // Fetch industries
  const fetchIndustries = async () => {
    try {
      console.log('Fetching industries...');
      const response = await getApi('industry');
      console.log('Industries API response:', response);
      
      const responseData = response.data || response;
      console.log('Industries response data:', responseData);
      
      // Check if the response has the expected structure
      if (responseData && responseData.success && Array.isArray(responseData.data)) {
        const options = responseData.data.map(item => ({
          label: item.industry,
          value: item.id
        }));
        console.log('Industries options:', options);
        setIndustries(options);
      } else if (Array.isArray(responseData)) {
        // Fallback: if response is directly an array
        const options = responseData.map(item => ({
          label: item.industry,
          value: item.id
        }));
        console.log('Industries options (fallback):', options);
        setIndustries(options);
      } else {
        console.error('Industries data structure is not as expected:', responseData);
        setIndustries([]);
      }
    } catch (error) {
      console.error('Error fetching industries:', error);
      setIndustries([]);
    }
  };

  // Handle category change
  const handleCategoryChange = (selectedOption) => {
    console.log('Category changed:', selectedOption);
    setFormData(prev => ({
      ...prev,
      projectCategory: selectedOption,
      projectSubCategories: []
    }));
    if (selectedOption) {
      console.log('Fetching sub-categories for:', selectedOption.value);
      fetchSubCategories(selectedOption.value);
    } else {
      console.log('No category selected, clearing sub-categories');
      setSubCategories([]);
    }
  };

  // Handle pricing model change
  const handlePricingModelChange = (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, pricingModel: value }));
    
    // Update visibility
    setHourlyVisible(value === 'hourly');
    setRetainershipVisible(value === 'retainer');
    setFixedPriceVisible(value === 'fixed');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.projectTitle || formData.projectTitle.length < 20) {
        throw new Error('Project title must be at least 20 characters long');
      }

      if (!formData.projectCategory) {
        throw new Error('Please select a project category');
      }

      if (!formData.projectSubCategories || formData.projectSubCategories.length === 0) {
        throw new Error('Please select at least one sub-category');
      }

      if (!formData.technologyPreference || formData.technologyPreference.length === 0) {
        throw new Error('Please select at least one technology preference');
      }

      if (!formData.customerIndustry) {
        throw new Error('Please select a customer industry');
      }

      if (!formData.rateMin || !formData.rateMax) {
        throw new Error('Please enter rate range');
      }

      if (parseFloat(formData.rateMin) > parseFloat(formData.rateMax)) {
        throw new Error('Maximum rate must be greater than minimum rate');
      }

      if (!formData.durationMin || !formData.durationMax) {
        throw new Error('Please enter duration range');
      }

      if (parseFloat(formData.durationMin) > parseFloat(formData.durationMax)) {
        throw new Error('Maximum duration must be greater than minimum duration');
      }

      if (!formData.projectSummary || formData.projectSummary.length < 160) {
        throw new Error('Project summary must be at least 160 characters long');
      }

      // Prepare data for API - matching confirmation-post-project.js structure
      const postprojectData = {
        posted_by_user_id: clientInfo.clientId || null,
        project_title: formData.projectTitle,
        project_category: formData.projectCategory.value,
        project_sub_category: formData.projectSubCategories.map(sub => sub.value).join(','),
        project_summary: formData.projectSummary,
        type_of_project: formData.typeOfProject,
        project_duration_min: formData.durationMin,
        project_duration_max: formData.durationMax,
        customer_industry: formData.customerIndustry.value,
        technologty_pre: formData.technologyPreference.map(tech => tech.label).join(','),
        notice_period: "0",
        project_amount: formData.rateMin,
        project_amount_max: formData.rateMax,
        model_engagement: formData.pricingModel,
        currency_type: formData.currency.split('-')[0],
        currency_symbol: formData.currency.split('-')[1],
        currency: formData.currency,
        created_by_admin: true,
        is_published: false
      };

      // Submit to API - matching the same endpoint structure as client-side
      const response = await postApi('admin/client-project', { postprojectData });

      if (!response.data) {
        throw new Error(response.message || 'Failed to create project');
      }

      setSuccess('Project created successfully!');
      setTimeout(() => {
        navigate('/clients');
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      console.log('Loading initial data...');
      setIsLoading(true);
      try {
        await Promise.all([
          fetchCategories(),
          fetchTechnologies(),
          fetchIndustries()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="create-client-project-page">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" mb={4}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/clients')}
              sx={{ mr: 2 }}
            >
              {/* Back to Clients */}
            </Button>
            <Typography variant="h4" component="h1">
              Create Project for Client
            </Typography>
          </Box>

          {/* Client Info */}
          {clientInfo.clientName && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Creating project for client: <strong>{clientInfo.clientName}</strong>
              {clientInfo.clientEmail && ` (${clientInfo.clientEmail})`}
            </Alert>
          )}

          {/* Error/Success Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Project Category */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Project Category *
                </Typography>
                {console.log('Categories options in render:', categories)}
                <Select
                  value={formData.projectCategory}
                  onChange={handleCategoryChange}
                  options={categories}
                  placeholder="Select a Project Category"
                  isClearable
                  isSearchable
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      zIndex: 9999,
                      position: 'absolute'
                    }),
                    menuList: (provided) => ({
                      ...provided,
                      maxHeight: '200px'
                    })
                  }}
                />
              </Grid>

              {/* Project Sub Categories */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Project Sub Categories *
                </Typography>
                <Select
                  isMulti
                  value={formData.projectSubCategories}
                  onChange={(selected) => setFormData(prev => ({ ...prev, projectSubCategories: selected }))}
                  options={subCategories}
                  placeholder="Select Sub Categories"
                  isDisabled={!formData.projectCategory}
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      zIndex: 9999,
                      position: 'absolute'
                    }),
                    menuList: (provided) => ({
                      ...provided,
                      maxHeight: '200px'
                    })
                  }}
                />
              </Grid>

              {/* Project Title */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Project Title *"
                  value={formData.projectTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
                  helperText={`${formData.projectTitle.length}/20 characters minimum`}
                  error={formData.projectTitle.length > 0 && formData.projectTitle.length < 20}
                  inputProps={{ minLength: 20 }}
                />
              </Grid>

              {/* Technology Preference */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Technology Preference *
                </Typography>
                <Select
                  isMulti
                  value={formData.technologyPreference}
                  onChange={(selected) => setFormData(prev => ({ ...prev, technologyPreference: selected }))}
                  options={technologies}
                  placeholder="Select Technologies"
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      zIndex: 9999,
                      position: 'absolute'
                    }),
                    menuList: (provided) => ({
                      ...provided,
                      maxHeight: '200px'
                    })
                  }}
                />
              </Grid>

              {/* Pricing Model */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Pricing Model *</FormLabel>
                  <RadioGroup
                    row
                    value={formData.pricingModel}
                    onChange={handlePricingModelChange}
                  >
                    <FormControlLabel value="hourly" control={<Radio />} label="Hourly" />
                    <FormControlLabel value="retainer" control={<Radio />} label="Retainership" />
                    <FormControlLabel value="fixed" control={<Radio />} label="Fixed Price" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Rate Range */}
              {(hourlyVisible || retainershipVisible || fixedPriceVisible) && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    {hourlyVisible ? 'Rate Per Hour' : retainershipVisible ? 'Rate Per Month' : 'Total Project Amount'} *
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Min"
                        value={formData.rateMin}
                        onChange={(e) => setFormData(prev => ({ ...prev, rateMin: e.target.value }))}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Max"
                        value={formData.rateMax}
                        onChange={(e) => setFormData(prev => ({ ...prev, rateMax: e.target.value }))}
                        inputProps={{ min: formData.rateMin || 0 }}
                        error={parseFloat(formData.rateMin) > parseFloat(formData.rateMax)}
                        helperText={parseFloat(formData.rateMin) > parseFloat(formData.rateMax) ? 'Max must be greater than Min' : ''}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Currency</InputLabel>
                        <MuiSelect
                          value={formData.currency}
                          onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                          label="Currency"
                        >
                          <MenuItem value="USD-$">USD-$</MenuItem>
                          <MenuItem value="INR-₹">INR-₹</MenuItem>
                          <MenuItem value="EUR-€">EUR-€</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* Duration Range */}
              {(hourlyVisible || retainershipVisible || fixedPriceVisible) && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Project Duration ({hourlyVisible ? 'Hours' : retainershipVisible ? 'Months' : 'Days'}) *
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Min"
                        value={formData.durationMin}
                        onChange={(e) => setFormData(prev => ({ ...prev, durationMin: e.target.value }))}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Max"
                        value={formData.durationMax}
                        onChange={(e) => setFormData(prev => ({ ...prev, durationMax: e.target.value }))}
                        inputProps={{ min: formData.durationMin || 0 }}
                        error={parseFloat(formData.durationMin) > parseFloat(formData.durationMax)}
                        helperText={parseFloat(formData.durationMin) > parseFloat(formData.durationMax) ? 'Max must be greater than Min' : ''}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* Project Summary */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Project Summary *"
                  value={formData.projectSummary}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectSummary: e.target.value }))}
                  helperText={`${formData.projectSummary.length}/160 characters minimum`}
                  error={formData.projectSummary.length > 0 && formData.projectSummary.length < 160}
                  inputProps={{ minLength: 160 }}
                />
              </Grid>

              {/* Type of Project */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Type of Project *</FormLabel>
                  <RadioGroup
                    row
                    value={formData.typeOfProject}
                    onChange={(e) => setFormData(prev => ({ ...prev, typeOfProject: e.target.value }))}
                  >
                    <FormControlLabel value="maintainance" control={<Radio />} label="Maintenance" />
                    <FormControlLabel value="new-development" control={<Radio />} label="New Development" />
                    <FormControlLabel value="maintainance-cum-new-development" control={<Radio />} label="Maintenance Cum New Development" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {/* Customer Industry */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Customer Industry *
                </Typography>
                <Select
                  value={formData.customerIndustry}
                  onChange={(selected) => setFormData(prev => ({ ...prev, customerIndustry: selected }))}
                  options={industries}
                  placeholder="Select Customer Industry"
                  isClearable
                  isSearchable
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      zIndex: 9999,
                      position: 'absolute'
                    }),
                    menuList: (provided) => ({
                      ...provided,
                      maxHeight: '200px'
                    })
                  }}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/clients')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  >
                    {isSubmitting ? 'Creating Project...' : 'Create Project'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default CreateClientProject;
