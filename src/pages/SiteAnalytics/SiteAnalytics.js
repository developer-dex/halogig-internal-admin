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

} from '@mui/material';
import moment from 'moment';
import 'moment-duration-format';
import { siteAnalytics } from '../../features/admin/siteAnalyticsSlice';
import '../ClientList/ClientList.scss';

const SiteAnalytics = () => {
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageAnalytics, setpageAnalytics] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const pageLimit = 50;

    // Get data from Redux store
    const totalEntries = totalCount;

    const fetchpageAnalytics = async () => {
        setIsLoading(true)
        const response = await dispatch(siteAnalytics({
            page: currentPage,
            pageLimit
        }));
        console.log('res', response.payload.data.data)
        setpageAnalytics(response.payload.data.data.userActivities);
        setTotalCount(response.payload.data.data.total_count);
        setIsLoading(false)

    };

    useEffect(() => {
        fetchpageAnalytics();
    }, [dispatch, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
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
            {/* <div className="search-container">
                <div className="search-box">
          <SearchIcon />
          <input type="text" placeholder="Search Tasks" />
        </div>
            </div> */}

            <h2>Site Analytics</h2>

            <div className="table-wrapper">
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>IP Address</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>In Time</TableCell>
                                <TableCell>Out Time</TableCell>
                                <TableCell>Time Spent</TableCell>
                                <TableCell>Page Load Time</TableCell>
                                <TableCell>Device Type</TableCell>
                                <TableCell width="30%">URL</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pageAnalytics.map((pageAnalytics) => (
                                <TableRow key={pageAnalytics.id}>
                                    <TableCell>
                                        {pageAnalytics.ip_address ? pageAnalytics.ip_address : '--'}
                                    </TableCell>
                                    <TableCell>
                                        {pageAnalytics.location ? pageAnalytics.location : '--'}
                                    </TableCell>
                                    <TableCell>
                                        {pageAnalytics.start_time ? moment(pageAnalytics.start_time).format('DD-MM-YYYY h:mm A') : '--'}
                                    </TableCell>
                                    <TableCell>
                                        {pageAnalytics.end_time ? moment(pageAnalytics.end_time).format('DD-MM-YYYY h:mm A') : '--'}
                                    </TableCell>
                                    <TableCell>
                                        {pageAnalytics.time_spent
                                            ? moment.duration(pageAnalytics.time_spent, 'seconds').format('m [min] s [sec]')
                                            : '--'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {pageAnalytics.page_load_time ? `${pageAnalytics.page_load_time} sec` : '--'}
                                    </TableCell>
                                    <TableCell>
                                        {pageAnalytics.device_type ? pageAnalytics.device_type : '--'}
                                    </TableCell>
                                    <TableCell width="30%">
                                        {pageAnalytics.url ? (
                                            <a href={pageAnalytics.url} target="_blank" rel="noopener noreferrer">
                                                {pageAnalytics.url}
                                            </a>
                                        ) : '--'}
                                    </TableCell>
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