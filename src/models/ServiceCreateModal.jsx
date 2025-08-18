import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material';
import axios from 'axios';
import { useGlobalContext } from '../components/GlobalContext';

const ServiceCreateModal = ({ open, onClose, onSuccess, vendorId, scopeId }) => {
  const { globalCompanyId } = useGlobalContext();
  const [form, setForm] = useState({
    name: '',
    productnumber: ''
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleConfirm = async () => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';

    try {
      await axios.post(`${baseURL}/scope3_add_service`, {
        idofvender: vendorId,
        productnumber: form.productnumber,
        name: form.name,
        idofcompany: globalCompanyId,
        idofscope: scopeId
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to add service', err);
      alert('新增服務失敗');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>新增服務</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            margin="dense"
            label="服務名稱"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="產品編號"
            name="productnumber"
            value={form.productnumber}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleConfirm} variant="contained">確認</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceCreateModal;
