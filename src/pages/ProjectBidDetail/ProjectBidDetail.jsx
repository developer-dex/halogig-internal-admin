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
} from '@mui/icons-material';
import { getProjectBidDetails, clearCurrentBid } from '../../features/admin/projectBidsSlice';
import Breadcrumb from '../../components/Breadcrumb';
import './ProjectBidDetail.scss';

const ProjectBidDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bidId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Get data from Redux store
  const { currentBid } = useSelector((state) => state.projectBidsReducer);

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
                  </Box>
                  <Divider className="section-divider" />
                  <Grid container spacing={3}>
                    {renderInfoItem(
                      <AttachMoney />,
                      'Bid Amount',
                      formatCurrency(currentBid.bid_amount)
                    )}
                    {renderInfoItem(
                      <Schedule />,
                      'Delivery Timeline',
                      currentBid.delivery_timeline ? `${currentBid.delivery_timeline} days` : '--'
                    )}
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
                    {/* {renderInfoItem(
                    <AttachMoney />, 
                    'Sales Commission', 
                    formatCurrency(currentBid.sales_comm_amount || 0)
                  )}
                  {renderInfoItem(
                    <AttachMoney />, 
                    'Total Proposal Value', 
                    formatCurrency(currentBid.total_proposal_value || 0)
                  )} */}
                    {currentBid.message && renderInfoItem(
                      <Description />,
                      'Bid Message',
                      currentBid.message,
                      true
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
                                  <Chip
                                    label={milestone.is_paid == true ? 'Paid' : 'Unpaid'}
                                    color="primary"
                                    variant="filled"
                                    className="paid-status"
                                  />
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
