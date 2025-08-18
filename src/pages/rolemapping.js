import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Modal,
    List,
    ListItem,
    TextField,
    Grid,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DataForm from '../components/Form/DataForm';
import * as PageController from '../controllers/PageControllers';
import { useTranslation } from 'react-i18next';

const RoleMappingPage = () => {
    const { t } = useTranslation(); // Translation hook
    const [lookupRows, setLookupRows] = useState([]);
    const [roleRows, setRoleRows] = useState([]);
    const [mappedRoles, setMappedRoles] = useState([]);
    const [selectedLookup, setSelectedLookup] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, roleId: null });

    // Columns for Lookup DataGrid
    const lookupColumns = [
         
        { field: 'label', headerName: 'Label', width: 150 },
        { field: 'path', headerName: 'Path', width: 150 },
        {
            field: 'active',
            headerName: 'Active',
            width: 100,
            type: 'boolean',
            renderCell: (params) => (params.value ? 'Yes' : 'No'),
        },
    ];

    // Columns for Role DataGrid
    const roleColumns = [
        
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'code', headerName: 'Label', width: 200 },
        {
            field: 'active',
            headerName: 'Active',
            width: 100,
            type: 'boolean',
            renderCell: (params) => (params.value ? 'Yes' : 'No'),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleAddMapping(params.row.id)}
                >
                    {t('Add')}
                </Button>
            ),
        },
    ];

    // Columns for Mapped Roles DataGrid
    const mappedRoleColumns = [
        { field: 'role_code', headerName: 'Role Code', width: 150 },
        { field: 'role_name', headerName: 'Role Name', width: 200 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleOpenDeleteDialog(params.row.role_id)}
                >
                    {t('Remove')}
                </Button>
            ),
        },
    ];

    // Load Lookup Data
    const loadLookupData = () => {
        PageController.loadData('/lookup', (data) => {
            setLookupRows(data);
        });
    };

    // Load Role Data
    const loadRoleData = () => {
        PageController.loadData('/role', (data) => {
            setRoleRows(data);
        });
    };

    // Load Mapped Roles for a Selected Lookup
    const loadMappedRoles = (lookupId) => {
        PageController.loadData(`/lookup_role?uuid=${lookupId}`, (data) => {
            setMappedRoles(data);
        });
    };

    // Handle Selection of a Lookup Row
    const handleLookupSelect = (params) => {
        const row = params.row;
        setSelectedLookup(row.uuid);
        loadMappedRoles(row.uuid);
    };

    // Handle Adding a New Role Mapping
    const handleAddMapping = (roleId) => {
        const payload = { uuid: selectedLookup, roleId };
        PageController.saveData('/add_lookup_role', payload, () => {
            loadMappedRoles(selectedLookup);
            setSnackbar({ open: true, message: 'Role mapping added successfully!', severity: 'success' });
        }, () => {
            setSnackbar({ open: true, message: 'Failed to add role mapping.', severity: 'error' });
        });
    };

    // Open Delete Confirmation Dialog
    const handleOpenDeleteDialog = (roleId) => {
        setDeleteDialog({ open: true, roleId });
    };

    // Close Delete Confirmation Dialog
    const handleCloseDeleteDialog = () => {
        setDeleteDialog({ open: false, roleId: null });
    };

    // Confirm Deletion of a Role Mapping
    const handleConfirmDelete = () => {
        const { roleId } = deleteDialog;
    
        // Construct the payload with roleId and selectedLookup
        const payload = {
            roleId: roleId,
            lookupId: selectedLookup, // Include the selected lookup ID
        };
    
        // Call the API with the payload
        PageController.saveData(
            '/remove_lookup_role',
            payload, // Send payload with the request
            () => {
                // Success callback
                loadMappedRoles(selectedLookup); // Reload roles based on the current lookup
                setSnackbar({ open: true, message: 'Role mapping removed successfully!', severity: 'success' });
            },
            () => {
                // Error callback
                setSnackbar({ open: true, message: 'Failed to remove role mapping.', severity: 'error' });
            }
        );
    
        // Close the delete dialog
        handleCloseDeleteDialog();
    };

    // Handle Form Input Changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle Form Submission for Adding/Editing Lookup Entries
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            PageController.updateRecord('/update_lookup', formData.uuid, formData, () => {
                loadLookupData();
                setSnackbar({ open: true, message: 'Lookup entry updated successfully!', severity: 'success' });
            }, () => {
                setSnackbar({ open: true, message: 'Failed to update lookup entry.', severity: 'error' });
            });
        } else {
            PageController.saveData('/add_lookup', formData, () => {
                loadLookupData();
                setFormData({});
                setSnackbar({ open: true, message: 'Lookup entry added successfully!', severity: 'success' });
            }, () => {
                setSnackbar({ open: true, message: 'Failed to add lookup entry.', severity: 'error' });
            });
        }
        setFormOpen(false);
    };

    // Open Form Modal for Adding a New Lookup Entry
    const handleOpenForm = () => {
        setIsEdit(false);
        setFormData({});
        setFormOpen(true);
    };

    // Open Form Modal for Editing an Existing Lookup Entry
    const handleEditLookup = () => {
        if (selectedLookup) {
            const lookup = lookupRows.find((row) => row.uuid === selectedLookup);
            if (lookup) {
                setIsEdit(true);
                setFormData(lookup);
                setFormOpen(true);
            }
        }
    };

    // Close Snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Fetch Data on Component Mount
    useEffect(() => {
        loadLookupData();
        loadRoleData();
    }, []);

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
                Role Mapping
            </Typography>

            <Grid container spacing={4}>
                {/* Lookup Table and Actions */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Lookup Entries</Typography>
                        <Box>
                            <Button variant="contained" color="primary" onClick={handleOpenForm} sx={{ mr: 1 }}>
                                Add Lookup
                            </Button>
                            <Button variant="outlined" color="secondary" onClick={handleEditLookup} disabled={!selectedLookup}>
                                Edit Lookup
                            </Button>
                        </Box>
                    </Box>
                    <DataGrid
                        rows={lookupRows}
                        columns={lookupColumns}
                        getRowId={(row) => row.uuid}
                        autoHeight
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 20]}
                        onRowClick={handleLookupSelect}
                        selectionModel={selectedLookup ? [selectedLookup] : []}
                        sx={{ cursor: 'pointer' }}
                    />
                </Grid>

                {/* Role Table and Actions */}
                <Grid item xs={12} md={5}>
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        {/* Roles Table */}
        <Box sx={{ flex: 1 }}>
            <Typography variant="h6">Roles</Typography>
            <DataGrid
                rows={roleRows}
                columns={roleColumns}
                getRowId={(row) => row.id}
                autoHeight
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
            />
        </Box>

        {/* Mapped Roles Table */}
        {selectedLookup && (
            <Box sx={{ flex: 1 }}>
                <Typography variant="h6">Mapped Roles for Selected Lookup</Typography>
                <DataGrid
                    rows={mappedRoles.map((role, index) => ({
                        id: index,
                        role_id: role.id,
                        role_code: role.role_code,
                        role_name: role.role_name,
                    }))}
                    columns={mappedRoleColumns}
                    getRowId={(row) => row.role_id}
                    autoHeight
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                    disableSelectionOnClick
                />
            </Box>
        )}
    </Box>
</Grid>
                
            </Grid>

            {/* Add/Edit Lookup Form Modal */}
            <Modal open={formOpen} onClose={() => setFormOpen(false)}>
                <Box
                    component="form"
                    onSubmit={handleFormSubmit}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        borderRadius: 2,
                        p: 4,
                        width: { xs: '90%', sm: '500px' },
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        {isEdit ? 'Edit Lookup Entry' : 'Add Lookup Entry'}
                    </Typography>
                    <DataForm
                        fields={[
                            { name: 'uuid', label: 'UUID', required: isEdit ? true : false, disabled: isEdit },
                            { name: 'label', label: 'Label', required: true },
                            { name: 'path', label: 'Path', required: true },
                            { name: 'active', label: 'Active', required: true, type: 'checkbox' },
                        ]}
                        values={formData}
                        onChange={handleFormChange}
                        onSubmit={handleFormSubmit}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button onClick={() => setFormOpen(false)} sx={{ mr: 2 }}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                            {isEdit ? 'Update' : 'Add'}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to remove this role mapping?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

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
}
    export default RoleMappingPage;