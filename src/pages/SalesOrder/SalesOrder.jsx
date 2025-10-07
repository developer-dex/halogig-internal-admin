import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getBillingInformation } from '../../features/admin/projectBidsSlice';
import logo1 from '../../assets/images/logo1.png';

const currencyFormat = (amount, currency = 'INR') => {
    if (amount === undefined || amount === null || isNaN(amount)) return '--';
    try {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(Number(amount));
    } catch {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount));
    }
};

const buildFinancialYears = (count = 6) => {
    const years = [];
    const now = new Date();
    // Indian FY: April to March
    const currentFYStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    for (let i = 0; i < count; i++) {
        const start = currentFYStartYear - i;
        const startTwo = String(start % 100).padStart(2, '0');
        const end = String((start + 1) % 100).padStart(2, '0');
        years.push(`${startTwo}-${end}`);
    }
    return years;
};

const overrideSalesOrderNoWithFY = (saleOrderNo, fy) => {
    if (!saleOrderNo) return '';
    const idx = saleOrderNo.lastIndexOf('/');
    if (idx === -1) return `${saleOrderNo}/${fy}`;
    const prefix = saleOrderNo.substring(0, idx + 1);
    return `${prefix}${fy}`;
};

const SalesOrder = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const invoiceRef = useRef(null);
    const { milestoneId, projectbidId } = useParams();

    const [billingInfo, setBillingInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [financialYear, setFinancialYear] = useState('');

    const fyOptions = useMemo(() => buildFinancialYears(8), []);

    useEffect(() => {
        const fetchBillingInfo = async () => {
            try {
                setIsLoading(true);
                const res = await dispatch(getBillingInformation({ milestoneId, projectbidId }));
                const apiData = res?.payload?.data?.data;
                if (apiData) {
                    setBillingInfo(apiData);
                    // default FY based on sale order date if present, else current FY
                    const now = new Date();
                    let defaultFYStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
                    const saleDate = apiData?.saleOrderDetails?.sale_order_date;
                    if (saleDate) {
                        const d = new Date(saleDate);
                        defaultFYStartYear = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
                    }
                    const end = String((defaultFYStartYear + 1) % 100).padStart(2, '0');
                    const startTwo = String(defaultFYStartYear % 100).padStart(2, '0');
                    setFinancialYear(`${startTwo}-${end}`);
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
        saleOrderNoBase: sale.sale_order_number || '',
        billDate: sale.sale_order_date || '',
        gstNumber: billing.gst_number || '',
        projectType: project.milestone_scope || '',
        rate: Number(project.milestone_amount) || 0,
        clientState: billing.billing_state || '',
        clientCountry: billing.billing_country || '',
    };

    const saleOrderNoWithFY = overrideSalesOrderNoWithFY(view.saleOrderNoBase, financialYear);

    const borderColor = '#bdbdbd';
    const cell = { border: `1px solid ${borderColor}`, p: 1, minHeight: 36 };
    const headCell = { ...cell, backgroundColor: '#f7f7f7', fontWeight: 700, color: '#333' };

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
        pdf.save(`SalesOrder.pdf`);
    };

    return (
        <Paper elevation={0} sx={{ p: 3, background: '#fff' }}>

            {/* Top Bar */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
                <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
                <Box display="flex" alignItems="center" gap={2}>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id="fy-label">Financial Year</InputLabel>
                        <Select
                            labelId="fy-label"
                            label="Financial Year"
                            value={financialYear}
                            onChange={(e) => setFinancialYear(e.target.value)}
                        >
                            {fyOptions.map((fy) => (
                                <MenuItem key={fy} value={fy}>{fy}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button variant="contained" onClick={handleDownloadPDF}>Download Sales Order</Button>
                </Box>
            </Box>

            {/* INVOICE CONTENT */}
            <Box ref={invoiceRef}>
                <Box style={{ border: `2px solid #000000` }}>
                    <Box style={{ backgroundColor: '#c3362a', height: '50px', width: '100%', marginBottom: '10px', borderBottom: `2px solid #000000` }}>
                        <Box textAlign="right" style={{ paddingRight: '10px' }}>
                            <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700 }}>Sales Order</Typography>
                            <Typography variant="caption" sx={{ color: '#fff' }}>Original for Recipient</Typography>
                        </Box>
                    </Box>
                    {/* Header with ribbon */}
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

                    {/* Sales Order box */}
                    <Grid container spacing={1}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ border: `1px solid ${borderColor}` }}>
                                <Box sx={headCell}><Typography variant="subtitle2">Bill To</Typography></Box>
                                <Box sx={{ p: 1.2 }}>
                                    <Typography sx={{ fontSize: 12, color: '#333' }}>Customer ID : {view.customerId || 'NA'}</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{view.billingName}</Typography>
                                    <Typography sx={{ fontSize: 14 }}>{view.billingAddress}</Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ border: `1px solid ${borderColor}` }}>
                                <Grid container>
                                    <Grid item xs={6} sx={headCell}><Typography>Sales Order No.</Typography></Grid>
                                    <Grid item xs={6} sx={{ ...cell, fontWeight: 700 }}>{saleOrderNoWithFY}</Grid>
                                    <Grid item xs={6} sx={headCell}><Typography>DATE</Typography></Grid>
                                    <Grid item xs={6} sx={{ ...cell, fontWeight: 700 }}>{view.billDate || 'NA'}</Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Description / Items table (match Invoice.jsx) */}
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

                    {/* GST Breakdown (match Invoice.jsx) */}
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

                    {/* Totals row */}
                    <Box mt={1}>
                        <Grid container sx={{ border: `1px solid ${borderColor}` }}>
                            <Grid item xs={8} sx={{ ...cell, backgroundColor: '#fafafa' }}>
                                <Typography sx={{ fontWeight: 800 }}>Grand Total</Typography>
                            </Grid>
                            <Grid item xs={4} sx={{ ...cell, textAlign: 'right' }}>
                                <Typography sx={{ fontWeight: 800 }}>{currencyFormat(grandTotal)}</Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Notes / terms */}
                    <Box mt={2}>
                        <Box sx={{ border: `1px solid ${borderColor}`, p: 1.2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Project Manager : Mr. Ankur Gupta</Typography>
                            <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 700 }}>Terms:</Typography>
                            <Typography variant="body2">50% Advance and Balance on Delivery</Typography>
                            <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 700 }}>Scope of Work :</Typography>
                            <Typography variant="body2">As Per Reference software shown which will be used as a validation for delivered software.</Typography>
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

                    {/* Amount in words and signature */}
                    <Box mt={1}>
                        <Grid container sx={{ border: `1px solid ${borderColor}` }}>
                            <Grid item xs={8} sx={cell}>
                                <Typography>Rupees {amountInWords(grandTotal).replace('Rupees ', '')}</Typography>
                            </Grid>
                            <Grid item xs={4} sx={{ ...cell, textAlign: 'center' }}>
                                <Typography variant="body2">For ( PRANAVA FREELANCING WORLD PRIVATE LIMITED )</Typography>
                                <Box sx={{ height: 40 }}></Box>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>Authorised Signatory</Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Footer note */}
                    <Box mt={1.5}>
                        <Typography variant="caption" color="text.secondary">
                            As per our company policy and contractual agreements, all freelancers, contractors, and resources associated with our company are considered to be the company's assets. As such, these individuals and resources are not available for direct engagement, or indirect engagement, solicitation, or utilization by any external parties, including yourself, either now or in the foreseeable future without our written consent.
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};

export default SalesOrder;


