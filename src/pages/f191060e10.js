import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Modal, TextField } from '@mui/material';
import DataTable from './f191060e10_dataTable'; // Adjust the path as necessary
import DataForm from './f191060e10_dataform';
import * as PageController from '../controllers/PageControllers';

const Companylist = () => {
    const endpoint = '/f191060e10';
    const resetpasswordEndpoint='/resetpassword';
    const sendemailEndpoint='/emailendpoint';
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]); // State for filtered rows
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const [formOpen, setFormOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [showActions, setShowActions] = useState(false); // State to toggle Actions column

    const columns = [
        { field: 'code', label: 'User Code' },
        { field: 'password', label: 'Password' },
        { field: 'companyname', label: 'Company Name' },
        { field: 'active', label: 'Active' },
    ];

    const fields = [
        //{ name: 'id', label: 'id', required: true },
        //{ name: 'active', label: 'Active', required: false, type: 'checkbox' },
    ];

    const loadTableData = () => {
        PageController.loadData(endpoint, (data) => {
            setRows(data);
            setFilteredRows(data); // Initialize filtered rows
        });
    };
    const handleSendEmail = (id) => {
        PageController.saveData(sendemailEndpoint, {"ID":id});
        setUnderConstructionOpen(true);
    };
    const handleResetpassowrd = (id) => {
        PageController.saveData(resetpasswordEndpoint, {"ID":id});
    };
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            PageController.updateRecord(endpoint, formData.id, formData, loadTableData);
        } else {
            PageController.saveData(endpoint, formData, () => setFormData({}), loadTableData);
        }
        setFormOpen(false);
    };

    const handleEdit = (row) => {
        setFormData(row);
        setIsEdit(true);
        setFormOpen(true);
    };

    const handleDelete = (id) => {
        PageController.deleteRecord(endpoint, id, loadTableData);
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query === '') {
            setFilteredRows(rows); // Reset to original data if search query is empty
        } else {
            const filtered = rows.filter(
                (row) =>
                    row.code.toString().includes(query) || // Ensure numeric values are converted to string
                    row.organization?.toLowerCase().includes(query)
            );
            setFilteredRows(filtered);
        }
    };

    useEffect(() => {
        loadTableData();
    }, []);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
            帳號設定
            </Typography>
            {/* Buttons for Add New and Show/Hide Actions */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
                    label="Search"
                    variant="outlined"
                    value={searchQuery}
                    onChange={handleSearch}
                    sx={{ width: '300px' }} // Adjust width if needed
                />
                <Button variant="contained" color="primary" onClick={() => setFormOpen(true)}>
                    Add New
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setShowActions((prev) => !prev)}
                >
                    {showActions ? 'Hide Actions' : 'Show Actions'}
                </Button>
            </Box>
            <DataTable
                columns={columns}
                rows={filteredRows}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSendEmail={handleSendEmail}
                    onReset={handleResetpassowrd}
                showActions={showActions} // Pass the state to DataTable
            />
            <Modal open={formOpen} onClose={() => setFormOpen(false)}>
                <Box
                    sx={{
                        p: 4,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        borderRadius: 1,
                        minWidth: '400px',
                        maxWidth: '600px',
                        margin: 'auto',
                        mt: '10%',
                    }}
                >
                    <DataForm fields={fields} values={formData} onChange={handleFormChange} onSubmit={handleFormSubmit} />
                </Box>
            </Modal>
        </Box>
    );
};

export default Companylist;