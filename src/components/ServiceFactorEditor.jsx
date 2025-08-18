import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FactorUpdateModal from '../models/FactorUpdateModal';
import FactorCreateModal from '../models/FactorCreateModal';
import FactorVersionManagerModal from '../models/FactorVersionManagerModal';
import Loader from "../components/Loader/loader";
import { useGlobalContext } from './GlobalContext';

const HIGHLIGHT = '#c8e6c9'; // unified selected-row color

const ServiceFactorEditor = ({ vendorId, scopeId, serviceId, selectedServiceData, readOnly = false }) => {
  const { globalCompanyId, globalOrgId } = useGlobalContext();
  const [factorData, setFactorData] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [rowToUpdate, setRowToUpdate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const showSnack = (message, severity = 'success') => {
    setSnackbarMsg(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const fetchFactors = useCallback(async () => {
    if (!serviceId || !vendorId || !scopeId) return;
    setIsLoading(true);
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';
    const url = `${baseURL}/scope3_getvenderdetail`;
    try {
      const res = await axios.post(url, {
        serviceid: serviceId,
        idofvender: vendorId,
        idofscope: scopeId,
        idofcompany: globalCompanyId,
        idoforg: globalOrgId
      });
      setFactorData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load service factors', err);
      setFactorData([]);
      showSnack('載入係數失敗', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [vendorId, scopeId, serviceId, globalCompanyId, globalOrgId]);

  useEffect(() => { fetchFactors(); }, [fetchFactors]);

  const handleUpdate = (row) => {
    if (row.canedit !== 'V' || readOnly) return;
    setRowToUpdate(row);
    setShowUpdateModal(true);
  };

  const handleDelete = (row) => {
    if (row.canedit !== 'V' || readOnly) return;
    setRowToDelete(row);
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!rowToDelete) return;
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';
    const url = `${baseURL}/scope3_delete_factor`;
    try {
      await axios.post(url, rowToDelete);
      showSnack('係數已刪除', 'success');
      setDeleteConfirm(false);
      setRowToDelete(null);
      fetchFactors();
    } catch (err) {
      console.error('Delete failed', err);
      showSnack('刪除失敗', 'error');
    }
  };

  const confirmUpdate = async (updatedRow) => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:1880';
    const url = `${baseURL}/scope3_update_factor`;
    try {
      await axios.post(url, updatedRow);
      showSnack('係數已更新', 'success');
      setShowUpdateModal(false);
      setRowToUpdate(null);
      fetchFactors();
    } catch (err) {
      console.error('Update failed', err);
      showSnack('更新失敗', 'error');
    }
  };

  const confirmCreate = () => {
    setShowCreateModal(false);
    fetchFactors();
    showSnack('係數已新增', 'success');
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      {isLoading && <Loader />}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
          4. 供應商係數設定
        </Typography>
        {readOnly && <Chip size="small" label="唯讀模式" color="default" />}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" disabled={readOnly} onClick={() => setShowVersionModal(true)}>
          係數版本管理
        </Button>
        &nbsp;
        <Button variant="contained" startIcon={<AddIcon />} disabled={readOnly} onClick={() => setShowCreateModal(true)}>
          新增係數
        </Button>
      </Box>

      <TableContainer>
        <Table size="small" sx={{ tableLayout: 'auto', whiteSpace: 'nowrap' }}>
          <TableHead>
            <TableRow>
              <TableCell>版本</TableCell>
              <TableCell>名稱</TableCell>
              <TableCell>係數值</TableCell>
              <TableCell>係數單位</TableCell>
              <TableCell>對應氣體</TableCell>
              <TableCell>係數等級</TableCell>
              <TableCell>備註</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {factorData.map((row, index) => (
              <TableRow
                key={row.uuid || index}
                hover
                selected={selectedRowId === row.uuid}
                onClick={() => setSelectedRowId(row.uuid)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: selectedRowId === row.uuid ? HIGHLIGHT : 'inherit',
                  '&:hover': {
                    backgroundColor: selectedRowId === row.uuid ? '#b2dfdb' : '#f5f5f5',
                  },
                }}
              >
                <TableCell>{row.pkgversion}</TableCell>
                <TableCell>{row.pkgname}</TableCell>
                <TableCell>{row.factor}</TableCell>
                <TableCell>{row.unitname}</TableCell>
                <TableCell>{row.gasname}</TableCell>
                <TableCell>{row.nameofleveloffactor}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell align="left">
                  {!readOnly && row.canedit === 'V' && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdate(row);
                        }}
                        sx={{ mr: 1 }}
                      >
                        編輯
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(row);
                        }}
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

      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <DialogTitle>確認刪除</DialogTitle>
        <DialogContent>確定要刪除此係數？</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>取消</Button>
          <Button color="error" onClick={confirmDelete}>確定</Button>
        </DialogActions>
      </Dialog>

      <FactorUpdateModal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={confirmUpdate}
        initialData={rowToUpdate}
      />

      <FactorCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={confirmCreate}
        vendorId={vendorId}
        scopeId={scopeId}
        serviceId={serviceId}
        selectedServiceData={selectedServiceData}
      />

      <FactorVersionManagerModal
        open={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        vendorId={vendorId}
        scopeId={scopeId}
        serviceId={serviceId}
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

export default ServiceFactorEditor;
