import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import axios from 'axios';

const ScopeUpdateModal = ({ open, onClose, onConfirm, initialData }) => {
  const [scopeOptions, setScopeOptions] = useState([]);
  const [selectedScopeId, setSelectedScopeId] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';
      const url = `${baseURL}/icx_dropdown_scope`;

      try {
        const res = await axios.get(url);
        setScopeOptions(res.data);
      } catch (err) {
        console.error('Failed to load scope options', err);
        setScopeOptions([]);
      }
    };

    if (open) fetchOptions();
  }, [open]);

  useEffect(() => {
    if (initialData?.scopeid) {
      setSelectedScopeId(initialData.scopeid);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (onConfirm && selectedScopeId) {
      onConfirm({
        ...initialData,
        scopeid: selectedScopeId
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
          選擇新的範疇類型
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>範疇名稱</InputLabel>
          <Select
            value={selectedScopeId}
            label="範疇名稱"
            onChange={(e) => setSelectedScopeId(e.target.value)}
          >
            {scopeOptions.map(opt => (
              <MenuItem key={opt.scopeid} value={opt.scopeid}>
                {opt.scopename}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            取消
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!selectedScopeId}>
            確定修改
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ScopeUpdateModal;
