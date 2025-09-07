import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  Box,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getProjectBidDetails, clearCurrentBid } from '../../features/admin/projectBidsSlice';
import './ProjectBidDetail.scss';

const ProjectBidDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bidId } = useParams();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleBackToList = () => {
    navigate('/project-bids');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
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

  if (!currentBid) {
    return (
      <div className="error-container">
        <Typography variant="h6" color="error">
          Bid not found
        </Typography>
        <Button onClick={handleBackToList} variant="outlined" sx={{ mt: 2 }}>
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="project-bid-detail">
      <div >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
          className="back-button"
        >
          Back to Project Bids
        </Button>
      </div>

      <div className="content-area">
        <Grid container spacing={3} sx={{ mt: 0 }}>
          {/* Bid Information */}
          <Grid item xs={12} md={6}>
            <Card className="bid-card">
              <CardContent>
                <Typography variant="h6" className="card-title">
                  Bid Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Box className="info-row">
                  <Typography variant="subtitle2" className="label">Bid ID:</Typography>
                  <Typography variant="body1" className="value">#{currentBid.id}</Typography>
                </Box>
                
                <Box className="info-row">
                  <Typography variant="subtitle2" className="label">Status:</Typography>
                  <Chip
                    label={currentBid.status || 'Pending'}
                    color={getStatusColor(currentBid.status)}
                    size="small"
                  />
                </Box>
                
                <Box className="info-row">
                  <Typography variant="subtitle2" className="label">Bid Amount:</Typography>
                  <Typography variant="body1" className="value bid-amount">
                    {formatCurrency(currentBid.bid_amount)}
                  </Typography>
                </Box>
                
                <Box className="info-row">
                  <Typography variant="subtitle2" className="label">Delivery Time:</Typography>
                  <Typography variant="body1" className="value">
                    {currentBid.delivery_time ? `${currentBid.delivery_time} days` : '--'}
                  </Typography>
                </Box>
                
                <Box className="info-row">
                  <Typography variant="subtitle2" className="label">Submitted:</Typography>
                  <Typography variant="body1" className="value">
                    {formatDate(currentBid.created_at)}
                  </Typography>
                </Box>
                
                {currentBid.bid_description && (
                  <Box className="info-row">
                    <Typography variant="subtitle2" className="label">Description:</Typography>
                    <Typography variant="body1" className="value description">
                      {currentBid.bid_description}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Freelancer Information */}
          <Grid item xs={12} md={6}>
            <Card className="freelancer-card">
              <CardContent>
                <Typography variant="h6" className="card-title">
                  Freelancer Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Box className="freelancer-header">
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
                
                <Box className="info-row">
                  <Typography variant="subtitle2" className="label">Phone:</Typography>
                  <Typography variant="body1" className="value">
                    {currentBid.freelancer?.mobile || '--'}
                  </Typography>
                </Box>
                
                <Box className="info-row">
                  <Typography variant="subtitle2" className="label">Location:</Typography>
                  <Typography variant="body1" className="value">
                    {currentBid.freelancer?.city && currentBid.freelancer?.country 
                      ? `${currentBid.freelancer.city}, ${currentBid.freelancer.country}`
                      : '--'
                    }
                  </Typography>
                </Box>
                
                <Box className="info-row">
                  <Typography variant="subtitle2" className="label">Experience:</Typography>
                  <Typography variant="body1" className="value">
                    {currentBid.freelancer?.experience ? `${currentBid.freelancer.experience} years` : '--'}
                  </Typography>
                </Box>
                
                {currentBid.freelancer?.key_skills && (
                  <Box className="info-row">
                    <Typography variant="subtitle2" className="label">Skills:</Typography>
                    <Typography variant="body1" className="value skills">
                      {currentBid.freelancer.key_skills}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Project Information */}
          <Grid item xs={12}>
            <Card className="project-card">
              <CardContent>
                <Typography variant="h6" className="card-title">
                  Project Information
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box className="info-row">
                      <Typography variant="subtitle2" className="label">Project Title:</Typography>
                      <Typography variant="body1" className="value project-title">
                        {currentBid.ClientProject?.project_title || '--'}
                      </Typography>
                    </Box>
                    
                    <Box className="info-row">
                      <Typography variant="subtitle2" className="label">Category:</Typography>
                      <Typography variant="body1" className="value">
                        {currentBid.ClientProject?.Category?.name || '--'}
                      </Typography>
                    </Box>
                    
                    <Box className="info-row">
                      <Typography variant="subtitle2" className="label">Budget Range:</Typography>
                      <Typography variant="body1" className="value">
                        {currentBid.ClientProject?.project_amount_min && currentBid.ClientProject?.project_amount_max
                          ? `${formatCurrency(currentBid.ClientProject.project_amount_min)} - ${formatCurrency(currentBid.ClientProject.project_amount_max)}`
                          : '--'
                        }
                      </Typography>
                    </Box>
                    
                    <Box className="info-row">
                      <Typography variant="subtitle2" className="label">Posted:</Typography>
                      <Typography variant="body1" className="value">
                        {formatDate(currentBid.ClientProject?.created_at)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box className="info-row">
                      <Typography variant="subtitle2" className="label">Project Status:</Typography>
                      <Chip
                        label={currentBid.ClientProject?.status === 1 ? 'Active' : 'Inactive'}
                        color={currentBid.ClientProject?.status === 1 ? 'primary' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    <Box className="info-row">
                      <Typography variant="subtitle2" className="label">Client:</Typography>
                      <Typography variant="body1" className="value">
                        {currentBid.ClientProject?.User?.first_name && currentBid.ClientProject?.User?.last_name
                          ? `${currentBid.ClientProject.User.first_name} ${currentBid.ClientProject.User.last_name}`
                          : '--'
                        }
                      </Typography>
                    </Box>
                    
                    <Box className="info-row">
                      <Typography variant="subtitle2" className="label">Client Email:</Typography>
                      <Typography variant="body1" className="value">
                        {currentBid.ClientProject?.User?.email || '--'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                {currentBid.ClientProject?.project_summary && (
                  <Box className="info-row full-width">
                    <Typography variant="subtitle2" className="label">Project Description:</Typography>
                    <Typography variant="body1" className="value description">
                      {currentBid.ClientProject.project_summary}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* SOW Information - Only show if SOW exists */}
          {currentBid.sow && (
            <Grid item xs={12}>
              <Card className="sow-card">
                <CardContent>
                  <Typography variant="h6" className="card-title">
                    Statement of Work (SOW)
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box className="info-row">
                        <Typography variant="subtitle2" className="label">SOW ID:</Typography>
                        <Typography variant="body1" className="value">
                          #{currentBid.sow.id}
                        </Typography>
                      </Box>
                      
                      <Box className="info-row">
                        <Typography variant="subtitle2" className="label">Status:</Typography>
                        <Chip
                          label={currentBid.sow.status || 'Draft'}
                          color={getStatusColor(currentBid.sow.status)}
                          size="small"
                        />
                      </Box>
                      
                      <Box className="info-row">
                        <Typography variant="subtitle2" className="label">Created:</Typography>
                        <Typography variant="body1" className="value">
                          {formatDate(currentBid.sow.created_at)}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box className="info-row">
                        <Typography variant="subtitle2" className="label">Version:</Typography>
                        <Typography variant="body1" className="value">
                          {currentBid.sow.version || '1.0'}
                        </Typography>
                      </Box>
                      
                      <Box className="info-row">
                        <Typography variant="subtitle2" className="label">Last Updated:</Typography>
                        <Typography variant="body1" className="value">
                          {formatDate(currentBid.sow.updated_at)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {currentBid.sow.description && (
                    <Box className="info-row full-width">
                      <Typography variant="subtitle2" className="label">SOW Description:</Typography>
                      <Typography variant="body1" className="value description">
                        {currentBid.sow.description}
                      </Typography>
                    </Box>
                  )}
                  
                  {currentBid.sow.deliverables && (
                    <Box className="info-row full-width">
                      <Typography variant="subtitle2" className="label">Deliverables:</Typography>
                      <Typography variant="body1" className="value description">
                        {currentBid.sow.deliverables}
                      </Typography>
                    </Box>
                  )}
                  
                  {currentBid.sow.timeline && (
                    <Box className="info-row full-width">
                      <Typography variant="subtitle2" className="label">Timeline:</Typography>
                      <Typography variant="body1" className="value description">
                        {currentBid.sow.timeline}
                      </Typography>
                    </Box>
                  )}
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
