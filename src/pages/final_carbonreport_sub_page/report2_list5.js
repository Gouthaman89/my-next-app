import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useRef
} from 'react';
import 'gridjs/dist/theme/mermaid.css';
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


const Report2List5 = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const tableRef = useRef(null);

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
    { key: 'amount', label: t('amount') },
    { key: 'unitname', label: t('unitname') },
    { key: 'percentage', label: t('percentage') },
    { key: 'emissionmethod', label: t('emissionmethod') },
    { key: 'gas', label: t('gas') },
    { key: 'hvfactor', label: t('hvfactor') },
    { key: 'hvunitname', label: t('hvunitname') },
    { key: 'factor', label: t('factor') },
    { key: 'factorunit', label: t('factorunit') },
    { key: 'factorfrom', label: t('factorfrom') },
    { key: 'levelfactor', label: t('levelfactor') },
    { key: 'emissions', label: t('emissions') },
    { key: 'gwp', label: t('GWP') },
    { key: 'co2e', label: t('co2e') },

    { key: 'gas2', label: t('gas2') },
    { key: 'hvfactor2', label: t('hvfactor2') },
    { key: 'hvunitname2', label: t('hvunitname2') },
    { key: 'factor2', label: t('factor2') },
    { key: 'factorunit2', label: t('factorunit2') },
    { key: 'factorfrom2', label: t('factorfrom2') },
    { key: 'levelfactor2', label: t('levelfactor2') },
    { key: 'emissions2', label: t('emissions2') },
    { key: 'GWP2', label: t('GWP2') },
    { key: 'co2e2', label: t('co2e2') },

    { key: 'gas3', label: t('gas3') },
    { key: 'hvfactor3', label: t('hvfactor3') },
    { key: 'hvunitname3', label: t('hvunitname3') },
    { key: 'factor3', label: t('factor3') },
    { key: 'factorunit3', label: t('factorunit3') },
    { key: 'factorfrom3', label: t('factorfrom3') },
    { key: 'levelfactor3', label: t('levelfactor3') },
    { key: 'emissions3', label: t('emissions3') },
    { key: 'GWP3', label: t('GWP3') },
    { key: 'co2e3', label: t('co2e3') },

    { key: 'emissionstotal', label: t('emissionstotal') },
    { key: 'biomesstotal', label: t('biomesstotal') },
    { key: 'emissionpercentage', label: t('emissionpercentage') },
    { key: 'absco2e', label: t('absco2e') }
  ];

  const router = useRouter();
  const { version } = router.query;
  const { globalReportId, globalOrgId, globalYear } = useGlobalContext();

  useEffect(() => {
    if (globalReportId && globalOrgId && globalYear) {
      axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_list5`, {
        reportId: globalReportId,
        orgId: globalOrgId,
        year: globalYear,
        language: i18n.language,
        version
      })
        .then(res => {
          const data = res.data;

          // Group by recordofceid
          const grouped = {};
          data.forEach(item => {
            const id = item.recordofceid;
            if (!grouped[id]) grouped[id] = [];
            grouped[id].push(item);
          });

          // Compute totals per group
          const updatedRows = data.map(row => {
            const group = grouped[row.recordofceid] || [];
            const groupEmissionTotal = group.reduce((sum, r) => sum + (parseFloat(r.co2e) || 0), 0);
            const biomesstotal = group.reduce((sum, r) => sum + ((r.isbiomess === 'Y' ? parseFloat(r.emissions) : 0) || 0), 0);
            const absco2e = group.reduce((sum, r) => sum + (parseFloat(r.co2e) || 0), 0);
            const rowCo2e = parseFloat(row.co2e) || 0;
            const emissionpercentage = absco2e > 0 ? (rowCo2e / absco2e) * 100 : 0;
            const isFirstRowOfGroup = group.findIndex(r => r === row) === 0;
            return {
              ...row,
              emissionstotal: isFirstRowOfGroup ? groupEmissionTotal.toFixed(2) : '',
              biomesstotal: biomesstotal.toFixed(2),
              absco2e: absco2e.toFixed(2),
              emissionpercentage: emissionpercentage.toFixed(2)
            };
          });

          // Sort rows by recordofceid to ensure grouping is contiguous
          const sortedRows = [...updatedRows].sort((a, b) =>
            a.recordofceid.localeCompare(b.recordofceid)
          );
          setRows(sortedRows);
        })
        .catch(err => console.error('Error fetching report2_list5:', err))
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
        {t('section5')}
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
                    <td key={h.key}>
                      {h.key === 'emissionpercentage' && row[h.key]
                        ? `${row[h.key]}%`
                        : row[h.key] || ''}
                    </td>
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

export default Report2List5;