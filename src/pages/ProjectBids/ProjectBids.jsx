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
  IconButton,
  CircularProgress,
  Chip,
  Avatar,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getAllProjectBids } from '../../features/admin/projectBidsSlice';
import './ProjectBids.scss';

const ProjectBids = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageLimit = 50;

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
      <h2>Project Bids</h2>

      <div className="table-wrapper">
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="10%">BID ID</TableCell>
                <TableCell width="15%">PROJECT</TableCell>
                <TableCell width="15%">FREELANCER</TableCell>
                <TableCell width="10%">BID AMOUNT</TableCell>
                <TableCell width="10%">DELIVERY TIME</TableCell>
                <TableCell width="10%">STATUS</TableCell>
                <TableCell width="10%">SUBMITTED</TableCell>
                <TableCell width="10%">VIEW</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell>
                    #{bid.id}
                  </TableCell>
                  <TableCell>
                    <div className="project-info">
                      <div className="project-title">
                        {bid.ClientProject?.project_title || '--'}
                      </div>
                      <div className="project-category">
                        {bid.ClientProject?.Category?.name || '--'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  <TableCell>
                    <div className="bid-amount">
                      {formatCurrency(bid.bid_amount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="delivery-time">
                      {bid.delivery_time ? `${bid.delivery_time} days` : '--'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={bid.status || 'Pending'}
                      color={getStatusColor(bid.status)}
                      size="small"
                      className="status-chip"
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(bid.created_at)}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      className="action-btn"
                      onClick={() => handleViewBidDetails(bid)}
                      title="View Bid Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
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
