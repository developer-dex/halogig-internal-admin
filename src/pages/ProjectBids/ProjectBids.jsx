import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { Home, Assignment, Visibility, CalendarToday } from '@mui/icons-material';
import { getAllProjectBids } from '../../features/admin/projectBidsSlice';
import Breadcrumb from '../../components/Breadcrumb';
import './ProjectBids.scss';

const ProjectBids = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageLimit = 50;

  // Breadcrumb items for project bids page
  const breadcrumbItems = [
    { label: 'Home', path: '/clients', icon: <Home /> },
    { label: 'Project Bids', path: null, icon: <Assignment /> }
  ];

  // Get data from Redux store
  const { bids, totalCount } = useSelector((state) => state.projectBidsReducer);
  const totalEntries = totalCount;

  const fetchProjectBids = async () => {
    setIsLoading(true);
    try {
      await dispatch(getAllProjectBids({
        page: currentPage,
        pageLimit
      }));
    } catch (error) {
      console.error('Error fetching project bids:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectBids();
  }, [dispatch, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewBidDetails = (bid) => {
    navigate(`/project-bids/${bid.id}`);
  };

  // Helper function to get status button style
  const getStatusButtonStyle = (status) => {
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
      case 'accepted':
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
      case 'in_progress':
        return {
          backgroundColor: '#e3f2fd',
          color: '#1565c0',
          border: '1px solid #2196f3',
          '&:hover': {
            backgroundColor: '#bbdefb',
          }
        };
      case 'completed':
        return {
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          border: '1px solid #4caf50',
          '&:hover': {
            backgroundColor: '#c8e6c9',
          }
        };
      default:
        return {
          backgroundColor: '#f5f5f5',
          color: '#757575',
          border: '1px solid #e0e0e0',
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '--';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading && bids.length === 0) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="project-bids-list">
      <Breadcrumb items={breadcrumbItems} />

      <div className="table-wrapper">
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="8%">BID ID</TableCell>
                <TableCell width="22%">PROJECT</TableCell>
                <TableCell width="20%">FREELANCER</TableCell>
                <TableCell width="12%">BID AMOUNT</TableCell>
                <TableCell width="12%">DELIVERY TIME</TableCell>
                <TableCell width="10%">STATUS</TableCell>
                <TableCell width="8%">SUBMITTED</TableCell>
                <TableCell width="8%">VIEW</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell width="8%">
                    #{bid.id}
                  </TableCell>
                  <TableCell width="22%">
                    <div className="project-info">
                      <div className="project-title">
                        {bid.ClientProject?.project_title || '--'}
                      </div>
                      <div className="project-category">
                        {bid.ClientProject?.Category?.name || '--'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell width="20%">
                    <div className="freelancer-info">
                      <Avatar 
                        className="freelancer-avatar"
                        src={bid.freelancer?.profile_image}
                      >
                        {bid.freelancer?.first_name?.[0]?.toUpperCase()}
                      </Avatar>
                      <div className="freelancer-details">
                        <div className="freelancer-name">
                          {`${bid.freelancer?.first_name || ''} ${bid.freelancer?.last_name || ''}`}
                        </div>
                        <div className="freelancer-email">
                          {bid.freelancer?.email || '--'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell width="12%">
                    <div className="bid-amount">
                      {formatCurrency(bid.bid_amount)}
                    </div>
                  </TableCell>
                  <TableCell width="12%">
                    <div className="delivery-time">
                      <CalendarToday className="delivery-icon" />
                      <span className="delivery-text">
                        {bid.delivery_time ? `${bid.delivery_time} days` : '--'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell width="10%">
                    <Button
                      variant="contained"
                      size="small"
                      sx={getStatusButtonStyle(bid.status)}
                      className={`status-button ${(bid.status || 'pending').toLowerCase().replace(' ', '-')}`}
                    >
                      {bid.status || 'Pending'}
                    </Button>
                  </TableCell>
                  <TableCell width="8%">
                    {formatDate(bid.created_at)}
                  </TableCell>
                  <TableCell width="8%">
                    <Button 
                      variant="contained"
                      size="small"
                      className="gradient-primary view-btn"
                      onClick={() => handleViewBidDetails(bid)}
                      startIcon={<Visibility />}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="table-footer">
          <div className="entries-info">
            Showing <span>{bids.length}</span> of {totalEntries}
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
              {Array.from({ length: Math.ceil(totalEntries / pageLimit) }, (_, i) => i + 1)
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
              disabled={currentPage === Math.ceil(totalEntries / pageLimit)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBids;
