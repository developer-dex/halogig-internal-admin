import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Modal,
  Box,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Grid,
  InputLabel
} from '@mui/material';
import { MoreHoriz, Add as AddIcon } from '@mui/icons-material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import '../ClientList/ClientList.scss';
import { contactData, getEnrollAsData, getCountryData, getIndustryData, createUserByAdmin, updateClientStatusInContactUsByAdmin } from '../../features/admin/contactUsManagementSlice';
import { showSuccess, showError } from '../../helpers/messageHelper';
import { Country, State, City } from 'country-state-city';

const ContactList = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [contacts, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [enrollAsData, setEnrollAsData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    company_name: '',
    gender: 'male',
    designation: '',
    country: ''
  });
  const [openReqModal, setOpenReqModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState('');
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    company_name: '',
    designation: '',
    country: 'IN',
    state: '',
    city: '',
    gender: 'male',
    notes: ''
  });
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const pageLimit = 10;

  const isIndividual = useMemo(() => {
    const selected = enrollAsData.find((o) => String(o.id) === String(createFormData.designation));
    const byName = (selected?.name || '').toLowerCase() === 'individual';
    const byId = String(createFormData.designation) === '2';
    return byName || byId;
  }, [enrollAsData, createFormData.designation]);

  // Get data from Redux store using useSelector
  // const { enrollAsData, countryData } = useSelector((state) => state.contactData);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,  // Increased width for two columns
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  // Get data from Redux store
  const totalEntries = totalCount;

  const fetchClients = async () => {
    setIsLoading(true)
    const response = await dispatch(contactData({
      page: currentPage,
      pageLimit
    }));
    console.log('res', response.payload.data.data)
    setClients(response.payload.data.data.contactUs);
    setTotalCount(response.payload.data.data.total_count)
    setIsLoading(false)

  };

  // Fetch enrollment and country data when component mounts
  useEffect(() => {
    enrollData();
    countryGetData();
  }, []);

  const enrollData = async () => {
    const response = await dispatch(getEnrollAsData());
    console.log('response', response)
    setEnrollAsData(response.payload.data.data)
  }

  const countryGetData = async () => {
    const response = await dispatch(getCountryData());
    console.log('response', response)
    setCountryData(response.payload.data.data)
  }
  const industryGetData = async () => {
    const response = await dispatch(getIndustryData());
    console.log('response', response)
    setIndustryData(response.payload.data.data)
  }

  useEffect(() => {
    fetchClients();
  }, [currentPage]);

  // Initialize country list options for Create modal
  useEffect(() => {
    const options = Country.getAllCountries().map((c) => ({ label: c.name, value: c.isoCode }));
    setCountryOptions(options);
    // Preload states for default country if any
    if (createFormData.country) {
      const states = State.getStatesOfCountry(createFormData.country).map((s) => ({ label: s.name, value: s.isoCode }));
      setStateOptions(states);
      if (createFormData.state) {
        const cities = City.getCitiesOfState(createFormData.country, createFormData.state).map((ci) => ({ label: ci.name, value: ci.name }));
        setCityOptions(cities);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update states when country changes
  useEffect(() => {
    if (createFormData.country) {
      const states = State.getStatesOfCountry(createFormData.country).map((s) => ({ label: s.name, value: s.isoCode }));
      setStateOptions(states);
      setCreateFormData((prev) => ({ ...prev, state: '', city: '' }));
      setCityOptions([]);
    }
  }, [createFormData.country]);

  // Update cities when state changes
  useEffect(() => {
    if (createFormData.country && createFormData.state) {
      const cities = City.getCitiesOfState(createFormData.country, createFormData.state).map((ci) => ({ label: ci.name, value: ci.name }));
      setCityOptions(cities);
      setCreateFormData((prev) => ({ ...prev, city: '' }));
    }
  }, [createFormData.country, createFormData.state]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenModal = (contact) => {
    // Open the same Create form, prefilled with contact values
    setSelectedContact(contact);

    // Prefill designation by mapping name -> id if needed
    const contactDesignation = String(contact?.designation || '').toLowerCase();
    const matchedRole = enrollAsData.find((o) => (o.name || '').toLowerCase() === contactDesignation);
    const designationId = matchedRole ? String(matchedRole.id) : '';

    // Prefill country/state/city using country-state-city
    let isoCountry = '';
    let isoState = '';
    let cityName = '';

    if (contact?.country) {
      const foundCountry = Country.getAllCountries().find((c) => (c.name || '').toLowerCase() === String(contact.country).toLowerCase());
      if (foundCountry) {
        isoCountry = foundCountry.isoCode;
        // Populate state options
        const states = State.getStatesOfCountry(isoCountry).map((s) => ({ label: s.name, value: s.isoCode }));
        setStateOptions(states);

        if (contact?.city) {
          // Try to find the state containing this city
          let locatedState = '';
          for (const st of states) {
            const cityList = City.getCitiesOfState(isoCountry, st.value);
            if (cityList && cityList.some((ct) => (ct.name || '').toLowerCase() === String(contact.city).toLowerCase())) {
              locatedState = st.value;
              break;
            }
          }
          if (locatedState) {
            isoState = locatedState;
            const cities = City.getCitiesOfState(isoCountry, isoState).map((ci) => ({ label: ci.name, value: ci.name }));
            setCityOptions(cities);
            cityName = contact.city;
          }
        }
      }
    }

    setCreateFormData((prev) => ({
      ...prev,
      first_name: contact?.first_name || '',
      last_name: contact?.last_name || '',
      email: contact?.email || '',
      mobile: contact?.mobile || '',
      company_name: contact?.company_name || '',
      gender: contact?.gender || 'male',
      designation: designationId,
      country: isoCountry || prev.country,
      state: isoState || '',
      city: cityName || '',
      notes: contact?.notes || prev.notes,
    }));

    // Set dependent select values for country/state/city dropdowns in Create modal
    if (isoCountry) {
      const states = State.getStatesOfCountry(isoCountry).map((s) => ({ label: s.name, value: s.isoCode }));
      setStateOptions(states);
      if (isoState) {
        const cities = City.getCitiesOfState(isoCountry, isoState).map((ci) => ({ label: ci.name, value: ci.name }));
        setCityOptions(cities);
      } else {
        setCityOptions([]);
      }
    }

    // Open Create User modal with prefilled data
    setOpenCreateModal(true);
    setOpenModal(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedContact(null);
  };

  const handleFormSubmit = async () => {
    try {
      const enhancedFormData = {
        id: selectedContact.id,
        is_client_added: true,
      };

      const response = await dispatch(updateClientStatusInContactUsByAdmin(enhancedFormData));
      if (response.payload?.status === 200) {
        handleCloseModal();
        fetchClients(); // Refresh the list after successful addition
      }
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleOpenReqModal = (requirements) => {
    setSelectedReq(requirements);
    setOpenReqModal(true);
  };

  const handleCloseReqModal = () => {
    setOpenReqModal(false);
    setSelectedReq('');
  };

  const handleOpenCreateModal = () => {
    console.log('Opening create modal');
    setSelectedContact(null);
    
    // Reset form data to initial state
    const initialFormData = {
      first_name: '',
      last_name: '',
      email: '',
      mobile: '',
      company_name: '',
      designation: '',
      country: 'IN',
      state: '',
      city: '',
      gender: 'male',
      notes: ''
    };
    
    console.log('Setting initial form data:', initialFormData);
    setCreateFormData(initialFormData);
    
    setOpenCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setCreateFormData({
      first_name: '',
      last_name: '',
      email: '',
      mobile: '',
      company_name: '',
      designation: '',
      country: 'IN',
      state: '',
      city: '',
      gender: 'male',
      notes: ''
    });
  };

  const handleCreateFormChange = (event) => {
    const { name, value } = event.target;
    console.log(`Form field changed: ${name} = ${value}`);
    
    setCreateFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Updated form data:', newData);
      return newData;
    });
  };

  const handlePhoneChange = (phone) => {
    console.log('Phone number changed:', phone);
    setCreateFormData(prev => {
      const newData = {
        ...prev,
        mobile: phone
      };
      console.log('Updated form data with phone:', newData);
      return newData;
    });
  };

  const handleCreateFormSubmit = async () => {
    try {
      console.log('Form submission started');
      console.log('Form data:', createFormData);
      
      // Validate required fields
      if (!createFormData.first_name || !createFormData.last_name || !createFormData.email || 
          !createFormData.mobile || !createFormData.designation || !createFormData.company_name || 
          !createFormData.country || !createFormData.state || !createFormData.city) {
        console.log('Validation failed - missing required fields');
        showError('Please fill in all required fields');
        return;
      }

      console.log('Validation passed, proceeding with API call');
      setIsCreatingUser(true);
      
      // Prepare data for API call
      const userData = {
        first_name: createFormData.first_name.trim(),
        last_name: createFormData.last_name.trim(),
        email: createFormData.email.trim(),
        mobile: createFormData.mobile,
        company_name: createFormData.company_name.trim(),
        designation: createFormData.designation,
        country: createFormData.country,
        state: createFormData.state,
        city: createFormData.city,
        gender: createFormData.gender,
        notes: createFormData.notes.trim()
      };
      
      console.log('Creating user with data:', userData);

      // Call the API to create user
      const response = await dispatch(createUserByAdmin(userData));
      
      console.log('Create user response:', response);
      
      if (response.payload && response.payload.status === 200) {
        showSuccess('User created successfully!');
        handleCloseCreateModal();
        fetchClients(); // Refresh the contact list
      } else {
        const errorMessage = response.payload?.data?.message || 'Failed to create user. Please try again.';
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create user. Please try again.';
      showError(errorMessage);
    } finally {
      setIsCreatingUser(false);
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
      {/* Header with title and create button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ margin: 0 }}>Contact List</h2>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenCreateModal}
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0'
            }
          }}
        >
          Create User
        </Button>
      </div>

      <div className="table-wrapper">
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="15%">First Name</TableCell>
                <TableCell width="15%">Last Name</TableCell>
                <TableCell width="20%">Email</TableCell>
                <TableCell width="15%">Phone Number</TableCell>
                <TableCell width="15%">Company Name</TableCell>
                <TableCell width="20%">Requirements</TableCell>
                <TableCell width="15%">Notes</TableCell>
                <TableCell width="15%">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    {contact.first_name ? contact.first_name : '--'}
                  </TableCell>
                  <TableCell>
                    {contact.last_name ? contact.last_name : '--'}
                  </TableCell>
                  <TableCell>
                    {contact.email ? contact.email : '--'}
                  </TableCell>
                  <TableCell>
                    {contact.mobile ? contact.mobile : '--'}
                  </TableCell>
                  <TableCell>
                    {contact.company_name ? contact.company_name : '--'}
                  </TableCell>
                  <TableCell>
                    {contact.requirements ? (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        maxWidth: '200px'
                      }}>
                        <div style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1
                        }}>
                          {contact.requirements}
                        </div>
                        {contact.requirements.length > 20 && (
                          <MoreHoriz 
                            style={{ 
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                            onClick={() => handleOpenReqModal(contact.requirements)}
                          />
                        )}
                      </div>
                    ) : '--'}
                  </TableCell>
                  <TableCell>
                    {contact.notes ? (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        maxWidth: '200px'
                      }}>
                        <div style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1
                        }}>
                          {contact.notes}
                        </div>
                        {contact.notes.length > 20 && (
                          <MoreHoriz 
                            style={{ 
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                            onClick={() => handleOpenReqModal(contact.notes)}
                          />
                        )}
                      </div>
                    ) : '--'}
                  </TableCell>
                  <TableCell>
                    {contact.is_client_added == true ? (
                      <span className="added-text">Added</span>
                    ) : (
                      <Button variant="outlined" onClick={() => handleOpenModal(contact)}>
                        ADD
                      </Button>)
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="table-footer">
          <div className="entries-info">
            Showing <span>{contacts.length}</span> of {totalEntries}
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

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="contact-modal-title"
      >
        <Box sx={modalStyle}>
          <Typography id="contact-modal-title" variant="h6" component="h2" sx={{ mb: 3 }}>
            Contact Details
          </Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              {/* Left Column */}
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="First Name"
                    fullWidth
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleFormChange}
                  />
                  <TextField
                    label="Email"
                    fullWidth
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                  />
                  <TextField
                    label="Company Name"
                    fullWidth
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleFormChange}
                  />

                  <FormControl fullWidth>
                    <FormLabel>Enroll as</FormLabel>
                    <Select
                      value={formData.designation}
                      name="designation"
                      onChange={handleFormChange}
                    >
                      {enrollAsData.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <FormLabel>Country</FormLabel>
                    <Select
                      value={formData.country}
                      name="country"
                      onChange={handleFormChange}
                    >
                      {countryData.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                </Box>
              </Grid>

              {/* Right Column */}
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleFormChange}
                  />
                  <TextField
                    label="Phone Number"
                    fullWidth
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleFormChange}
                  />
                  <FormControl style={{ paddingTop: '5px' }}>
                    <FormLabel>Gender</FormLabel>
                    <RadioGroup
                      row
                      name="gender"
                      value={formData.gender}
                      onChange={handleFormChange}
                    >
                      <FormControlLabel value="male" control={<Radio />} label="Male" />
                      <FormControlLabel value="female" control={<Radio />} label="Female" />
                      <FormControlLabel value="other" control={<Radio />} label="Other" />
                    </RadioGroup>
                  </FormControl>

                </Box>
              </Grid>

              {/* Button - Full Width */}
              <Grid item >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleFormSubmit}
                    fullWidth
                  >
                    Add
                  </Button>
                  <Button variant="contained" onClick={handleCloseModal} fullWidth>
                    Close
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openReqModal}
        onClose={handleCloseReqModal}
        aria-labelledby="requirements-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: '600px',
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography 
            id="requirements-modal-title" 
            variant="h6" 
            component="h2" 
            sx={{ 
              mb: 2,
              borderBottom: '1px solid #e0e0e0',
              pb: 1
            }}
          >
            Requirements
          </Typography>
          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            mb: 2
          }}>
            <Typography sx={{ 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#333'
            }}>
              {selectedReq}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            borderTop: '1px solid #e0e0e0',
            pt: 2
          }}>
            <Button 
              variant="contained" 
              onClick={handleCloseReqModal}
              sx={{
                minWidth: '100px'
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Create Contact Modal */}
      <Modal
        open={openCreateModal}
        onClose={handleCloseCreateModal}
        aria-labelledby="create-contact-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <Typography id="create-contact-modal-title" variant="h6" component="h2" sx={{ mb: 3 }}>
            Create New Contact
          </Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              {/* First Name */}
              <Grid item xs={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  name="first_name"
                  value={createFormData.first_name}
                  onChange={handleCreateFormChange}
                  required
                />
              </Grid>
              
              {/* Last Name */}
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  name="last_name"
                  value={createFormData.last_name}
                  onChange={handleCreateFormChange}
                  required
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  fullWidth
                  type="email"
                  name="email"
                  value={createFormData.email}
                  onChange={handleCreateFormChange}
                  required
                />
              </Grid>

              {/* Company Name */}
              <Grid item xs={12}>
                <TextField
                  label="Company Name"
                  fullWidth
                  name="company_name"
                  value={createFormData.company_name}
                  onChange={handleCreateFormChange}
                />
              </Grid>

              {/* Legal Entity Type */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel>Legal Entity Type</FormLabel>
                  <Select
                    value={createFormData.designation}
                    name="designation"
                    onChange={handleCreateFormChange}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select Legal Entity Type
                    </MenuItem>
                    {enrollAsData.map((option) => (
                      <MenuItem key={option.id} value={String(option.id)}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Select Gender (visible only for Individual) */}
              {isIndividual && (
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Select Gender</FormLabel>
                    <RadioGroup
                      row
                      name="gender"
                      value={createFormData.gender}
                      onChange={handleCreateFormChange}
                    >
                      <FormControlLabel value="male" control={<Radio />} label="Male" />
                      <FormControlLabel value="female" control={<Radio />} label="Female" />
                      <FormControlLabel value="Other" control={<Radio />} label="Other" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              )}

              {/* Mobile Number with Country Code */}
              <Grid item xs={12}>
                <Box sx={{ '& .react-tel-input': { width: '100%' } }}>
                  <PhoneInput
                    required
                    country={'in'}
                    value={createFormData.mobile}
                    onChange={handlePhoneChange}
                    inputProps={{
                      name: 'mobile',
                      required: true,
                      autoFocus: false
                    }}
                    containerStyle={{
                      width: '100%'
                    }}
                    inputStyle={{
                      width: '100%',
                      height: '56px',
                      fontSize: '16px',
                      border: '1px solid #c4c4c4',
                      borderRadius: '4px'
                    }}
                    buttonStyle={{
                      border: '1px solid #c4c4c4',
                      borderRadius: '4px 0 0 4px'
                    }}
                  />
                </Box>
              </Grid>

              {/* Country */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel>Country</FormLabel>
                  <Select
                    value={createFormData.country}
                    name="country"
                    onChange={(e) => {
                      console.log('Country changed:', e.target.value);
                      setCreateFormData((prev) => ({ ...prev, country: e.target.value }));
                    }}
                  >
                    {countryOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* State */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel>State</FormLabel>
                  <Select
                    value={createFormData.state}
                    name="state"
                    onChange={(e) => {
                      console.log('State changed:', e.target.value);
                      setCreateFormData((prev) => ({ ...prev, state: e.target.value }));
                    }}
                    disabled={!createFormData.country || stateOptions.length === 0}
                  >
                    {stateOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* City */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormLabel>City</FormLabel>
                  <Select
                    value={createFormData.city}
                    name="city"
                    onChange={(e) => {
                      console.log('City changed:', e.target.value);
                      setCreateFormData((prev) => ({ ...prev, city: e.target.value }));
                    }}
                    disabled={!createFormData.state || cityOptions.length === 0}
                  >
                    {cityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  rows={3}
                  name="notes"
                  value={createFormData.notes}
                  onChange={handleCreateFormChange}
                  placeholder="Add any additional notes..."
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleCloseCreateModal}
                    disabled={isCreatingUser}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={
                      !createFormData.first_name || 
                      !createFormData.last_name || 
                      !createFormData.email || 
                      !createFormData.mobile ||
                      !createFormData.designation ||
                      !createFormData.company_name ||
                      !createFormData.country ||
                      !createFormData.state ||
                      !createFormData.city ||
                      isCreatingUser
                    }
                    startIcon={isCreatingUser ? <CircularProgress size={16} color="inherit" /> : null}
                    onClick={() => {
                      console.log('Create button clicked');
                      console.log('Form validation state:', {
                        first_name: !!createFormData.first_name,
                        last_name: !!createFormData.last_name,
                        email: !!createFormData.email,
                        mobile: !!createFormData.mobile,
                        designation: !!createFormData.designation,
                        company_name: !!createFormData.company_name,
                        country: !!createFormData.country,
                        state: !!createFormData.state,
                        city: !!createFormData.city,
                        isCreatingUser
                      });
                      handleCreateFormSubmit();
                    }}
                  >
                    {isCreatingUser ? 'Creating...' : 'Create'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ContactList; 