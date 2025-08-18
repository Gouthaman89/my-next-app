import React, { useCallback,useState, useEffect } from "react";
import { Box, Button, Container, Paper, Typography, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EmployeeCommuteController from "../controllers/EmployeeCommuteController";
import EmployeeCommuteTable from "../components/EmployeeCommuteTable";
import AddCommuteModal from "../components/AddCommuteModal";
import { useGlobalContext } from "../components/GlobalContext";
import Loader from "../components/Loader/loader";
import CommuteCsvUploader from '../components/CommuteCsvUploader';
import { useTranslation } from 'react-i18next';


const EmployeeCommutePage = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { globalOrgId } = useGlobalContext();
  const { t } = useTranslation();

const loadCommutes = useCallback(async (orgId) => {
  setLoading(true);
  setError(null);
  try {
    const result = await EmployeeCommuteController.getCommutes(orgId);
    setData(result);
  } catch (err) {
    setError("Failed to load commutes");
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    if (globalOrgId) {
      loadCommutes(globalOrgId);
    }
  }, [globalOrgId]);

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
    {t('員工通勤主檔')}
  </Typography>

  <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => setShowModal(true)}
    >
      新增通勤資料
    </Button>
    <Button
      variant="outlined"
      startIcon={<RefreshIcon />}
      onClick={() => loadCommutes(globalOrgId)}
    >
      重新整理
    </Button>
    <Button
      variant="outlined"
      onClick={() => (window.location.href = '/employee_template.csv')}
    >
      {t('Download Sample')}
    </Button>
    <CommuteCsvUploader onSuccess={() => loadCommutes(globalOrgId)} />
  </Box>
</Box>
      <EmployeeCommuteTable data={data} refresh={() => loadCommutes(globalOrgId)} />
        </Paper>
      <AddCommuteModal
  show={showModal}
  onClose={() => setShowModal(false)}
  refresh={loadCommutes}
/>
    </Container>
  );
};

export default EmployeeCommutePage;
