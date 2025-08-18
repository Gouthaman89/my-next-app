import axios from 'axios';
import { useRouter } from 'next/router';
import { useGlobalContext } from '../../components/GlobalContext';
import {
  Box,
  Typography,
  CircularProgress,
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
  forwardRef,
  useRef
} from 'react';

import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/dataTables.dataTables.css';

const Report2List3 = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

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
    { key: 'hasco2', label: t('hasco2') },
    { key: 'hasch4', label: t('hasch4') },
    { key: 'hasn2o', label: t('hasn2o') },
    { key: 'hashfcs', label: t('hashfcs') },
    { key: 'haspfcs', label: t('haspfcs') },
    { key: 'hassf6', label: t('hassf6') },
    { key: 'hasnf3', label: t('hasnf3') },
    { key: 'ischp', label: t('ischp') },
    { key: 'comment', label: t('comment') }
  ];

  const router = useRouter();
  const { version } = router.query;
  const { globalReportId, globalOrgId, globalYear } = useGlobalContext();

  const tableRef = useRef();

  useEffect(() => {
    if (globalReportId && globalOrgId && globalYear) {
      axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_list3`, {
        reportId: globalReportId,
        orgId: globalOrgId,
        year: globalYear,
        language: i18n.language,
        version
      })
        .then(res => setRows(res.data))
        .catch(err => console.error('Error fetching report2_list3:', err))
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
        {t('section3')}
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

export default Report2List3;