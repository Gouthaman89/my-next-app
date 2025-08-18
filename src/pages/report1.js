import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel, IconButton, Checkbox, Typography, TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import DisplayChartIcon from '@mui/icons-material/ShowChart';
import SaveIcon from '@mui/icons-material/Save';
import ImportExportIcon from '@mui/icons-material/ImportExport'; // Icon for Excel Export/Import
import axios from 'axios';
import { useRouter } from 'next/router'; // Next.js router for navigation
import { useTranslation } from 'react-i18next';
import { tableHeaderStyles } from '../styles/styles'; // Import the styles
import withAuth from '../components/withAuth';
import { useAuth } from '../components/AuthContext'; // Import useAuth to get global personId and token
import { useGlobalContext } from '../components/GlobalContext'; // Import the GlobalContext
import Loader from '../components/Loader/loader';

const RoleListPage = () => {
  const { t } = useTranslation(); // Translation hook
  const { personId, token } = useAuth(); // Retrieve personId and token from AuthContext
  const {
    setGlobalReportId,
    setGlobalOrgId,
    setGlobalYear,
    setGlobalYearid,
    globalCompanyId,
    globalOrgId,
    companyList,
    organizationList
  } = useGlobalContext();
  // Initialize the state
  const [roles, setRoles] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]); // To store the selected rows
  const [showAddForm, setShowAddForm] = useState(false); // Add form visibility
  const [deleteMode, setDeleteMode] = useState(false); // Toggle delete mode (show checkboxes)
  const [years, setYears] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedReport, setSelectedReport] = useState('');
  const [ setWarning] = useState('');
  const router = useRouter(); // For navigation
  const [versions, setVersions] = useState({}); // To store versions for each report
  const [selectedVersions, setSelectedVersions] = useState({}); // To store selected version per row
  // New state variables for selected company/org names
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [selectedOrganizationName, setSelectedOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  // On mount, set selected company/org and fetch years/reports
  useEffect(() => {
    fetchReports();
    if (globalCompanyId) {
      setSelectedCompany(globalCompanyId);
    }
    if (globalOrgId) {
      setSelectedOrganization(globalOrgId);
      fetchYears(globalOrgId);
      fetchReports(); // for select report type get API from this, fill the data to drop down
    }
  }, []);

  // Respond to changes in globalCompanyId and update company name from global list
  useEffect(() => {
    if (globalCompanyId) {
      setSelectedCompany(globalCompanyId);
      const comp = companyList.find(c => c.companyid === globalCompanyId);
      setSelectedCompanyName(comp?.companyname || '');
    }
  }, [globalCompanyId, companyList]);

  // Respond to changes in globalOrgId and update organization name from global list
  useEffect(() => {
    if (globalOrgId) {
      setSelectedOrganization(globalOrgId);
      const org = organizationList.find(o => o.organizationid === globalOrgId);
      setSelectedOrganizationName(org?.organization || '');
      fetchYears(globalOrgId);
    }
  }, [globalOrgId, organizationList]);

  // Effect to handle year value mismatch
  useEffect(() => {
    if (selectedYear && !years.find(y => y.yearid === selectedYear)) {
      setSelectedYear('');
  
    }
  }, [years]);

 
  const fetchVersionList = async (reportId, rowIndex) => {
    if (versions[rowIndex]) {
      return; // Skip the API call if versions are already loaded
    }
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get_multiple_version_list`, {
        reportid: reportId,
      });
      const versionList = response.data; // Assuming API returns an array of versions
  
      // Sort versions in descending order to pick the latest one
      const sortedVersions = versionList.sort((a, b) => b.version - a.version);
  
      setVersions((prev) => ({ ...prev, [rowIndex]: sortedVersions }));
  
      // Automatically select the latest version
      if (sortedVersions.length > 0) {
        setSelectedVersions((prev) => ({ ...prev, [rowIndex]: sortedVersions[0].version }));
        console.log('Auto-selected version for row', rowIndex, ':', sortedVersions[0].version);
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  };
  const handleVersionChange = (event, rowIndex) => {
    const versionId = event.target.value;
    setSelectedVersions((prev) => ({ ...prev, [rowIndex]: versionId }));
    console.log('Selected version for row', rowIndex, ':', versionId);
  };
 

  const fetchYears = async (organizationId) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/f000110e20`, { organizationId: organizationId, personid: personId});
      setYears(response.data);
    } catch (error) {
      console.error('Error fetching years:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report_template`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleCompanyChange = (event) => {
    const companyId = event.target.value;
    setSelectedCompany(companyId);
    setYears([]);
  };

  const handleOrganizationChange = (event) => {
    const organizationId = event.target.value;
    setSelectedOrganization(organizationId);
    fetchYears(organizationId); // Fetch the years related to this organization
  };

  const handleSave = async () => {
    // Check if all dropdowns are selected
    if (!selectedCompany || !selectedOrganization || !selectedYear || !selectedReport) {
      setWarning('Please select all dropdowns.');
      return;
    }
      // Generate the report number (YYYYMMDD + reporttemplatecode + number)
  const currentDate = new Date();
  const YYYYMMDD = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`;

  // Find the selected report template from the reports array
  const selectedReportTemplate = reports.find(report => report.reporttemplateid === selectedReport);
  const reporttemplatecode = selectedReportTemplate ? selectedReportTemplate.reporttemplatecode : '';

  // Assuming you want to append a unique number, for now, let's just use a static number '001'
  const reportNumber = `${YYYYMMDD}-${reporttemplatecode}-001`;

    // API call to create template
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/create_template`, {
        reportno: reportNumber,
        idoforg: selectedOrganization,
        idofyear: selectedYear,
        idofreporttemplate: selectedReport,
        idofperson: personId
      });
       // You can use the response here if needed
  console.log('Template created successfully:', response.data); 

      // Clear the form and refresh the table
      setSelectedCompany('');
      setSelectedOrganization('');
      setSelectedYear('');
      setSelectedReport('');
      setWarning('');
      setShowAddForm(false);
      fetchData(); // Refresh table
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

 // Function to fetch data from API
const fetchData = async () => {
  try {
    setLoading(true); // Start loader
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report1_1`, {
      personid: personId, // Include personId in the request body
    });
    const data = response.data;
    setRoles(data); // Assuming the data is returned as an array of objects
  } catch (error) {
    console.error('Error fetching data', error);
  } finally {
    setLoading(false); // Stop loader
  }
};

  // Fetch data whenever globalCompanyId or globalOrgId change
  useEffect(() => {
    if (globalCompanyId && globalOrgId) {
      fetchData();
    }
  }, [globalCompanyId, globalOrgId]);

// Delete the selected rows and trigger a bulk API call for deletion
const deleteSelectedRows = async () => {
  try {
    // Extract the report IDs of the selected rows
    const reportIds = selectedRows.map((index) => roles[index].reportid);

    // Make an API call to delete the selected reports in bulk
    await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/delete_report1`, {
      reportids: reportIds, // Send the list of report IDs to the API
      personid: personId, // Include personId if required
    });

    // Filter out the deleted roles from the state
    const filteredRoles = roles.filter((role) => !reportIds.includes(role.reportid));
    setRoles(filteredRoles); // Update the state to reflect the removed items
    setSelectedRows([]); // Clear the selected rows after deletion
    setDeleteMode(false); // Exit delete mode

    // Optionally, show a success message
    console.log('Selected reports deleted successfully');
  } catch (error) {
    console.error('Error deleting selected rows:', error);
  }
};

  // Toggle row selection
  const handleRowSelect = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((row) => row !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  // Navigate to report page and store reportid, orgid, and year in global state
  const handleView = (reportId, orgId, year,yearId) => {
    setGlobalReportId(reportId); // Store reportId in the global context
    setGlobalOrgId(orgId); // Store orgId in the global context
    setGlobalYear(year); // Store year in the global context
    setGlobalYearid(yearId); // Store yearid in the global context
    // Navigate to the report page without passing these values in the URL
    router.push(`/reportpage`);
  };
  const handleFinalView = (reportId, orgId, year, yearId, version) => {
    if (!version) {
      console.warn('No version selected for final report');
      return;
    }
    setGlobalReportId(reportId); // Store reportId in the global context
    setGlobalOrgId(orgId); // Store orgId in the global context
    setGlobalYear(year); // Store year in the global context
    setGlobalYearid(yearId); // Store yearid in the global context
    // Navigate to the final carbon report with the selected version
    router.push(`/final-carbon-report?version=${version}`);
  };
  

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Container disableGutters maxWidth={false} sx={{ mt: 3 }}>
      
    {/* Top toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        {!deleteMode && (
          <>  
            <IconButton onClick={() => {
              setSelectedCompany(globalCompanyId || '');
              setSelectedOrganization(globalOrgId || '');
              setShowAddForm(true);
            }}>
              <AddIcon /> <Typography variant="body1">{t('addNew')}</Typography>
            </IconButton>
          </>
        )}
        {deleteMode ? (
          <Button variant="contained" color="secondary" onClick={deleteSelectedRows}>
            <Typography variant="body1">{t('deleteSelected')}</Typography>
          </Button>
        ) : (
          <IconButton onClick={() => setDeleteMode(true)}>
            <DeleteIcon /> <Typography variant="body1">{t('delete')}</Typography>
          </IconButton>
        )}
        <IconButton onClick={fetchData}>
          <RefreshIcon /> <Typography variant="body1">{t('refresh')}</Typography>
        </IconButton>
        {!deleteMode && (
          <>
            
          </>
        )}
      </Box>

      {/* Add form (visible when "新增" is clicked and not in delete mode) */}
      {showAddForm && !deleteMode && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="subtitle2">公司名稱 (Company)</Typography>
              <Typography variant="body1">
                {selectedCompanyName || '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">組織名稱 (Organization)</Typography>
              <Typography variant="body1">
                {selectedOrganizationName || '—'}
              </Typography>
            </Box>
            <FormControl sx={{ minWidth: 160 }} disabled={!selectedOrganization}>
              <InputLabel>年份 (Year)</InputLabel>
              <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {years.map((year) => (
                  <MenuItem key={year.yearid} value={year.yearid}>
                    {year.year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 220 }} disabled={!reports.length}>
              <InputLabel>報告名稱 (Report Name)</InputLabel>
              <Select
                value={selectedReport || ''}
                onChange={(e) => setSelectedReport(e.target.value)}
              >
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <MenuItem key={report.reporttemplateid} value={report.reporttemplateid}>
                      {report.reporttemplatename}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No Reports Available
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>
          <Button variant="contained" onClick={handleSave} startIcon={<SaveIcon />}>
            <Typography variant="body1">{t('save')}</Typography>
          </Button>
        </Box>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
        <TableHead>
          <TableRow>
            {deleteMode && <TableCell><Typography variant="body1">{t('select')}</Typography></TableCell>}
            <TableCell sx={tableHeaderStyles}><Typography variant="body1">{t('orgName')}</Typography></TableCell>
            <TableCell sx={tableHeaderStyles}><Typography variant="body1">{t('year')}</Typography></TableCell>
            <TableCell sx={tableHeaderStyles}><Typography variant="body1">{t('reportName')}</Typography></TableCell>
            <TableCell sx={tableHeaderStyles}><Typography variant="body1">{t('creationDate')}</Typography></TableCell>
            <TableCell sx={tableHeaderStyles}><Typography variant="body1">{t('percentage')}</Typography></TableCell>
            <TableCell sx={tableHeaderStyles}><Typography variant="body1">{t('action')}</Typography></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
  {roles.map((role, index) => (
    <TableRow key={index}>
      {deleteMode && (
        <TableCell>
          <Checkbox
            checked={selectedRows.includes(index)}
            onChange={() => handleRowSelect(index)}
          />
        </TableCell>
      )}
      <TableCell><Typography variant="body2">{role.orgname}</Typography></TableCell>
      <TableCell><Typography variant="body2">{role.year}</Typography></TableCell>
      <TableCell><Typography variant="body2">{role.reportname}</Typography></TableCell>
      <TableCell><Typography variant="body2">{new Date(role.createdate).toLocaleString()}</Typography></TableCell>
      <TableCell>
        <TextField
          size="small"
          type="number"
          value={role.excludedpercentage ?? ''}
          onChange={(e) => {
            const updatedRoles = [...roles];
            updatedRoles[index] = {
              ...updatedRoles[index],
              excludedpercentage: parseFloat(e.target.value) || 0,
            };
            setRoles(updatedRoles);
          }}
          inputProps={{ min: 0, max: 100 }}
        />
      </TableCell>
      <TableCell>
        <Box display="flex" gap={1}>
          <Button 
            variant="outlined" 
            onClick={() => handleView(role.reportid, role.orgid, role.year, role.yearid)}
          >
            <Typography variant="body2">{t('view')}</Typography>
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleFinalView(role.reportid, role.orgid, role.year, role.yearid, selectedVersions[index])}
            disabled={!selectedVersions[index]} // Disable if no version is selected
          >
            <Typography variant="body2">{t('finalReport')}</Typography>
          </Button>
          {/* Dropdown for versions */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('version')}</InputLabel>
            <Select
              value={selectedVersions[index] || ''}
              onChange={(e) => handleVersionChange(e, index)}
              onOpen={() => fetchVersionList(role.reportid, index)}
            >
              {versions[index]?.map((version, idx) => (
                <MenuItem key={idx} value={version.version}>
                  {version.version}
                </MenuItem>
              )) || <MenuItem disabled>{t('loading')}</MenuItem>}
            </Select>
          </FormControl>
        </Box>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
        </Table>
      </TableContainer>
        </Container>
      )}
    </>
  );
};

export default withAuth(RoleListPage);