// src/pages/OrganizationEditor.js

import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    TextField,
    MenuItem,
    Button,
    Card,
    Divider,
    Snackbar,
    Alert,
    Modal,
    FormControl,
    InputLabel,
    Select, 
} from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow ,TablePagination } from '@mui/material';
import * as PageController from '../controllers/PageControllers';
import DataTable from '../components/Table/organization_iadmin_DataTable';

const OrganizationEditor = () => {
    // State variables
    const [companies, setCompanies] = useState([]); // List of companies
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [selectedYear, setSelectedYear] = useState(''); // New state for selected year
    const [showPopup, setShowPopup] = useState(true); // Show popup on page load
    const [searchText, setSearchText] = useState(''); // Search input value
    const [selectedCompany, setSelectedCompany] = useState(null); // Selected company
    const [organizationDetails, setOrganizationDetails] = useState({
        name: '',
        address: '',
        amtofemployee: '',
        industryname: '',
        taxcode: '',
    });
    const [yearData, setYearData] = useState([]); // For year and year-related data
    const [loading, setLoading] = useState(false);
    const [addYearOpen, setAddYearOpen] = useState(false); // State for "Add Year" modal
    const [editMode, setEditMode] = useState(false); // Tracks if in edit mode
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });
    const [bookkeepers, setBookkeepers] = useState([]); // List of bookkeepers
    const [selectedBookkeeper, setSelectedBookkeeper] = useState(''); // Selected bookkeeper ID
    const [selectedYearRow, setSelectedYearRow] = useState(null); // Year row for assigning bookkeeper
    const [assignBookkeeperOpen, setAssignBookkeeperOpen] = useState(false); // Modal state
    const [assigningBookkeeperRow, setAssigningBookkeeperRow] = useState(null); // For storing the current row being assigned
    const [page, setPage] = useState(0); // Current page
    const [companySearchText, setCompanySearchText] = useState(''); // For companies
const [bookkeeperSearchText, setBookkeeperSearchText] = useState(''); // For bookkeepers
 
const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page
const handleChangePage = (event, newPage) => {
    console.log(`Navigating to page: ${newPage}`); // Debugging
    setPage(newPage); // Update current page
};

const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`Changing rows per page to: ${newRowsPerPage}`); // Debugging
    setRowsPerPage(newRowsPerPage); // Update rows per page
    setPage(0); // Reset to first page
};

const handleAssignBookkeeperInline = (row) => {
    console.log('Row passed to handleAssignBookkeeperInline:', row);
    if (!row) {
        console.error('Row is null or undefined!');
        return;
    }
    // Use selectedYearRow instead of assigningBookkeeperRow
    setSelectedYearRow(row);
    fetchBookkeepers(); // Fetch the list of bookkeepers
    setAssignBookkeeperOpen(true); // Open the modal
};
    const fetchBookkeepers = async () => {
        console.log('Fetching bookkeepers...');
        await PageController.getData('/bookkeepers/list', (data) => {
            if (Array.isArray(data)) {
                console.log('Fetched Bookkeepers:', data);
                setBookkeepers(data);
            } else {
                console.error('Bookkeepers data is not an array.');
                setBookkeepers([]);
            }
        });
    };
    const handleAssignBookkeeper = async (row, bookkeeper) => {
        if (!row || !bookkeeper) {
            console.error('Row or bookkeeper is null:', { row, bookkeeper });
            return;
        }
        const payload = {
            yearId: row.id,
            bookkeeperId: bookkeeper.id,
        };
        console.log('Assigning bookkeeper with payload:', payload);
        
        await PageController.saveData('/organization/assignBookkeeper', payload, async () => {
            // Update yearData locally with new bookkeeper info
            setYearData((prevYears) =>
                prevYears.map((year) =>
                    year.id === row.id
                        ? { ...year, bookkeepername: bookkeeper.name }
                        : year
                )
            );
            setAssignBookkeeperOpen(false);
            setSnackbar({
                open: true,
                message: `Bookkeeper ${bookkeeper.name} assigned successfully!`,
                severity: 'success',
            });
            // Refresh year data
            await fetchYearData(selectedOrgId)
        });
    };
       useEffect(() => {
        // Fetch the list of companies when the page loads
         // Function to load the list of companies
    const loadCompanyList = () => {
        PageController.loadData('/company_list', (data) => {
            if (Array.isArray(data)) {
                console.log('Fetched Companies Data:', data); // Debugging
                setCompanies(data); // Populate the companies list
            } else {
                console.error('Expected an array of companies, but received:', data);
                setCompanies([]); // Fallback to an empty array
            }
        });
    };
    loadCompanyList();
    }, []);

       // Handle search input change
       const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    // Filtered list of companies based on search input
    const filteredCompanies = companies?.filter((company) =>
        (company.name || '').toLowerCase().includes((searchText || '').toLowerCase()) ||
        (company.taxId || '').toLowerCase().includes((searchText || '').toLowerCase()) ||
        (company.email || '').toLowerCase().includes((searchText || '').toLowerCase()) ||
        (company.telephone || '').toLowerCase().includes((searchText || '').toLowerCase())
    ) || [];

   // Function to fetch organizations based on company ID
const fetchOrganizations = (companyId) => {
    console.log(`Fetching organizations for company ID: ${companyId}`); // Debugging
    PageController.getData(`/organization_list?companyId=${companyId}`, (data) => {
        if (Array.isArray(data)) {
            console.log('Fetched Organizations Data:', data); // Debugging
            setOrganizations(data); // Populate the organizations list
        } else {
            console.error('Expected an array of organizations, but received:', data);
            setOrganizations([]); // Fallback to an empty array
        }
    });
};

// Handle company selection
const handleCompanySelect = (company) => {
    setSelectedCompany(company); // Set the selected company
    setShowPopup(false); // Close the popup

    if (company?.id) {
        fetchOrganizations(company.id); // Fetch organizations using the company ID
        PageController.getData(`/organization_list?companyId=${company.id}`, (data) => {
            if (Array.isArray(data) && data.length > 0) {
                setOrganizations(data); // Populate the organizations list
                setSelectedOrgId(data[0].orgid); // Automatically select the first organization
                setOrganizationDetails(data[0]); // Set details for the first organization
                fetchYearData(data[0].orgid); // Fetch year data for the first organization
            } else {
                console.error('No organizations found for the selected company.');
                setOrganizations([]); // Fallback to an empty array
                setSelectedOrgId(''); // Clear the selected organization
                setOrganizationDetails({
                    name: '',
                    address: '',
                    amtofemployee: '',
                    industryname: '',
                    taxcode: '',
                }); // Reset organization details
            }
        });
    } else {
        console.error('Selected company does not have a valid ID.');
    }
};

// Open Assign Bookkeeper Modal
const handleAddPerson = (row) => {
    console.log('Add Person clicked for:', row);
    setSelectedYearRow(row); // Store the selected row (Year details)
    setAssignBookkeeperOpen(true); // Open the modal
    fetchBookkeepers(); // Fetch the list of available bookkeepers
};

// Placeholder for Remove Person functionality
const handleRemovePerson = async (row) => {
    console.log('Remove Person clicked for Year ID:', row);
    // Add logic to remove person if necessary (API call or state update)
    const payload = {
        id: row.id, // Year ID or relevant row ID
        bookkeeperid: row.bookkeeperid, // Updated Bookkeeper ID
    };

    console.log('Updating person with payload:', payload);
    try {
        // Make the API call
        await PageController.saveData('/updated_bookeper_status', payload, async () => {
          
            setSnackbar({
                open: true,
                message: `Bookkeeper updated successfully!`,
                severity: 'success',
            });
            // Refresh year data
            await fetchYearData(selectedOrgId)
        });
    } catch (error) {
        console.error('Error updating bookkeeper:', error);
        setSnackbar({
            open: true,
            message: 'Failed to update bookkeeper.',
            severity: 'error',
        });
    }
};
    // Function to fetch year data
    const fetchYearData = async (orgid) => {
        console.log(`Fetching year data for orgid: ${orgid}`);
        await PageController.getData(`/organization/years?org=${orgid}`, (data) => {
            console.log('Year Data:', data); // Debugging
            if (Array.isArray(data)) {
                const years = data.map((yr) => ({
                    id: yr.yearid || 'N/A', // Unique identifier for DataTable
                    year: yr.year || 'N/A',
                    bookkeeperid :yr.bookkeeperid || 'N/A',
                    bookkeepercompanyname: yr.bookkeepercompanyname || 'N/A', // New field
                    bookkeepername: yr.bookkeepername || 'N/A', // New field
                    starttime:yr.startdate|| 'N/A', // New field
                }));
                setYearData(years);
            } else {
                console.error('Year data is not an array.');
                setYearData([]);
            }
        });
    };

    // Handler for organization dropdown change
    const handleOrganizationChange = (e) => {
        const orgid = e.target.value;
        console.log('Selected Org ID:', orgid); // Debugging
        setSelectedOrgId(orgid);
        const selectedOrg = organizations.find((org) => org.orgid === orgid);
        if (selectedOrg) {
            setOrganizationDetails(selectedOrg); // Update details based on selection
            fetchYearData(orgid); // Fetch year data for the selected organization
            setEditMode(false); // Exit edit mode on organization change
        }
    };
    // Handle Add Year
    const handleAddYear = (year) => {
        const payload = {
            orgid: selectedOrgId,
            year,
        };
        PageController.saveData('/organization/createyears', payload, () => {
            setYearData((prevYears) => [...prevYears, { year }]);
            setSnackbar({
                open: true,
                message: `Year ${year} added successfully!`,
                severity: 'success',
            });
        });
        setAddYearOpen(false);
    };
        // Generate the list of years (2014 to 2034)
        const generateYearList = () => {
            const currentYear = new Date().getFullYear();
            const minYear = currentYear - 10;
            const maxYear = currentYear + 10;
            const existingYears = yearData.map((y) => y.year);
            return Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).filter(
                (year) => !existingYears.includes(year)
            );
        };
    // Handler for form field changes
    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        console.log(`Field Change - ${name}: ${value}`); // Debugging
        setOrganizationDetails((prev) => ({ ...prev, [name]: value }));
    };

    // Handler to save changes to the database
    const handleSave = async () => {
        setLoading(true);
        console.log('Saving organization details:', organizationDetails);
        try {
            await PageController.updateRecord(
                '/organization/details',
                selectedOrgId,
                {  orgid: selectedOrgId, // Include the selected orgid
                    name: organizationDetails.name,
                    address: organizationDetails.address,
                    amtofemployee: organizationDetails.amtofemployee,
                },
                () => {
                    console.log('Organization details updated successfully!');
                     // Update the local state for organizations
                setOrganizations((prevOrganizations) =>
                    prevOrganizations.map((org) =>
                        org.orgid === selectedOrgId
                            ? { ...org, ...organizationDetails } // Merge updated details
                            : org
                    )
                );

                // Update the local state for the current organization details
                setOrganizationDetails((prevDetails) => ({
                    ...prevDetails,
                    name: organizationDetails.name,
                    address: organizationDetails.address,
                    amtofemployee: organizationDetails.amtofemployee,
                }));
                    setSnackbar({
                        open: true,
                        message: 'Organization details updated successfully!',
                        severity: 'success',
                    });
                }
            );
        } catch (error) {
            console.error('Error updating organization:', error);
            setSnackbar({
                open: true,
                message: 'Failed to update organization details.',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    // Handler to close the Snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ p: 4 }}>
  
            {/* Popup Modal */}
            <Modal open={showPopup} onClose={() => setShowPopup(false)}>
    <Box
        sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '70%', md: '50%' },
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
        }}
    >
        <Typography variant="h6" component="h2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            Select a Company
        </Typography>
        <TextField
            fullWidth
            label="Search"
            variant="outlined"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search by name, Tax ID, email, or telephone"
            sx={{ mb: 2 }}
        />
        <Divider />
        <TableContainer sx={{ maxHeight: '300px' }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Tax ID</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>Telephone</strong></TableCell>
                        <TableCell align="center"><strong>Action</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredCompanies
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((company) => (
                            <TableRow key={company.id} hover>
                                <TableCell>{company.name || 'N/A'}</TableCell>
                                <TableCell>{company.taxcode || 'N/A'}</TableCell>
                                <TableCell>{company.email || 'N/A'}</TableCell>
                                <TableCell>{company.telephone || 'N/A'}</TableCell>
                                <TableCell align="center">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleCompanySelect(company)}
                                    >
                                        Select
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </TableContainer>
        <TablePagination
            component="div"
            count={filteredCompanies.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
            rowsPerPageOptions={[5, 10, 15]}
        />
    </Box>
</Modal>
{selectedCompany ? (
    <Card sx={{ flex: 1, p: 3, boxShadow: 3, mb: 4 }}>
        {/* Header with Title and Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
                Selected Company Details
            </Typography>
            <Button
                variant="outlined"
                color="primary"
                onClick={() => setShowPopup(true)}
            >
                Change Company
            </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                    <strong>Name:</strong> {selectedCompany.name}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                    <strong>Tax ID:</strong> {selectedCompany.taxcode}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                    <strong>Email:</strong> {selectedCompany.email}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                    <strong>Telephone:</strong> {selectedCompany.telephone}
                </Typography>
            </Grid>
          
        </Grid>
    </Card>
) : (
    <Typography variant="h6" sx={{ mt: 3 }}>
        Please select a company to view its details.
    </Typography>
)}

 

            {organizationDetails && (
    <Card sx={{ p: 3, boxShadow: 3 }}>
          {/* Header with Title and Dropdown */}
    <Box 
        sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
        }}
    >
        <Typography variant="h4" gutterBottom>
            Organization Details
        </Typography>
        {/* Dropdown */}
        <TextField
            select
            size="small"
            label="Select Organization"
            value={selectedOrgId}
            onChange={handleOrganizationChange}
            sx={{ width: 250 }} // Adjust width as needed
            disabled={loading}
        >
            {organizations.map((org) => (
                <MenuItem key={org.orgid} value={org.orgid}>
                    {org.name}
                </MenuItem>
            ))}
        </TextField>
          {/* Edit and Save Buttons */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        {!editMode ? (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setEditMode(true)}
                            >
                                Edit
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    sx={{ mr: 2 }}
                                    onClick={() => setEditMode(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    Save
                                </Button>
                            </>
                        )}
                    </Box>
        </Box>
        <Divider sx={{ mb: 3}} />
        <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
                <Typography variant="body1">
                    <strong>Name:</strong>{' '}
                    {!editMode ? (
                        organizationDetails.name
                    ) : (
                        <TextField
                            fullWidth
                            name="name"
                            value={organizationDetails.name}
                            onChange={handleFieldChange}
                        />
                    )}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Typography variant="body1">
                    <strong>Address:</strong>{' '}
                    {!editMode ? (
                        organizationDetails.address || 'N/A'
                    ) : (
                        <TextField
                            fullWidth
                            name="address"
                            value={organizationDetails.address}
                            onChange={handleFieldChange}
                        />
                    )}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Typography variant="body1">
                    <strong>Tax Code:</strong> {organizationDetails.taxcode || 'N/A'}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Typography variant="body1">
                    <strong>Country:</strong> {organizationDetails.country || 'N/A'}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Typography variant="body1">
                    <strong>Industry:</strong> {organizationDetails.industryname || 'N/A'}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Typography variant="body1">
                    <strong>Employees:</strong>{' '}
                    {!editMode ? (
                        organizationDetails.amtofemployee || 'N/A'
                    ) : (
                        <TextField
                            fullWidth
                            type="number"
                            name="amtofemployee"
                            value={organizationDetails.amtofemployee}
                            onChange={handleFieldChange}
                        />
                    )}
                </Typography>
            </Grid>
        </Grid>

                  
                </Card>
       )}

       {/* Added spacing here */}
       <Box sx={{ mb: 4 }} /> {/* Provides a space of 4 between the two sections */}
            {/* Year Data Table */}
            <Card sx={{ p: 3, boxShadow: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Year Data
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <DataTable
    columns={[
        { field: 'year', label: 'Year' },
        { field: 'bookkeepercompanyname', label: 'Bookkeeper Company Name' },
        
        {
            field: 'bookkeepername',
            label: 'Bookkeeper',
            render: (row) => (
                <Box>
                    {row.bookkeepername || 'None'}
                    <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ ml: 2 }}
                        onClick={() => handleAssignBookkeeperInline(row)}
                    >
                        Assign Bookkeeper
                    </Button>
                </Box>
            ),
        },
        { field: 'starttime', label: 'Start Time' },

    ]}
    rows={yearData}
    showActions={true}
    onAddPerson={handleAddPerson} // Pass handleAddPerson here
    onRemovePerson={handleRemovePerson} // Pass handleRemovePerson here
/>
            </Card>
            <Modal open={assignBookkeeperOpen} onClose={() => setAssignBookkeeperOpen(false)}>
    <Box
        sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 4,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            width: { xs: '90%', sm: '80%', md: '60%' },
        }}
    >
        {/* Header with Search */}
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
    Assign Bookkeeper for Year: {selectedYearRow?.year || 'N/A'}
</Typography>
            <TextField
                variant="outlined"
                placeholder="Search by name, email, company, or tel"
                size="small"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ width: '50%' }}
            />
        </Box>
        <Divider sx={{ mb: 3 }} />

        {/* Table with Bookkeepers */}
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>Company</strong></TableCell>
                        <TableCell><strong>Phone</strong></TableCell>
                        <TableCell align="center"><strong>Action</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
    {bookkeepers
        .filter((bk) =>
            (bk.bookkeepername || '').toLowerCase().includes((searchText || '').toLowerCase()) ||
            (bk.bookkeeperemail || '').toLowerCase().includes((searchText || '').toLowerCase()) ||
            (bk.bookkeepercompanyname || '').toLowerCase().includes((searchText || '').toLowerCase()) ||
            (bk.bookkeepertel || '').toLowerCase().includes((searchText || '').toLowerCase())
        )
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Pagination logic
        .map((bk) => (
            <TableRow key={bk.id}>
                <TableCell>{bk.bookkeepername || 'N/A'}</TableCell>
                <TableCell>{bk.bookkeeperemail || 'N/A'}</TableCell>
                <TableCell>{bk.bookkeepercompanyname || 'N/A'}</TableCell>
                <TableCell>{bk.bookkeepertel || 'N/A'}</TableCell>
                <TableCell align="center">
                <Button
    variant="contained"
    color="primary"
    size="small"
    onClick={() => handleAssignBookkeeper(selectedYearRow, bk)}
>
    Select
</Button>
                </TableCell>
            </TableRow>
        ))}
</TableBody>
            </Table>
        </TableContainer>
        <TablePagination
            component="div"
            count={
                bookkeepers.filter((bk) =>
                    (bk.bookkeepername || '').toLowerCase().includes((searchText || '').toLowerCase()) ||
                    (bk.bookkeeperemail || '').toLowerCase().includes((searchText || '').toLowerCase()) ||
                    (bk.bookkeepercompanyname || '').toLowerCase().includes((searchText || '').toLowerCase()) ||
                    (bk.bookkeepertel || '').toLowerCase().includes((searchText || '').toLowerCase())
                ).length
            } // Total filtered rows
            rowsPerPage={rowsPerPage} // Rows per page
            page={page} // Current page
            onPageChange={handleChangePage} // Handle page change
            onRowsPerPageChange={handleChangeRowsPerPage} // Handle rows per page change
            rowsPerPageOptions={[5, 10, 15]} // Allow changing rows per page
        />
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => setAssignBookkeeperOpen(false)}>
                Close
            </Button>
        </Box>
    </Box>
</Modal>
   
            {/* Snackbar for User Feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OrganizationEditor;