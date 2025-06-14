import React, { useEffect, useState, version } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    styled,
    Tooltip,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import moment from 'moment';
import 'moment-duration-format';
import { siteAnalytics, ipAnalytics, exportSiteAnalytics } from '../../features/admin/siteAnalyticsSlice';
import '../ClientList/ClientList.scss';
import * as XLSX from 'xlsx';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Custom styled table cells
const StyledTableCell = styled(TableCell)({
    maxWidth: '150px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '&.location-cell': {
        minWidth: '180px',
        whiteSpace: 'normal',
        wordBreak: 'break-word'
    },
    '&.time-cell': {
        minWidth: '180px',
        whiteSpace: 'normal'
    },
    '&.url-cell': {
        maxWidth: 'none',
        width: '30%',
        whiteSpace: 'normal',
        wordBreak: 'break-all',
        '& a': {
            color: '#1976d2',
            textDecoration: 'none',
            '&:hover': {
                textDecoration: 'underline'
            }
        }
    }
});

// Custom styled tooltip
const StyledTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    '& .MuiTooltip-tooltip': {
        backgroundColor: '#fff',
        color: 'rgba(0, 0, 0, 0.87)',
        fontSize: '0.875rem',
        border: '1px solid #dadde9',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        padding: '8px 12px',
        maxWidth: 'none'
    }
});

const SiteAnalytics = () => {
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageAnalytics, setpageAnalytics] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedIpAddress, setSelectedIpAddress] = useState(null);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const pageLimit = 50;

    // Get data from Redux store
    const totalEntries = totalCount;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (selectedIpAddress) {
                    const response = await dispatch(ipAnalytics({
                        page: currentPage,
                        pageLimit,
                        ipAddress: selectedIpAddress
                    }));
                    setpageAnalytics(response.payload.data.data.userActivities);
                    setTotalCount(response.payload.data.data.total_count);
                } else {
                    const response = await dispatch(siteAnalytics({
                        page: currentPage,
                        pageLimit
                    }));
                    setpageAnalytics(response.payload.data.data.userActivities);
                    setTotalCount(response.payload.data.data.total_count);
                }
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line
    }, [dispatch, currentPage, selectedIpAddress]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleExportClick = () => {
        setIsExportDialogOpen(true);
    };

    const handleExportDialogClose = () => {
        setIsExportDialogOpen(false);
        setFromDate('');
        setToDate('');
    };

    const handleExport = async () => {
        if (!fromDate || !toDate) {
            alert('Please select both from and to dates');
            return;
        }

        setIsExporting(true);
        try {
            const response = await dispatch(exportSiteAnalytics({
                fromDate: moment(fromDate).format('YYYY-MM-DD'),
                toDate: moment(toDate).format('YYYY-MM-DD')
            }));
            const data = response.payload.data.data.userActivities;
            
            // Transform data for Excel
            const excelData = data.map(item => ({
                'IP Address': item.ip_address || '--',
                'Location': item.location || '--',
                'In Time': item.start_time ? moment(item.start_time).format('DD-MM-YYYY h:mm:ss A') : '--',
                'Out Time': item.end_time ? moment(item.end_time).format('DD-MM-YYYY h:mm:ss A') : '--',
                'Time Spent': item.time_spent ? moment.duration(item.time_spent, 'seconds').format('m [min] s [sec]') : '--',
                'Page Load Time': item.page_load_time ? `${item.page_load_time} sec` : '--',
                'Device Type': item.device_type || '--',
                'URL': item.url || '--'
            }));

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Site Analytics');

            // Generate filename with date range
            const fileName = `site_analytics_${moment(fromDate).format('YYYY-MM-DD')}_to_${moment(toDate).format('YYYY-MM-DD')}.xlsx`;

            // Save file
            XLSX.writeFile(wb, fileName);
            handleExportDialogClose();
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleViewIpAnalytics = async (ipAddress) => {
        setIsLoading(true);
        setSelectedIpAddress(ipAddress);
        try {
            const response = await dispatch(ipAnalytics({
                page: currentPage,
                pageLimit,
                ipAddress
            }));
            setpageAnalytics(response.payload.data.data.userActivities);
            setTotalCount(response.payload.data.data.total_count);
        } catch (error) {
            console.error('Error fetching IP analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToList = () => {
        console.log("handleBackToList");
        setSelectedIpAddress(null);
        setCurrentPage(currentPage);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                {selectedIpAddress && 
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleBackToList}
                    startIcon={<ArrowBackIcon />}
                >
                    Back to List
                </Button>
                }
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{paddingTop: '10px'}}>{selectedIpAddress ? `Analytics for IP: ${selectedIpAddress}` : 'Site Analytics'}</h2>
                </div>
              
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleExportClick}
                    disabled={isExporting}
                    startIcon={<FileDownloadIcon />}
                >
                    {isExporting ? 'Exporting...' : 'Export to Excel'}
                </Button>
            </div>

            {/* Export Dialog */}
            <Dialog open={isExportDialogOpen} onClose={handleExportDialogClose}>
                <DialogTitle>Select Date Range for Export</DialogTitle>
                <DialogContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px', minWidth: '300px' }}>
                        <TextField
                            label="From Date"
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                        />
                        <TextField
                            label="To Date"
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleExportDialogClose}>Cancel</Button>
                    <Button 
                        onClick={handleExport} 
                        variant="contained" 
                        color="primary"
                        disabled={!fromDate || !toDate || isExporting}
                    >
                        {isExporting ? 'Exporting...' : 'Download'}
                    </Button>
                </DialogActions>
            </Dialog>

            <div className="table-wrapper">
                <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>IP Address</StyledTableCell>
                                <StyledTableCell className="location-cell">Location</StyledTableCell>
                                <StyledTableCell>In Time</StyledTableCell>
                                <StyledTableCell>Out Time</StyledTableCell>
                                <StyledTableCell>Time Spent</StyledTableCell>
                                <StyledTableCell>Page Load Time</StyledTableCell>
                                <StyledTableCell>Device Type</StyledTableCell>
                                <StyledTableCell className="url-cell">URL</StyledTableCell>
                                {!selectedIpAddress && <StyledTableCell>Actions</StyledTableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pageAnalytics.map((pageAnalytics) => (
                                <TableRow key={pageAnalytics.id}>
                                    <StyledTableCell>
                                        {pageAnalytics.ip_address ? pageAnalytics.ip_address : '--'}
                                    </StyledTableCell>
                                    <StyledTableCell className="location-cell">
                                        {pageAnalytics.location ? pageAnalytics.location : '--'}
                                    </StyledTableCell>
                                    <StyledTableCell className="time-cell">
                                        {pageAnalytics.start_time ? moment(pageAnalytics.start_time).format('DD-MM-YYYY h:mm:ss A') : '--'}
                                    </StyledTableCell>
                                    <StyledTableCell className="time-cell">
                                        {pageAnalytics.end_time ? moment(pageAnalytics.end_time).format('DD-MM-YYYY h:mm:ss A') : '--'}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {pageAnalytics.time_spent
                                            ? moment.duration(pageAnalytics.time_spent, 'seconds').format('m [min] s [sec]')
                                            : '--'
                                        }
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {pageAnalytics.page_load_time ? `${pageAnalytics.page_load_time} sec` : '--'}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {pageAnalytics.device_type ? pageAnalytics.device_type : '--'}
                                    </StyledTableCell>
                                    <StyledTableCell className="url-cell" title={pageAnalytics.url || '--'}>
                                        {pageAnalytics.url ? (
                                            <a href={pageAnalytics.url} target="_blank" rel="noopener noreferrer">
                                                {pageAnalytics.url}
                                            </a>
                                        ) : '--'}
                                    </StyledTableCell>
                                    {!selectedIpAddress && (
                                    <StyledTableCell>
                                        <IconButton
                                            onClick={() => handleViewIpAnalytics(pageAnalytics.ip_address)}
                                            disabled={!pageAnalytics.ip_address}
                                            color="primary"
                                            size="small"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                    </StyledTableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <div className="table-footer">
                    <div className="entries-info">
                        Showing <span>{pageAnalytics.length}</span> of {totalEntries}
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

export default SiteAnalytics; 