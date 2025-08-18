import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Typography,
    Modal,
    TextField,
    MenuItem,
    Grid,
    Divider,
    Card,
    Checkbox,
    FormControlLabel,
    Autocomplete,
} from '@mui/material';
import DataTable from '../components/Table/DataTable_company_list.js'; // Adjust the path as necessary
import * as PageController from '../controllers/PageControllers';


const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};

const CompanyList = () => {
    const endpoint = '/company_list';
    const updateEndpoint = '/update_company_list';
    const createEndpoint = '/create_company';
    const countryEndpoint = '/country';
    const companytypeEndpoint = '/compnaytype';
    const industryTypeEndpoint = '/industry_type_list';
    const sendEmailEndpoint = '/send_email'; // Define your send email endpoint
    const resetPasswordEndpoint = '/reset_password'; // Define your reset password endpoint
    const addrEndpoint = '/addrs';

    // State variables
    const [addressList, setAddressList] = useState([]);
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [countries, setCountries] = useState([]);
    const [companytype, setcompanytype] = useState([]);
    const [countrySearch, setCountrySearch] = useState('');
    const [industryTypes, setIndustryTypes] = useState([]);
    const [organizationDetails, setOrganizationDetails] = useState([{ name: '',  city: '', area: '', postcode: '', industry: '' ,address:''}]);
    const [numberOfOrganizations, setNumberOfOrganizations] = useState(1);
    // New state for form change detection
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [initialFormData, setInitialFormData] = useState({});

    // Initialize form data
    const initializeFormData = () => ({
        taxcode: '',
        name: '',
        email: '',
        contactnumber: '',
        country: countries.length > 0 ? countries[0].id : '92e19c8a-c867-40c3-a0ad-d70c0c143045', // Default to the first country or Taiwan
        numberofusers: 4, // Default to 5 as per your requirement
        active: true,
        numberOfOrganizations: 1, // Default number of organizations
        companytype:companytype.length > 0 ? companytype[0].id : '3c90eba5-c60f-43e3-8cd1-b3c281c8a831',
    });

    // Fetch data on component mount
    useEffect(() => {
        setFormData(initializeFormData());
        loadTableData();
        loadCountryData();
        loadCompanytypeData();
        loadIndustryTypeData();
    }, []);

    useEffect(() => {
        if (countries.length > 0 && formData.country) {
            loadAddressList(formData.country);
        }
    }, [countries, formData.country]);

    const loadAddressList = (countryId) => {
        const url = countryId ? `${addrEndpoint}?country=${countryId}` : addrEndpoint;
        PageController.loadData(url, (data) => {
            if (data && Array.isArray(data)) {
                setAddressList(data);
            } else {
                console.error('Invalid address data');
            }
        });
    };
    // Load table data
    const loadTableData = () => {
        PageController.loadData(endpoint, (data) => {
            setRows(data);
            setFilteredRows(data);
        });
    };

    // Load countries data
    const loadCountryData = () => {
        PageController.loadData(countryEndpoint, (data) => {
            if (data && Array.isArray(data)) {
                setCountries(data);
            } else {
                console.error('Invalid country data');
            }
        });
    };
    
    const loadCompanytypeData = () => {
        PageController.loadData(companytypeEndpoint, (data) => {
            if (data && Array.isArray(data)) {
                setcompanytype(data);
            } else {
                console.error('Invalid company type data');
            }
        });
    };

    // Load industry types data
    const loadIndustryTypeData = () => {
        PageController.loadData(industryTypeEndpoint, (data) => {
            setIndustryTypes(data);
        });
    };

    // Validate form
    const validateForm = () => {
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Invalid email address';
        if (formData.numberofusers <= 0) return 'Number of users must be greater than zero';
        if (!formData.country) return 'Please select a country';
        if (!formData.companytype) return 'Please select a Company Type';
        // Additional validations can be added here
        return null;
    };
    

    // Handle form submission
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const errorMessage = validateForm();
        if (errorMessage) {
            alert(errorMessage);
            return;
        }

        const payload = {
          ...formData,
          organizationDetails: isEdit ? formData.organizationDetails || [] : organizationDetails
        };
        if (isEdit) {
            PageController.updateRecord(updateEndpoint, formData.id, payload, loadTableData);
        } else {
            const { id, ...formWithoutId } = payload;
            PageController.saveData(createEndpoint, formWithoutId, () => {
                setFormData(initializeFormData());
                setOrganizationDetails([{ name: '', city: '', area: '', postcode: '', address: '', industry: '' }]);
                setNumberOfOrganizations(1);
                loadTableData();
            });
        }
        setFormOpen(false);
    };

    // Handle form field changes
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        const updatedForm = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        };
        setFormData(updatedForm);

        // Compare updatedForm with initialFormData
        const hasChanged = Object.keys(updatedForm).some(key => updatedForm[key] !== initialFormData[key]);
        setIsFormChanged(hasChanged);

        if (name === 'country') {
            loadAddressList(value);
        }
    };

    // Handle changes in organization details
    const handleOrganizationDetailsChange = (index, field, value) => {
        const updatedDetails = [...organizationDetails];
        updatedDetails[index][field] = value;

        if (field === 'area') {
            const match = addressList.find(
                (item) =>
                    item.city === updatedDetails[index].city && item.area === value
            );
            updatedDetails[index].postcode = match ? match.postcode : '';
        }

        setOrganizationDetails(updatedDetails);
    };

    // Handle number of organizations change
    const handleNumberOfOrganizationsChange = (e) => {
        const value = parseInt(e.target.value, 10) || 1;
        setNumberOfOrganizations(value);

        const updatedDetails = [...organizationDetails];
        while (updatedDetails.length < value) {
            updatedDetails.push({ name: '',  city: '', area: '', postcode: '', industry: '' ,address:''});
        }
        setOrganizationDetails(updatedDetails.slice(0, value));
    };

    // Handle search with debounce
    const debouncedSearch = useCallback(
        debounce((query) => {
            setFilteredRows(
                query
                    ? rows.filter((row) =>
                          Object.values(row).some((value) =>
                              String(value).toLowerCase().includes(query)
                          )
                      )
                    : rows
            );
        }, 300),
        [rows]
    );

    // Handle search input change
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        debouncedSearch(query);
    };

    // Handle send email action
    const handleSendEmail = (id) => {
        PageController.saveData(sendEmailEndpoint, { ID: id }, () => {
            alert('Email sent successfully!');
            // Implement any additional logic or UI updates here
        });
    };

    // Handle reset password action
    const handleResetPassword = (id) => {
        PageController.saveData(resetPasswordEndpoint, { ID: id }, () => {
            alert('Password reset successfully!');
            // Implement any additional logic or UI updates here
        });
    };

    return (
        <Box sx={{ p: 4 }}>
            {/* Header Section */}
            <Card sx={{ mb: 4, p: 2, boxShadow: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Company List
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        label="Search"
                        variant="outlined"
                        value={searchQuery}
                        onChange={handleSearch}
                        sx={{ width: '100%', maxWidth: '300px' }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setFormData(initializeFormData());
                            setOrganizationDetails([{ name: '', city: '', area: '', postcode: '', industry: '' ,address:''}]);
                            setNumberOfOrganizations(1);
                            setIsEdit(false);
                            setFormOpen(true);
                        }}
                    >
                        Add New
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setShowActions((prev) => !prev)} // Toggles actions visibility
                    >
                        {showActions ? 'Hide Actions' : 'Show Actions'}
                    </Button>
                </Box>
            </Card>

            {/* Data Table Section */}
            <Card sx={{ p: 2, boxShadow: 3 }}>
                <DataTable
                    columns={[
                        { field: 'taxcode', label: 'Tax Code' },
                        { field: 'name', label: 'Name' },
                        { field: 'orgnumber', label: 'Number of Org' },
                        { field: 'email', label: 'Email' },
                        {
                          field: 'active',
                          label: 'Status',
                          render: (row) => {
                            const isActive = row.active === true || row.active === 'true' || row.active === 1;
                            return (
                              <span style={{
                                color: isActive ? 'green' : 'red',
                                fontWeight: 'bold'
                              }}>
                                {isActive ? 'Active' : 'Inactive'}
                              </span>
                            );
                          }
                        },
                        { field: 'countryname', label: 'Country' },
                        { field: 'typename', label: 'Company Type' },
                        ...(showActions
                            ? [
                                  { field: 'actions', label: 'Actions' },
                              ]
                            : []),
                    ]}
                    rows={filteredRows}
                    onEdit={(row) => {
                        const resolvedCompanyType = companytype.find(c => c.name === row.typename || c.id === row.companytype);
                        const resolvedCountry = countries.find(c => c.name === row.countryname || c.id === row.country);

                        setFormData({
                            ...row,
                            companytype: resolvedCompanyType ? resolvedCompanyType.id : '',
                            country: resolvedCountry ? resolvedCountry.id : ''
                        });
                        setInitialFormData({
                            ...row,
                            companytype: resolvedCompanyType ? resolvedCompanyType.id : '',
                            country: resolvedCountry ? resolvedCountry.id : ''
                        });
                        setIsFormChanged(false);

                        setOrganizationDetails(row.organizationDetails || [{ name: '', city: '', area: '', postcode: '', industry: '', address: '' }]);
                        setNumberOfOrganizations(row.organizationDetails ? row.organizationDetails.length : 1);
                        setIsEdit(true);
                        setFormOpen(true);
                    }}
                    onDelete={(id) => {
                      const row = rows.find((r) => r.id === id);
                      const newStatus = !row.active;
                      const actionLabel = newStatus ? 'Activate' : 'Deactivate';
                      if (window.confirm(`Are you sure you want to ${actionLabel} this company?`)) {
                        const payload = { active: newStatus };
                        PageController.updateRecord(updateEndpoint, id, payload, loadTableData);
                      }
                    }}
                    onSendEmail={handleSendEmail}
                    onResetPassword={handleResetPassword}
                    showActions={showActions}
                />
            </Card>

            {/* Modal for Add/Edit Company */}
            <Modal
    open={formOpen}
    onClose={() => setFormOpen(false)}
    aria-labelledby="form-modal-title"
    aria-describedby="form-modal-description"
>
    <Box
        sx={{
            p: 4,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            minWidth: '500px',
            maxWidth: '800px',
            margin: 'auto',
            mt: '5%',
            maxHeight: '90vh',
            overflowY: 'auto',
        }}
    >
        <Typography id="form-modal-title" variant="h6" gutterBottom>
            {isEdit ? 'Edit Company' : 'Add New Company'}
        </Typography>
        <form onSubmit={handleFormSubmit}>
            <Grid container spacing={3}>
                {/* Company Information */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        name="taxcode"
                        label="Tax Code"
                        value={formData.taxcode || ''}
                        onChange={handleFormChange}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        name="name"
                        label="Company Name"
                        value={formData.name || ''}
                        onChange={handleFormChange}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
    fullWidth
    name="companytype"
    label="Company Type"
    select
    value={formData.companytype || ''}
    onChange={handleFormChange}
    required
>
    {companytype.map((type) => (
        <MenuItem key={type.id} value={type.id}>
            {type.name}
        </MenuItem>
    ))}
</TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        name="email"
                        label="Email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleFormChange}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        name="contactnumber"
                        label="Contact Number"
                        type="tel"
                        value={formData.contactnumber || ''}
                        onChange={handleFormChange}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        name="country"
                        label="Country"
                        select
                        value={formData.country || ''}
                        onChange={handleFormChange}
                        required
                    >
                        {countries.map((country) => (
                            <MenuItem key={country.id} value={country.id}>
                                {country.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.active || false}
                                onChange={handleFormChange}
                                name="active"
                            />
                        }
                        label="Active"
                    />
                </Grid>

                {/* Number of Users and Organization Details - Only show when not editing */}
                {!isEdit && (
                  <>
                    <Grid item xs={12}>
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            name="numberofusers"
                            label="Number of Users"
                            type="number"
                            value={formData.numberofusers || 5}
                            onChange={handleFormChange}
                            inputProps={{ min: 1 }}
                            required
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Number of Organizations"
                            type="number"
                            value={numberOfOrganizations || 1}
                            onChange={handleNumberOfOrganizationsChange}
                            inputProps={{ min: 1 }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {organizationDetails.map((org, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: '100%',
                          mb: 2,
                          p: 2,
                          border: '1px solid #ccc',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          Organization {index + 1}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Organization Name"
                              value={org.name}
                              onChange={(e) =>
                                handleOrganizationDetailsChange(index, 'name', e.target.value)
                              }
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              select
                              label="City"
                              value={org.city}
                              onChange={(e) => handleOrganizationDetailsChange(index, 'city', e.target.value)}
                              required
                            >
                              {[...new Set(addressList.map((item) => item.city))].map((city) => (
                                <MenuItem key={city} value={city}>
                                  {city}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              select
                              label="Area"
                              value={org.area}
                              onChange={(e) => handleOrganizationDetailsChange(index, 'area', e.target.value)}
                              required
                            >
                              {addressList
                                .filter((item) => item.city === org.city)
                                .map((item) => (
                                  <MenuItem key={item.area} value={item.area}>
                                    {item.area}
                                  </MenuItem>
                                ))}
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Postcode"
                              value={org.postcode || ''}
                              disabled
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Address"
                              value={org.address}
                              onChange={(e) =>
                                handleOrganizationDetailsChange(index, 'address', e.target.value)
                              }
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Autocomplete
                              fullWidth
                              options={industryTypes}
                              getOptionLabel={(option) => option.name}
                              value={industryTypes.find((type) => type.id === org.industry) || null}
                              onChange={(event, newValue) =>
                                handleOrganizationDetailsChange(index, 'industry', newValue ? newValue.id : '')
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Industry Type"
                                  required
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </>
                )}
            </Grid>

            {/* Form Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setFormOpen(false)}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isEdit && !isFormChanged}
                >
                    {isEdit ? 'Update' : 'Create'}
                </Button>
            </Box>
        </form>
    </Box>
</Modal>
        </Box>
    );
};

export default CompanyList;