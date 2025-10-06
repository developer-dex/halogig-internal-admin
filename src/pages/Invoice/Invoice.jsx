import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Button,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getBillingInformation } from '../../features/admin/projectBidsSlice';

const currencyFormat = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '--';
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(Number(amount));
  } catch {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount));
  }
};

const Invoice = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const invoiceRef = useRef(null);
  const { milestoneId, projectbidId } = useParams();

  const [billingInfo, setBillingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBillingInfo = async () => {
      try {
        setIsLoading(true);
        const res = await dispatch(getBillingInformation({ milestoneId, projectbidId }));
        const apiData = res?.payload?.data?.data;
        if (apiData) {
          setBillingInfo(apiData);
        } else {
          console.warn('Unexpected API structure:', res);
        }
      } catch (error) {
        console.error('Error fetching billing info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (milestoneId && projectbidId) fetchBillingInfo();
  }, [dispatch, milestoneId, projectbidId]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!billingInfo) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="body1" color="error">
          Failed to load billing information.
        </Typography>
      </Box>
    );
  }

  const billing = billingInfo?.userBillingInformation || {};
  const sale = billingInfo?.saleOrderDetails || {};
  const project = billingInfo?.projectDetails || {};

  const fullAddress = [
    billing.billing_address,
    billing.billing_state,
    billing.billing_country,
  ].filter(Boolean).join(', ');

  const view = {
    customerId: billing.customer_id || '',
    billingName: billing.billing_name || '',
    billingEmail: billing.billing_email || '',
    billingContact: billing.billing_contact_number || '',
    billingAddress: fullAddress,
    saleOrderNo: sale.sale_order_number || '',
    billDate: sale.sale_order_date || '',
    gstNumber: billing.gst_number || '',
    projectType: project.milestone_scope || '',
    rate: Number(project.milestone_amount) || 0,
    clientState: billing.billing_state || '',
    clientCountry: billing.billing_country || '',
  };

  const borderColor = '#bdbdbd';
  const cell = { border: `1px solid ${borderColor}`, p: 1, minHeight: 36 };
  const headCell = { ...cell, backgroundColor: '#f7f7f7', fontWeight: 700, color: '#333' };

  // ✅ GST Logic
  const normalizeState = (s) => (s || '').trim().toLowerCase();
  const isUPState = (s) => {
    const n = normalizeState(s);
    return n === 'uttar pradesh' || n === 'u.p.' || n === 'up';
  };

  const lowerCountry = (view.clientCountry || '').trim().toLowerCase();
  const isDomestic = lowerCountry === '' || lowerCountry === 'india' || lowerCountry === 'in';

  let sgst = 0, cgst = 0, igst = 0, gstType = 'NO GST (Exempt/International)';

  if (!isDomestic) {
    gstType = 'NO GST (International)';
  } else if (isUPState(view.clientState)) {
    sgst = view.rate * 0.09;
    cgst = view.rate * 0.09;
    gstType = 'CGST + SGST';
  } else {
    igst = view.rate * 0.18;
    gstType = 'IGST';
  }

  const subTotal = view.rate;
  const totalTax = sgst + cgst + igst;
  const grandTotal = subTotal + totalTax;

  const amountInWords = (num) => {
    try {
      const n = Number(num || 0);
      const str = new Intl.NumberFormat('en-IN').format(n);
      return `Rupees ${str} Only`;
    } catch {
      return 'Rupees -- Only';
    }
  };

  // ✅ PDF Download
  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    pdf.save(`Invoice_${projectbidId}.pdf`);
  };

  return (
    <Paper elevation={0} sx={{ p: 3, background: '#fff' }}>
      {/* Top Bar */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
        <Button variant="contained" onClick={handleDownloadPDF}>Download Invoice</Button>
      </Box>

      {/* INVOICE CONTENT */}
      <Box ref={invoiceRef}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#111' }}>
              HaloGig Technologies
            </Typography>
            <Typography variant="body2" color="text.secondary">
              2nd Floor, Business Park, Lucknow, Uttar Pradesh, India
            </Typography>
          </Box>
        </Box>

        {/* Bill To and Sale Order */}
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
            <Box sx={{ border: `1px solid ${borderColor}` }}>
              <Box sx={headCell}><Typography variant="subtitle2">Bill To</Typography></Box>
              <Box sx={{ p: 1.2 }}>
                <Typography sx={{ fontSize: 12, color: '#333' }}>Customer ID : {view.customerId}</Typography>
                <Typography sx={{ fontWeight: 700 }}>{view.billingName}</Typography>
                <Typography sx={{ fontSize: 14 }}>{view.billingAddress}</Typography>
                <Typography sx={{ fontSize: 14 }}>{view.billingEmail}</Typography>
                <Typography sx={{ fontSize: 14 }}>{view.billingContact}</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ border: `1px solid ${borderColor}` }}>
              <Box sx={headCell}><Typography variant="subtitle2">Sale Order</Typography></Box>
              <Grid container>
                <Grid item xs={6} sx={cell}><Typography sx={{ fontSize: 12 }}>Sales Order No.</Typography></Grid>
                <Grid item xs={6} sx={cell}><Typography sx={{ fontWeight: 600 }}>{view.saleOrderNo}</Typography></Grid>
                <Grid item xs={6} sx={cell}><Typography sx={{ fontSize: 12 }}>Date</Typography></Grid>
                <Grid item xs={6} sx={cell}><Typography sx={{ fontWeight: 600 }}>{view.billDate}</Typography></Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {/* Description */}
        <Box mt={2}>
          <Grid container sx={{ border: `1px solid ${borderColor}` }}>
            <Grid item xs={6} sx={headCell}>Description</Grid>
            <Grid item xs={2} sx={headCell}>GST Type</Grid>
            <Grid item xs={1} sx={headCell}>QTY</Grid>
            <Grid item xs={1} sx={headCell}>Rate</Grid>
            <Grid item xs={2} sx={headCell}>Amount</Grid>

            <Grid item xs={6} sx={cell}>
              <Typography sx={{ fontWeight: 700 }}>{view.projectType}</Typography>
              <Typography sx={{ fontSize: 12, color: '#666' }}>SAC Code : 998519</Typography>
            </Grid>
            <Grid item xs={2} sx={cell}><Typography>{gstType}</Typography></Grid>
            <Grid item xs={1} sx={cell}><Typography>1</Typography></Grid>
            <Grid item xs={1} sx={cell}><Typography>{currencyFormat(view.rate)}</Typography></Grid>
            <Grid item xs={2} sx={cell}><Typography>{currencyFormat(view.rate)}</Typography></Grid>
          </Grid>
        </Box>

        {/* GST Breakdown */}
        {(cgst || sgst || igst) && (
          <Box mt={1}>
            <Grid container sx={{ border: `1px solid ${borderColor}` }}>
              {cgst > 0 && (
                <>
                  <Grid item xs={8} sx={cell}><Typography>CGST (9%)</Typography></Grid>
                  <Grid item xs={4} sx={{ ...cell, textAlign: 'right' }}>
                    <Typography>{currencyFormat(cgst)}</Typography>
                  </Grid>
                </>
              )}
              {sgst > 0 && (
                <>
                  <Grid item xs={8} sx={cell}><Typography>SGST (9%)</Typography></Grid>
                  <Grid item xs={4} sx={{ ...cell, textAlign: 'right' }}>
                    <Typography>{currencyFormat(sgst)}</Typography>
                  </Grid>
                </>
              )}
              {igst > 0 && (
                <>
                  <Grid item xs={8} sx={cell}><Typography>IGST (18%)</Typography></Grid>
                  <Grid item xs={4} sx={{ ...cell, textAlign: 'right' }}>
                    <Typography>{currencyFormat(igst)}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )}

        {/* Total */}
        <Box mt={2}>
          <Grid container sx={{ border: `1px solid ${borderColor}` }}>
            <Grid item xs={8} sx={{ ...cell, backgroundColor: '#fafafa' }}>
              <Typography sx={{ fontWeight: 800 }}>Grand Total</Typography>
            </Grid>
            <Grid item xs={4} sx={{ ...cell, textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 800 }}>{currencyFormat(grandTotal)}</Typography>
            </Grid>
            <Grid item xs={12} sx={cell}>
              <Typography>{amountInWords(grandTotal)}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
};

export default Invoice;
