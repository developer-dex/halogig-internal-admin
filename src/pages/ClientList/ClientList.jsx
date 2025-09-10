import React, { useEffect, useState, version } from 'react';
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
  FormControlLabel,
  Checkbox,
  DialogActions,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Home, People } from '@mui/icons-material';
import { clientData, statusChange } from '../../features/admin/clientManagementSlice';
import Breadcrumb from '../../components/Breadcrumb';
import './ClientList.scss';

const ClientList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // Breadcrumb items for client list page
  const breadcrumbItems = [
    { label: 'Home', path: '/clients', icon: <Home /> },
    { label: 'Clients', path: null, icon: <People /> }
  ];
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Under Review'];
  const pageLimit = 50;

  // Get data from Redux store
  const totalEntries = totalCount;

  const fetchClients = async () => {
    setIsLoading(true)
    const response = await dispatch(clientData({
      page: currentPage,
      pageLimit
    }));
    console.log('res', response.payload.data.data)
    setClients(response.payload.data.data.clients);
    setTotalCount(response.payload.data.data.total_count);
    setIsLoading(false)

  };

  useEffect(() => {
    fetchClients();
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
    setClients((prevFreelancers) =>
      prevFreelancers.map((p) => (p.id === selectedPartner.id ? { ...p, status: selectedStatus } : p))
    );
    handleCloseModal();
    fetchClients();
  };

  const handleViewClient = (client) => {
    // Navigate to client detail page
    navigate(`/clients/${client.id}`);
  };

  const handlePostProject = (client) => {
    // Navigate to create client project page with client information
    navigate(`/create-client-project`, { 
      state: { 
        clientId: client.id,
        clientName: `${client.first_name} ${client.last_name}`,
        clientEmail: client.email
      }
    });
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

      <div className="table-wrapper">
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="15%">FIRST NAME</TableCell>
                <TableCell width="15%">LAST NAME</TableCell>
                <TableCell width="20%">EMAIL</TableCell>
                <TableCell width="10%" >VIEW</TableCell>
                <TableCell width="20%">ACTION</TableCell>
                <TableCell width="20%">POST PROJECT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell  width="15%">
                    {client.first_name ? client.first_name : '--'}
                  </TableCell>
                  <TableCell width="15%">
                    {client.last_name ? client.last_name : '--'}
                  </TableCell>
                  <TableCell width="20%">
                    {client.email ? client.email : '--'}
                  </TableCell>
                  <TableCell width="10%">
                    <IconButton 
                      className="action-btn"
                      onClick={() => handleViewClient(client)}
                      title="View Client Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell width="20%">
                    <Button 
                      variant="outlined" 
                      onClick={() => handleOpenModal(client)}
                      sx={getStatusButtonStyle(client.status)}
                      className={`status-button ${client.status?.toLowerCase().replace(' ', '-')}`}
                    >
                      {client.status}
                    </Button>
                  </TableCell>
                  <TableCell width="20%">
                    {client.created_by_admin && (
                      <Button 
                        variant="contained" 
                        onClick={() => handlePostProject(client)}
                        className="gradient-primary"
                        size="small"
                      >
                        Post A Project
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="table-footer">
          <div className="entries-info">
            Showing <span>{clients.length}</span> of {totalEntries}
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

export default ClientList; 