import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Paper, Button, Chip, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ServiceUpdateModal from '../models/ServiceUpdateModal';
import ServiceCreateModal from '../models/ServiceCreateModal';
import Loader from "../components/Loader/loader";
import { useGlobalContext } from './GlobalContext';

const HIGHLIGHT = '#c8e6c9'; // unified selected-row color (same as Vendor)

const ServiceSelector = ({ vendorId, scopeId, onSelectService, readOnly = false }) => {
  const { globalCompanyId, globalOrgId } = useGlobalContext();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const showSnack = (message, severity = 'success') => {
    setSnackbarMsg(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const fetchServices = useCallback(async () => {
    if (!vendorId || !scopeId) return;
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';
    try {
      setIsLoading(true);
      const res = await axios.post(`${baseURL}/scope3_getservice`, {
        idofvender: vendorId,
        idofscope: scopeId,
        idofcompany: globalCompanyId,
        idoforg: globalOrgId
      });
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch services', err);
      setServices([]);
      showSnack('載入服務失敗', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [vendorId, scopeId, globalCompanyId, globalOrgId]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleConfirmCreate = () => {
    showSnack('服務已新增', 'success');
    setShowCreateModal(false);
    fetchServices();
  };

  const handleConfirmUpdate = async (updatedService) => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';
      await axios.post(`${baseURL}/scope3_update_service`, {
        serviceid: updatedService.serviceid,
        servicename: updatedService.servicename,
        productnumber: updatedService.productnumber,
        idofvender: vendorId,
        idofcompany: globalCompanyId,
        idoforg: globalOrgId
      });
      showSnack('服務已更新', 'success');
      setShowUpdateModal(false);
      fetchServices();
    } catch (err) {
      console.error('Failed to update service', err);
      showSnack('更新失敗', 'error');
    }
  };

  const handleDelete = (service) => {
    setServiceToDelete(service);
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';
      await axios.post(`${baseURL}/scope3_delete_service`, {
        serviceid: serviceToDelete.serviceid,
        idofvender: vendorId,
        idofcompany: globalCompanyId,
        idoforg: globalOrgId
      });
      showSnack('服務已刪除', 'success');
      setDeleteConfirm(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (err) {
      console.error('Failed to delete service', err);
      showSnack('刪除失敗', 'error');
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      {isLoading && <Loader />}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
          3. 供應商服務設定
        </Typography>
        {readOnly && <Chip size="small" label="唯讀模式" color="default" />}
      </Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} disabled={readOnly} onClick={() => setShowCreateModal(true)}>
          新增服務
        </Button>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>服務名稱</TableCell>
              <TableCell>產品代碼</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((s) => (
              <TableRow
                key={s.serviceid}
                hover
                selected={selectedService?.serviceid === s.serviceid}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: selectedService?.serviceid === s.serviceid ? HIGHLIGHT : 'inherit',
                  '&:hover': {
                    backgroundColor: selectedService?.serviceid === s.serviceid ? '#b2dfdb' : '#f5f5f5',
                  },
                }}
              >
                <TableCell>{s.servicename}</TableCell>
                <TableCell>{s.productnumber}</TableCell>
                <TableCell align="left">
                  <Button
                    aria-label={`選取服務 ${s.servicename}`}
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setSelectedService(s);
                      onSelectService?.(s);
                    }}
                    sx={{ mr: 1 }}
                  >
                    選取
                  </Button>
                  {!readOnly && (
                    <>
                      <Button
                        aria-label={`編輯服務 ${s.servicename}`}
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedService(s);
                          setShowUpdateModal(true);
                        }}
                        sx={{ mr: 1 }}
                      >
                        編輯
                      </Button>
                      <Button
                        aria-label={`刪除服務 ${s.servicename}`}
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(s)}
                      >
                        刪除
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ServiceCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleConfirmCreate}
        vendorId={vendorId}
        scopeId={scopeId}
      />

      <ServiceUpdateModal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        initialData={selectedService}
        onConfirm={handleConfirmUpdate}
      />

      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <DialogTitle>確認刪除</DialogTitle>
        <DialogContent>確定要刪除此服務？</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>取消</Button>
          <Button color="error" onClick={confirmDelete}>確定</Button>
        </DialogActions>
      </Dialog>

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

export default ServiceSelector;
