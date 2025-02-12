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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { freelancerData } from '../../features/admin/freelancerManagementSlice';

const FreeLancerList = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [partners, setPartners] = useState([]);
  const pageLimit = 10;

  // Get data from Redux store
  const { isLoading, responseData } = useSelector((state) => state.clientData);
  const totalEntries = 10;

  const fetchPartners = async () => {
    const response = await dispatch(freelancerData({ 
      page: currentPage, 
      pageLimit 
    }));
    console.log('res', response.payload.data.data)
    setPartners(response.payload.data.data);
  };

  useEffect(() => {
    fetchPartners();
  }, [dispatch, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusChange = (partnerId, newStatus) => {
    // Here you would typically dispatch an action to update the status
    console.log('Status changed for partner', partnerId, 'to', newStatus);
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
        <div className="search-box">
          <SearchIcon />
          <input type="text" placeholder="Search Tasks" />
        </div>
      </div>

      <h2>Partner List</h2>

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
              {partners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>
                          {partner.first_name}
                  </TableCell>
                  <TableCell>
                    {partner.last_name}
                    </TableCell>
                  <TableCell>
                    {partner.email}
                    </TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={partner.status || 'pending'}
                        onChange={(e) => handleStatusChange(partner.id, e.target.value)}
                        className="status-select"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="table-footer">
          <div className="entries-info">
            Showing <span>{partners.length}</span> of {totalEntries}
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
    </div>
  );
};

export default FreeLancerList; 