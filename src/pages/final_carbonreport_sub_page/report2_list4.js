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
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/dataTables.dataTables.css';

const Report2List4 = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const tableRef = useRef();

  const headers = [
    { key: 'processno', label: t('processno') },
    { key: 'processcode', label: t('processcode') },
    { key: 'processname', label: t('processname') },
    { key: 'assetno', label: t('assetno') },
    { key: 'assetcode', label: t('assetcode') },
    { key: 'assetname', label: t('assetname') },
    { key: 'objecttype', label: t('objecttype') },
    { key: 'objectcode', label: t('objectcode') },
    { key: 'objectname', label: t('objectname') },
    { key: 'isbiomess', label: t('isbiomess') },
    { key: 'isdirect', label: t('isdirect') },
    { key: 'scopetype', label: t('scopetype') },
    { key: 'scopesubtype', label: t('scopesubtype') },
    { key: 'scope2provider', label: t('scope2provider') },
    { key: 'amount', label: t('amount') },
    { key: 'unitname', label: t('unitname') },
    { key: 'percentage', label: t('percentage') },
    { key: 'otherunit', label: t('otherunit') },
    { key: 'dsname', label: t('dsname') },
    { key: 'dep', label: t('dep') },
    { key: 'measurefreq', label: t('measurefreq') },
    { key: 'measureequip', label: t('measureequip') },
    { key: 'correctionfreq', label: t('correctionfreq') },
    { key: 'emissionmethod', label: t('emissionmethod') },
    { key: 'lhv', label: t('lhv') },
    { key: 'lhvunit', label: t('lhvunit') },
    { key: 'moisturepercentage', label: t('moisturepercentage') },
    { key: 'carbonpercentage', label: t('carbonpercentage') },
    { key: 'comment', label: t('comment') }
  ];

  const router = useRouter();
  const { version } = router.query;
  const { globalReportId, globalOrgId, globalYear } = useGlobalContext();

  useEffect(() => {
    if (globalReportId && globalOrgId && globalYear) {
      axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_list4`, {
        reportId: globalReportId,
        orgId: globalOrgId,
        year: globalYear,
        language: i18n.language,
        version
      })
        .then(res => setRows(res.data))
        .catch(err => console.error('Error fetching report2_list4:', err))
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
        {t('section4')}
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

export default Report2List4;