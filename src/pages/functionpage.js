import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel, IconButton, Checkbox, Typography
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

const FunctionPage = () => {
  const { t } = useTranslation(); // Translation hook
  const { personId, token } = useAuth(); // Retrieve personId and token from AuthContext
  const { setGlobalReportId, setGlobalOrgId, setGlobalYear, setGlobalYearid } = useGlobalContext(); // Access global context for reportId, orgId, and year
  // Initialize the state
  const [roles, setRoles] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]); // To store the selected rows
  const [showAddForm, setShowAddForm] = useState(false); // Add form visibility
  const [deleteMode, setDeleteMode] = useState(false); // Toggle delete mode (show checkboxes)
  const [companies, setCompanies] = useState([]);
  const [organizations, setOrganizations] = useState([]);
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
  // Fetch Companies when the component mounts
  useEffect(() => {
    fetchCompanies();
    fetchReports(); // Fetch reports independently
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/f000110e30/companies`, { personid: personId });
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };
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
  const fetchOrganizations = async (companyId) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/f000110e30/organizations`, { companyId: companyId, personid: personId});
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
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
    setOrganizations([]); // Clear organization and year dropdowns
    setYears([]);
    fetchOrganizations(companyId); // Fetch the organizations related to this company
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
    // Include personid in the request body
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report1_1`, {
      personid: personId, // Include personId in the request body
    });
    const data = response.data;
    setRoles(data); // Assuming the data is returned as an array of objects
  } catch (error) {
    console.error('Error fetching data', error);
  }
};

  useEffect(() => {
    fetchData(); // Fetch data when the component mounts
  }, []);

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
    <Container disableGutters maxWidth={false} sx={{ mt: 3 }}>
      
    {/* Top toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        {!deleteMode && (
          <>
            <IconButton onClick={() => console.log('Display Chart')}>
              <DisplayChartIcon /> <Typography variant="body1">{t('displayChart')}</Typography>
            </IconButton>
            <IconButton onClick={() => setShowAddForm(true)}>
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
            <IconButton onClick={() => console.log('Excel Template')}>
              <ImportExportIcon /> <Typography variant="body1">{t('excelTemplate')}</Typography>
            </IconButton>
            <IconButton onClick={() => console.log('Export to Excel')}>
              <ImportExportIcon /> <Typography variant="body1">{t('exportToExcel')}</Typography>
            </IconButton>
            <IconButton onClick={() => console.log('Import from Excel')}>
              <ImportExportIcon /> <Typography variant="body1">{t('importFromExcel')}</Typography>
            </IconButton>
          </>
        )}
      </Box>

      {/* Add form (visible when "新增" is clicked and not in delete mode) */}
      {showAddForm && !deleteMode && (
       <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
       <FormControl sx={{ flex: 1, minWidth: '200px' }}>
         <InputLabel>公司名稱 (Company)</InputLabel>
         <Select value={selectedCompany} onChange={handleCompanyChange}>
           {companies.map((company) => (
             <MenuItem key={company.companyid} value={company.companyid}>
               {company.companyname}
             </MenuItem>
           ))}
         </Select>
       </FormControl>
     
       <FormControl sx={{ flex: 1, minWidth: '200px' }} disabled={!selectedCompany}>
         <InputLabel>組織名稱 (Organization)</InputLabel>
         <Select value={selectedOrganization} onChange={handleOrganizationChange}>
           {organizations.map((org) => (
             <MenuItem key={org.organizationid} value={org.organizationid}>
               {org.oraganization}
             </MenuItem>
           ))}
         </Select>
       </FormControl>
     
       <FormControl sx={{ flex: 1, minWidth: '200px' }} disabled={!selectedOrganization}>
         <InputLabel>年份 (Year)</InputLabel>
         <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
           {years.map((year) => (
             <MenuItem key={year.yearid} value={year.yearid}>
               {year.year}
             </MenuItem>
           ))}
         </Select>
       </FormControl>
     
       <FormControl sx={{ flex: 1, minWidth: '200px' }}>
         <InputLabel>報告名稱 (Report Name)</InputLabel>
         <Select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
           {reports.map((report) => (
             <MenuItem key={report.reporttemplateid} value={report.reporttemplateid}>
               {report.reporttemplatename}
             </MenuItem>
           ))}
         </Select>
       </FormControl>
     
       <Button 
         variant="contained" 
         onClick={handleSave} 
         startIcon={<SaveIcon />} 
         sx={{ height: '56px' }} // Adjust height to match the inputs
       >
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
            <TableCell sx={tableHeaderStyles}><Typography variant="body1">{t('code')}</Typography></TableCell>
            <TableCell sx={tableHeaderStyles}><Typography variant="body1">{t('name')}</Typography></TableCell>
            <TableCell sx={tableHeaderStyles}><Typography variant="body1">{t('dateOfCreate')}</Typography></TableCell>
            <TableCell sx={tableHeaderStyles}><Typography variant="body1">{t('isActive')}</Typography></TableCell>
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
 
</TableCell>
    </TableRow>
  ))}
</TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default withAuth(FunctionPage);