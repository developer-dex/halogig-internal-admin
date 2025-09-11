import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  Paper,
  Alert,
  AlertTitle,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import GetAppIcon from '@mui/icons-material/GetApp';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LaunchIcon from '@mui/icons-material/Launch';
import {
  uploadWebsiteDataExcel,
  getWebsiteData,
  deleteWebsiteData,
  deleteAllWebsiteData,
  getWebsiteDataById,
  createWebsiteData,
  updateWebsiteData,
  downloadWebsiteDataExcel,
  clearUploadResponse,
} from '../../features/admin/websiteDataSlice';
import './WebsiteData.scss';

const WebsiteData = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [websiteData, setWebsiteData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDeleteAllModal, setOpenDeleteAllModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [serviceFilter, setServiceFilter] = useState('');
  const [debouncedServiceFilter, setDebouncedServiceFilter] = useState('');
  
  // Form state
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
  
  const pageLimit = 10;

  // Redux state
  const {
    isLoading,
    uploadLoading,
    uploadResponse,
    uploadError,
    responseData
  } = useSelector((state) => state.websiteData);

  // Debouncing effect for service filter
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedServiceFilter(serviceFilter);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [serviceFilter]);

  // Fetch website data
  const fetchWebsiteData = useCallback(async () => {
    const response = await dispatch(getWebsiteData({
      page: currentPage,
      limit: pageLimit,
      serviceName: debouncedServiceFilter || undefined,
    }));
    
    if (response.payload?.data?.success) {
      setWebsiteData(response.payload.data.data.data || []);
      setTotalCount(response.payload.data.data.pagination?.totalRecords || 0);
    }
  }, [dispatch, currentPage, pageLimit, debouncedServiceFilter]);

  // Format date helper function
  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return includeTime ? date.toLocaleString() : date.toLocaleDateString();
  };

  // Handle preview URL
  const handlePreview = (row) => {
    if (!row.category_name || !row.slug_link) {
      alert('Preview not available: Missing category name or slug link');
      return;
    }
    
    const previewUrl = `${process.env.REACT_APP_FRONTEND_URL}/${row.category_name}${row.slug_link}`;
    window.open(previewUrl, '_blank');
  };

  useEffect(() => {
    fetchWebsiteData();
  }, [fetchWebsiteData]);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
        alert('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setOpenUploadModal(true);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('excelFile', selectedFile);
    
    try {
      await dispatch(uploadWebsiteDataExcel(formData));
      setOpenUploadModal(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Refresh data after successful upload
      fetchWebsiteData();
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedRecord) return;
    
    try {
      await dispatch(deleteWebsiteData(selectedRecord.id));
      setOpenDeleteModal(false);
      setSelectedRecord(null);
      fetchWebsiteData(); // Refresh data
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // Handle delete all
  const handleDeleteAll = async () => {
    try {
      await dispatch(deleteAllWebsiteData());
      setOpenDeleteAllModal(false);
      setCurrentPage(1); // Reset to first page
      fetchWebsiteData(); // Refresh data
    } catch (error) {
      console.error('Delete all error:', error);
    }
  };

  // Handle download Excel
  const handleDownloadExcel = async () => {
    try {
      const filters = {};
      if (debouncedServiceFilter) filters.serviceName = debouncedServiceFilter;
      
      const response = await dispatch(downloadWebsiteDataExcel(filters));
      
      if (response.payload?.blob) {
        // Handle blob download from fetch response
        const blob = response.payload.blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `website-data-${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  // Handle view details
  const handleViewDetails = async (record) => {
    setSelectedRecord(record);
    setOpenViewModal(true);
  };

  // Handle edit - navigate to details page
  const handleEdit = (record) => {
    navigate(`/website-data/${record.id}/details`);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Clear filters
  const clearFilters = () => {
    setServiceFilter('');
    setCurrentPage(1);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
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
  };

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

  // Handle form submission
  const handleCreateSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.serviceName.trim()) {
        alert('Service name is required');
        return;
      }

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

      await dispatch(createWebsiteData(submitData));
      setOpenCreateModal(false);
      resetForm();
      fetchWebsiteData(); // Refresh data
    } catch (error) {
      console.error('Create error:', error);
    }
  };


  // Pagination component
  const renderPagination = () => {
    const totalPages = Math.ceil(totalCount / pageLimit);
    if (totalPages <= 1) return null;

    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={3} gap={1}>
        <Button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          variant="outlined"
          size="small"
        >
          Previous
        </Button>
        
        <Typography variant="body2" mx={2}>
          Page {currentPage} of {totalPages} ({totalCount} total)
        </Typography>
        
        <Button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          variant="outlined"
          size="small"
        >
          Next
        </Button>
      </Box>
    );
  };

  return (
    <div className="website-data-container">
      {/* Actions Section */}
      <Card className="actions-card" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Website Data Management
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Manage your website data with powerful tools for upload, download, and content management
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Primary Actions */}
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" gap={1.5} justifyContent="flex-end" flexWrap="wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  
                  {/* File Operations Group */}
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLoading}
                    sx={{
                      minWidth: 140,
                      height: 40,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Upload Excel
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<GetAppIcon />}
                    onClick={handleDownloadExcel}
                    disabled={isLoading || totalCount === 0}
                    sx={{
                      minWidth: 140,
                      height: 40,
                      fontWeight: 600,
                      textTransform: 'none',
                      backgroundColor: 'success.main',
                      boxShadow: 2,
                      '&:hover': {
                        backgroundColor: 'success.dark',
                        boxShadow: 4,
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        backgroundColor: 'action.disabledBackground',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Download Excel
                  </Button>
                </Box>
                
                {/* Secondary Actions */}
                <Box display="flex" gap={1.5} justifyContent="flex-end" flexWrap="wrap">
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreateModal(true)}
                    disabled={isLoading}
                    sx={{
                      minWidth: 120,
                      height: 36,
                      fontWeight: 500,
                      textTransform: 'none',
                      borderWidth: 1.5,
                      '&:hover': {
                        borderWidth: 1.5,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Add New
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchWebsiteData}
                    disabled={isLoading}
                    sx={{
                      minWidth: 100,
                      height: 36,
                      fontWeight: 500,
                      textTransform: 'none',
                      borderColor: 'grey.400',
                      color: 'grey.700',
                      borderWidth: 1.5,
                      '&:hover': {
                        borderWidth: 1.5,
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Refresh
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={() => setOpenDeleteAllModal(true)}
                    disabled={isLoading || totalCount === 0}
                    sx={{
                      minWidth: 120,
                      height: 36,
                      fontWeight: 500,
                      textTransform: 'none',
                      borderColor: 'error.main',
                      color: 'error.main',
                      borderWidth: 1.5,
                      '&:hover': {
                        borderWidth: 1.5,
                        backgroundColor: 'error.main',
                        color: 'white',
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        borderColor: 'action.disabled',
                        color: 'action.disabled',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Delete All
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Upload Response Display */}
      {uploadResponse && (
        <Alert 
          severity={uploadResponse.success ? "success" : "error"} 
          sx={{ mb: 3 }}
          onClose={() => dispatch(clearUploadResponse())}
        >
          <AlertTitle>Upload Results</AlertTitle>
          <Box>
            <Typography variant="body2">
              Total Rows: {uploadResponse.data?.totalRows || 0}
            </Typography>
            <Typography variant="body2" color="success.main">
              Successful: {uploadResponse.data?.successfulRows || 0}
            </Typography>
            <Typography variant="body2" color="error.main">
              Failed: {uploadResponse.data?.failedRows || 0}
            </Typography>
            {uploadResponse.data?.errors?.length > 0 && (
              <Box mt={1}>
                <Typography variant="body2" fontWeight="bold">Errors:</Typography>
                {uploadResponse.data.errors.slice(0, 5).map((error, index) => (
                  <Typography key={index} variant="body2" color="error">
                    Row {error.row}: {error.error}
                  </Typography>
                ))}
                {uploadResponse.data.errors.length > 5 && (
                  <Typography variant="body2" color="textSecondary">
                    ... and {uploadResponse.data.errors.length - 5} more errors
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search by Service Name"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                variant="outlined"
                size="small"
                placeholder="Type to search services... (debounced)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                disabled={!serviceFilter}
              >
                Clear Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : websiteData.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="textSecondary">
                No website data found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Upload an Excel file to get started
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Slug URL</TableCell>
                      <TableCell>Operations</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {websiteData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>
                          {row.category_name && (
                            <Chip label={row.category_name} size="small" />
                          )}
                        </TableCell>
                        <TableCell>{row.service_name || '-'}</TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              maxWidth: 250,
                              fontFamily: 'monospace',
                              fontSize: '0.875rem',
                              color: 'primary.main',
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline',
                              }
                            }}
                            title={row.slug_link || 'No slug URL'}
                            onClick={() => row.slug_link && navigator.clipboard.writeText(row.slug_link)}
                          >
                            {row.slug_link || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {/* <IconButton
                              size="small"
                              onClick={() => handleViewDetails(row)}
                              title="View Details"
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease-in-out',
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton> */}
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(row)}
                              title="Edit"
                              color="primary"
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease-in-out',
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handlePreview(row)}
                              title="Preview Page"
                              color="secondary"
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'secondary.light',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease-in-out',
                              }}
                            >
                              <LaunchIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRecord(row);
                                setOpenDeleteModal(true);
                              }}
                              title="Delete"
                              color="error"
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'error.light',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease-in-out',
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {renderPagination()}
            </>
          )}
        </CardContent>
      </Card>

      {/* Upload Confirmation Modal */}
      <Dialog open={openUploadModal} onClose={() => setOpenUploadModal(false)}>
        <DialogTitle>Confirm Excel Upload</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to upload this Excel file?
          </Typography>
          {selectedFile && (
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">
                <strong>File:</strong> {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenUploadModal(false)} 
            disabled={uploadLoading}
            className="gradient-secondary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploadLoading}
            startIcon={uploadLoading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
            className="gradient-primary"
          >
            {uploadLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this website data record?
          </Typography>
          {selectedRecord && (
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">
                <strong>ID:</strong> {selectedRecord.id}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Category:</strong> {selectedRecord.category_name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Service:</strong> {selectedRecord.service_name || 'N/A'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteModal(false)}
            className="gradient-secondary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={isLoading}
            className="gradient-primary"
            sx={{
              backgroundColor: 'error.main',
              '&:hover': {
                backgroundColor: 'error.dark',
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Modal */}
      <Dialog 
        open={openViewModal} 
        onClose={() => setOpenViewModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Website Data Details</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Basic Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Category</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.category_name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Service</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.service_name || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Slug Link</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.slug_link || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Primary Keyword</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.primary_keyword || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Secondary Keywords</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.secondary_keyword || 'N/A'}
                  </Typography>
                </Grid>

                {/* Banner Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Banner Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Banner Title</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.banner_title || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Banner Description</Typography>
                  <Typography variant="body1" gutterBottom style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedRecord.banner_description || 'N/A'}
                  </Typography>
                </Grid>

                {/* Service Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Service Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Service Title</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.service_title || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Service Description</Typography>
                  <Typography variant="body1" gutterBottom style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedRecord.service_description || 'N/A'}
                  </Typography>
                </Grid>

                {/* Service Lists JSON */}
                {selectedRecord.service_lists && selectedRecord.service_lists.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Service Lists ({selectedRecord.service_lists.length})
                    </Typography>
                    {selectedRecord.service_lists.map((service, index) => (
                      <Box key={index} mb={2} p={2} bgcolor="primary.light" borderRadius={1} sx={{ color: 'primary.contrastText' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {service.title}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                          {service.description}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                )}

                {/* Industry Lists */}
                {selectedRecord.industry_lists && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Industry Lists
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {selectedRecord.industry_lists.split(',').map((industry, index) => (
                        <Chip
                          key={index}
                          label={industry.trim()}
                          size="medium"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* Main Application Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Main Application
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Main Application Title</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.main_application_title || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Main Application Description</Typography>
                  <Typography variant="body1" gutterBottom style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedRecord.main_application_description || 'N/A'}
                  </Typography>
                </Grid>

                {/* Main Application Lists JSON */}
                {selectedRecord.main_application_lists && selectedRecord.main_application_lists.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Main Application Lists ({selectedRecord.main_application_lists.length})
                    </Typography>
                    {selectedRecord.main_application_lists.map((app, index) => (
                      <Box key={index} mb={2} p={2} bgcolor="secondary.light" borderRadius={1} sx={{ color: 'secondary.contrastText' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {app.title}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                          {app.description}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                )}

                {/* Interlink Pages JSON */}
                {selectedRecord.interlink_pages && selectedRecord.interlink_pages.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Interlink Pages ({selectedRecord.interlink_pages.length})
                    </Typography>
                    {selectedRecord.interlink_pages.map((page, index) => (
                      <Box key={index} mb={1} p={2} bgcolor="info.light" borderRadius={1} sx={{ color: 'info.contrastText' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {page.altername_skill_name || page.title}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', opacity: 0.9 }}>
                          {page.slug || page.description}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                )}

                {/* Use Case Lists */}
                {selectedRecord.usercase_listes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Use Case Lists
                    </Typography>
                    <Box>
                      {selectedRecord.usercase_listes.split(',').map((usecase, index) => (
                        <Box key={index} display="flex" alignItems="center" mb={1}>
                          <Typography variant="body2" fontWeight="bold" color="primary" sx={{ minWidth: 30 }}>
                            {index + 1}.
                          </Typography>
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {usecase.trim()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* SEO Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    SEO Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Meta Title</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRecord.meta_title || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Meta Description</Typography>
                  <Typography variant="body1" gutterBottom style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedRecord.meta_description || 'N/A'}
                  </Typography>
                </Grid>

                {/* Timestamps */}
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Record Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedRecord.createdAt || selectedRecord.created_at, true)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Updated At</Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedRecord.updatedAt || selectedRecord.updated_at, true)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenViewModal(false)}
            className="gradient-secondary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Confirmation Modal */}
      <Dialog open={openDeleteAllModal} onClose={() => setOpenDeleteAllModal(false)}>
        <DialogTitle>Confirm Delete All Data</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to delete ALL website data records?
          </Typography>
          <Box mt={2} p={2} bgcolor="error.light" borderRadius={1}>
            <Typography variant="body2" color="error.contrastText" fontWeight="bold">
              ⚠️ WARNING: This action cannot be undone!
            </Typography>
            <Typography variant="body2" color="error.contrastText" mt={1}>
              • All {totalCount} records will be permanently deleted
            </Typography>
            <Typography variant="body2" color="error.contrastText">
              • The next upload will start with ID 1
            </Typography>
            <Typography variant="body2" color="error.contrastText">
              • This will clear the entire website data table
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteAllModal(false)}
            className="gradient-secondary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAll}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
            className="gradient-primary"
            sx={{
              backgroundColor: 'error.main',
              '&:hover': {
                backgroundColor: 'error.dark',
              }
            }}
          >
            {isLoading ? 'Deleting...' : 'Delete All Data'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Website Data Modal */}
      <Dialog 
        open={openCreateModal} 
        onClose={() => setOpenCreateModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Add New Website Data</DialogTitle>
        <DialogContent>
          <Box mt={2}>
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
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Slug Link"
                  value={formData.slugLink}
                  onChange={(e) => handleInputChange('slugLink', e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Primary Keyword"
                  value={formData.primaryKeyword}
                  onChange={(e) => handleInputChange('primaryKeyword', e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Secondary Keywords"
                  value={formData.secondaryKeyword}
                  onChange={(e) => handleInputChange('secondaryKeyword', e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Banner Title"
                  value={formData.bannerTitle}
                  onChange={(e) => handleInputChange('bannerTitle', e.target.value)}
                  variant="outlined"
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
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Service Title"
                  value={formData.serviceTitle}
                  onChange={(e) => handleInputChange('serviceTitle', e.target.value)}
                  variant="outlined"
                />
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
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Main Application Title"
                  value={formData.mainApplicationTitle}
                  onChange={(e) => handleInputChange('mainApplicationTitle', e.target.value)}
                  variant="outlined"
                />
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
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Meta Title"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  variant="outlined"
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
                />
              </Grid>

              {/* Service Lists Section */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" gutterBottom color="primary">
                    Service Lists (Max 5)
                  </Typography>
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
                </Box>
                
                {formData.serviceLists.map((service, index) => (
                  <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="subtitle1">Service {index + 1}</Typography>
                      {formData.serviceLists.length > 1 && (
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
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Grid>

              {/* Industry Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Industry Title"
                  value={formData.industryTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, industryTitle: e.target.value }))}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
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
                    />
                    {formData.industryLists.length > 1 && (
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
                <Button
                  startIcon={<AddIcon />}
                  onClick={addIndustryList}
                  variant="outlined"
                  size="small"
                >
                  Add Industry
                </Button>
              </Grid>

              {/* Main Application Lists Section */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" gutterBottom color="primary">
                    Main Application Lists (Max 5)
                  </Typography>
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
                </Box>
                
                {formData.mainApplicationLists.map((app, index) => (
                  <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="subtitle1">Application {index + 1}</Typography>
                      {formData.mainApplicationLists.length > 1 && (
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
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Grid>

              {/* Interlink Pages Section */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" gutterBottom color="primary">
                    Interlink Pages
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addInterlinkPage}
                    variant="contained"
                    size="small"
                    className="gradient-primary"
                  >
                    Add Page
                  </Button>
                </Box>
                
                {formData.interlinkPages.map((page, index) => (
                  <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="subtitle1">Interlink Page {index + 1}</Typography>
                      {formData.interlinkPages.length > 1 && (
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
                    />
                    {formData.usercaseListes.length > 1 && (
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
                <Button
                  startIcon={<AddIcon />}
                  onClick={addUsecaseList}
                  variant="outlined"
                  size="small"
                >
                  Add Use Case
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenCreateModal(false);
              resetForm();
            }}
            className="gradient-secondary"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateSubmit}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <AddIcon />}
            className="gradient-primary"
          >
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default WebsiteData;
