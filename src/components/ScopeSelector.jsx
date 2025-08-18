import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Paper, Button, Chip, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ScopeUpdateModal from '../models/ScopeUpdateModal';
import ScopeCreateModal from '../models/ScopeCreateModal';
import { useGlobalContext } from '../components/GlobalContext';
import Loader from "../components/Loader/loader";

const HIGHLIGHT = '#c8e6c9'; // unified selected-row color (same as Vendor)

const ScopeSelector = ({ vendorId, onSelectScope, readOnly = false }) => {
  const { globalOrgId } = useGlobalContext();
  const [scopes, setScopes] = useState([]);
  const [selectedScope, setSelectedScope] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const showSnack = (message, severity = 'success') => {
    setSnackbarMsg(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const fetchScopes = useCallback(async () => {
    if (!vendorId) return;
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';
    const url = `${baseURL}/scope3_getvender2`;
    try {
      setIsLoading(true);
      const res = await axios.post(url, { idofvender: vendorId, idoforg: globalOrgId });
      setScopes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch scopes', err);
      setScopes([]);
      showSnack('載入範疇失敗', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [vendorId, globalOrgId]);

  useEffect(() => { fetchScopes(); }, [fetchScopes]);

  const handleUpdate = (scope) => {
    setSelectedScope(scope);
    setShowModal(true);
  };

  const handleConfirmUpdate = async (updatedScope) => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';
      const url = `${baseURL}/scope3_update_scope`;
      await axios.post(url, {
        uuid: updatedScope.venderscopetypeid,
        typename: updatedScope.typename,
        idofvender: vendorId,
        idofscope: updatedScope.scopeid,
        idoforg: globalOrgId
      });
      showSnack('範疇已更新', 'success');
      setShowModal(false);
      fetchScopes();
    } catch (err) {
      console.error('Failed to update scope', err);
      showSnack('更新失敗', 'error');
    }
  };

  const handleConfirmCreate = async (newScope) => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';
      const url = `${baseURL}/scope3_add_scope`;
      await axios.post(url, {
        idofvender: vendorId,
        idofscope: newScope.idofscope,
        idoforg: globalOrgId
      });
      showSnack('範疇已新增', 'success');
      setShowCreateModal(false);
      fetchScopes();
    } catch (err) {
      console.error('Failed to create scope', err);
      showSnack('新增失敗', 'error');
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      {isLoading && <Loader />}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
          2. 供應商範疇設定
        </Typography>
        {readOnly && <Chip size="small" label="唯讀模式" color="default" />}
      </Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} disabled={readOnly} onClick={() => setShowCreateModal(true)}>
          新增範疇
        </Button>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>範疇類型名稱</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scopes.map((s) => (
              <TableRow
                key={s.scopeid}
                hover
                selected={selectedScope?.scopeid === s.scopeid}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: selectedScope?.scopeid === s.scopeid ? HIGHLIGHT : 'inherit',
                  '&:hover': {
                    backgroundColor: selectedScope?.scopeid === s.scopeid ? '#b2dfdb' : '#f5f5f5',
                  },
                }}
              >
                <TableCell>{s.typename}</TableCell>
                <TableCell align="left">
                  <Button
                    aria-label={`選取範疇 ${s.typename}`}
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setSelectedScope(s);
                      onSelectScope?.(s.scopeid);
                    }}
                    sx={{ mr: 1 }}
                  >
                    選取
                  </Button>
                  {!readOnly && (
                    <Button
                      aria-label={`編輯範疇 ${s.typename}`}
                      variant="outlined"
                      size="small"
                      onClick={() => handleUpdate(s)}
                    >
                      編輯
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ScopeUpdateModal
        open={showModal}
        onClose={() => setShowModal(false)}
        initialData={selectedScope}
        onConfirm={handleConfirmUpdate}
      />

      <ScopeCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleConfirmCreate}
        vendorId={vendorId}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ScopeSelector;
