import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Button,
  Avatar,
  CircularProgress,
  Box,
  Paper,
  Card,
  CardContent,
  Chip,
  Divider,
  Tabs,
  Tab,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Home,
  Assignment,
  Info,
  Person,
  Work,
  Description,
  CalendarToday,
  Money,
  Email,
  Phone,
  LocationOn,
  Category,
  AccessTime,
  AttachMoney,
  Business,
  Timeline,
  TrendingUp,
  AccountCircle,
  Language,
  Public,
  Schedule,
  Assignment as AssignmentIcon,
  CheckCircle,
  HourglassEmpty,
  ListAlt,
  Flag,
  Subtitles,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { getProjectBidDetails, clearCurrentBid, approveMilestoneByAdmin, clearApproveMilestoneState, updateProjectBid, clearUpdateBidState, updateMilestoneByAdmin } from '../../features/admin/projectBidsSlice';
import { showSuccess, showError } from '../../helpers/messageHelper';
import Breadcrumb from '../../components/Breadcrumb';
import './ProjectBidDetail.scss';

const ProjectBidDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bidId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // State for editable admin bid fields
  const [isEditingBid, setIsEditingBid] = useState(false);
  const [editedBidData, setEditedBidData] = useState({
    admin_modified_bid_amount: '',
    admin_modified_delivery_timeline: '',
    admin_modified_message: '',
    approved_by_admin: false
  });
  
  // State for editable admin milestone fields
  const [isEditingMilestones, setIsEditingMilestones] = useState(false);
  const [editedMilestones, setEditedMilestones] = useState({});
  const [milestoneFieldErrors, setMilestoneFieldErrors] = useState({});

  // Get data from Redux store
  const { currentBid, isApprovingMilestone, approveMilestoneSuccess, approveMilestoneError, isUpdatingBid, updateBidSuccess, updateBidError } = useSelector((state) => state.projectBidsReducer);

  const fetchBidDetails = async () => {
    setIsLoading(true);
    try {
      await dispatch(getProjectBidDetails(bidId));
    } catch (error) {
      console.error('Error fetching bid details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bidId) {
      fetchBidDetails();
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentBid());
    };
  }, [dispatch, bidId]);

  // Handle success/error states for milestone approval
  useEffect(() => {
    if (approveMilestoneSuccess) {
      showSuccess('Milestone approved successfully!');
      // Clear the state
      dispatch(clearApproveMilestoneState());
      // Optionally refresh the bid details to show updated status
      fetchBidDetails();
    }
    if (approveMilestoneError) {
      showError('Failed to approve milestone');
      // Clear the state
      dispatch(clearApproveMilestoneState());
    }
  }, [approveMilestoneSuccess, approveMilestoneError, dispatch]);

  // Handle success/error states for bid update
  useEffect(() => {
    if (updateBidSuccess) {
      showSuccess('Bid updated successfully!');
      // Clear the state
      dispatch(clearUpdateBidState());
      // Refresh the bid details to show updated data
      fetchBidDetails();
      // Exit edit mode
      setIsEditingBid(false);
    }
    if (updateBidError) {
      showError('Failed to update bid');
      // Clear the state
      dispatch(clearUpdateBidState());
    }
  }, [updateBidSuccess, updateBidError, dispatch]);

  // Helper function to get status chip color
  const getStatusChipProps = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { color: 'warning', variant: 'filled' };
      case 'accepted':
        return { color: 'success', variant: 'filled' };
      case 'rejected':
        return { color: 'error', variant: 'filled' };
      case 'in_progress':
        return { color: 'info', variant: 'filled' };
      case 'completed':
        return { color: 'success', variant: 'filled' };
      default:
        return { color: 'default', variant: 'outlined' };
    }
  };

  // Helper function to render info item
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

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '--';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', path: '/clients', icon: <Home /> },
    { label: 'Project Bids', path: '/project-bids', icon: <Assignment /> },
    { label: `Bid #${bidId}`, path: null, icon: <Info /> }
  ];

  if (!currentBid) {
    return (
      <div className="project-bid-detail">
        <Breadcrumb items={breadcrumbItems} />
        <div className="error-container">
          <Typography variant="h6" color="error">
            Bid not found
          </Typography>
          <Button onClick={() => navigate('/project-bids')} className="gradient-secondary">
            Back to Project Bids
          </Button>
        </div>
      </div>
    );
  }

  const handleViewSalesOrder = (milestoneIndex) => {
    const milestone = currentBid?.milestones?.[milestoneIndex] || currentBid?.sow?.milestones?.[milestoneIndex];
    const milestoneId = milestone?.id || milestone?.milestone_id || milestoneIndex;
    navigate(`/salesorder/${milestoneId}/${bidId}`);
  };
  const handleGenerateInvoice = (milestoneIndex) => {
    const milestone = currentBid?.milestones?.[milestoneIndex] || currentBid?.sow?.milestones?.[milestoneIndex];
    const milestoneId = milestone?.id || milestone?.milestone_id || milestoneIndex;
    navigate(`/invoice/${milestoneId}/${bidId}`);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOrderApproved = async (milestoneIndex) => {
    try {
      const milestone = currentBid?.milestones?.[milestoneIndex] || currentBid?.sow?.milestones?.[milestoneIndex];
      const milestoneId = milestone?.id || milestone?.milestone_id || milestoneIndex;
      
      if (!milestoneId) {
        console.error('Milestone ID not found');
        return;
      }

      // Call API to approve milestone
      await dispatch(approveMilestoneByAdmin(milestoneId));
      
    } catch (error) {
      console.error('Error approving milestone:', error);
    }
  };

  // Handle bid editing functions
  const handleEditBid = () => {
    setEditedBidData({
      admin_modified_bid_amount: currentBid?.admin_modified_bid_amount ? parseFloat(currentBid.admin_modified_bid_amount).toString() : '',
      admin_modified_delivery_timeline: currentBid?.admin_modified_delivery_timeline || '',
      admin_modified_message: currentBid?.admin_modified_message || '',
      approved_by_admin: currentBid?.approved_by_admin || false
    });
    // Prepare editable milestone admin fields
    const initialMilestones = (currentBid?.milestones || []).reduce((acc, m) => {
      acc[m.id] = {
        admin_hours: m.admin_hours ? String(m.admin_hours) : '',
        admin_scope: m.admin_scope || '',
        admin_amount: m.admin_amount ? parseFloat(m.admin_amount).toString() : '',
      };
      return acc;
    }, {});
    setEditedMilestones(initialMilestones);
    setIsEditingBid(true);
  };

  const handleCancelEdit = () => {
    setIsEditingBid(false);
    setEditedBidData({
      admin_modified_bid_amount: '',
      admin_modified_delivery_timeline: '',
      admin_modified_message: '',
      approved_by_admin: false
    });
    setEditedMilestones({});
  };

  // Milestones edit handlers
  const handleEditMilestones = () => {
    const initialMilestones = (currentBid?.milestones || []).reduce((acc, m) => {
      acc[m.id] = {
        admin_hours: m.admin_hours ? String(m.admin_hours) : '',
        admin_scope: m.admin_scope || '',
        admin_amount: m.admin_amount ? parseFloat(m.admin_amount).toString() : '',
      };
      return acc;
    }, {});
    setEditedMilestones(initialMilestones);
    setMilestoneFieldErrors({});
    setIsEditingMilestones(true);
  };

  const handleCancelEditMilestones = () => {
    setIsEditingMilestones(false);
    setEditedMilestones({});
    setMilestoneFieldErrors({});
  };

  const handleSaveMilestones = async () => {
    try {
      // Prevent save if totals do not match admin_modified_* when present
      const sumAdminHours = Object.values(editedMilestones || {}).reduce((t, m) => t + (parseInt(m.admin_hours || 0) || 0), 0);
      const sumAdminAmount = Object.values(editedMilestones || {}).reduce((t, m) => t + (parseFloat(m.admin_amount || 0) || 0), 0);
      const targetHours = currentBid?.admin_modified_delivery_timeline ? parseInt(currentBid.admin_modified_delivery_timeline) : null;
      const targetAmount = currentBid?.admin_modified_bid_amount ? parseFloat(currentBid.admin_modified_bid_amount) : null;

      // If mismatched, set inline errors under all related fields and block save
      const hoursMismatch = targetHours !== null && !Number.isNaN(targetHours) && sumAdminHours !== targetHours;
      const amountMismatch = targetAmount !== null && !Number.isNaN(targetAmount) && Number(sumAdminAmount.toFixed(2)) !== Number(targetAmount.toFixed(2));

      if (hoursMismatch || amountMismatch) {
        setMilestoneFieldErrors(() => {
          const errs = {};
          Object.keys(editedMilestones || {}).forEach((mid) => {
            errs[mid] = {
              admin_hours: hoursMismatch ? `Total hours must equal ${targetHours}` : '',
              admin_amount: amountMismatch ? `Total amount must equal ${targetAmount?.toFixed(2)}` : '',
            };
          });
          return errs;
        });
        return;
      }

      const updates = Object.entries(editedMilestones || {})
        .map(([milestoneId, values]) => {
          const payload = {
            admin_scope: values.admin_scope ?? '',
            admin_hours: values.admin_hours ?? '',
            admin_amount: values.admin_amount ? parseFloat(values.admin_amount).toString() : '',
          };
          // Only call if any field provided
          const hasAny = payload.admin_scope !== '' || payload.admin_hours !== '' || payload.admin_amount !== '';
          if (!hasAny) return null;
          return dispatch(updateMilestoneByAdmin({ milestoneId, data: payload }));
        })
        .filter(Boolean);

      if (updates.length === 0) {
        setIsEditingMilestones(false);
        return;
      }

      await Promise.all(updates);
      showSuccess('Admin milestones updated successfully!');
      setIsEditingMilestones(false);
      setEditedMilestones({});
      await fetchBidDetails();
    } catch (error) {
      showError('Failed to update admin milestones');
    }
  };

  const handleSaveBid = async () => {
    try {
      // Validate minimum character limit for admin message
      if (editedBidData.admin_modified_message && editedBidData.admin_modified_message.length < 100) {
        showError('Bid Message Admin must be at least 100 characters long');
        return;
      }

      // Prepare data for API call
      const apiData = {
        ...editedBidData,
        // Ensure bid amount is sent as integer/string without decimal points
        admin_modified_bid_amount: editedBidData.admin_modified_bid_amount ? 
          parseFloat(editedBidData.admin_modified_bid_amount).toString() : ''
      };

      // Call API to update bid data
      await dispatch(updateProjectBid({ 
        projectBidId: bidId, 
        bidData: apiData 
      }));
    } catch (error) {
      console.error('Error saving bid data:', error);
    }
  };

  const handleBidDataChange = (field, value) => {
    setEditedBidData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMilestoneDataChange = (milestoneId, field, value) => {
    setEditedMilestones(prev => {
      const next = {
        ...prev,
        [milestoneId]: {
          ...(prev[milestoneId] || {}),
          [field]: value,
        },
      };

      // Live validation: totals must match admin_modified_* if provided
      const sumAdminHours = Object.values(next).reduce((t, m) => t + (parseInt(m.admin_hours || 0) || 0), 0);
      const sumAdminAmount = Object.values(next).reduce((t, m) => t + (parseFloat(m.admin_amount || 0) || 0), 0);

      const targetHours = currentBid?.admin_modified_delivery_timeline ? parseInt(currentBid.admin_modified_delivery_timeline) : null;
      const targetAmount = currentBid?.admin_modified_bid_amount ? parseFloat(currentBid.admin_modified_bid_amount) : null;

      // Inline errors: attach to the field being edited
      setMilestoneFieldErrors(prevErrs => {
        const nextErrs = { ...prevErrs };
        const errsForThis = { ...(nextErrs[milestoneId] || {}) };
        if (field === 'admin_hours') {
          if (targetHours !== null && !Number.isNaN(targetHours) && sumAdminHours !== targetHours) {
            errsForThis.admin_hours = `Total hours must equal ${targetHours}`;
          } else {
            errsForThis.admin_hours = '';
          }
        }
        if (field === 'admin_amount') {
          if (targetAmount !== null && !Number.isNaN(targetAmount) && Number(sumAdminAmount.toFixed(2)) !== Number(targetAmount.toFixed(2))) {
            errsForThis.admin_amount = `Total amount must equal ${targetAmount.toFixed(2)}`;
          } else {
            errsForThis.admin_amount = '';
          }
        }
        nextErrs[milestoneId] = errsForThis;
        return nextErrs;
      });

      return next;
    });
  };

  return (
    <div className="project-bid-detail">
      <Breadcrumb items={breadcrumbItems} />

      <div className="detail-container">


        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="bid detail tabs">
            <Tab label="Client Info" />
            <Tab label="Billing Info" />
            <Tab label="Freelancer Info" />
            <Tab label="Project Info" />
            <Tab label="Bid Info" />
            <Tab label="SOW" />
            <Tab label="Milestones" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {/* Client Info Tab */}
          {activeTab === 0 && (
            <Grid item xs={12}>
              <Card className="detail-section">
                <CardContent>
                  <Box className="section-header">
                    <Person className="section-icon" />
                    <Typography variant="h6" className="section-title">
                      Client Information
                    </Typography>
                  </Box>
                  <Divider className="section-divider" />
                  <Grid container spacing={3}>
                    {renderInfoItem(
                      <Person />,
                      'Client Name',
                      `${currentBid.ClientProject?.User?.first_name || ''} ${currentBid.ClientProject?.User?.last_name || ''}`
                    )}
                    {renderInfoItem(
                      <Email />,
                      'Client Email',
                      currentBid.ClientProject?.User?.email
                    )}
                    {renderInfoItem(
                      <Phone />,
                      'Client Mobile',
                      currentBid.ClientProject?.User?.mobile
                    )}
                    {renderInfoItem(
                      <Business />,
                      'Company Name',
                      currentBid.ClientProject?.User?.company_name || '--'
                    )}
                    {renderInfoItem(
                      <Public />,
                      'Gender',
                      currentBid.ClientProject?.User?.gender || '--'
                    )}
                    {renderInfoItem(
                      <Public />,
                      'Country',
                      currentBid.ClientProject?.User?.country || '--'
                    )}
                    {renderInfoItem(
                      <LocationOn />,
                      'State',
                      currentBid.ClientProject?.User?.state || '--'
                    )}
                    {renderInfoItem(
                      <LocationOn />,
                      'City',
                      currentBid.ClientProject?.User?.city || '--'
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Billing Info Tab */}
          {activeTab === 1 && (
            <Grid item xs={12}>
              <Card className="detail-section">
                <CardContent>
                  <Box className="section-header">
                    <AttachMoney className="section-icon" />
                    <Typography variant="h6" className="section-title">
                      Billing Information
                    </Typography>
                  </Box>
                  <Divider className="section-divider" />
                  <Grid container spacing={2}>
                    {renderInfoItem(
                      <Person />,
                      'Billing Name',
                      currentBid.ClientProject?.User?.billingDetails?.billing_name || '--'
                    )}
                    {renderInfoItem(
                      <Email />,
                      'Billing Email',
                      currentBid.ClientProject?.User?.billingDetails?.billing_email || '--'
                    )}
                    {renderInfoItem(
                      <Phone />,
                      'Billing Contact Number',
                      currentBid.ClientProject?.User?.billingDetails?.billing_contact_number || '--'
                    )}
                    {renderInfoItem(
                      <LocationOn />,
                      'Billing Address',
                      currentBid.ClientProject?.User?.billingDetails?.billing_address || '--',

                    )}
                    {renderInfoItem(
                      <LocationOn />,
                      'Billing State',
                      currentBid.ClientProject?.User?.billingDetails?.billing_state || '--'
                    )}
                    {renderInfoItem(
                      <Public />,
                      'Billing Country',
                      currentBid.ClientProject?.User?.billingDetails?.billing_country || '--'
                    )}
                    {renderInfoItem(
                      <Description />,
                      'GST Number',
                      currentBid.ClientProject?.User?.billingDetails?.gst_number || '--'
                    )}
                    {
                      <Grid item xs={12} sm={6} md={4}>
                        <Box className="info-item">
                          <Box className="info-header">
                            <Description />
                            <Typography variant="subtitle2" className="info-label">
                              GST Exempted File
                            </Typography>
                          </Box>
                          {currentBid.ClientProject?.User?.billingDetails?.gst_exemted_file ? (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => window.open(currentBid.ClientProject?.User?.billingDetails?.gst_exemted_file, '_blank')}
                              sx={{ mt: 1 }}
                            >
                              View File
                            </Button>
                          ) : (
                            <Typography variant="subtitle2" className="info-label">
                              No GST Exempted File
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    }
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Freelancer Info Tab */}
          {activeTab === 2 && (
            <Grid item xs={12}>
              <Card className="detail-section">
                <CardContent>
                  <Box className="section-header">
                    <Person className="section-icon" />
                    <Typography variant="h6" className="section-title">
                      Freelancer Information
                    </Typography>
                  </Box>
                  <Divider className="section-divider" />

                  {/* Freelancer Profile Header */}
                  <Box className="freelancer-profile">
                    <Avatar
                      className="freelancer-avatar"
                      src={currentBid.freelancer?.profile_image}
                    >
                      {currentBid.freelancer?.first_name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box className="freelancer-info">
                      <Typography variant="h6" className="freelancer-name">
                        {`${currentBid.freelancer?.first_name || ''} ${currentBid.freelancer?.last_name || ''}`}
                      </Typography>
                      <Typography variant="body2" className="freelancer-email">
                        {currentBid.freelancer?.email}
                      </Typography>
                      <Chip
                        label={currentBid.freelancer?.status || 'Unknown'}
                        {...getStatusChipProps(currentBid.freelancer?.status)}
                        size="small"
                        className="freelancer-status"
                      />
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    {renderInfoItem(
                      <Phone />,
                      'Mobile',
                      currentBid.freelancer?.mobile
                    )}
                    {renderInfoItem(
                      <LocationOn />,
                      'Location',
                      currentBid.freelancer?.city && currentBid.freelancer?.state
                        ? `${currentBid.freelancer.city}, ${currentBid.freelancer.state}, ${currentBid.freelancer.country}`
                        : '--'
                    )}
                    {renderInfoItem(
                      <AccountCircle />,
                      'Username',
                      currentBid.freelancer?.pseudoName || currentBid.freelancer?.username || '--'
                    )}
                    {renderInfoItem(
                      <Business />,
                      'Company',
                      currentBid.freelancer?.company_name || '--'
                    )}
                    {renderInfoItem(
                      <Public />,
                      'Gender',
                      currentBid.freelancer?.gender || '--'
                    )}
                    {renderInfoItem(
                      <CalendarToday />,
                      'Joined Date',
                      formatDate(currentBid.freelancer?.createdAt)
                    )}
                    {currentBid.freelancer?.key_skills && renderInfoItem(
                      <Work />,
                      'Key Skills',
                      currentBid.freelancer.key_skills,
                      true
                    )}
                    {currentBid.freelancer?.bio && renderInfoItem(
                      <Description />,
                      'Bio',
                      currentBid.freelancer.bio,
                      true
                    )}
                    {currentBid.freelancer?.aboutme && renderInfoItem(
                      <Description />,
                      'About Me',
                      currentBid.freelancer.aboutme,
                      true
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Project Info Tab */}
          {activeTab === 3 && (
            <Grid item xs={12}>
              <Card className="detail-section">
                <CardContent>
                  <Box className="section-header">
                    <Work className="section-icon" />
                    <Typography variant="h6" className="section-title">
                      Project Information
                    </Typography>
                  </Box>
                  <Divider className="section-divider" />

                  {/* Project Header */}
                  {/* <Box className="project-header">
                    <Typography variant="h6" className="project-title">
                      {currentBid.ClientProject?.project_title}
                    </Typography>
                  </Box> */}

                  <Grid container spacing={3}>
                    {renderInfoItem(
                      <Subtitles />,
                      'Project Title',
                      currentBid.ClientProject?.project_title,
                      true
                    )}
                    {renderInfoItem(
                      <Category />,
                      'Category',
                      currentBid.ClientProject?.Category?.name
                    )}
                    {renderInfoItem(
                      <AttachMoney />,
                      'Budget Range',
                      currentBid.ClientProject?.project_amount_min && currentBid.ClientProject?.project_amount_max
                        ? `${formatCurrency(currentBid.ClientProject.project_amount_min)} - ${formatCurrency(currentBid.ClientProject.project_amount_max)}`
                        : '--'
                    )}
                    {renderInfoItem(
                      <Timeline />,
                      'Duration',
                      currentBid.ClientProject?.project_duration_min && currentBid.ClientProject?.project_duration_max
                        ? `${currentBid.ClientProject.project_duration_min} - ${currentBid.ClientProject.project_duration_max} days`
                        : '--'
                    )}
                    {renderInfoItem(
                      <Work />,
                      'Engagement Model',
                      currentBid.ClientProject?.model_engagement || '--'
                    )}
                    {renderInfoItem(
                      <Language />,
                      'Technology Preference',
                      currentBid.ClientProject?.technologty_pre || '--'
                    )}
                    {renderInfoItem(
                      <Public />,
                      'Currency',
                      `${currentBid.ClientProject?.currency_symbol} ${currentBid.ClientProject?.currency_type}` || '--'
                    )}
                    {renderInfoItem(
                      <CalendarToday />,
                      'Posted Date',
                      formatDate(currentBid.ClientProject?.createdAt)
                    )}
                    {renderInfoItem(
                      <CalendarToday />,
                      'Last Updated',
                      formatDate(currentBid.ClientProject?.updatedAt)
                    )}
                    {currentBid.ClientProject?.project_summary && renderInfoItem(
                      <Description />,
                      'Project Summary',
                      currentBid.ClientProject.project_summary,
                      true
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Bid Info Tab */}
          {activeTab === 4 && (
            <Grid item xs={12}>
              <Card className="detail-section">
                <CardContent>
                  <Box className="section-header">
                    <Info className="section-icon" />
                    <Typography variant="h6" className="section-title">
                      Bid Information
                    </Typography>
                    {currentBid?.ClientProject?.created_by_admin && (
                      <Box sx={{ ml: 'auto' }}>
                        {!isEditingBid ? (
                          <IconButton onClick={handleEditBid} color="primary">
                            <Edit />
                          </IconButton>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              onClick={handleSaveBid} 
                              color="success"
                              disabled={isUpdatingBid}
                            >
                              <Save />
                            </IconButton>
                            <IconButton 
                              onClick={handleCancelEdit} 
                              color="error"
                              disabled={isUpdatingBid}
                            >
                              <Cancel />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                  <Divider className="section-divider" />
                  <Grid container spacing={3}>
                    {/* Original Bid Amount */}
                    {renderInfoItem(
                      <AttachMoney />,
                      'Bid Amount',
                      formatCurrency(currentBid.bid_amount)
                    )}

                    {/* Bid Amount Admin - Only show if created_by_admin */}
                    {currentBid?.ClientProject?.created_by_admin && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Box className="info-item">
                          <Box className="info-header">
                            <AttachMoney />
                            <Typography variant="subtitle2" className="info-label">
                              Bid Amount Admin
                            </Typography>
                          </Box>
                          {isEditingBid ? (
                            <TextField
                              type="number"
                              value={editedBidData.admin_modified_bid_amount}
                              onChange={(e) => handleBidDataChange('admin_modified_bid_amount', e.target.value)}
                              variant="outlined"
                              size="small"
                              fullWidth
                              placeholder="Enter admin bid amount"
                            />
                          ) : (
                            <Typography variant="body1" className="info-value">
                              {currentBid.admin_modified_bid_amount ? `$${parseFloat(currentBid.admin_modified_bid_amount).toString()}` : '--'}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    )}

                    {/* Original Delivery Timeline */}
                    {renderInfoItem(
                      <Schedule />,
                      'Delivery Timeline',
                      currentBid.delivery_timeline ? `${currentBid.delivery_timeline} days` : '--'
                    )}

                    {/* Delivery Timeline Admin - Only show if created_by_admin */}
                    {currentBid?.ClientProject?.created_by_admin && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Box className="info-item">
                          <Box className="info-header">
                            <Schedule />
                            <Typography variant="subtitle2" className="info-label">
                              Delivery Timeline Admin
                            </Typography>
                          </Box>
                          {isEditingBid ? (
                            <TextField
                              type="number"
                              value={editedBidData.admin_modified_delivery_timeline}
                              onChange={(e) => handleBidDataChange('admin_modified_delivery_timeline', e.target.value)}
                              variant="outlined"
                              size="small"
                              fullWidth
                              placeholder="Enter admin delivery days"
                              InputProps={{
                                endAdornment: <Typography variant="body2">days</Typography>
                              }}
                            />
                          ) : (
                            <Typography variant="body1" className="info-value">
                              {currentBid.admin_modified_delivery_timeline ? `${currentBid.admin_modified_delivery_timeline} days` : '--'}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    )}

                    {/* Technology Preference - Not editable */}
                    {renderInfoItem(
                      <Language />,
                      'Technology Preference',
                      currentBid.technologty_pre || '--'
                    )}
                    {renderInfoItem(
                      <CalendarToday />,
                      'Submitted Date',
                      formatDate(currentBid.createdAt)
                    )}
                    {renderInfoItem(
                      <CalendarToday />,
                      'Last Updated',
                      formatDate(currentBid.updatedAt)
                    )}
                    {renderInfoItem(
                      <TrendingUp />,
                      'Lead Status',
                      currentBid.lead_status === '2' ? 'Active' : 'Inactive'
                    )}

                    {/* Status - Editable if created_by_admin */}
                    {currentBid?.ClientProject?.created_by_admin && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Box className="info-item">
                          <Box className="info-header">
                            <CheckCircle />
                            <Typography variant="subtitle2" className="info-label">
                              Status
                            </Typography>
                          </Box>
                          {isEditingBid ? (
                            <FormControl fullWidth size="small">
                              <Select
                                value={editedBidData.approved_by_admin}
                                onChange={(e) => handleBidDataChange('approved_by_admin', e.target.value)}
                                variant="outlined"
                              >
                                <MenuItem value={false}>Pending</MenuItem>
                                <MenuItem value={true}>Approved</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            <Typography variant="body1" className="info-value">
                              {currentBid.approved_by_admin ? 'Approved' : 'Pending'}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    )}

                    {/* Original Bid Message */}
                    {currentBid.message && renderInfoItem(
                      <Description />,
                      'Bid Message',
                      currentBid.message,
                      true
                    )}

                    {/* Bid Message Admin - Editable if created_by_admin */}
                    {currentBid?.ClientProject?.created_by_admin && (
                      <Grid item xs={12}>
                        <Box className="info-item">
                          <Box className="info-header">
                            <Description />
                            <Typography variant="subtitle2" className="info-label">
                              Bid Message Admin
                            </Typography>
                          </Box>
                          {isEditingBid ? (
                            <Box>
                              <TextField
                                multiline
                                rows={4}
                                value={editedBidData.admin_modified_message}
                                onChange={(e) => handleBidDataChange('admin_modified_message', e.target.value)}
                                variant="outlined"
                                size="small"
                                fullWidth
                                placeholder="Enter admin bid message (minimum 100 characters)"
                                error={editedBidData.admin_modified_message && editedBidData.admin_modified_message.length < 100}
                                helperText={
                                  editedBidData.admin_modified_message && editedBidData.admin_modified_message.length < 100
                                    ? `Minimum 100 characters required. Current: ${editedBidData.admin_modified_message.length}`
                                    : `${editedBidData.admin_modified_message?.length || 0} characters`
                                }
                              />
                            </Box>
                          ) : (
                            <Typography variant="body1" className="info-value">
                              {currentBid.admin_modified_message || '--'}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    )}

                    {currentBid.gst_note && renderInfoItem(
                      <Description />,
                      'GST Note',
                      currentBid.gst_note,
                      true
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* SOW Tab */}
          {activeTab === 5 && currentBid.sow && (
            <Grid item xs={12}>
              <Card className="detail-section">
                <CardContent>
                  <Box className="section-header">
                    <AssignmentIcon className="section-icon" />
                    <Typography variant="h6" className="section-title">
                      Statement of Work (SOW)
                    </Typography>
                  </Box>
                  <Divider className="section-divider" />

                  {/* SOW Header */}
                  <Box className="sow-header">
                    <Typography variant="h6" className="sow-title">
                      SOW
                    </Typography>
                    <Chip
                      label={currentBid.sow.status || 'Draft'}
                      {...getStatusChipProps(currentBid.sow.status)}
                      className="sow-status"
                    />
                  </Box>

                  <Grid container spacing={3}>
                    {/* {renderInfoItem(
                      <Info />, 
                      'SOW ID', 
                      `#${currentBid.sow.id}`
                    )} */}
                    {renderInfoItem(
                      <Person />,
                      'User ID',
                      currentBid.sow.user_id
                    )}
                    {renderInfoItem(
                      <Work />,
                      'Project ID',
                      currentBid.sow.project_id
                    )}
                    {renderInfoItem(
                      <HourglassEmpty />,
                      'Hours Proposed',
                      currentBid.sow.hours_proposed ? `${currentBid.sow.hours_proposed} hours` : '0 hours'
                    )}
                    {renderInfoItem(
                      <ListAlt />,
                      'Scope of Work',
                      currentBid.sow.scope_of_work || '--'
                    )}
                    {renderInfoItem(
                      <CalendarToday />,
                      'Created Date',
                      formatDate(currentBid.sow.createdAt)
                    )}
                    {renderInfoItem(
                      <CalendarToday />,
                      'Last Updated',
                      formatDate(currentBid.sow.updatedAt)
                    )}
                    {currentBid.sow.customer_objective && renderInfoItem(
                      <Flag />,
                      'Customer Objective',
                      currentBid.sow.customer_objective,
                      true
                    )}
                    {currentBid.sow.remarks && renderInfoItem(
                      <Description />,
                      'Remarks',
                      currentBid.sow.remarks,
                      true
                    )}
                  </Grid>

                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Milestones Tab */}
          {activeTab === 6 && currentBid.sow?.milestones && currentBid.sow.milestones.length > 0 && (
            <Grid item xs={12}>
              <Card className="detail-section">
                <CardContent>
                    <Box className="milestones-section">
                    <Box className="milestones-header">
                      <CheckCircle className="milestones-icon" />
                      <Typography variant="h6" className="milestones-title">
                        Project Milestones ({currentBid.sow.milestones.length})
                      </Typography>
                      {currentBid?.ClientProject?.created_by_admin && (
                        <Box sx={{ ml: 'auto' }}>
                          {!isEditingMilestones ? (
                            <IconButton onClick={handleEditMilestones} color="primary">
                              <Edit />
                            </IconButton>
                          ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton onClick={handleSaveMilestones} color="success">
                                <Save />
                              </IconButton>
                              <IconButton onClick={handleCancelEditMilestones} color="error">
                                <Cancel />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                    <Divider className="milestones-divider" />

                    <Grid container spacing={2}>
                      {currentBid.milestones.map((milestone, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Card className="milestone-card">
                            <CardContent>
                              <Box className="milestone-header">
                                <Typography variant="h6" className="milestone-number">
                                  Milestone {index + 1}
                                </Typography>
                                <Box>
                                  {!currentBid?.ClientProject?.created_by_admin && (
                                    <Chip
                                      label={milestone.is_paid == true ? 'Paid' : 'Unpaid'}
                                      color="primary"
                                      variant="filled"
                                      className="paid-status"
                                    />
                                  )}
                                  <Chip
                                    label={formatCurrency(milestone.amount)}
                                    color="primary"
                                    variant="filled"
                                    className="milestone-amount"
                                  />
                                </Box>
                              </Box>
                              <Typography variant="body1" className="milestone-scope">
                                {milestone.scope}
                              </Typography>
                              <Box className="milestone-details">
                                <Box className="milestone-detail">
                                  <HourglassEmpty className="milestone-detail-icon" />
                                  <Typography variant="body2">
                                    {milestone.hours} hours
                                  </Typography>
                                </Box>
                                <Box className="milestone-detail">
                                  <AttachMoney className="milestone-detail-icon" />
                                  <Typography variant="body2">
                                    {formatCurrency(milestone.amount)}
                                  </Typography>
                                </Box>
                                
                                {!currentBid?.ClientProject?.created_by_admin && milestone.is_paid == true && (
                                  <Box>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      className="gradient-primary view-btn"
                                      onClick={() => handleViewSalesOrder(index)}
                                    >
                                      View Sales Order
                                    </Button>
                                  </Box>
                                )}
                                {!currentBid?.ClientProject?.created_by_admin && milestone.is_paid == true && (
                                  <Box>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      className="gradient-primary view-btn"
                                      onClick={() => handleGenerateInvoice(index)}
                                    >
                                      View Invoice
                                    </Button>
                                  </Box>
                                )}
                                {!currentBid?.ClientProject?.created_by_admin && milestone.is_paid == true && (
                                <Box>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    className="gradient-primary view-btn"
                                    onClick={() => handleOrderApproved(index)}
                                    disabled={isApprovingMilestone || milestone.admin_approved_date != null}
                                  >
                                    {isApprovingMilestone ? 'Approving...' : 'Order Approved'}
                                  </Button>
                                </Box>
                                )}
                              </Box>

                              
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Milestones Summary */}
                    <Box className="milestones-summary">
                      <Typography variant="h6" className="summary-title">
                        Milestones Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Box className="summary-item">
                            <Typography variant="subtitle2" className="summary-label">
                              Total Milestones
                            </Typography>
                            <Typography variant="h6" className="summary-value">
                              {currentBid.sow.milestones.length}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box className="summary-item">
                            <Typography variant="subtitle2" className="summary-label">
                              Total Hours
                            </Typography>
                            <Typography variant="h6" className="summary-value">
                              {currentBid.sow.milestones.reduce((total, milestone) =>
                                total + parseInt(milestone.hours || 0), 0
                              )} hours
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box className="summary-item">
                            <Typography variant="subtitle2" className="summary-label">
                              Total Amount
                            </Typography>
                            <Typography variant="h6" className="summary-value amount">
                              {formatCurrency(
                                currentBid.sow.milestones.reduce((total, milestone) =>
                                  total + parseFloat(milestone.amount || 0), 0
                                )
                              )}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {currentBid?.ClientProject?.created_by_admin && (
                      <Box className="milestones-section" sx={{ mt: 4 }}>
                        <Box className="milestones-header">
                          <CheckCircle className="milestones-icon" />
                      <Typography variant="h6" className="milestones-title">
                            Admin Project Milestones ({currentBid.milestones?.length || 0})
                          </Typography>
                        </Box>
                        <Divider className="milestones-divider" />

                        <Grid container spacing={2}>
                          {currentBid.milestones.map((milestone, index) => (
                            <Grid item xs={12} md={6} key={`admin-${index}`}>
                              <Card className="milestone-card">
                                <CardContent>
                                  <Box className="milestone-header">
                                    <Typography variant="h6" className="milestone-number">
                                      Admin Milestone {index + 1}
                                    </Typography>
                                    <Box>
                                      <Chip
                                        label={milestone.is_paid == true ? 'Paid' : 'Unpaid'}
                                        color="primary"
                                        variant="filled"
                                        className="paid-status"
                                      />
                                      <Chip
                                        label={formatCurrency(isEditingMilestones ? parseFloat(editedMilestones[milestone.id]?.admin_amount || 0) : (parseFloat(milestone.admin_amount || 0)))}
                                        color="primary"
                                        variant="filled"
                                        className="milestone-amount"
                                      />
                                    </Box>
                                  </Box>

                                  {/* Scope styled like the standard milestone scope */}
                                  {isEditingMilestones ? (
                                    <Box sx={{ mb: 1 }}>
                                      <TextField
                                        multiline
                                        rows={3}
                                        fullWidth
                                        size="small"
                                        placeholder="Enter admin scope"
                                        value={(editedMilestones[milestone.id]?.admin_scope) || ''}
                                        onChange={(e) => handleMilestoneDataChange(milestone.id, 'admin_scope', e.target.value)}
                                      />
                                    </Box>
                                  ) : (
                                    <Typography variant="body1" className="milestone-scope">
                                      {milestone.admin_scope || '--'}
                                    </Typography>
                                  )}

                                  <Box className="milestone-details">
                                    <Box className="milestone-detail">
                                      <HourglassEmpty className="milestone-detail-icon" />
                                      {isEditingMilestones ? (
                                        <TextField
                                          type="number"
                                          size="small"
                                          placeholder="Hours"
                                          value={(editedMilestones[milestone.id]?.admin_hours) || ''}
                                          onChange={(e) => handleMilestoneDataChange(milestone.id, 'admin_hours', e.target.value)}
                                          InputProps={{
                                            endAdornment: <Typography variant="body2">hrs</Typography>
                                          }}
                                          error={Boolean(milestoneFieldErrors[milestone.id]?.admin_hours)}
                                          helperText={milestoneFieldErrors[milestone.id]?.admin_hours}
                                        />
                                      ) : (
                                        <Typography variant="body2">
                                          {(milestone.admin_hours ?? '') !== '' ? `${milestone.admin_hours} hours` : '--'}
                                        </Typography>
                                      )}
                                    </Box>
                                    <Box className="milestone-detail">
                                      <AttachMoney className="milestone-detail-icon" />
                                      {isEditingMilestones ? (
                                        <TextField
                                          type="number"
                                          size="small"
                                          placeholder="Amount"
                                          value={(editedMilestones[milestone.id]?.admin_amount) || ''}
                                          onChange={(e) => handleMilestoneDataChange(milestone.id, 'admin_amount', e.target.value)}
                                          error={Boolean(milestoneFieldErrors[milestone.id]?.admin_amount)}
                                          helperText={milestoneFieldErrors[milestone.id]?.admin_amount}
                                        />
                                      ) : (
                                        <Typography variant="body2">
                                          {formatCurrency(parseFloat(milestone.admin_amount || 0))}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>

                                  {/* Admin actions: mirror standard milestone actions */}
                                  {currentBid?.ClientProject?.created_by_admin && (
                                    <Box className="milestone-details" sx={{ mt: 1, gap: 1 }}>
                                      {milestone.is_paid == true && (
                                        <Box>
                                          <Button
                                            variant="contained"
                                            size="small"
                                            className="gradient-primary view-btn"
                                            onClick={() => handleViewSalesOrder(index)}
                                          >
                                            View Sales Order
                                          </Button>
                                        </Box>
                                      )}
                                      {milestone.is_paid == true && (
                                        <Box>
                                          <Button
                                            variant="contained"
                                            size="small"
                                            className="gradient-primary view-btn"
                                            onClick={() => handleGenerateInvoice(index)}
                                          >
                                            View Invoice
                                          </Button>
                                        </Box>
                                      )}
                                      {milestone.is_paid == true && (
                                        <Box>
                                          <Button
                                            variant="contained"
                                            size="small"
                                            className="gradient-primary view-btn"
                                            onClick={() => handleOrderApproved(index)}
                                            disabled={isApprovingMilestone || milestone.admin_approved_date != null}
                                          >
                                            {isApprovingMilestone ? 'Approving...' : 'Order Approved'}
                                          </Button>
                                        </Box>
                                      )}
                                    </Box>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>

                        <Box className="milestones-summary" sx={{ mt: 2 }}>
                          <Typography variant="h6" className="summary-title">
                            Admin Milestones Summary
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <Box className="summary-item">
                                <Typography variant="subtitle2" className="summary-label">
                                  Total Admin Milestones
                                </Typography>
                                <Typography variant="h6" className="summary-value">
                                  {currentBid.milestones?.length || 0}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Box className="summary-item">
                                <Typography variant="subtitle2" className="summary-label">
                                  Total Admin Hours
                                </Typography>
                                <Typography variant="h6" className="summary-value">
                                  {(isEditingMilestones
                                    ? Object.values(editedMilestones).reduce((t, m) => t + (parseInt(m.admin_hours || 0) || 0), 0)
                                    : (currentBid.milestones || []).reduce((total, milestone) =>
                                        total + (parseInt(milestone.admin_hours || 0) || 0), 0
                                      ))} hours
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Box className="summary-item">
                                <Typography variant="subtitle2" className="summary-label">
                                  Total Admin Amount
                                </Typography>
                                <Typography variant="h6" className="summary-value amount">
                                  {formatCurrency(
                                    isEditingMilestones
                                      ? Object.values(editedMilestones).reduce((t, m) => t + (parseFloat(m.admin_amount || 0) || 0), 0)
                                      : (currentBid.milestones || []).reduce((total, milestone) =>
                                          total + (parseFloat(milestone.admin_amount || 0) || 0), 0
                                        )
                                  )}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </div>
    </div>
  );
};

export default ProjectBidDetail;
