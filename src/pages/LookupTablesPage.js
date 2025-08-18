import React, { useEffect, useState } from 'react';
import CarbonReportExtended from './final_carbonreport_sub_page/finalcarbonreporitextend1';
import SideBySideTables from './final_carbonreport_sub_page/finalreport34';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Box } from '@mui/material';
import lookupTableConfig from '../components/config/lookupTableConfig';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useGlobalContext } from '../components/GlobalContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useRouter } from 'next/router';
import Loader from '../components/Loader/loader';

export default function LookupTablesPage() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [dataMap, setDataMap] = useState({}); // store all API data
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [showSection8, setShowSection8] = useState(false);
  const router = useRouter();
  const { version } = router.query;
  const { globalReportId, globalOrgId, globalYear, globalYearid } = useGlobalContext();
  const { t } = useTranslation();

  useEffect(() => {
    if (lookupTableConfig.length > 0) {
      fetchData(lookupTableConfig[0]);
    }
  }, []);

  const resolvePayload = (payload, context) => {
    const resolved = {};
    for (const key in payload) {
      resolved[key] = context[payload[key]];
    }
    return resolved;
  };

  const globalContext = {
    globalReportId,
    globalOrgId,
    globalYearid,
    globalYear,
    version,
    'i18n.language': i18n.language
  };

  const fetchData = async (tableConfig) => {
    setLoading(true);
    try {
      const postPayload = resolvePayload(tableConfig.payload || {}, globalContext);
      const fullUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${tableConfig.apiUrl}`;
      const res = await axios.post(fullUrl, postPayload);
      const updated = { ...dataMap, [tableConfig.name]: res.data };
      setDataMap(updated);
      setSelectedTable(tableConfig);
      setSearchTerm('');
      setCurrentPage(1);
      setSortColumn(null);
      setSortDirection('asc');
    } catch (err) {
      console.error(`Error fetching ${tableConfig.name}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const downloadAllAsExcel = async () => {
    setLoading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const updatedDataMap = { ...dataMap };

      for (const table of lookupTableConfig) {
        if (!updatedDataMap[table.name]) {
          const postPayload = resolvePayload(table.payload || {}, globalContext);
          const fullUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${table.apiUrl}`;
          try {
            const res = await axios.post(fullUrl, postPayload);
            updatedDataMap[table.name] = res.data;
          } catch (err) {
            console.error(`Error fetching ${table.name} for Excel:`, err);
            continue;
          }
        }

        const sheet = workbook.addWorksheet(table.name);
        const data = updatedDataMap[table.name] || [];

        if (data.length > 0) {
          sheet.addRow(table.columns.map(col => t(col.labelKey || col)));
          data.forEach(row =>
            sheet.addRow(table.columns.map(col => row[col.key || col]))
          );
        }
      }

      const sheet8 = workbook.addWorksheet('Section8');
      sheet8.addRow([
        t('electricity'), t('steam'), t('thermalPower'), t('windPower'),
        t('hydropower'), t('geothermal'), t('tidal'), t('otherRenewable'),
        t('nuclear'), t('other'), t('otherPowerGeneration'), t('plantSteamGeneration')
      ]);
      sheet8.addRow(Array(12).fill(0));
      sheet8.addRow([]); // Spacer
      sheet8.addRow(['CarbonReportExtended placeholder']);
      sheet8.addRow(['SideBySideTables placeholder']);

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'lookup_data.xlsx');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  let filteredRows = [];
  let paginatedRows = [];

  if (selectedTable && dataMap[selectedTable.name]) {
    const terms = searchTerm.toLowerCase().split(' ').filter(Boolean);
    filteredRows = dataMap[selectedTable.name].filter(row =>
      terms.every(term =>
        selectedTable.columns.some(col => {
          const key = col.key || col;
          return String(row[key]).toLowerCase().includes(term);
        })
      )
    );

    if (sortColumn) {
      filteredRows.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA == null) return 1;
        if (valB == null) return -1;
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    paginatedRows = filteredRows.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Loader />
        </div>
      )}

      {/* Dynamic API Buttons */}
      <div style={{ marginBottom: '20px' }}>
        {lookupTableConfig.map((table, idx) => (
          <button
            key={idx}
            onClick={() => {
              fetchData(table);
              setShowSection8(false);
            }}
            style={{
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1565c0'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1976d2'}
          >
            {t(table.name)}
          </button>
        ))}
        <button
          onClick={() => {
            setShowSection8(true);
            setSelectedTable(null);
          }}
          style={{
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: '#f57c00',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ef6c00'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f57c00'}
        >
          {t('section8')}
        </button>
        <button
          onClick={downloadAllAsExcel}
          style={{
            padding: '8px 16px',
            backgroundColor: '#388e3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginLeft: '20px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2e7d32'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#388e3c'}
        >
          Download All as Excel
        </button>
      </div>

      {/* Selected Table View */}
      {!showSection8 && selectedTable && dataMap[selectedTable.name] && (
        <div>
          <h3>{t(selectedTable.title)}</h3>
          <div style={{
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}>
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                marginBottom: '10px',
                width: '100%',
                maxWidth: '300px',
                padding: '8px 12px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                boxSizing: 'border-box'
              }}
            />
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '120px'
              }}
            >
              {[5, 10, 25, 50].map(n => (
                <option key={n} value={n}>{n} {t('entries')}</option>
              ))}
            </select>
          </div>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table
              id={`table-${selectedTable.name}`}
              className="styled-table"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <thead>
                <tr>
                  {selectedTable.columns.map((col, idx) => (
                    <th
                      key={idx}
                      onClick={() => handleSort(col.key || col)}
                      style={{
                        padding: '12px',
                        backgroundColor: '#f4f6f8',
                        borderBottom: '1px solid #ddd',
                        textAlign: 'left',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {t(col.labelKey || col)}
                      {sortColumn === (col.key || col) && (
                        <span style={{ marginLeft: '6px' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : '#ffffff' }}>
                    {selectedTable.columns.map((col, cIdx) => (
                      <td key={cIdx} style={{
                        padding: '10px',
                        borderBottom: '1px solid #eee',
                        fontSize: '14px'
                      }}>
                        {row[col.key || col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '10px' }}>
            {filteredRows.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                {t('showing')} {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredRows.length)} {t('of')} {filteredRows.length} {t('entries')}
              </div>
            )}
          </div>
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{
                marginRight: '10px',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={e => {
                if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#e0e0e0';
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#f0f0f0';
              }}
            >
              Prev
            </button>
            <span style={{ margin: '0 10px', fontSize: '14px' }}>
              {t('page')} {currentPage} {t('of')} {Math.ceil(filteredRows.length / rowsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(p => (p * rowsPerPage < filteredRows.length ? p + 1 : p))}
              disabled={currentPage * rowsPerPage >= filteredRows.length}
              style={{
                marginRight: '10px',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                cursor: currentPage * rowsPerPage >= filteredRows.length ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={e => {
                if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#e0e0e0';
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#f0f0f0';
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Section 8-like layout */}
      {showSection8 && (
        <div style={{ marginTop: '40px' }}>
          <Typography variant="h4" align="center" gutterBottom>
            {t('section8')}
          </Typography>

          {/* Static Renewable Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('electricity')}</TableCell>
                  <TableCell>{t('steam')}</TableCell>
                  <TableCell>{t('thermalPower')}</TableCell>
                  <TableCell>{t('windPower')}</TableCell>
                  <TableCell>{t('hydropower')}</TableCell>
                  <TableCell>{t('geothermal')}</TableCell>
                  <TableCell>{t('tidal')}</TableCell>
                  <TableCell>{t('otherRenewable')}</TableCell>
                  <TableCell>{t('nuclear')}</TableCell>
                  <TableCell>{t('other')}</TableCell>
                  <TableCell>{t('otherPowerGeneration')}</TableCell>
                  <TableCell>{t('plantSteamGeneration')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>0</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell align="center">0</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4 }}>
            <CarbonReportExtended />
          </Box>
          <Box sx={{ mt: 4 }}>
            <SideBySideTables />
          </Box>
        </div>
      )}
    </div>
  );
}