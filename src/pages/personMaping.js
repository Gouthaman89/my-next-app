import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Modal, List, ListItem, ListItemButton, ListItemText, TextField  } from '@mui/material';
import DataTable from '../components/Table/personmaping_DataTable'; // Adjust the path as necessary
import DataForm from '../components/Form/DataForm';
import * as PageController from '../controllers/PageControllers';
import { useAuth } from '../components/AuthContext';
import { useTranslation } from 'react-i18next';
import PersonManagementPopupDataTable from '../components/Table/person_management_popup_datatable';
const Personmaping = () => {
    const endpoint = '/Personmaping_page';
    const endpoint2 = '/person_list_by_org';
    const endpoint3 = '/assign_person_to_org_user' ;
  const { t } = useTranslation(); // Translation hook
     const { personId } = useAuth();
    const [selectedCountyId, setSelectedCountyId] = useState(null);
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]); // State for filtered rows
    const [searchQuery, setSearchQuery] = useState(''); // State for search input
    const [formOpen, setFormOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [showActions, setShowActions] = useState(false); // State to toggle Actions column
    // Add these state variables alongside your existing useState hooks
const [popupRows, setPopupRows] = useState([]); // Data for pop-up table
const [selectedMainRowId, setSelectedMainRowId] = useState(null); // ID from main table row
const [popupOpen, setPopupOpen] = useState(false); // Control pop-up visibility

    const columns = [
       
        { field: 'usercode', label: 'Account Code' },
        { field: 'active', label: 'status' },
        { field: 'passwordreset', label: 'Reset password' },
        { field: 'personame', label: 'User Name' },
        { field: 'useremail', label: 'User E-mail' },
        { field: 'usertel', label: 'User tel-num' },
    ];

    const fields = [
        { name: 'id', label: 'id', required: true },
        { name: 'code', label: 'Code', required: true },
        { name: 'name', label: 'Name', required: false },
        { name: 'useraccount', label: 'User Account', required: true },
        { name: 'role', label: 'Role', required: false, type: 'checkbox' },
    ];

    const loadTableData = () => {
      const queryEndpoint = `${endpoint}?personId=${personId}`;
      PageController.loadData(queryEndpoint, (data) => {
          setRows(data);
          setFilteredRows(data); // Initialize filtered rows
      });
  };

  const loadPopupTableData = async () => {
    const payload = { personId };
    const queryEndpoint = `${endpoint2}?personId=${personId}`;
    PageController.loadData(queryEndpoint, (data) => {
        setPopupRows(data);
    });
};
const handleAddPerson = (row) => {
    setSelectedMainRowId(row.userid); // Store the main table row ID
    setPopupOpen(true); // Open the pop-up modal
    loadPopupTableData(); // Fetch data for the pop-up table
};

  const handleFormChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
      e.preventDefault();
      if (isEdit) {
          PageController.updateRecord(endpoint, formData.id, formData, () => loadTableData(selectedCountyId));
      } else {
          PageController.saveData(endpoint, formData, () => setFormData({}), () => loadTableData(selectedCountyId));
      }
      setFormOpen(false);
  };

  const handleEdit = (row) => {
      setFormData(row);
      setIsEdit(true);
      setFormOpen(true);
  };

  const handleDelete = (row) => {
    const rowId = row.userid;  // Extract the ID from the row object
    console.log('Row ID to delete:', rowId); // Log the row ID for debugging
    PageController.deleteRecord(endpoint, rowId, () => loadTableData(selectedCountyId));
};
  const handlePopupAddPerson = async (selectedRow) => {
    const payload = {
        selectedEmployeeId: selectedRow.id, // ID from pop-up row
        mainRowId: selectedMainRowId, // ID from main table row
    };

    // Reuse the saveData function
    PageController.saveData(
        endpoint3,  // API endpoint
        payload,                // Data to be sent
        () => setPopupOpen(false),  // Reset form or close modal
        loadTableData            // Refresh main table data
    );
};
 

  const handleSearch = (e) => {
      const query = e.target.value.toLowerCase();
      setSearchQuery(query);
      if (query === '') {
          setFilteredRows(rows); // Reset to full data if search query is empty
      } else {
          const filtered = rows.filter(
              (row) =>
                  row.taxcode?.toLowerCase().includes(query) ||
                  row.name?.toLowerCase().includes(query) ||
                  row.rolename?.toLowerCase().includes(query) ||
                  row.useraccount?.toLowerCase().includes(query) ||
                  row.role?.toLowerCase().includes(query)
          );
          setFilteredRows(filtered);
      }
  };
     useEffect(() => {
          loadTableData();
      }, []);

 

  return (
      <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Main Content Area */}
          <Box sx={{ flex: 1, p: 2 }}>
              <Typography variant="h4" gutterBottom>
                  Person Maping
              </Typography>

              {/* Search Bar */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <TextField
                      label="Search"
                      variant="outlined"
                      value={searchQuery}
                      onChange={handleSearch}
                      sx={{ width: '300px' }} // Adjust width as needed
                  />
                  {/* Buttons for Show/Hide Actions */}
                  
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
                   onAddPerson={handleAddPerson} // Pass the "Add Person" handler
                   onDelete={handleDelete}
                   showActions={showActions}
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
                      <DataForm
                          fields={fields}
                          values={formData}
                          onChange={handleFormChange}
                          onSubmit={handleFormSubmit}
                      />
                  </Box>
              </Modal>
              {/* Pop-up Modal for Adding Person */}
              <Modal open={popupOpen} onClose={() => setPopupOpen(false)}>
    <Box
        sx={{
            p: 4,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 1,
            minWidth: '600px',
            maxWidth: '800px',
            margin: 'auto',
            mt: '10%',
        }}
    >
        <Typography variant="h6" gutterBottom>
            {t('Select Person to Assign')}
        </Typography>

        {/* Use the new PersonManagementPopupDataTable */}
        <PersonManagementPopupDataTable
            columns={[
                { field: 'name', label: t('Name') },
                { field: 'tel', label: t('Telephone') },
                { field: 'email', label: t('Email') },
                { field: 'pid', label: t('Employee ID') },
            ]}
            rows={popupRows}
            onAssignPerson={handlePopupAddPerson} // Assign button handler
        />
    </Box>
</Modal>
          </Box>
      </Box>
  );
};

export default Personmaping;