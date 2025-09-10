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
  IconButton,
  Avatar,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Checkbox,
  DialogActions,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Home, Work } from '@mui/icons-material';
import { freelancerData } from '../../features/admin/freelancerManagementSlice';
import { statusChange } from '../../features/admin/clientManagementSlice';
import Breadcrumb from '../../components/Breadcrumb';
import './FreeLancerList.scss';

const FreeLancerList = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  // Breadcrumb items for freelancer list page
  const breadcrumbItems = [
    { label: 'Home', path: '/clients', icon: <Home /> },
    { label: 'Freelancers', path: null, icon: <Work /> }
  ];
  const [freelancers, setFreelancers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Under Review'];
  const pageLimit = 50;

  // Get data from Redux store
  // const { isLoading, responseData } = useSelector((state) => state.clientData);
  const totalEntries = totalCount;

  const fetchFreelancers = async () => {
    setIsLoading(true)
    const response = await dispatch(freelancerData({
      page: currentPage,
      pageLimit
    }));
    console.log('res', response.payload.data.data)
    setFreelancers(response.payload.data.data.freelancers);
    setTotalCount(response.payload.data.data.total_count);
    setIsLoading(false)
  };

  useEffect(() => {
    fetchFreelancers();
  }, [dispatch, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenModal = (partner) => {
    setSelectedPartner(partner);
    setSelectedStatus(partner.status);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPartner(null);
    setSelectedStatus('');
  };

  const handleStatusChange = async () => {
    if (!selectedPartner) return;
    const statusObj = { status: selectedStatus };
    console.log('status', statusObj);
    // Updated to pass an object containing both id and statusObj
    await dispatch(statusChange({ id: selectedPartner.id, apiData: statusObj }));
    setFreelancers((prevFreelancers) =>
      prevFreelancers.map((p) => (p.id === selectedPartner.id ? { ...p, status: selectedStatus } : p))
    );
    handleCloseModal();
    fetchFreelancers();
  };

  const getStatusButtonStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          backgroundColor: '#fff3e0',
          color: '#f57c00',
          borderColor: '#f57c00',
          '&:hover': {
            backgroundColor: '#ffe0b2',
            borderColor: '#ef6c00'
          }
        };
      case 'approved':
      case 'otpverified':
        return {
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          borderColor: '#4caf50',
          '&:hover': {
            backgroundColor: '#c8e6c9',
            borderColor: '#388e3c'
          }
        };
      case 'rejected':
        return {
          backgroundColor: '#ffebee',
          color: '#d32f2f',
          borderColor: '#f44336',
          '&:hover': {
            backgroundColor: '#ffcdd2',
            borderColor: '#c62828'
          }
        };
      case 'under review':
      case 'incomplete':
        return {
          backgroundColor: '#e3f2fd',
          color: '#1565c0',
          borderColor: '#2196f3',
          '&:hover': {
            backgroundColor: '#bbdefb',
            borderColor: '#1976d2'
          }
        };
      default:
        return {
          backgroundColor: '#f5f5f5',
          color: '#666',
          borderColor: '#ccc'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="partner-list">
      <Breadcrumb items={breadcrumbItems} />
      {/* <div className="search-container"> */}
        {/* <div className="search-box">
          <SearchIcon />
          <input type="text" placeholder="Search Tasks" />
        </div> */}
      {/* </div> */}

      <div className="table-wrapper">
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="25%">FIRST NAME</TableCell>
                <TableCell width="25%">LAST NAME</TableCell>
                <TableCell width="25%">EMAIL</TableCell>
                <TableCell width="25%">ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {freelancers.map((freelancer) => (
                <TableRow key={freelancer.id}>
                  <TableCell>
                    {freelancer.first_name ? freelancer.first_name : '--'}
                  </TableCell>
                  <TableCell>
                    {freelancer.last_name ? freelancer.last_name : '--'}
                  </TableCell>
                  <TableCell>
                    {freelancer.email ? freelancer.email : '--'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      onClick={() => handleOpenModal(freelancer)}
                      className={`status-button ${freelancer.status?.toLowerCase().replace(' ', '-')}`}
                    >
                      {freelancer.status}
                    </Button>                 
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="table-footer">
          <div className="entries-info">
            Showing <span>{freelancers.length}</span> of {totalEntries}
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
              {/* Calculate total pages */}
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
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Select Status</DialogTitle>
        <DialogContent>
          {statusOptions.map((status) => (
            <FormControlLabel
              key={status}
              control={
                <Checkbox
                  checked={selectedStatus === status}
                  onChange={() => setSelectedStatus(status)}
                />
              }
              label={status}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} className="gradient-secondary">Cancel</Button>
          <Button onClick={handleStatusChange} className="gradient-primary" variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FreeLancerList; 