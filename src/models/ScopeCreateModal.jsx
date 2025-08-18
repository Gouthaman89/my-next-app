import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem
} from '@mui/material';
import axios from 'axios';
import { useGlobalContext } from '../components/GlobalContext';

const ScopeCreateModal = ({ open, onClose, onCreated, vendorId }) => {
  const { globalCompanyId, globalOrgId } = useGlobalContext();
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';

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

  const handleConfirm = async () => {
    try {
      const url = `${baseURL}/scope3_add_scope`;
      await axios.post(url, {
        idofvender: vendorId,
        idofscope: selectedScopeId,
        idoforg: globalOrgId,
        idofcreatecomp: globalCompanyId
      });
      alert('Scope created');
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create scope', err);
      alert('Create failed');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>新增範疇</DialogTitle>
      <DialogContent>
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
        <Button variant="contained" onClick={handleConfirm} disabled={!selectedScopeId}>新增</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScopeCreateModal;
