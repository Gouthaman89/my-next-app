import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import VendorUpdateModal from '../models/VendorUpdateModal';
import VendorCreateModal from '../models/VendorCreateModal';
import { useGlobalContext } from '../components/GlobalContext';

import Loader from "../components/Loader/loader";


const VendorSelector = ({ onSelect, onModeChange }) => {
  const { globalOrgId , globalCompanyId } = useGlobalContext();
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' | 'error' | 'info' | 'warning'

  const [isReadOnly, setIsReadOnly] = useState(false);

  const tableRef = useRef();

  const showSnack = (message, severity = 'success') => {
    setSnackbarMsg(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const fetchVendors = async () => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';
    setIsLoading(true);
    try {
      if (tableRef.current && $.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      const res = await axios.post(`${baseURL}/scope3_getvender`, { idoforg: globalOrgId });
      setVendors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch vendors', err);
      setVendors([]);
      showSnack('載入供應商失敗', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOtherCompanyVendors = async () => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';
    setIsLoading(true);
    try {
      if (tableRef.current && $.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      // Adjust payload as needed by your backend; using org & company context here
      const res = await axios.post(`${baseURL}/scope3_getvender_othercompany`, {
        idoforg: globalOrgId,
        idofcreatecomp: globalCompanyId
      });
      setVendors(Array.isArray(res.data) ? res.data : []);
      setIsReadOnly(true);
      if (onModeChange) onModeChange(true);
      showSnack('已載入其他公司供應商（唯讀）', 'info');
    } catch (err) {
      console.error('Failed to fetch other company vendors', err);
      setVendors([]);
      showSnack('載入其他公司供應商失敗', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCompanyView = async () => {
    if (isReadOnly) {
      setIsReadOnly(false);
      if (onModeChange) onModeChange(false);
      await fetchVendors();
      showSnack('已切換回本公司清單', 'info');
    } else {
      await fetchOtherCompanyVendors();
    }
  };

  useEffect(() => {
    if (globalOrgId) {
      setIsReadOnly(false);
      if (onModeChange) onModeChange(false);
      fetchVendors();
    }
  }, [globalOrgId]);

  useEffect(() => {
    if (!tableRef.current) return;
    const $table = $(tableRef.current);
    if ($.fn.DataTable.isDataTable($table)) {
      $table.DataTable().clear().destroy();
    }
    if (vendors.length) {
      $table.DataTable({ pageLength: 5 });
    }
  }, [vendors]);

  useEffect(() => {
    return () => {
      if (tableRef.current && $.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
    };
  }, []);

  const selectVendorById = (uuid) => {
    const vendor = vendors.find(v => v.uuid === uuid) || null;
    setSelectedVendor(vendor);
    if (onSelect) onSelect(vendor);
  };

  const handleUpdate = (vendor) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  const handleConfirmUpdate = async (updatedVendor) => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';
    setIsLoading(true);
    try {
      await axios.post(`${baseURL}/scope3_update_vender`, {
        uuid: updatedVendor.uuid,
        taxcode: updatedVendor.taxcode,
        name: updatedVendor.name,
        idofvender: updatedVendor.uuid,
        idofcreatecomp: globalCompanyId
      });
      showSnack('供應商已更新', 'success');
      setShowModal(false);
      await fetchVendors();
    } catch (err) {
      console.error('Failed to update vendor', err);
      showSnack('更新失敗', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (vendor) => {
    setVendorToDelete(vendor);
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';
    setIsLoading(true);
    try {
      await axios.post(`${baseURL}/scope3_delete_vender`, {
        uuid: vendorToDelete.uuid,
        idofvender: vendorToDelete.uuid,
        idofcreatecomp: globalCompanyId
      });
      setDeleteConfirm(false);
      setVendorToDelete(null);
      showSnack('供應商已刪除', 'success');
      await fetchVendors();
    } catch (err) {
      console.error('Failed to delete vendor', err);
      showSnack('刪除失敗', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      {isLoading && <Loader />}
      <Typography variant="h6" gutterBottom>
        供應商管理設定
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} disabled={isLoading || isReadOnly} onClick={() => setShowCreateModal(true)}>
          新增供應商
        </Button>
        <Button
          sx={{ ml: 1 }}
          variant="outlined"
          disabled={isLoading}
          onClick={handleToggleCompanyView}
        >
          {isReadOnly ? '返回本公司清單' : '載入其他公司供應商'}
        </Button>
      </Box>
      {isReadOnly && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          目前顯示的是「其他公司」的供應商清單：僅可選取，無法編輯或刪除。
        </Typography>
      )}
        <Table size="small" ref={tableRef}>
          <TableHead>
            <TableRow>
              <TableCell>名稱</TableCell>
              <TableCell>統編</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendors.map((v) => (
              <TableRow
                key={v.uuid}
                hover
                selected={selectedVendor?.uuid === v.uuid}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: selectedVendor?.uuid === v.uuid ? '#c8e6c9' : 'inherit',
                  '&:hover': {
                    backgroundColor: selectedVendor?.uuid === v.uuid ? '#b2dfdb' : '#f5f5f5',
                  },
                }}
              >
                <TableCell>{v.name}</TableCell>
                <TableCell>{v.taxcode}</TableCell>
                <TableCell align="left">
                  <Button
                    size="small"
                    variant="contained"
                    disabled={isLoading}
                    onClick={() => selectVendorById(v.uuid)}
                    sx={{ mr: 1 }}
                  >
                    選取
                  </Button>
                  {!isReadOnly && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={isLoading}
                        onClick={() => handleUpdate(v)}
                        sx={{ mr: 1 }}
                      >
                        編輯
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={isLoading}
                        onClick={() => handleDelete(v)}
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

      <VendorUpdateModal
        open={showModal}
        onClose={() => setShowModal(false)}
        initialData={selectedVendor}
        onConfirm={handleConfirmUpdate}
      />

      <VendorCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchVendors}
      />

      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <DialogTitle>確認刪除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            確定要刪除供應商「{vendorToDelete?.name}」嗎？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>取消</Button>
          <Button onClick={confirmDelete} color="error">確定刪除</Button>
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

export default VendorSelector;
