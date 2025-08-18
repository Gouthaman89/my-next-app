import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/dataTables.dataTables.css';

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
  TableBody
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const Report2List6 = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const tableRef = useRef(null);

  const headers = [
    { key: 'processno', label: t('processno') },
    { key: 'processcode', label: t('processcode') },
    { key: 'assetno', label: t('assetno') },
    { key: 'assetcode', label: t('assetcode') },
    { key: 'objectcode', label: t('objectcode') },
    { key: 'objectname', label: t('objectname') },
    { key: 'errorlevel', label: t('errorlevel') },
    { key: 'reliability', label: t('reliability') },
    { key: 'correctionlevel', label: t('correctionlevel') },
    { key: 'credibility', label: t('credibility') },
    { key: 'owner', label: t('owner') },
    { key: 'isdirect', label: t('isdirect') },
    { key: 'scopetype', label: t('scopesubtype') },
    { key: 'categoryofds', label: t('catogoryofds') },
    { key: 'errorfactorlevel', label: t('errorlevel2') },
    { key: 'errorleveltotal', label: t('errorleveltotal') },
    { key: 'emissionpercentage', label: t('emissionpercentage') },
    { key: 'scorerange', label: t('scorerange') },
    { key: 'weightavg', label: t('weightavg') }
  ];

  const router = useRouter();
  const { version } = router.query;
  const { globalReportId, globalOrgId, globalYear } = useGlobalContext();

  useEffect(() => {
    if (globalReportId && globalOrgId && globalYear) {
      axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_list6`, {
        reportId: globalReportId,
        orgId: globalOrgId,
        year: globalYear,
        language: i18n.language,
        version
      })
        .then(res => {
          const data = res.data || [];
          const totalCo2e = data.reduce((sum, row) => sum + (parseFloat(row.co2e) || 0), 0);
          const updatedRows = data.map(row => {
            const co2e = parseFloat(row.co2e) || 0;
            const emissionpercentage = totalCo2e ? (co2e / totalCo2e * 100) : 0;
            const errorleveltotal = parseFloat(row.errorleveltotal) || 0;
            const weightavg = ((errorleveltotal * emissionpercentage) / 100).toFixed(2);
            return {
              ...row,
              emissionpercentage: emissionpercentage.toFixed(2) + '%',
              weightavg
            };
          });
          setRows(updatedRows);
        })
        .catch(err => {
          console.error('Error fetching report2_list6:', err);
          setRows([]); // Ensure rows is defined to prevent empty export
        })
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
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
       
      <Typography variant="h5" align="center" gutterBottom>
        {t('section6')}
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

export default Report2List6;