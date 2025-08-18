import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import { useRef } from 'react';
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
  TableBody
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react';

const Report2List2 = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const headers = [
    { key: 'certificate', label: t('certificate') },
    { key: 'competent', label: t('competent') },
    { key: 'city', label: t('city') },
    { key: 'area', label: t('area') },
    { key: 'postcode', label: t('postcode') },
    { key: 'neighborhood', label: t('neighborhood') },
    { key: 'village', label: t('village') },
    { key: 'address', label: t('address') },
    { key: 'combinname', label: t('combinname') },
    { key: 'combinname2', label: t('combinname2') },
    { key: 'combinname3', label: t('combinname3') }
  ];

  const router = useRouter();
  const { version } = router.query;
  const { globalReportId, globalOrgId, globalYear } = useGlobalContext();

  const tableRef = useRef(null);

  useEffect(() => {
    if (globalReportId && globalOrgId && globalYear) {
      axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_list2`, {
        reportId: globalReportId,
        orgId: globalOrgId,
        year: globalYear,
        language: i18n.language,
        version
      })
        .then(res => setRows(res.data))
        .catch(err => console.error('Error fetching report2_list2:', err))
        .finally(() => setLoading(false));
    }
  }, [globalReportId, globalOrgId, globalYear, version]);

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" align="center" gutterBottom>
        {t('section2')}
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
    </Box>
  );
});

export default Report2List2;