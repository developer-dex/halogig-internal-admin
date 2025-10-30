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
import { useDispatch, useSelector } from 'react-redux';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getBillingInformation, saveSaleOrderInvoiceInformation, clearSaveInvoiceState, saveInvoiceInformation } from '../../features/admin/projectBidsSlice';
import logo1 from '../../assets/images/logo1.png';

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

  // Redux state for save invoice
  const { isSavingInvoice, saveInvoiceSuccess, saveInvoiceError } = useSelector((state) => state.projectBidsReducer);

  // Handle success/error states
  useEffect(() => {
    if (saveInvoiceSuccess) {
      // You can add a success notification here
      console.log('Invoice created successfully!');
      // Clear the state
      dispatch(clearSaveInvoiceState());
      // Optionally navigate or show success message
    }
    if (saveInvoiceError) {
      // You can add an error notification here
      console.error('Failed to create invoice');
      // Clear the state
      dispatch(clearSaveInvoiceState());
    }
  }, [saveInvoiceSuccess, saveInvoiceError, dispatch]);

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
    projectType: (project.created_by_admin ? project.admin_scope : project.milestone_scope) || '',
    rate: Number(project.created_by_admin ? project.admin_amount : project.milestone_amount) || 0,
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
    pdf.save(`Invoice.pdf`);
  };

  const handleCreateInvoice = async () => {
    if (!billingInfo) {
      console.error('Billing information not available');
      return;
    }

    try {
      // Generate PDF
      const element = invoiceRef.current;
      if (!element) {
        console.error('Invoice element not found');
        return;
      }

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Convert PDF to blob
      const pdfBlob = pdf.output('blob');
      
      // Create FormData
      const formData = new FormData();
      formData.append('milestoneId', milestoneId);
      formData.append('projectBidId', projectbidId);
      formData.append('file', pdfBlob, 'invoice.pdf');
      formData.append('fileType', 'invoice');
      formData.append('clientId', billingInfo.userBillingInformation?.user_id || '');
      formData.append('freelancerId', ''); // Add freelancer ID if available
      formData.append('jsonDetails', JSON.stringify(billingInfo));

      // Call API
      await dispatch(saveInvoiceInformation(formData));
      
      // Navigate or show success message
      // navigate(`/order/${milestoneId}/${projectbidId}`);
      
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, background: '#fff' }}>
      {/* Top Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
        <Box display="flex" alignItems="center" gap={2}>
          <Button variant="contained" onClick={handleDownloadPDF}>Download Invoice</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateInvoice}
            disabled={isSavingInvoice}
          >
            {isSavingInvoice ? 'Creating Invoice...' : 'Create Invoice'}
          </Button>
        </Box>
      </Box>

      {/* INVOICE CONTENT */}
      <Box ref={invoiceRef}>
        <Box style={{ border: `2px solid #000000` }}>
          <Box style={{ backgroundColor: '#c3362a', height: '50px', width: '100%', marginBottom: '10px', borderBottom: `2px solid #000000` }}>
            <Box textAlign="right" style={{ paddingRight: '10px' }}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700 }}>Original for Recipient</Typography>
            </Box>
          </Box>

          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5} style={{ borderBottom: `2px solid #000000`, paddingBottom: '10px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: '10px' }}>
              <Box component="img" src={logo1} alt="Halogig" sx={{ height: 30 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#111', letterSpacing: 0.2, textAlign: 'center' }}>
                PRANAVA FREELANCING WORLD PRIVATE LIMITED
              </Typography>
              <Typography variant="body2" color="text.secondary" style={{ textAlign: 'center' }}>
                9th Floor, Tower-C , Bhutani Cyber Park, Sector-62, Noida, Uttar Pradesh, India, 201301
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center' }}>
                GST NO. : 09AANCP2796A1ZS : PAN No. : AANCP2796A
              </Typography>
            </Box>
          </Box>

          {/* Bill To and Invoice box */}
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <Box sx={{ border: `1px solid ${borderColor}` }}>
                <Box sx={headCell}><Typography variant="subtitle2">TO</Typography></Box>
                <Box sx={{ p: 1.2 }}>
                  <Typography sx={{ fontWeight: 700 }}>{view.billingName}</Typography>
                  <Typography sx={{ fontSize: 14 }}>{view.billingAddress}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ border: `1px solid ${borderColor}` }}>
                <Grid container>
                  <Grid item xs={6} sx={headCell}><Typography>INVOICE NO.</Typography></Grid>
                  <Grid item xs={6} sx={{ ...cell, fontWeight: 700 }}>{view.saleOrderNo || ''}</Grid>
                  <Grid item xs={6} sx={headCell}><Typography>DATE</Typography></Grid>
                  <Grid item xs={6} sx={{ ...cell, fontWeight: 700 }}>{view.billDate || ''}</Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>

          {/* Contact Person placeholder */}
          <Grid container spacing={1} mt={1}>
            <Grid item xs={12}>
              <Box sx={{ border: `1px solid ${borderColor}`, p: 1 }}>
                <Typography variant="body2">Contact Person Name | PH. | Email ID |</Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Description with IGST column */}
          <Box mt={2}>
            <Grid container sx={{ border: `1px solid ${borderColor}` }}>
              <Grid item xs={6} sx={headCell}>Description of Service</Grid>
              <Grid item xs={1} sx={headCell}>QTY</Grid>
              <Grid item xs={1.5} sx={headCell}>Rate</Grid>
              <Grid item xs={1.5} sx={headCell}>{igst > 0 ? 'IGST (18%)' : 'CGST+SGST (18%)'}</Grid>
              <Grid item xs={2} sx={headCell}>Amount (Rs.)</Grid>

              <Grid item xs={6} sx={cell}>
                <Typography sx={{ fontWeight: 700 }}>{view.projectType}</Typography>
                <Typography sx={{ fontSize: 12, color: '#666' }}>SAC Code : 998519</Typography>
              </Grid>
              <Grid item xs={1} sx={cell}><Typography>1</Typography></Grid>
              <Grid item xs={1.5} sx={cell}><Typography>{currencyFormat(view.rate)}</Typography></Grid>
              <Grid item xs={1.5} sx={cell}><Typography>{currencyFormat(igst > 0 ? igst : (cgst + sgst))}</Typography></Grid>
              <Grid item xs={2} sx={cell}><Typography>{currencyFormat(view.rate)}</Typography></Grid>
            </Grid>
          </Box>

          {/* TOTAL Row with IGST column */}
          <Box mt={1}>
            <Grid container sx={{ border: `1px solid ${borderColor}` }}>
              <Grid item xs={6} sx={cell}><Typography>SAC Code : 998519</Typography></Grid>
              <Grid item xs={1} sx={cell}></Grid>
              <Grid item xs={1.5} sx={{ ...cell, backgroundColor: '#fafafa' }}><Typography>TOTAL :</Typography></Grid>
              <Grid item xs={1.5} sx={{ ...cell, textAlign: 'right' }}><Typography>{currencyFormat(igst > 0 ? igst : (cgst + sgst))}</Typography></Grid>
              <Grid item xs={2} sx={{ ...cell, textAlign: 'right' }}><Typography>{currencyFormat(grandTotal)}</Typography></Grid>
            </Grid>
          </Box>

          {/* Bank Details */}
          <Box mt={2}>
            <Box sx={{ border: `1px solid ${borderColor}`, p: 1.2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Bank Details :</Typography>
              <Typography variant="body2">Account Name : PRANAVA FREELANCING WORLD PRIVATE LIMITED</Typography>
              <Typography variant="body2">Bank Name : ICICI Bank Ltd</Typography>
              <Typography variant="body2">A/C Number : 107005013464</Typography>
              <Typography variant="body2">Branch : SECTOR -1, NOIDA-201301, UTTAR PRADESH</Typography>
              <Typography variant="body2">IFSC Code : ICIC0001070</Typography>
              <Typography variant="body2">Swift Code : ICICINBBCTS</Typography>
            </Box>
          </Box>

          {/* PAN / GSTIN and Grand total */}
          <Box mt={1}>
            <Grid container sx={{ border: `1px solid ${borderColor}` }}>
              <Grid item xs={8} sx={cell}>
                <Grid container>
                  <Grid item xs={12} md={6} sx={cell}><Typography>PAN No : AANCP2796A</Typography></Grid>
                  <Grid item xs={12} md={6} sx={cell}><Typography>GSTIN No : 09AANCP2796A1ZS</Typography></Grid>
                </Grid>
              </Grid>
              <Grid item xs={2} sx={{ ...cell, backgroundColor: '#fafafa' }}>
                <Typography sx={{ fontWeight: 800 }}>Grand Total</Typography>
              </Grid>
              <Grid item xs={2} sx={{ ...cell, textAlign: 'right' }}>
                <Typography sx={{ fontWeight: 800 }}>{currencyFormat(grandTotal)}</Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Signature */}
          <Box mt={1}>
            <Grid container sx={{ border: `1px solid ${borderColor}` }}>
              <Grid item xs={8} sx={cell}></Grid>
              <Grid item xs={4} sx={{ ...cell, textAlign: 'center' }}>
                <Typography variant="body2">For ( PRANAVA FREELANCING WORLD PRIVATE LIMITED )</Typography>
                <Box sx={{ height: 40 }}></Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Authorised Signatory</Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default Invoice;
