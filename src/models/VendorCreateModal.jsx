// src/components/modals/VendorCreateModal.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import axios from 'axios';
import { useGlobalContext } from '../components/GlobalContext';

const VendorCreateModal = ({ open, onClose, onSuccess }) => {

  const { globalCompanyId, globalOrgId } = useGlobalContext();
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';

  const [form, setForm] = useState({ taxcode: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [scopeOptions, setScopeOptions] = useState([]);
  const [selectedScopeId, setSelectedScopeId] = useState('');



  useEffect(() => {
    if (!open) return;
    const fetchScopes = async () => {
      try {
        const res = await axios.get(`${baseURL}/icx_dropdown_scope`);
        setScopeOptions(res.data);
      } catch (err) {
        console.error('Failed to fetch scope options', err);
      }
    };
    fetchScopes();
  }, [open]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.taxcode || !form.name) {
      alert('請填寫完整資料');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${baseURL}/scope3_add_vender`, {
        taxcode: form.taxcode,
        name: form.name,
        idofscope: selectedScopeId,
        idofcompany: globalCompanyId,
        idoforg: globalOrgId,
        idofcreatecomp: globalCompanyId
      });
      alert('新增成功');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('新增失敗', err);
      alert('新增失敗');
    } finally {
      setLoading(false);
    }
  };



  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>新增供應商</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="統一編號"
          value={form.taxcode}
          onChange={handleChange('taxcode')}
        />
        <TextField
          fullWidth
          margin="normal"
          label="供應商名稱"
          value={form.name}
          onChange={handleChange('name')}
        />
        <TextField
          fullWidth
          select
          label="範疇名稱"
          value={selectedScopeId}
          onChange={(e) => setSelectedScopeId(e.target.value)}
          margin="normal"
        >
          {scopeOptions.map((option) => (
            <MenuItem key={option.scopeid} value={option.scopeid}>
              {option.scopename}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          確定新增
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VendorCreateModal;
