import React, { useEffect, useState, version } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Checkbox,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { clientData, statusChange } from '../../features/admin/clientManagementSlice';
import './ClientList.scss';

const ClientList = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const statusOptions = ['Pending', 'Approved', 'Rejected', 'Under Review'];
  const pageLimit = 10;

  // Get data from Redux store
  const totalEntries = 10;

  const fetchClients = async () => {
    setIsLoading(true)
    const response = await dispatch(clientData({ 
      page: currentPage, 
      pageLimit 
    }));
    console.log('res', response.payload.data.data)
    setClients(response.payload.data.data.clients);
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
  if (isLoading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="partner-list">
      <div className="search-container">
        {/* <div className="search-box">
          <SearchIcon />
          <input type="text" placeholder="Search Tasks" />
        </div> */}
      </div>

      <h2>Client List</h2>

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
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                          {client.first_name ? client.first_name : '--'}
                  </TableCell>
                  <TableCell>
                    {client.last_name ? client.last_name : '--'}
                    </TableCell>
                  <TableCell>
                    {client.email ? client.email : '--'}
                    </TableCell>
                  <TableCell>
                  <Button variant="outlined" onClick={() => handleOpenModal(client)}>
                    {client.status}
                  </Button>   
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
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleStatusChange} color="primary" variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ClientList; 