// src/pages/OrganizationEditor.js

import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader/loader';
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
    Radio,
    RadioGroup,
    FormControlLabel,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@mui/material';
import * as PageController from '../controllers/PageControllers';
import { useTranslation } from 'react-i18next';
import { YearTable } from '../components/Table/YearActions';

import { useGlobalContext } from '../components/GlobalContext';

const OrganizationEditor = () => {
    const { t } = useTranslation();
    const { globalOrgId } = useGlobalContext();
    // State variables
    const [organizations, setOrganizations] = useState([]);
    const [selectedYear, setSelectedYear] = useState(''); // New state for selected year
    const [typeofCalendarSelection, setTypeofCalendarSelection] = useState('0');

    const [organizationDetails, setOrganizationDetails] = useState({
        name: '',
        address: '',
        amtofemployee: '',
        industryname: '',
        taxcode: '',
        certificate: '',
        competent: '',
        controlno: '',
        factorynumber: '',
    });
    const [yearData, setYearData] = useState([]); // For year and year-related data
    const [editingYearId, setEditingYearId] = useState(null);
    const [editedCalendarType, setEditedCalendarType] = useState('');
    const [loading, setLoading] = useState(false);
    const [addYearOpen, setAddYearOpen] = useState(false); // State for "Add Year" modal
    const [editMode, setEditMode] = useState(false); // Tracks if in edit mode
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // Additional state for dropdowns and new fields
    const [registerReasons, setRegisterReasons] = useState([]);
    const [cfvList, setCfvList] = useState([]);
    const [institutions, setInstitutions] = useState([]);

    const [selectedRegisterReason, setSelectedRegisterReason] = useState('');
    const [selectedCfv, setSelectedCfv] = useState('');
    const [selectedInstitution, setSelectedInstitution] = useState('');
    const [ispermit, setIspermit] = useState(true);
    const [comment, setComment] = useState('');

    // Fetch all organization data and dropdown data on component mount
    useEffect(() => {
        const fetchOrganizationData = async () => {
            console.log(t('fetchingOrganizationData'));
            setLoading(true);
            try {
                await PageController.getData('/organizations', (data) => {
                    console.log(t('organizationsData'), data); // Debugging
                    if (data.length > 0) {
                        setOrganizations(data);
                    }
                });
            } catch (error) {
                console.error(t('errorFetchingOrganizationData'), error);
                setSnackbar({
                    open: true,
                    message: t('errorFetchingOrganizationData'),
                    severity: 'error',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchOrganizationData();
    }, []);

    // Effect to update organization details and year data when globalOrgId or organizations change
    useEffect(() => {
        if (globalOrgId && organizations.length > 0) {
            const selectedOrg = organizations.find((org) => org.orgid === globalOrgId);
            if (selectedOrg) {
                setOrganizationDetails(selectedOrg);
                setComment(selectedOrg.comment || '');
                setOrganizationDetails((prev) => ({
                    ...prev,
                    certificate: selectedOrg.certificate || '',
                    competent: selectedOrg.competent || '',
                    ispermit: selectedOrg.ispermit || '',
                }));
                fetchYearData(globalOrgId);
                setEditMode(false);
                setSelectedRegisterReason(selectedOrg.reason || '');
                setSelectedCfv(selectedOrg.accordto || '');
                setSelectedInstitution(selectedOrg.institution || '');
            }
        }
    }, [globalOrgId, organizations]);

    // Handler to enter edit mode (no longer fetching dropdown data)
    const handleEditModeChange = async () => {
        setLoading(true);
        setEditMode(true);
        try {
            // No longer fetching dropdown data
        } catch (err) {
            console.error('Error in edit mode:', err);
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch year data
    const fetchYearData = async (globalOrgId) => {
        setLoading(true);
        try {
            console.log(t('fetchingYearData', { globalOrgId }));
            await PageController.getData(`/organization/years?org=${globalOrgId}`, (data) => {
                console.log(t('yearData'), data); // Debugging
                if (Array.isArray(data)) {
                    const years = data.map((yr) => ({
                        id: yr.yearid || 'N/A', // Unique identifier for DataTable
                        year: yr.year || 'N/A',
                        bookkeepercompanyname: yr.bookkeepercompanyname || 'N/A', // New field
                        bookkeepername: yr.bookkeepername || 'N/A', // New field
                        typeofcalendar: yr.typeofcalendar, // Keep raw value as "0" or "1"
                    }));
                    setYearData(years);
                } else {
                    console.error(t('yearDataNotArray'));
                    setYearData([]);
                }
            });
        } finally {
            setLoading(false);
        }
    };

    // Handler for organization dropdown change (now unused, so remove)

    // Handle Add Year
    const handleAddYear = async (year) => {
        setLoading(true);
        try {
            const payload = {
                orgid: globalOrgId,
                year,
                typeofcalendar: typeofCalendarSelection || '0',
            };
            await PageController.saveData('/organization/createyears', payload, () => {
                setYearData((prevYears) => [...prevYears, { year }]);
                setSnackbar({
                    open: true,
                    message: t('yearAddedSuccessfully', { year }),
                    severity: 'success',
                });
            });
            setAddYearOpen(false);
        } finally {
            setLoading(false);
        }
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
        console.log(t('fieldChange', { name, value })); // Debugging
        setOrganizationDetails((prev) => ({ ...prev, [name]: value }));
    };

    // Handler to save changes to the database
    const handleSave = async () => {
        setLoading(true);
        console.log(t('savingOrganizationDetails'), organizationDetails);
        try {
            const payload = {
                orgid: globalOrgId,
                name: organizationDetails.name,
                address: organizationDetails.address,
                amtofemployee: organizationDetails.amtofemployee,
                comment: comment,
                certificate: organizationDetails.certificate,
                competent: organizationDetails.competent,
                registerreason: organizationDetails.reason,
                cfv: organizationDetails.accordto,
                permitted: organizationDetails.ispermit,
                institution: organizationDetails.institution,
                controlno: organizationDetails.controlno,
                factorynumber: organizationDetails.factorynumber,
            };
            await PageController.updateRecord(
                '/organization/details',
                globalOrgId,
                payload,
                () => {
                    console.log(t('organizationDetailsUpdatedSuccessfully'));
                    // Update the local state for organizations
                    setOrganizations((prevOrganizations) =>
                        prevOrganizations.map((org) =>
                            org.orgid === globalOrgId
                                ? {
                                    ...org,
                                    ...organizationDetails,
                                    reason: organizationDetails.reason,
                                    accordto: organizationDetails.accordto,
                                    ispermit: organizationDetails.ispermit,
                                    institution: organizationDetails.institution,
                                    comment: comment,
                                    certificate: organizationDetails.certificate,
                                    competent: organizationDetails.competent,
                                    controlno: organizationDetails.controlno,
                                    factorynumber: organizationDetails.factorynumber,
                                }
                                : org
                        )
                    );

                    // Update the local state for the current organization details
                    setOrganizationDetails((prevDetails) => ({
                        ...prevDetails,
                        name: organizationDetails.name,
                        address: organizationDetails.address,
                        amtofemployee: organizationDetails.amtofemployee,
                        reason: organizationDetails.reason,
                        accordto: organizationDetails.accordto,
                        ispermit: organizationDetails.ispermit,
                        institution: organizationDetails.institution,
                        comment: comment,
                        certificate: organizationDetails.certificate,
                        competent: organizationDetails.competent,
                        controlno: organizationDetails.controlno,
                        factorynumber: organizationDetails.factorynumber,
                    }));
                    setSnackbar({
                        open: true,
                        message: t('organizationDetailsUpdatedSuccessfully'),
                        severity: 'success',
                    });
                    setEditMode(false);
                }
            );
        } catch (error) {
            console.error(t('errorUpdatingOrganization'), error);
            setSnackbar({
                open: true,
                message: t('failedToUpdateOrganizationDetails'),
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
      <>
        {loading ? (
          <Loader />
        ) : (
          <Box sx={{ p: 4 }}>

            {organizationDetails && (
                <Card sx={{ p: 3, boxShadow: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        {t('organizationDetails')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {!editMode ? (
                        <>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>{t('name')}:</strong> {organizationDetails.name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>{t('address')}:</strong> {organizationDetails.address || t('n/a')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>{t('taxCode')}:</strong> {organizationDetails.taxcode || t('n/a')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>{t('controlNo')}:</strong> {organizationDetails.controlno || t('n/a')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>{t('factoryNumber')}:</strong> {organizationDetails.factorynumber || t('n/a')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>{t('country')}:</strong> {organizationDetails.country || t('n/a')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>{t('industry')}:</strong> {organizationDetails.industryname || t('n/a')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>{t('certificate')}:</strong> {organizationDetails.certificate || t('n/a')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>{t('competent')}:</strong> {organizationDetails.competent || t('n/a')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>{t('employees')}:</strong> {organizationDetails.amtofemployee || t('n/a')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>{t('reason')}:</strong> {organizationDetails.reason || t('n/a')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>{t('accordTo')}:</strong> {organizationDetails.accordto || t('n/a')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>{t('ispermit')}:</strong> {organizationDetails.ispermit || t('n/a')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>{t('institution')}:</strong> {organizationDetails.institution || t('n/a')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body1">
                                        <strong>{t('comment')}:</strong> {organizationDetails.comment || t('n/a')}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </>
                    ) : (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('name')}
                                    name="name"
                                    value={organizationDetails.name}
                                    onChange={handleFieldChange}
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('address')}
                                    name="address"
                                    value={organizationDetails.address}
                                    onChange={handleFieldChange}
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('taxCode')}
                                    name="taxcode"
                                    value={organizationDetails.taxcode || ''}
                                    disabled
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('controlNo')}
                                    name="controlno"
                                    value={organizationDetails.controlno || ''}
                                    onChange={handleFieldChange}
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('factoryNumber')}
                                    name="factorynumber"
                                    value={organizationDetails.factorynumber || ''}
                                    onChange={handleFieldChange}
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('country')}
                                    name="country"
                                    value={organizationDetails.country || ''}
                                    disabled
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('industry')}
                                    name="industryname"
                                    value={organizationDetails.industryname || ''}
                                    disabled
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('certificate')}
                                    name="certificate"
                                    value={organizationDetails.certificate}
                                    onChange={handleFieldChange}
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('competent')}
                                    name="competent"
                                    value={organizationDetails.competent}
                                    onChange={handleFieldChange}
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('employees')}
                                    type="number"
                                    name="amtofemployee"
                                    value={organizationDetails.amtofemployee}
                                    onChange={handleFieldChange}
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('reason')}
                                    name="reason"
                                    value={organizationDetails.reason || ''}
                                    onChange={handleFieldChange}
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('accordTo')}
                                    name="accordto"
                                    value={organizationDetails.accordto || ''}
                                    onChange={handleFieldChange}
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('ispermit')}
                                    name="ispermit"
                                    value={organizationDetails.ispermit || ''}
                                    onChange={handleFieldChange}
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('institution')}
                                    name="institution"
                                    value={organizationDetails.institution || ''}
                                    onChange={handleFieldChange}
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label={t('comment')}
                                    multiline
                                    rows={2}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    sx={{ mt: 1 }}
                                />
                            </Grid>
                        </Grid>
                    )}
                    {/* Edit and Save Buttons */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        {!editMode ? (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleEditModeChange}
                            >
                                {t('edit')}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    sx={{ mr: 2 }}
                                    onClick={() => setEditMode(false)}
                                >
                                    {t('cancel')}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    {t('save')}
                                </Button>
                            </>
                        )}
                    </Box>
                </Card>
            )}
            {/* Added spacing here */}
            <Box sx={{ mb: 4 }} /> {/* Provides a space of 4 between the two sections */}
            {/* Year Data Table */}
            <Card sx={{ p: 3, boxShadow: 3 }}>
                <Typography variant="h5" gutterBottom>
                    {t('yearData')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Button variant="contained" color="primary" onClick={() => {
                    setTypeofCalendarSelection('0');
                    setAddYearOpen(true);
                }}>
                    {t('addYear')}
                </Button>
                <YearTable
                    yearData={yearData}
                    editingYearId={editingYearId}
                    editedCalendarType={editedCalendarType}
                    setEditedCalendarType={setEditedCalendarType}
                    setEditingYearId={setEditingYearId}
                    selectedOrgId={globalOrgId}
                    fetchYearData={fetchYearData}
                    setSnackbar={setSnackbar}
                />
            </Card>
            
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
                        {t('addNewYear')}
                    </Typography>
                    <Divider sx={{ width: '100%' }} />
                    <FormControl fullWidth>
                        <InputLabel id="select-year-label">{t('selectYear')}</InputLabel>
                        <Select
                            labelId="select-year-label"
                            id="select-year"
                            value={selectedYear}
                            label={t('selectYear')}
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
                    {/* Calendar Type RadioGroup */}
                    <Typography variant="subtitle1" sx={{ alignSelf: 'flex-start' }}>
                        {t('calendarType') || 'Calendar Type'}
                    </Typography>
                    <RadioGroup
                        row
                        value={typeofCalendarSelection}
                        onChange={(e) => setTypeofCalendarSelection(e.target.value)}
                    >
                        <FormControlLabel
                            value="0"
                            control={<Radio />}
                            label={t('calendarDaily') || 'Daily'}
                        />
                        <FormControlLabel
                            value="1"
                            control={<Radio />}
                            label={t('calendarWorking') || 'Working Days'}
                        />
                    </RadioGroup>
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
                            {t('cancel')}
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
                            {t('submit')}
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
        )}
      </>
    );
};

export default OrganizationEditor;