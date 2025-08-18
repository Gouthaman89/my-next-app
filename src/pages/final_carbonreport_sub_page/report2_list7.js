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
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/dataTables.dataTables.css';

const Report2List7 = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const tableRef = useRef(null);

  const headers = [
    { key: 'processno', label: t('processno') },
    { key: 'assetno', label: t('assetno') },
    { key: 'objectcode', label: t('objectcode') },
    { key: 'objectname', label: t('objectname') },
    { key: 'uncertaintydslower', label: t('uncertaintydslower') },
    { key: 'uncertaintydsupper', label: t('uncertaintydsupper') },
    { key: 'datafrom', label: t('datafrom') },
    { key: 'dsdep', label: t('dsdep') },
    { key: 'gas', label: t('gas1') },
    { key: 'co2e', label: t('co2e') },
    { key: 'uncertaintyfactorlower', label: t('uncertaintyfactorlower') },
    { key: 'uncertaintyfactorupper', label: t('uncertaintyfactorupper') },
    { key: 'uncertaintyfactorfrom', label: t('uncertaintyfactorfrom') },
    { key: 'factordep', label: t('factordep') },
    { key: 'uncertaintygaslower', label: t('uncertaintygaslower') },
    { key: 'uncertaintygasupper', label: t('uncertaintygasupper') },
    { key: 'uncertaintyemissionlower', label: t('uncertaintyemissionlower') },
    { key: 'uncertaintyemissionupper', label: t('uncertaintyemissionupper') }
  ];

  const router = useRouter();
  const { version } = router.query;
  const { globalReportId, globalOrgId, globalYear } = useGlobalContext();

  useEffect(() => {
    if (globalReportId && globalOrgId && globalYear) {
      axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_list7`, {
        reportId: globalReportId,
        orgId: globalOrgId,
        year: globalYear,
        language: i18n.language,
        version
      })
        .then(res => setRows(res.data))
        .catch(err => console.error('Error fetching report2_list7:', err))
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

  useImperativeHandle(ref, () => ({
    getRows: () => rows
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" align="center" gutterBottom>
        {t('section7')}
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

export default React.memo(Report2List7);