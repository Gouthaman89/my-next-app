import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, IconButton, Button, Paper } from '@mui/material';
import { getData, updateData } from '../controllers/PageControllers';
import { useGlobalContext } from './GlobalContext';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const VendorServiceList = ({ vendorId, scopeId }) => {
  const { globalCompanyId } = useGlobalContext();
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedService, setEditedService] = useState({});

  useEffect(() => {
    const fetchServices = async () => {
      if (!vendorId || !scopeId) return;
      try {
        const res = await getData('scope3_getservice', { idofvender: vendorId, idofscope: scopeId });
        setServices(res);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };
    fetchServices();
  }, [vendorId, scopeId]);

  const handleEdit = (service) => {
    setEditing(service.uuid);
    setEditedService({
      name: service.name,
      productnumber: service.productnumber,
    });
  };

  const handleSave = async (serviceId) => {
    try {
      await updateData('materialofsmb', {
        uuid: serviceId,
        idofvender: vendorId,
        name: editedService.name,
        productnumber: editedService.productnumber,
        idofcompany: globalCompanyId,
      });
      alert('✅ Service updated');
      setEditing(null);
    } catch (err) {
      console.error('❌ Update failed', err);
      alert('❌ Failed to update');
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6">Vendor Service Management</Typography>
      <Box>
        {services.map((svc) => (
          <Box key={svc.uuid} sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 1 }}>
            {editing === svc.uuid ? (
              <>
                <TextField
                  label="Service Name"
                  value={editedService.name}
                  onChange={(e) => setEditedService((prev) => ({ ...prev, name: e.target.value }))}
                  size="small"
                />
                <TextField
                  label="Product Number"
                  value={editedService.productnumber}
                  onChange={(e) => setEditedService((prev) => ({ ...prev, productnumber: e.target.value }))}
                  size="small"
                />
                <IconButton onClick={() => handleSave(svc.uuid)}><SaveIcon /></IconButton>
              </>
            ) : (
              <>
                <Typography>{svc.name}</Typography>
                <Typography>({svc.productnumber})</Typography>
                <IconButton onClick={() => handleEdit(svc)}><EditIcon /></IconButton>
              </>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default VendorServiceList;