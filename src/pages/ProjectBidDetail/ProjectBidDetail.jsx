import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Button,
  Avatar,
  CircularProgress,
  Box,
  Paper,
} from '@mui/material';
import {
  ExpandMore,
  Home,
  Assignment,
  Info,
  Person,
  Work,
  Description,
  CalendarToday,
  Money
} from '@mui/icons-material';
import { getProjectBidDetails, clearCurrentBid } from '../../features/admin/projectBidsSlice';
import Breadcrumb from '../../components/Breadcrumb';
import './ProjectBidDetail.scss';

const ProjectBidDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bidId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState('bid');

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

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  // Helper function to get status button style (matching other pages)
  const getStatusButtonStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          backgroundColor: '#fff3e0',
          color: '#e65100',
          border: '1px solid #ffcc02',
        };
      case 'accepted':
        return {
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          border: '1px solid #4caf50',
        };
      case 'rejected':
        return {
          backgroundColor: '#ffebee',
          color: '#c62828',
          border: '1px solid #f44336',
        };
      case 'in_progress':
        return {
          backgroundColor: '#e3f2fd',
          color: '#1565c0',
          border: '1px solid #2196f3',
        };
      case 'completed':
        return {
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          border: '1px solid #4caf50',
        };
      default:
        return {
          backgroundColor: '#fff3e0',
          color: '#e65100',
          border: '1px solid #ffcc02',
        };
    }
  };

  // Helper function to render professional field
  const renderProfessionalField = (icon, label, value, isAmount = false) => {
    if (!value && value !== 0) return null;
    
    return (
      <Grid item xs={12} sm={6} md={4}>
        <Paper className="professional-field">
          <Box className="field-header">
            {icon && <Box className="field-icon">{icon}</Box>}
            <Typography variant="subtitle2" className="field-label">
              {label}
            </Typography>
          </Box>
          <Typography 
            variant="body1" 
            className={`field-value ${isAmount ? 'amount-value' : ''}`}
          >
            {value}
          </Typography>
        </Paper>
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

  return (
    <div className="project-bid-detail">
      <Breadcrumb items={breadcrumbItems} />

      <div className="accordion-container">
        {/* Bid Information Accordion */}
        <Accordion 
          expanded={expandedPanel === 'bid'} 
          onChange={handleAccordionChange('bid')}
          className="bid-accordion"
        >
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            className="accordion-header"
          >
            <Box className="accordion-title-container">
              <Info className="accordion-icon" />
              <Typography variant="h6" className="accordion-title">
                Bid Information
              </Typography>
              <Button
                variant="contained"
                size="small"
                sx={getStatusButtonStyle(currentBid.status)}
                className={`status-button ${(currentBid.status || 'pending').toLowerCase().replace(' ', '-')}`}
                onClick={(e) => e.stopPropagation()}
              >
                {currentBid.status || 'Pending'}
              </Button>
            </Box>
          </AccordionSummary>
          <AccordionDetails className="accordion-content">
            <Grid container spacing={2}>
              {renderProfessionalField(
                <Info />, 
                'Bid ID', 
                `#${currentBid.id}`
              )}
              {renderProfessionalField(
                <Money />, 
                'Bid Amount', 
                formatCurrency(currentBid.bid_amount),
                true
              )}
              {renderProfessionalField(
                <CalendarToday />, 
                'Delivery Time', 
                currentBid.delivery_time ? `${currentBid.delivery_time} days` : '--'
              )}
              {renderProfessionalField(
                <CalendarToday />, 
                'Submitted', 
                formatDate(currentBid.created_at)
              )}
              
              {currentBid.bid_description && (
                <Grid item xs={12}>
                  <Paper className="professional-field description-field">
                    <Box className="field-header">
                      <Description className="field-icon" />
                      <Typography variant="subtitle2" className="field-label">
                        Bid Description
                      </Typography>
                    </Box>
                    <Typography variant="body1" className="field-value description-text">
                      {currentBid.bid_description}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Freelancer Information Accordion */}
        <Accordion 
          expanded={expandedPanel === 'freelancer'} 
          onChange={handleAccordionChange('freelancer')}
          className="freelancer-accordion"
        >
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            className="accordion-header"
          >
            <Box className="accordion-title-container">
              <Person className="accordion-icon" />
              <Typography variant="h6" className="accordion-title">
                Freelancer Information
              </Typography>
              <Box className="freelancer-preview">
                <Avatar 
                  className="preview-avatar"
                  src={currentBid.freelancer?.profile_image}
                >
                  {currentBid.freelancer?.first_name?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="body2" className="preview-name">
                  {`${currentBid.freelancer?.first_name || ''} ${currentBid.freelancer?.last_name || ''}`}
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails className="accordion-content">
            <Box className="profile-header">
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
                  {currentBid.freelancer?.email || '--'}
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              {renderProfessionalField(
                <Person />, 
                'Phone', 
                currentBid.freelancer?.mobile || '--'
              )}
              {renderProfessionalField(
                <Work />, 
                'Location', 
                currentBid.freelancer?.city && currentBid.freelancer?.country 
                  ? `${currentBid.freelancer.city}, ${currentBid.freelancer.country}`
                  : '--'
              )}
              {renderProfessionalField(
                <CalendarToday />, 
                'Experience', 
                currentBid.freelancer?.experience ? `${currentBid.freelancer.experience} years` : '--'
              )}
              
              {currentBid.freelancer?.key_skills && (
                <Grid item xs={12}>
                  <Paper className="professional-field description-field">
                    <Box className="field-header">
                      <Work className="field-icon" />
                      <Typography variant="subtitle2" className="field-label">
                        Skills
                      </Typography>
                    </Box>
                    <Typography variant="body1" className="field-value">
                      {currentBid.freelancer.key_skills}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Project Information Accordion */}
        <Accordion 
          expanded={expandedPanel === 'project'} 
          onChange={handleAccordionChange('project')}
          className="project-accordion"
        >
          <AccordionSummary 
            expandIcon={<ExpandMore />}
            className="accordion-header"
          >
            <Box className="accordion-title-container">
              <Work className="accordion-icon" />
              <Typography variant="h6" className="accordion-title">
                Project Information
              </Typography>
              <Button
                variant="contained"
                size="small"
                className={`status-button ${currentBid.ClientProject?.status === 1 ? 'accepted' : 'rejected'}`}
                onClick={(e) => e.stopPropagation()}
              >
                {currentBid.ClientProject?.status === 1 ? 'Active' : 'Inactive'}
              </Button>
            </Box>
          </AccordionSummary>
          <AccordionDetails className="accordion-content">
            <Grid container spacing={2}>
              {renderProfessionalField(
                <Work />, 
                'Project Title', 
                currentBid.ClientProject?.project_title || '--'
              )}
              {renderProfessionalField(
                <Work />, 
                'Category', 
                currentBid.ClientProject?.Category?.name || '--'
              )}
              {renderProfessionalField(
                <Money />, 
                'Budget Range', 
                currentBid.ClientProject?.project_amount_min && currentBid.ClientProject?.project_amount_max
                  ? `${formatCurrency(currentBid.ClientProject.project_amount_min)} - ${formatCurrency(currentBid.ClientProject.project_amount_max)}`
                  : '--',
                true
              )}
              {renderProfessionalField(
                <CalendarToday />, 
                'Posted', 
                formatDate(currentBid.ClientProject?.created_at)
              )}
              {renderProfessionalField(
                <Person />, 
                'Client', 
                currentBid.ClientProject?.User?.first_name && currentBid.ClientProject?.User?.last_name
                  ? `${currentBid.ClientProject.User.first_name} ${currentBid.ClientProject.User.last_name}`
                  : '--'
              )}
              {renderProfessionalField(
                <Person />, 
                'Client Email', 
                currentBid.ClientProject?.User?.email || '--'
              )}
              
              {currentBid.ClientProject?.project_summary && (
                <Grid item xs={12}>
                  <Paper className="professional-field description-field">
                    <Box className="field-header">
                      <Description className="field-icon" />
                      <Typography variant="subtitle2" className="field-label">
                        Project Description
                      </Typography>
                    </Box>
                    <Typography variant="body1" className="field-value description-text">
                      {currentBid.ClientProject.project_summary}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* SOW Information Accordion - Only show if SOW exists */}
        {currentBid.sow && (
          <Accordion 
            expanded={expandedPanel === 'sow'} 
            onChange={handleAccordionChange('sow')}
            className="sow-accordion"
          >
            <AccordionSummary 
              expandIcon={<ExpandMore />}
              className="accordion-header"
            >
              <Box className="accordion-title-container">
                <Description className="accordion-icon" />
                <Typography variant="h6" className="accordion-title">
                  Statement of Work (SOW)
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={getStatusButtonStyle(currentBid.sow.status)}
                  className={`status-button ${(currentBid.sow.status || 'pending').toLowerCase().replace(' ', '-')}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentBid.sow.status || 'Draft'}
                </Button>
              </Box>
            </AccordionSummary>
            <AccordionDetails className="accordion-content">
              <Grid container spacing={2}>
                {renderProfessionalField(
                  <Info />, 
                  'SOW ID', 
                  `#${currentBid.sow.id}`
                )}
                {renderProfessionalField(
                  <Info />, 
                  'Version', 
                  currentBid.sow.version || '1.0'
                )}
                {renderProfessionalField(
                  <CalendarToday />, 
                  'Created', 
                  formatDate(currentBid.sow.created_at)
                )}
                {renderProfessionalField(
                  <CalendarToday />, 
                  'Last Updated', 
                  formatDate(currentBid.sow.updated_at)
                )}
                
                {currentBid.sow.description && (
                  <Grid item xs={12}>
                    <Paper className="professional-field description-field">
                      <Box className="field-header">
                        <Description className="field-icon" />
                        <Typography variant="subtitle2" className="field-label">
                          SOW Description
                        </Typography>
                      </Box>
                      <Typography variant="body1" className="field-value description-text">
                        {currentBid.sow.description}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                
                {currentBid.sow.deliverables && (
                  <Grid item xs={12}>
                    <Paper className="professional-field description-field">
                      <Box className="field-header">
                        <Work className="field-icon" />
                        <Typography variant="subtitle2" className="field-label">
                          Deliverables
                        </Typography>
                      </Box>
                      <Typography variant="body1" className="field-value description-text">
                        {currentBid.sow.deliverables}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                
                {currentBid.sow.timeline && (
                  <Grid item xs={12}>
                    <Paper className="professional-field description-field">
                      <Box className="field-header">
                        <CalendarToday className="field-icon" />
                        <Typography variant="subtitle2" className="field-label">
                          Timeline
                        </Typography>
                      </Box>
                      <Typography variant="body1" className="field-value description-text">
                        {currentBid.sow.timeline}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default ProjectBidDetail;
