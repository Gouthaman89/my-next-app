import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Container, Paper, Typography, Alert, TextField, MenuItem } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EmployeeAttendanceController from '../controllers/EmployeeAttendanceController';
import EmployeeAttendanceTable from '../components/EmployeeAttendanceTable';
import AddAttendanceModal from '../components/AddAttendanceModal';
import AttendanceCsvUploader from '../components/AttendanceCsvUploader';
import DeleteAttendanceModal from '../components/DeleteAttendanceModal';
import Loader from '../components/Loader/loader';
import { useGlobalContext } from '../components/GlobalContext';
import { useTranslation } from 'react-i18next';
import SyncIcon from '@mui/icons-material/Sync';
import { CircularProgress } from '@mui/material';

const EmployeeAttendancePage = () => {
const [data, setData] = useState([]);
const [showModal, setShowModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const { globalOrgId } = useGlobalContext();
 const { t } = useTranslation();
 const [year, setYear] = useState(new Date().getFullYear());
const [month, setMonth] = useState(new Date().getMonth() + 1);
const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const disableSync = data.length === 0 && data.some((d) => d.status?.startsWith('X'));
const [hasSyncedPdf, setHasSyncedPdf] = useState(false);
const [hasSyncedProcessing, setHasSyncedProcessing] = useState(false);
const checkSyncedProcessing = useCallback(async () => {
  try {
    const res = await EmployeeAttendanceController.checkSyncedProcessing(globalOrgId, year, month);
    setHasSyncedProcessing(Array.isArray(res) && res.length > 0);
    console.log('Sync processing status:', res);
  } catch (error) {
    console.error('Failed to check existing Sync:', error);
  }
}, [globalOrgId, year, month]);

const loadRecords = useCallback(async (orgId, yearParam = year, monthParam = month) => {
  if (!orgId) return;
  setLoading(true);
  setError(null);
  try {
    const result = await EmployeeAttendanceController.getRecords(orgId, yearParam, monthParam);
    setData(result);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [year, month]);

useEffect(() => {
  loadRecords(globalOrgId, year, month);
}, [globalOrgId, year, month, loadRecords]);
const showSync =
  data.length > 0 &&          // table is not empty
  !data.some(d =>             // and no status starts with 'X'
    d.status?.startsWith('X')
  );
  useEffect(() => {
  const checkSyncedPdf = async () => {
    try {
      const res = await EmployeeAttendanceController.checkSyncedPdf(globalOrgId, year, month);
      setHasSyncedPdf(Array.isArray(res) && res.length > 0);
    } catch (error) {
      console.error('Failed to check existing PDF:', error);
    }
  };
  checkSyncedPdf();
}, [globalOrgId, year, month]);
  useEffect(() => {
  checkSyncedProcessing();
}, [checkSyncedProcessing]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {loading && <Loader />}

      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            pb: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            員工出勤資訊
          </Typography>
<Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 }, flexWrap: 'wrap' }}>
  <TextField
    select
    size="small"
    label="年份"
    value={year}
    onChange={(e) => setYear(e.target.value)}
    sx={{ minWidth: 100 }}
  >
    {years.map((y) => (
      <MenuItem key={y} value={y}>
        {y}
      </MenuItem>
    ))}
  </TextField>

  <TextField
    select
    size="small"
    label="月份"
    value={month}
    onChange={(e) => setMonth(e.target.value)}
    sx={{ minWidth: 90 }}
  >
    {months.map((m) => (
      <MenuItem key={m} value={m}>
        {m}
      </MenuItem>
    ))}
  </TextField>

  

  <Button
    variant="outlined"
    startIcon={<RefreshIcon />}
    onClick={async () => {
      await loadRecords(globalOrgId, year, month);
      await checkSyncedProcessing();
    }}
  >
    重新整理
  </Button>

  <Button
    variant="outlined"
    onClick={() => (window.location.href = '/attendance_template.csv')}
  >
    {t('Download Sample')}
  </Button>

  <AttendanceCsvUploader onSuccess={() => loadRecords(globalOrgId)} />

  <Button
    variant="outlined"
    color="error"
    onClick={() => setShowDeleteModal(true)}
  >
    刪除出勤資料
  </Button>

<Button
  variant="outlined"
  color="primary"
  startIcon={<SyncIcon />}
  disabled={!showSync || hasSyncedProcessing}
  onClick={async () => {
    if (hasSyncedProcessing) return;
    try {
      await EmployeeAttendanceController.syncScope3Commuting(globalOrgId, year, month);
      console.log('Synchronization completed');
      loadRecords(globalOrgId, year, month);
      await checkSyncedProcessing();
    } catch (error) {
      console.error('Synchronization failed:', error);
    }
  }}
>
  {hasSyncedProcessing ? (
    <>
      <CircularProgress size={18} sx={{ mr: 1 }} />
      處理中...
    </>
  ) : (
    '產生碳排活動數據'
  )}
</Button>
    {hasSyncedPdf && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        已產生報告，無需再次同步。
      </Typography>
    )}
  
</Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <EmployeeAttendanceTable data={data} refresh={() => loadRecords(globalOrgId, year, month)} />
      </Paper>

      <AddAttendanceModal
        open={showModal}
        onClose={() => setShowModal(false)}
        refresh={() => loadRecords(globalOrgId)}
      />
 <DeleteAttendanceModal
  open={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onSuccess={() => loadRecords(globalOrgId)}
  year={year}
  month={month}
/>
    </Container>
  );
};

export default EmployeeAttendancePage;