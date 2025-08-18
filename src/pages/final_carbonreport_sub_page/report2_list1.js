import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useRef
} from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useGlobalContext } from '../../components/GlobalContext';
import {
  Box,
  Typography,
  CircularProgress,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/dataTables.dataTables.css';

const Report2List1 = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const headers = [
    { key: 'carbonyear', label: t('carbonyear') },
    { key: 'controlno', label: t('controlno') },
    { key: 'companyname', label: t('companyname') },
    { key: 'taxcode', label: t('taxcode') },
    { key: 'organizationcode', label: t('organizationcode') },
    { key: 'owner', label: t('owner') },
    { key: 'contactname', label: t('contactname') },
    { key: 'tel', label: t('tel') },
    { key: 'email', label: t('email') },
    { key: 'fax', label: t('fax') },
    { key: 'mobile', label: t('mobile') },
    { key: 'industrycode', label: t('industrycode') },
    { key: 'industryname', label: t('industryname') },
    { key: 'reason', label: t('reason') },
    { key: 'accordto', label: t('accordto') },
    { key: 'ispermit', label: t('ispermit') },
    { key: 'institution', label: t('institution') },
    { key: 'comment', label: t('comment') }
  ];

  const router = useRouter();
  const { version } = router.query;
  const { globalReportId, globalOrgId, globalYear, globalYearid } = useGlobalContext();

  const tableRef = useRef(null);

  useEffect(() => {
    if (globalReportId && globalOrgId && globalYear) {
      axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_list1`, {
        reportId: globalReportId,
        orgId: globalOrgId,
        yearid: globalYearid,
        year: globalYear,
        version,
        language: i18n.language
      })
        .then(res => setRows(res.data))
        .catch(err => console.error('Error fetching report2_list1:', err))
        .finally(() => setLoading(false));
    }
  }, [globalReportId, globalOrgId, globalYear, version]);
console.log(i18n.language);

  useEffect(() => {
    if (!loading && tableRef.current) {
      if ($.fn.DataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      $(tableRef.current).DataTable();
    }
  }, [loading, rows]);

  // Expose rows to parent via ref for Excel export
  useImperativeHandle(ref, () => ({
    getRows: () => rows
  }), [rows]);

  return (
  <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      
    <Typography variant="h5" align="center" gutterBottom>
      {t('section1')}
    </Typography>
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    ) : (
      <Box sx={{ overflowX: 'auto', mt: 2 }}>
        <table ref={tableRef} className="display" style={{ width: '1850px' }}>
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h.key} style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map(h => (
                  <td key={h.key}>{row[h.key] || ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    )}
  </Paper>
);
});

export default Report2List1;