import React, { useEffect, useState } from 'react';
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
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  Pagination,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { toast } from 'react-toastify';
import moment from 'moment';
import logManagerService from '../../services/logManager.service';
import './LogManager.scss';

const LogManager = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageLimit] = useState(50);
  
  // Filter states
  const [filters, setFilters] = useState({
    logLevel: '',
    logType: '',
    priority: '',
    environment: '',
    isResolved: '',
    apiEndpoint: '',
    startDate: '',
    endDate: '',
  });
  
  // Modal states
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  
  // Statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    error: 0,
    warning: 0,
    info: 0,
    critical: 0,
    resolved: 0,
    unresolved: 0,
  });

  // Filter options
  const logLevelOptions = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
  const logTypeOptions = [
    'API_ERROR', 'VALIDATION_ERROR', 'DATABASE_ERROR', 
    'AUTH_ERROR', 'SYSTEM_ERROR', 'FILE_UPLOAD_ERROR', 'BUSINESS_LOGIC_ERROR'
  ];
  const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const environmentOptions = ['development', 'staging', 'production'];
  const resolvedOptions = [
    { value: 'true', label: 'Resolved' },
    { value: 'false', label: 'Unresolved' }
  ];

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageLimit,
        ...filters,
      };
      
      const response = await logManagerService.getAllLogs(params);
      
      if (response.data.success) {
        setLogs(response.data.data.logs);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalCount(response.data.data.pagination.total);
      } else {
        toast.error('Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Error fetching logs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await logManagerService.getLogStatistics();
      if (response.data.success) {
        // Process statistics data
        const stats = response.data.data;
        setStatistics({
          total: stats.total || 0,
          error: stats.error || 0,
          warning: stats.warning || 0,
          info: stats.info || 0,
          critical: stats.critical || 0,
          resolved: stats.resolved || 0,
          unresolved: stats.unresolved || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStatistics();
  }, [currentPage, filters]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      logLevel: '',
      logType: '',
      priority: '',
      environment: '',
      isResolved: '',
      apiEndpoint: '',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
  };

  const handleViewLog = async (logId) => {
    try {
      const response = await logManagerService.getLogById(logId);
      if (response.data.success) {
        setSelectedLog(response.data.data);
        setIsDetailModalOpen(true);
      } else {
        toast.error('Failed to fetch log details');
      }
    } catch (error) {
      console.error('Error fetching log details:', error);
      toast.error('Error fetching log details');
    }
  };

  const handleResolveLog = async () => {
    if (!selectedLog) return;
    
    setIsResolving(true);
    try {
      const response = await logManagerService.resolveLog(selectedLog.id, resolutionNotes);
      if (response.data.success) {
        toast.success('Log marked as resolved successfully');
        setIsResolveModalOpen(false);
        setResolutionNotes('');
        fetchLogs(); // Refresh the list
        fetchStatistics(); // Refresh statistics
      } else {
        toast.error('Failed to resolve log');
      }
    } catch (error) {
      console.error('Error resolving log:', error);
      toast.error('Error resolving log');
    } finally {
      setIsResolving(false);
    }
  };

  const getLogLevelIcon = (level) => {
    switch (level) {
      case 'ERROR':
        return <ErrorIcon color="error" />;
      case 'WARN':
        return <WarningIcon color="warning" />;
      case 'INFO':
        return <InfoIcon color="info" />;
      case 'DEBUG':
        return <InfoIcon color="action" />;
      default:
        return <InfoIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getResolvedStatusIcon = (isResolved) => {
    return isResolved ? (
      <CheckCircleIcon color="success" />
    ) : (
      <ErrorIcon color="error" />
    );
  };

  const formatTimestamp = (timestamp) => {
    return moment(timestamp).format('MMM DD, YYYY HH:mm:ss');
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="log-manager">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Log Manager
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage system logs, errors, and system health
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Logs
              </Typography>
              <Typography variant="h4" component="div">
                {statistics.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Errors
              </Typography>
              <Typography variant="h4" component="div" color="error">
                {statistics.error}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Critical Issues
              </Typography>
              <Typography variant="h4" component="div" color="error">
                {statistics.critical}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Unresolved
              </Typography>
              <Typography variant="h4" component="div" color="warning">
                {statistics.unresolved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Log Level</InputLabel>
              <Select
                value={filters.logLevel}
                label="Log Level"
                onChange={(e) => handleFilterChange('logLevel', e.target.value)}
              >
                <MenuItem value="">All Levels</MenuItem>
                {logLevelOptions.map(level => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Log Type</InputLabel>
              <Select
                value={filters.logType}
                label="Log Type"
                onChange={(e) => handleFilterChange('logType', e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                {logTypeOptions.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <MenuItem value="">All Priorities</MenuItem>
                {priorityOptions.map(priority => (
                  <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.isResolved}
                label="Status"
                onChange={(e) => handleFilterChange('isResolved', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                {resolvedOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="API Endpoint"
              value={filters.apiEndpoint}
              onChange={(e) => handleFilterChange('apiEndpoint', e.target.value)}
              placeholder="e.g., /freelancer/bids"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                size="small"
              >
                Clear Filters
              </Button>
              <Button
                variant="contained"
                onClick={fetchLogs}
                startIcon={<RefreshIcon />}
                size="small"
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Logs Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Error Message</TableCell>
                <TableCell>API Endpoint</TableCell>
                <TableCell>User</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Environment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No logs found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getLogLevelIcon(log.log_level)}
                        {log.log_level}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={log.log_type} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={log.priority} 
                        size="small" 
                        color={getPriorityColor(log.priority)}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={log.error_message}>
                        <Typography variant="body2">
                          {truncateText(log.error_message, 40)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={log.api_endpoint}>
                        <Typography variant="body2">
                          {truncateText(log.api_endpoint, 30)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {truncateText(log.user_info, 25)}
                      </Typography>
                    </TableCell>
                    <TableCell>{log.ip_address}</TableCell>
                    <TableCell>
                      <Chip 
                        label={log.environment} 
                        size="small" 
                        variant="outlined"
                        color={log.environment === 'production' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getResolvedStatusIcon(log.is_resolved)}
                        <Typography variant="body2">
                          {log.is_resolved ? 'Resolved' : 'Unresolved'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewLog(log.id)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Log Detail Modal */}
      <Dialog
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Log Details - ID: {selectedLog?.id}
        </DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Timestamp</Typography>
                  <Typography variant="body1">{formatTimestamp(selectedLog.created_at)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Log Level</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getLogLevelIcon(selectedLog.log_level)}
                    {selectedLog.log_level}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Log Type</Typography>
                  <Typography variant="body1">{selectedLog.log_type}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                  <Chip 
                    label={selectedLog.priority} 
                    color={getPriorityColor(selectedLog.priority)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Error Message</Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                    {selectedLog.error_message || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Stack Trace</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100', maxHeight: 200, overflow: 'auto' }}>
                    <Typography variant="body2" fontFamily="monospace" fontSize="12px">
                      {selectedLog.stack_trace || 'No stack trace available'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">API Endpoint</Typography>
                  <Typography variant="body1">{selectedLog.api_endpoint || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">HTTP Method</Typography>
                  <Typography variant="body1">{selectedLog.http_method || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">User</Typography>
                  <Typography variant="body1">{selectedLog.user_info || 'System'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">IP Address</Typography>
                  <Typography variant="body1">{selectedLog.ip_address || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Environment</Typography>
                  <Typography variant="body1">{selectedLog.environment}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Module</Typography>
                  <Typography variant="body1">{selectedLog.module || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Function</Typography>
                  <Typography variant="body1">{selectedLog.function_name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Execution Time</Typography>
                  <Typography variant="body1">{selectedLog.execution_time || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Request Data</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100', maxHeight: 200, overflow: 'auto' }}>
                    <Typography variant="body2" fontFamily="monospace" fontSize="12px">
                      {selectedLog.request_data ? JSON.stringify(selectedLog.request_data, null, 2) : 'No request data available'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Response Data</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100', maxHeight: 200, overflow: 'auto' }}>
                    <Typography variant="body2" fontFamily="monospace" fontSize="12px">
                      {selectedLog.response_data ? JSON.stringify(selectedLog.response_data, null, 2) : 'No response data available'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailModalOpen(false)}>Close</Button>
          {selectedLog && !selectedLog.is_resolved && (
            <Button 
              variant="contained" 
              color="success"
              onClick={() => {
                setIsDetailModalOpen(false);
                setIsResolveModalOpen(true);
              }}
            >
              Mark as Resolved
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Resolve Log Modal */}
      <Dialog
        open={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mark Log as Resolved</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Resolution Notes"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Describe how this issue was resolved..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsResolveModalOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={handleResolveLog}
            disabled={isResolving}
          >
            {isResolving ? <CircularProgress size={20} /> : 'Mark Resolved'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LogManager;
