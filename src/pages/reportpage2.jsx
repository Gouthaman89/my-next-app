/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, Select, MenuItem,
  FormControl, InputLabel, Grid, Typography, TablePagination
} from '@mui/material';
import { useRouter } from 'next/router'; // For fetching reportid from URL
import axios from 'axios';
import PopupFormDialog from '../components/PopupFormDialog';  // Import your PopupFormDialog component

const ReportPreview = () => {
  const router = useRouter();
  const { reportid } = router.query; // Get the reportid from the URL

  // State for form data from the API
  const [formData, setFormData] = useState({
    organization: '',
    year: '',
    reportname: '',
    requestor: '',
    gwpVersion: '',
    printDate: ''
  });

  // State for the table data from the API
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Data after search filter
  const [customFactorData, setCustomFactorData] = useState([]); // Data from report2_customizedfactor

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search state
  const [searchText, setSearchText] = useState('');

  // State to manage the open/close state of the dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null); // To store selected row data

  // GWP Versions state
  const [gwpVersions, setGwpVersions] = useState([]);
  const [selectedGwpVersion, setSelectedGwpVersion] = useState('');

  // State for the popup form values (including IDs)
  const [popupFormData, setPopupFormData] = useState({
    factorProvider: '',
    version: '',
    level: '',
    unit: '',
    object: '',
    category: '',
    process: '',
    gas: '',
    factor: '',
    description: '',
    objectid: '',
    objecttype:'',
    categoryId: '',
    processId: '',
    gasId: '',
    ghgid:'',
    factorid:'',
    year:'',
    factorcode:''
  });

  // State for Levels
  const [levels, setLevels] = useState([]);

  // State for Units
  const [units, setUnits] = useState([]);

// Fetch both report_preview and report2_customizedfactor data
useEffect(() => {
  const fetchReportData = async (reportid) => {
    try {
      // Fetch preview and custom factor data
      const previewResponse = await axios.post('http://localhost:1880/report2_list', { reportid });
      const customFactorResponse = await axios.post('http://localhost:1880/report2_customizedfactor', { reportid });

      console.log('Preview Data:', previewResponse.data);  // Debug log for preview data
      console.log('Custom Factor Data:', customFactorResponse.data);  // Debug log for custom factor data

      // Assuming both responses return arrays of data
      const report2_list = previewResponse.data;
      const report2_customizedfactor = customFactorResponse.data;

      // Create an object to store gasids grouped by objecttype
      const objectGasMap = {};

      // Collect gasid and objecttype BEFORE merging data
      report2_list.forEach((reportItem) => {
        const { gasid, objecttype } = reportItem;

        if (gasid && objecttype) {
          // If the objecttype doesn't exist in objectGasMap, create an entry
          if (!objectGasMap[objecttype]) {
            objectGasMap[objecttype] = new Set(); // Using Set to avoid duplicates
          }

          // Add gasid to the Set for this objecttype
          objectGasMap[objecttype].add(gasid);
        }
      });

      // Convert Sets to arrays for API posting
      const objectGasArray = Object.entries(objectGasMap).map(([objecttype, gasidsSet]) => ({
        objecttype, // Send objecttype (not objectid)
        gasids: Array.from(gasidsSet), // Convert Set to array
      }));

      // POST distinct objecttypes and gasids to the API
      const postData = {
        objectGasData: objectGasArray,
      };

      // POST request to new API
      const newApiResponse = await axios.post('http://localhost:1880/get_package_data', postData);
      console.log('New API Data:', newApiResponse.data);  // Debug log for new API response

      // Assume newApiResponse.data contains data similar to customFactorResponse but with the required fields
      const newApiCustomData = newApiResponse.data;

      // Merge report2_list, report2_customizedfactor, and get_package_data
      const mergedData = report2_list.map((reportItem) => {
        // Log the current report item being processed
        console.log('Processing reportItem:', reportItem);
      
        const customFactor = report2_customizedfactor.find(
          (factor) => factor.recordofceid === reportItem.recordofceid
        );
        const newCustomFactor = newApiCustomData.find(
          (factor) => factor.gasid === reportItem.gasid && factor.objecttype === reportItem.objecttype
        );
      
        // Log both factors to verify if they are found correctly
        console.log('Custom Factor:', customFactor);
        console.log('New Custom Factor:', newCustomFactor);
      
        if (customFactor && newCustomFactor) {
          return {
            ...reportItem,
            factorProviders: [
              {
                providerName: customFactor.factorprovidername,
                version: customFactor.version,
                rate: customFactor.rate
              },
              {
                providerName: newCustomFactor.factorprovidername,
                version: newCustomFactor.version,
                rate: newCustomFactor.rate
              }
            ],
            selectedFactorProvider: customFactor.factorprovidername,
          };
        }
      
        if (newCustomFactor) {
          return {
            ...reportItem,
            factorProviders: [
              {
                providerName: newCustomFactor.factorprovidername,
                version: newCustomFactor.version,
                rate: newCustomFactor.rate
              }
            ],
            selectedFactorProvider: newCustomFactor.factorprovidername,
          };
        }
      
        if (customFactor) {
          return {
            ...reportItem,
            factorProviders: [
              {
                providerName: customFactor.factorprovidername,
                version: customFactor.version,
                rate: customFactor.rate
              }
            ],
            selectedFactorProvider: customFactor.factorprovidername,
          };
        }
      
        return {
          ...reportItem,
          selectedFactorProvider: reportItem.factorprovidername,
        };
      });
   
      console.log('Merged Data:', mergedData);
// Update the state with the final merged data
setTableData(mergedData);
setFilteredData(mergedData); // Ensure filtered data is also updated

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  if (reportid) {
    fetchReportData(reportid);
  }
}, [reportid]);

  // Combine the table data based on recordofceid
  const combineTableData = (data) => {
    const groupedData = {};
  
    data.forEach((row, index) => {
      const {
        recordofceid,
        cateofastname,
        processname,
        objectname,
        gasname,
        factorprovidername,
        version,
        rate,
      } = row;
  
      if (!groupedData[recordofceid]) {
        groupedData[recordofceid] = {
          recordofceid,
          cateofastname,
          processname,
          objectname,
          gases: [],
        };
      }
  
      groupedData[recordofceid].gases.push({
        gasname,
        factorprovidername,
        version,
        rate,
        rowData: row, // Include original row data
        index: index,
        action: (
          <Button onClick={() => handleOpenDialog(row)} variant="contained">
            添加係數 (Add Factor)
          </Button>
        ),
      });
    });
  
    return Object.values(groupedData);
  };


  // Fetch GWP Versions
  useEffect(() => {
    const fetchGwpVersions = async () => {
      try {
        const response = await axios.post('http://localhost:1880/gwpall');
        setGwpVersions(response.data); // Assuming response.data contains the GWP version list
      } catch (error) {
        console.error('Error fetching GWP versions:', error);
      }
    };

    fetchGwpVersions();
  }, []);

  // Function to handle GWP version change
  const handleGwpVersionChange = async (gwpid) => {
    setSelectedGwpVersion(gwpid);

    try {
      const response = await axios.post('http://localhost:1880/report2_factorselection', { gwp: gwpid });
      const factorData = response.data;

      // Iterate over the table data and match recordofceid with the factorData
      const updatedTableData = tableData.map(row => {
        const matchingFactor = factorData.find(factor => factor.recordofceid === row.recordofceid);

        if (matchingFactor) {
          // Update row with factor provider, version, and rate from the API
          return {
            ...row,
            factorprovidername: matchingFactor.factorprovidername,
            version: matchingFactor.version,
            rate: matchingFactor.rate
          };
        }
        return row;
      });

      setTableData(updatedTableData);
      setFilteredData(updatedTableData); // Update filtered data as well
    } catch (error) {
      console.error('Error fetching factor selection data:', error);
    }
  };

  // Fetch Levels for the popup form
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await axios.post('http://localhost:1880/report3_leveloffactor');
        setLevels(response.data); // Assuming response.data is the array of levels
      } catch (error) {
        console.error('Error fetching levels:', error);
      }
    };

    fetchLevels();
  }, []);

  // Fetch Units for the popup form
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.post('http://localhost:1880/report3_units');
        setUnits(response.data); // Assuming response.data is the array of units
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };

    fetchUnits();
  }, []);

  useEffect(() => {
    const updatedFilteredData = tableData.filter((row) => {
      const rowString = `${row.cateofastname} ${row.processname} ${row.objectname} ${row.gasname} ${row.factorprovidername} ${row.version} ${row.rate}`.toLowerCase();
  
      return rowString.includes(searchText.toLowerCase());
    });
  
    setFilteredData(updatedFilteredData);
  }, [tableData, searchText]);

  // Function to open the dialog
  const handleOpenDialog = (row) => {
    console.log('Opening dialog', row); // Debugging log
    setSelectedRow(row);
    setOpenDialog(true);

    // Pre-fill the popup form with row data (including the IDs for submission)
    setPopupFormData({
      category: row.cateofastname || '', // Displayed name
      categoryId: row.cateofastid || '', // ID to be submitted
      process: row.processname || '', // Displayed name
      processId: row.processid || '', // ID to be submitted
      object: row.objectname || '', // Displayed name
      objectid: row.objectid || '', // ID to be submitted
      objecttype: row.objecttype || '',
      gas: row.gasname || '', // Displayed name
      gasId: row.gasid || '', // ID to be submitted
      factorid: row.factorid || '', // Factor ID to be submitted
      ghgid: row.ghgid || '',  // Make sure idofghg is set here
      year: row.year || '',
      factorcode: row.factorcode || '',
      factorProvider: row.provider || '',
      version: row.version || '',
      factor: row.rate || '',
      description: '',
      level: '', // Set level to blank initially
      unit:'' // Set unit to blank initially
    });
  };

  // Function to close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

// Function to handle GWP version and custom factor selection change
// Ensure handleProviderChange is declared only once
const handleProviderChange = (selectedProvider, rowIndex) => {
  const updatedTableData = [...tableData];

  const selectedProviderDetails = updatedTableData[rowIndex].factorProviders.find(
    (provider) => provider.providerName === selectedProvider
  );

  if (selectedProviderDetails) {
    updatedTableData[rowIndex].selectedFactorProvider = selectedProviderDetails.providerName;
    updatedTableData[rowIndex].version = selectedProviderDetails.version;
    updatedTableData[rowIndex].rate = selectedProviderDetails.rate;
  }

  setTableData(updatedTableData);
  setFilteredData(updatedTableData); // Make sure the filtered data is updated too
};

// Function to render the dropdown if both GWP and custom factors exist
const renderFactorProviderDropdown = (row, index) => {
  // Log row data for debugging purposes
  console.log('Row Data:', row);
  
  // Ensure row.rowData.factorProviders exists and has at least one provider
  if (row.rowData.factorProviders && row.rowData.factorProviders.length > 1) {
    return (
      <Select
        value={row.selectedFactorProvider || ''} // Ensure it's not undefined
        onChange={(e) => handleProviderChange(e.target.value, index)}
      >
        {row.rowData.factorProviders.map((provider, idx) => (
          <MenuItem key={idx} value={provider.providerName}>
            {provider.providerName} (Version: {provider.version}, Rate: {provider.rate})
          </MenuItem>
        ))}
      </Select>
    );
  }

  // If only one provider exists, display it as a static value
  if (row.rowData.factorProviders && row.rowData.factorProviders.length === 1) {
    console.log('Row Data1:', row.rowData);
    return row.rowData.factorProviders[0].providerName || 'N/A1';
  }

  // If factorProviders is empty or undefined, return 'N/A'
  return 'N/A1';
};

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

// Handle search input change
const handleSearchChange = (e) => {
  setSearchText(e.target.value);

  // Update the filteredData safely by checking if any field contains the search text
  const filtered = tableData.filter((row) => {
    // Combine all values into a single string and check if it includes the search text
    const rowString = `${row.cateofastname} ${row.processname} ${row.objectname} ${row.gasname} ${row.factorprovidername} ${row.version} ${row.rate}`.toLowerCase();
    
    return rowString.includes(e.target.value.toLowerCase());
  });

  setFilteredData(filtered);
};

  // Handle Submit Factor (with levelId & unitId)
  const handleSubmitFactor = async () => {
    try {
      const response = await axios.post('http://localhost:1880/creatfactor', {
        categoryId: popupFormData.categoryId,
        processId: popupFormData.processId,
        objectid: popupFormData.objectid,
        objecttype: popupFormData.objecttype,
        gasId: popupFormData.gasId,
        factorProvider: popupFormData.factorProvider,
        version: popupFormData.version,
        factor: popupFormData.factor,
        description: popupFormData.description,
        levelId: popupFormData.level,
        unitId: popupFormData.unit,
        factorid: popupFormData.factorid,
        ghgid: popupFormData.ghgid,
        year: popupFormData.year,
        factorcode: popupFormData.factorcode
      });
      console.log('Factor added successfully:', response.data);
      handleCloseDialog(); // Close dialog after successful submission
    } catch (error) {
      console.error('Error creating factor:', error);
    }
  };

  // Pagination logic
  const paginatedData = combineTableData(filteredData).slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container disableGutters maxWidth={false} sx={{ mt: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        列印明細預覽 (Report Preview)
      </Typography>

      {/* Top Section with 6 fields (3 on each side) */}
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="組織 (Organization)"
            value={formData.organization}
            onChange={(e) => handleFormChange(e, 'organization')}
            disabled // Read-only as data comes from API
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="印表人員 (Requestor)"
            value={formData.requestor}
            onChange={(e) => handleFormChange(e, 'requestor')}
            disabled // Read-only as data comes from API
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="列印年度 (Year)"
            value={formData.year}
            onChange={(e) => handleFormChange(e, 'year')}
            disabled // Read-only as data comes from API
          />
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>GWP 版本 (GWP Version)</InputLabel>
            <Select
              value={selectedGwpVersion}
              onChange={(e) => handleGwpVersionChange(e.target.value)}
            >
              {gwpVersions.map((gwp) => (
                <MenuItem key={gwp.gwpid} value={gwp.gwpid}>
                  {gwp.gwpname} ({gwp.gwpversion})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="套用範本 (Format Template)"
            value={formData.reportname}
            onChange={(e) => handleFormChange(e, 'reportname')}
            disabled // Read-only as data comes from API
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="印表日期 (Print Date)"
            value={formData.printDate}
            onChange={(e) => handleFormChange(e, 'printDate')}
            disabled // Read-only as data comes from API
          />
        </Grid>
      </Grid>

      {/* Top Section with Total Records and Search */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">
          總紀錄: {filteredData.length} 項目 (Total Records: {filteredData.length})
        </Typography>
        <TextField
          label="搜尋 (Search)"
          variant="outlined"
          value={searchText}
          onChange={handleSearchChange}
        />
      </Box>

      {/* Table Section */}
      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>設備類別 (Category of Asset)</TableCell>
              <TableCell>製程 (Process)</TableCell>
              <TableCell>添加物 (Object)</TableCell>
              <TableCell>排放氣體 (Gas)</TableCell>
              <TableCell>係數供應商 (Factor Provider)</TableCell>
              <TableCell>係數版本 (Version)</TableCell>
              <TableCell>係數值 (Rate)</TableCell>
              <TableCell>操作 (Action)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {paginatedData.map((groupedRow, index) => (
            <React.Fragment key={index}>
              <TableRow>
                <TableCell rowSpan={groupedRow.gases.length}>{groupedRow.cateofastname || 'N/A'}</TableCell>
                <TableCell rowSpan={groupedRow.gases.length}>{groupedRow.processname || 'N/A'}</TableCell>
                <TableCell rowSpan={groupedRow.gases.length}>{groupedRow.objectname || 'N/A'}</TableCell>

                {/* Render first gas/factor data */}
                <TableCell>{groupedRow.gases[0].gasname || 'N/A'}</TableCell>
                <TableCell>{renderFactorProviderDropdown(groupedRow.gases[0], index)}</TableCell>
                <TableCell>{groupedRow.gases[0].version || groupedRow.gases[0].rowData.version || 'N/A'}</TableCell>
                <TableCell>{groupedRow.gases[0].rate || groupedRow.gases[0].rowData.rate || 'N/A'}</TableCell>
                <TableCell>{groupedRow.gases[0].action}</TableCell>
              </TableRow>

              {/* Render additional rows for remaining gases */}
              {groupedRow.gases.slice(1).map((gas, idx) => (
                <TableRow key={idx}>
                  <TableCell>{gas.gasname || 'N/A'}</TableCell>
                  <TableCell>{renderFactorProviderDropdown(groupedRow.gases[idx], index)}</TableCell>
                  <TableCell>{gas.version || gas.rowData.version || 'N/A'}</TableCell>
                  <TableCell>{gas.rate || gas.rowData.rate || 'N/A'}</TableCell>
                  <TableCell>{gas.action}</TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Popup Form Dialog */}
      <PopupFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        popupFormData={popupFormData}
        setPopupFormData={setPopupFormData}
        handleSubmitFactor={handleSubmitFactor}
        levels={levels}
        units={units}
      />
    </Container>
  );
};

export default ReportPreview;