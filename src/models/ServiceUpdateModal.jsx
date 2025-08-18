import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

const ServiceUpdateModal = ({ open, onClose, onConfirm, initialData }) => {
  const [form, setForm] = useState({ servicename: '', productnumber: '' });

  useEffect(() => {
    if (initialData) {
      setForm({
        serviceid: initialData.serviceid,
        servicename: initialData.servicename || '',
        productnumber: initialData.productnumber || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (onConfirm) {
      onConfirm({
        ...initialData, // includes uuid, serviceid, etc.
        servicename: form.servicename,
        productnumber: form.productnumber
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        p: 4,
        backgroundColor: 'white',
        borderRadius: 2,
        width: 400,
        mx: 'auto',
        my: '20vh',
        boxShadow: 24,
      }}>
        <Typography variant="h6" gutterBottom>
          編輯服務資訊
        </Typography>

        <TextField
          label="服務名稱"
          name="servicename"
          fullWidth
          value={form.servicename}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="產品代碼"
          name="productnumber"
          fullWidth
          value={form.productnumber}
          onChange={handleChange}
          margin="normal"
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            取消
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            確定修改
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ServiceUpdateModal;
