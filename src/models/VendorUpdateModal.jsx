import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

const VendorUpdateModal = ({ open, onClose, onConfirm, initialData }) => {
  const [form, setForm] = useState({ taxcode: '', name: '' });

  useEffect(() => {
    if (initialData) {
      setForm({
        taxcode: initialData.taxcode || '',
        name: initialData.name || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (onConfirm) {
      onConfirm({
        ...initialData,
        taxcode: form.taxcode,
        name: form.name
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
          編輯供應商資訊
        </Typography>

        <TextField
          label="統一編號"
          name="taxcode"
          fullWidth
          value={form.taxcode}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="供應商名稱"
          name="name"
          fullWidth
          value={form.name}
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

export default VendorUpdateModal;
