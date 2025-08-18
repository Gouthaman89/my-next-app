import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Modal , TextField} from '@mui/material';
import DataTable from '../components/Table/DataTable'; // Adjust the path as necessary
import DataForm from '../components/Form/DataForm';
import * as PageController from '../controllers/PageControllers';

const Organization = () => {
    const endpoint = '/organization';
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]); // State for filtered rows
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const [formOpen, setFormOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [showActions, setShowActions] = useState(false); // State to toggle Actions column

    const columns = [
        { field: 'name', label: 'Name of Consultant' },
        { field: 'company', label: 'Name of company' },
        { field: 'typeofcompany', label: 'Type of Company' },
        { field: 'industryname', label: 'Industry' },
        { field: 'address', label: 'address' },
    ];

    const fields = [
        { name: 'id', label: 'id', required: true },
        { name: 'year', label: 'Year', required: true },
        { name: 'wayofcontrol', label: 'Way of Control', required: false },
        { name: 'nameofconsultant', label: 'Name of Consultant', required: true },
        { name: 'assigndate', label: 'Assign Date', required: false, type: 'checkbox' },
    ];

    const loadTableData = () => {
        PageController.loadData(endpoint, (data) => {
            setRows(data);
            setFilteredRows(data); // Initialize filtered rows
        });
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
                    //row.year.toString().includes(query) || // Ensure numeric values are converted to string
                    row.name?.toLowerCase().includes(query) ||
                    row.company?.toLowerCase().includes(query) ||
                    row.typeofcompany?.toLowerCase().includes(query)||
                    row.industryname?.toLowerCase().includes(query)||
                    row.address?.toLowerCase().includes(query)
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
            Organization
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

export default Organization;