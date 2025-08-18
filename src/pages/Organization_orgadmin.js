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
import * as PageController from '../controllers/PageControllers';
import DataTable from '../components/Table/DataTable';

const OrganizationEditor = () => {
    // State variables
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [selectedYear, setSelectedYear] = useState(''); // New state for selected year

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
    
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // Fetch all organization data on component mount
    useEffect(() => {
        const fetchOrganizationData = async () => {
            console.log('Fetching organization data...');
            setLoading(true);
            try {
                await PageController.getData('/organizations/oadmin', (data) => {
                    console.log('Organizations Data:', data); // Debugging
                    setOrganizations(data);
                    if (data.length > 0) {
                        const defaultOrgId = data[0].orgid;
                        setSelectedOrgId(defaultOrgId); // Set the first organization as default
                        setOrganizationDetails(data[0]); // Set details for the default organization
                        fetchYearData(defaultOrgId); // Fetch year data for the default organization
                    }
                });
            } catch (error) {
                console.error('Error fetching organization data:', error);
                setSnackbar({
                    open: true,
                    message: 'Error fetching organization data.',
                    severity: 'error',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchOrganizationData();
    }, []);

    // Function to fetch year data
    const fetchYearData = async (orgid) => {
        console.log(`Fetching year data for orgid: ${orgid}`);
        await PageController.getData(`/organization/years?org=${orgid}`, (data) => {
            console.log('Year Data:', data); // Debugging
            if (Array.isArray(data)) {
                const years = data.map((yr) => ({
                    id: yr.yearid || 'N/A', // Unique identifier for DataTable
                    year: yr.year || 'N/A',
                    bookkeepercompanyname: yr.bookkeepercompanyname || 'N/A', // New field
                    bookkeepername: yr.bookkeepername || 'N/A', // New field
                }));
                setYearData(years);
            } else {
                console.error('Year data is not an array.');
                setYearData([]);
            }
        });
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
       
       {organizationDetails && (
    <Card sx={{ p: 3, boxShadow: 3 }}>
        <Typography variant="h5" gutterBottom>
            Organization Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                    <strong>Name:</strong> {organizationDetails.name || 'N/A'}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                    <strong>Address:</strong> {organizationDetails.address || 'N/A'}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                    <strong>Tax Code:</strong> {organizationDetails.taxcode || 'N/A'}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                    <strong>Country:</strong> {organizationDetails.country || 'N/A'}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                    <strong>Industry:</strong> {organizationDetails.industryname || 'N/A'}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                    <strong>Employees:</strong> {organizationDetails.amtofemployee || 'N/A'}
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
                <Button variant="contained" color="primary" onClick={() => setAddYearOpen(true)}>
                    Add Year
                </Button>
                <DataTable
                    columns={[
                        { field: 'year', label: 'Year' },
                        { field: 'bookkeepercompanyname', label: 'Bookkeeper company name' },
                        { field: 'bookkeepername', label: 'Bookkeeper Name' },
                    ]}
                    rows={yearData}
                    showActions={false} // No actions needed for this table
                />
            </Card>
            
    {/* Add Year Modal */}
   {/* Add Year Modal */}
<Modal open={addYearOpen} onClose={() => setAddYearOpen(false)}>
    <Box
        sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 6,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            width: { xs: '90%', sm: '60%', md: '40%' },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
        }}
    >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Add New Year
        </Typography>
        <Divider sx={{ width: '100%' }} />
        <FormControl fullWidth>
            <InputLabel id="select-year-label">Select Year</InputLabel>
            <Select
                labelId="select-year-label"
                id="select-year"
                value={selectedYear}
                label="Select Year"
                onChange={(e) => setSelectedYear(e.target.value)}
                sx={{
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    '& .MuiSelect-select': {
                        paddingY: 1.5,
                    },
                }}
            >
                {generateYearList().map((year) => (
                    <MenuItem key={year} value={year}>
                        {year}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
                variant="contained"
                color="secondary"
                onClick={() => setAddYearOpen(false)}
                sx={{
                    minWidth: '100px',
                    borderRadius: '20px',
                    textTransform: 'none',
                }}
            >
                Cancel
            </Button>
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleAddYear(selectedYear)}
                disabled={!selectedYear || loading}
                sx={{
                    minWidth: '100px',
                    borderRadius: '20px',
                    textTransform: 'none',
                    bgcolor: 'primary.main',
                    '&:hover': {
                        bgcolor: 'primary.dark',
                    },
                }}
            >
                Submit
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