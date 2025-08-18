/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, Select, MenuItem,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  Typography, TablePagination
} from '@mui/material';
import { useRouter } from 'next/router'; // For fetching reportId from URL
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { tableHeaderStyles } from '../styles/styles'; // Import the styles
// Inside ReportPreview
import { useAuth } from '../components/AuthContext'; // Import the AuthContext to access reportId
import { useGlobalContext } from '../components/GlobalContext'; // Import the GlobalContext to access reportId, orgId, year

const ReportPreview = () => {
  // Use GlobalContext to get reportId, orgId, and year
  const { globalReportId, globalOrgId, globalYear } = useGlobalContext();
  const [selectedRowId, setSelectedRowId] = useState(null);
    const { t } = useTranslation(); // Translation hook
  const router = useRouter();
  const { personId, token } = useAuth(); // Retrieve personId and token from AuthContext
  //const { reportId } = router.query; // Get the reportId from the URL

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

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Popup dialog state
  const [openFactorDialog, setOpenFactorDialog] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null); // For storing the selected row
  const [factorProviders, setFactorProviders] = useState([]); // Factor provider data for the selected row

    // Pagination state for the dialog
    const [dialogPage, setDialogPage] = useState(0);
    const [dialogRowsPerPage, setDialogRowsPerPage] = useState(5); // 5 rows per page for the factor provider dialog
  

  // Search state
  const [searchText, setSearchText] = useState('');

  // State to manage the open/close state of the dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null); // To store selected row data

  // GWP Versions state
  const [gwpVersions, setGwpVersions] = useState([]);
  const [selectedGwpVersion, setSelectedGwpVersion] = useState('');

  const [triggerRender, setTriggerRender] = useState(false);

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

  const [conversionRates, setConversionRates] = useState([]);

  // Function to open the dialog
  const handleOpenDialog = (row) => {
    console.log('Opening dialog', row); // Debugging log
    setSelectedRow(row);
    setOpenDialog(true);

    // Pre-fill the popup form with row data (including the IDs for submission)
    setPopupFormData({
      category: row.cateofastname, // Displayed name
      categoryId: row.cateofastid, // ID to be submitted
      process: row.processname, // Displayed name
      processId: row.processid, // ID to be submitted
      object: row.objectname, // Displayed name
      objectid: row.objectid, // ID to be submitted
      objecttype: row.objecttype,
      gas: row.gasname, // Displayed name
      gasId: row.gasid, // ID to be submitted
      factorid: row.factorid, // Factor ID to be submitted
      ghgid: row.ghgid,  // Make sure idofghg is set here
      year: row.year,
      factorcode: row.factorcode,
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

  useEffect(() => {
    const fetchConversionRates = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/unitconversion`);
        setConversionRates(response.data); // Store conversion rates in state
      } catch (error) {
        console.error('Error fetching unit conversion rates:', error);
      }
    };
  
    fetchConversionRates();
  }, []);

  const getConversionRate = (rowUnitId, providerUnitId) => {
    const conversion = conversionRates.find(
      (rate) =>
        rate.idofbaseunit === rowUnitId && rate.idofconvertunit === providerUnitId
    );
  
    // If no conversion is found, return 1 as the default rate
    return conversion ? conversion.rate : 1;
  };

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredData(tableData);
    } else {
      const filtered = tableData.filter((row) =>
        Object.values(row).some((value) =>
          value && value.toString().toLowerCase().includes(searchText.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  }, [tableData, searchText]);

  // Fetch Levels for the popup form
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report3_leveloffactor`);
        setLevels(response.data); // Assuming response.data is the array of levels
      } catch (error) {
        console.error('Error fetching levels:', error);
      }
    };

    fetchLevels();
  }, []);

  // Fetch units for the popup form
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report3_units`);
        console.log('Units response:', response.data); // Add this to check if data is fetched
        setUnits(response.data); // Assuming response.data is the array of units
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };

    fetchUnits();
  }, []);

  // Fetch GWP Versions
// Fetch GWP Versions and set the latest as default
useEffect(() => {
  const fetchGwpVersions = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/gwpall`);
      
      // Assuming response.data contains the list of GWP versions
      const gwpList = response.data;

      // Sort GWP versions by version number or date (assuming gwpversion is a number or sortable)
      const sortedGwpList = gwpList.sort((a, b) => b.gwpversion - a.gwpversion);

      // Set the sorted list in state
      setGwpVersions(sortedGwpList);

      // Set the latest GWP version as default
      if (sortedGwpList.length > 0) {
        setSelectedGwpVersion(sortedGwpList[0].gwpid); // Select the latest GWP version by default
      }
    } catch (error) {
      console.error('Error fetching GWP versions:', error);
    }
  };

  fetchGwpVersions();
}, []);

  const handleGwpVersionChange = async (e) => {
    const selectedGwpId = e.target.value;
    setSelectedGwpVersion(selectedGwpId); // Update selected GWP version
  
    // Prepare data for API request
    const gwpRequestData = tableData.map(row => {
      const selectedProvider = row.factorProviders.find(
        (provider) => provider.providerName === row.selectedFactorProvider
      ) || row.factorProviders[0]; // Default to the first provider if no match
  
      return {
        gwpid: selectedGwpId,
        recordofceid: row.recordofceid,
        gasid: row.gasid,
        factorgasid: selectedProvider ? selectedProvider.factorgasid : 'N/A',
      };
    });
  
    console.log('GWP Request Data:', gwpRequestData); // Log request data for debugging
  
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_gwprate`, {
        gwpid: selectedGwpId,
        records: gwpRequestData
      });
  
      console.log('API Response Data:', response.data); // Log API response
  
      // Update the table with the received rates
      const updatedTableData = tableData.map((row) => {
        const rateData = response.data.find(
          (rateItem) => rateItem.recordofceid === row.recordofceid && rateItem.gasid === row.gasid
        );
        console.log('Matching Rate Data:', rateData); // Check if correct rate data is found
  
        return {
          ...row,
          co2e: rateData ? rateData.rate : 1 // Default to 1 if no rate found
        };
      });
  
      console.log('Updated Table Data:', updatedTableData); // Check updated table data
      setTableData([...updatedTableData]); // Update the table with new CO2e values
      setFilteredData([...updatedTableData]); 
      setTriggerRender(!triggerRender); // This forces a re-render
    } catch (error) {
      console.error('Error fetching CO2e rates:', error);
    }
  };
    

   // Fetch report data on component load based on the reportId, orgId, and year
   useEffect(() => {
    if (globalReportId && globalOrgId && globalYear) {
      // Fetch report data using these values
      fetchReportData(globalReportId, globalOrgId, globalYear);
    }
  }, [globalReportId, globalOrgId, globalYear]);

  // Fetch report data and merge factorProviders
  const fetchReportData = async (reportId, orgId, year) => {
    try {
      // Fetch preview and custom factor data
      const previewResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_list`, {
        reportId,
        orgId,
        year
        });
      const customFactorResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_customizedfactor`, { 
        reportId,
        orgId,
        year
       });

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
      const newApiResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get_package_data`, postData);
      console.log('New API Data:', newApiResponse.data);  // Debug log for new API response

      // Assume newApiResponse.data contains data similar to customFactorResponse but with the required fields
      const newApiCustomData = newApiResponse.data;

      // Merge report2_list, report2_customizedfactor, and get_package_data
      const mergedData = report2_list.map((reportItem, index) => {
        // Log the current report item being processed
        console.log('Processing reportItem:', reportItem);
        // Find all custom factors for this record
      const customFactors = report2_customizedfactor.filter(
        (factor) => factor.recordofceid === reportItem.recordofceid
      );

        // Find all new custom factors for this record
        const newCustomFactors = newApiCustomData.filter(
            (factor) => factor.gasid === reportItem.gasid && factor.objecttype === reportItem.objecttype
        );

        // Log both factors to verify if they are found correctly
        console.log('Custom Factor:', customFactors);
        console.log('New Custom Factor:', newCustomFactors);

        // Initialize factorProviders array
        const factorProviders = [];

      // Add all custom factors (if any)
      customFactors.forEach((customFactor) => {
        factorProviders.push({
          providerId: customFactor.factorid,
          providerName: customFactor.factorprovidername || '自訂係數',
          version: customFactor.version || 'N/A',
          rate: customFactor.rate,
          unitname: customFactor.unitname,
          unitid: customFactor.unitid,
          pkgid: customFactor.pkgid,
          factorgasid: customFactor.factorgasid,
        });
      });

      // Add all new custom factors (if any)
      newCustomFactors.forEach((newCustomFactor) => {
        factorProviders.push({
          providerId: newCustomFactor.factorid,
          providerName: newCustomFactor.factorprovidername,
          version: newCustomFactor.version,
          rate: newCustomFactor.rate,
          unitname: newCustomFactor.unitname,
          unitid: newCustomFactor.unitid,
          pkgid: newCustomFactor.pkgid,
          factorgasid: newCustomFactor.factorgasid,
        });
      });

      // If no factors exist, provide default
      if (factorProviders.length === 0) {
        factorProviders.push({
          providerName: 'N/A',
          version: 'N/A',
          rate: 'N/A',
        });
      }

      // Set the selectedFactorProvider to the first provider by default
      const selectedProviderName = factorProviders[0].providerName;

        // Return the merged reportItem with factorProviders
        return {
          ...reportItem,
          factorProviders,
          factorgasid: customFactors?.factorgasid || newCustomFactors?.factorgasid || 'N/A', // Ensure factorgasid is set
          selectedFactorProvider: selectedProviderName,
          index, // Add index to identify the row
        };
      });
      // **Sort the mergedData based on the fields you want to compare**
      const sortedData = mergedData.sort((a, b) => new Date(a.createdate) - new Date(b.createdate));/*{
        if (a.cateofastname !== b.cateofastname) return a.cateofastname.localeCompare(b.cateofastname);
        if (a.processname !== b.processname) return a.processname.localeCompare(b.processname);
        if (a.objectname !== b.objectname) return a.objectname.localeCompare(b.objectname);
        return a.gasname.localeCompare(b.gasname);
      });*/

      console.log('Merged Data:', sortedData);
      
      // Update the state with the final merged data
    setTableData(sortedData);
    setFilteredData(sortedData);

      if (sortedData.length > 0) {
        const report = sortedData[0];
        setFormData({
          organization: report.orgname,
          year: report.year,
          factorcode: report.factorcode,
          reportname: report.reporttemplatename,
          requestor: report.requestor,
          gwpVersion: report.gwp,
          printDate: new Date(report.reportcreatedate).toLocaleString(),
        });

        // Set selected GWP version based on fetched data
        setSelectedGwpVersion(report.gwp);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

   // Handle button click to open the factor selection dialog
   const handleOpenFactorDialog = (rowId) => {
    setSelectedRowId(rowId); // Store the selected row's unique ID
    const row = tableData.find(r => r.recordofceid === rowId); // Use the unique identifier to find the row
    setFactorProviders(row?.factorProviders || []); // Update factor providers for the dialog
    setDialogPage(0); // Reset pagination to the first page
    setDialogRowsPerPage(5); // Default the rows per page to 5
    setOpenFactorDialog(true); // Open the dialog
  };
    // Add a new state to store the selected row's unique ID
    const handleSelectFactorProvider = (provider) => {
      const updatedTableData = [...tableData];
      const rowIndex = updatedTableData.findIndex(r => r.recordofceid === selectedRowId); // Find the row by unique ID
    
      if (rowIndex !== -1) {
        updatedTableData[rowIndex].selectedFactorProvider = provider.providerName;
        updatedTableData[rowIndex].version = provider.version;
        updatedTableData[rowIndex].rate = provider.rate;
    
        // Update conversion rate if applicable
        const conversionRate = getConversionRate(updatedTableData[rowIndex].unitid, provider.unitid);
        updatedTableData[rowIndex].conversionRate = conversionRate;
    
        setTableData(updatedTableData);
        setFilteredData(updatedTableData); // Ensure filtered data is also updated
        setOpenFactorDialog(false); // Close the dialog
      } else {
        console.error('Selected row not found in tableData');
      }
    };

  // Function to handle form input changes
  const handleFormChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
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
    const searchValue = e.target.value.toLowerCase();
    setSearchText(searchValue);
  
    // Filter the data based on search input
    const filtered = tableData.filter((row) =>
      Object.values(row).some((value) =>
        value && value.toString().toLowerCase().includes(searchValue)
      )
    );
    
    setFilteredData(filtered);
    setPage(0); // Reset to the first page after a new search
  };
  


  // Handle Submit Factor (with levelId & unitId)
  const handleSubmitFactor = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/creatfactor`, {
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
        factorid:popupFormData.factorid,
        ghgid: popupFormData.ghgid, 
        year:popupFormData.year,
        factorcode:popupFormData.factorcode
      });
      console.log('Factor added successfully:', response.data);
      handleCloseDialog(); // Close dialog after successful submission
    } catch (error) {
      console.error('Error creating factor:', error);
    }
  };
  useEffect(() => {
    console.log('Updated Table Data:', tableData);
  }, [tableData])
  // Function to handle factor provider selection change
  const handleProviderChange = (selectedProvider, rowIndex) => {
    const updatedTableData = [...tableData];

    const row = updatedTableData.find(r => r.index === rowIndex);

    if (row) {
      const selectedProviderDetails = row.factorProviders.find(
        (provider) => provider.providerName === selectedProvider
      );

      if (selectedProviderDetails) {
        row.selectedFactorProvider = selectedProviderDetails.providerName;
        // No need to update version and rate here, as render function will pick up the correct values
         // Update the conversion rate when provider changes
      const conversionRate = getConversionRate(row.unitid, selectedProviderDetails.unitid);
      row.conversionRate = conversionRate; // Store conversion rate in the row
      }

      setTableData(updatedTableData);
     // setFilteredData(updatedTableData); // Make sure the filtered data is updated too
    }
  };

  // Function to render the dropdown if both GWP and custom factors exist
  const renderFactorProviderDropdown = (row) => {
    // Log row data for debugging purposes
    //console.log('Row Data:', row);

    // Ensure row.factorProviders exists and has at least one provider
    if (row.factorProviders && row.factorProviders.length > 1) {
      return (
        <Select
          value={row.selectedFactorProvider || ''} // Ensure it's not undefined
          onChange={(e) => handleProviderChange(e.target.value, row.index)}
        >
          {row.factorProviders.map((provider, idx) => (
            <MenuItem key={idx} value={provider.providerName}>
            {provider.providerName}
          </MenuItem>
          ))}
        </Select>
      );
    }

    // If only one provider exists, display it as a static value
    if (row.factorProviders && row.factorProviders.length === 1) {
      return row.factorProviders[0].providerName || 'N/A';
    }

    // If factorProviders is empty or undefined, return 'N/A'
    return 'N/A';
  };

  // Function to render version and rate based on selected provider
  const renderFactorDetails = (row) => {
    if (row.factorProviders && row.factorProviders.length > 0) {
      const selectedProvider = row.factorProviders.find(
        (provider) => provider.providerName === row.selectedFactorProvider
      ) || row.factorProviders[0]; // Default to the first provider if no match

       // Get conversion rate by matching unit IDs
    const conversionRate = getConversionRate(row.unitid, selectedProvider.unitid);

      return (
        <>
          <TableCell>{selectedProvider.version || 'N/A'}</TableCell>
          <TableCell>{selectedProvider.rate || 'N/A'} {selectedProvider.unitname || 'N/A'}</TableCell>
          <TableCell>{conversionRate}</TableCell> {/* Display conversion rate (CR) */}
          <TableCell>{row.sum} {row.unitname}</TableCell> 
          <TableCell>{(row.sum*conversionRate)*selectedProvider.rate } {selectedProvider.unitname || 'N/A'}</TableCell> 
          <TableCell>{row.co2e}</TableCell>
          <TableCell>{((row.sum*conversionRate)*selectedProvider.rate)*row.co2e } {selectedProvider.unitname || 'N/A'}</TableCell> 
        </>
      );
    }

    // If no factorProviders, return 'N/A'
    return (
      <>
        <TableCell>N/A</TableCell>
        <TableCell>N/A</TableCell>
        <TableCell>N/A</TableCell> {/* Default value for CR */}
        <TableCell>{row.sum}</TableCell> 
      </>
    );
  };
  const handleSubmitFinalResult = async () => {
    const finalResult = tableData.map(row => {
      const selectedProvider = row.factorProviders.find(provider => provider.providerName === row.selectedFactorProvider);

       // Calculate sum and rate
    const sum = row.sum || 0; // Assuming row.sum is coming from report2_list
    const rate = selectedProvider?.rate || 1; // If no rate, default to 1
    const co2e = row.co2e || 0; // Ensure row.co2e exists or default to 0
    const multiple = sum * rate * co2e; // Calculate multiple with sum, rate, and co2e
  
      return {
        personid:personId,
        recordofceid: row.recordofceid,
        groupofgas: row.groupofgas,
        gasid: row.gasid,
        objectid: row.objectid,
        pkgid: selectedProvider ? selectedProvider.pkgid : null,
        providerId: selectedProvider ? selectedProvider.providerId : null,
        factorgasid: selectedProvider ? selectedProvider.factorgasid : null,
        idofheader:globalReportId,
        sum: row.sum, // Include sum
        co2e: multiple, // Send co2e
      };
    });
  
    console.log('Final Result:', finalResult);
  
    try {
      // Send data to the API endpoint using axios
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/final_result`, finalResult);
  
      // Log the API response
      console.log('API Response:', response.data);
  
      // You can handle any success actions here, like showing a notification
    } catch (error) {
      // Log and handle any errors from the API call
      console.error('Error sending final result:', error);
    }
  };
  
  // Pagination logic for the dialog
  const paginatedFactorProviders = factorProviders.slice(dialogPage * dialogRowsPerPage, dialogPage * dialogRowsPerPage + dialogRowsPerPage);
  // Handle dialog page change
  const handleDialogChangePage = (event, newPage) => {
    setDialogPage(newPage);
  };

    // Handle dialog rows per page change
    const handleDialogRowsPerPageChange = (event) => {
        setDialogRowsPerPage(parseInt(event.target.value, 10));
        setDialogPage(0); // Reset to first page
      };
  // Pagination logic
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container disableGutters maxWidth={false} sx={{ mt: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        {t('reportPreview')}
      </Typography>

      {/* Top Section with 6 fields (3 on each side) */}
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label={t('organizationrch')}
            value={formData.organization}
            onChange={(e) => handleFormChange(e, 'organization')}
            disabled // Read-only as data comes from API
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label={t('requestor')}
            value={formData.requestor}
            onChange={(e) => handleFormChange(e, 'requestor')}
            disabled // Read-only as data comes from API
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label={t('year')}
            value={formData.year}
            onChange={(e) => handleFormChange(e, 'year')}
            disabled // Read-only as data comes from API
          />
        </Grid>
        <Grid item xs={4}>
       {/* GWP Version Selector */}
       <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>{t('gwpVersion')}</InputLabel>
  <Select
    value={selectedGwpVersion || ''}
    onChange={handleGwpVersionChange} // Trigger API call when GWP version is selected
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
            label={t('formatTemplate')}
            value={formData.reportname}
            onChange={(e) => handleFormChange(e, 'reportname')}
            disabled // Read-only as data comes from API
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label={t('printDate')}
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
            label={t('search')}
            variant="outlined"
            value={searchText}
            onChange={handleSearchChange}
            />
            <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={handleSubmitFinalResult}>
            {t('submit')}
            </Button>
        </Box>
        </Box>

      {/* Table Section */}
      <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Table
  sortDirection={false} // Disable default sorting
>
          <TableHead>
          <TableRow>
                <TableCell sx={tableHeaderStyles}>{t('categoryOfAsset')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('process')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('object')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('gas')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('factorProvider')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('version')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('rate')}</TableCell>
                <TableCell sx={tableHeaderStyles}>CR</TableCell> {/* Sum Column */}
                <TableCell sx={tableHeaderStyles}>{t('sum')}</TableCell> {/* Sum Column */}  
              <TableCell sx={tableHeaderStyles}>{t('rate')}* ({t('sum')}*CR) </TableCell> {/* Multiple Column */}
              <TableCell sx={tableHeaderStyles}>{t('Co2e-Rate')}</TableCell> {/* Co2e Column */}
              <TableCell sx={tableHeaderStyles}>{t('Co2e')}</TableCell> {/* Co2e Column */}
                <TableCell sx={tableHeaderStyles}>{t('action')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('change Facto ')}</TableCell>
                
                </TableRow>
          </TableHead>
          <TableBody>
  {paginatedData.map((row, index) => {
    const actualIndex = page * rowsPerPage + index; // Calculate the actual index if needed
     let isSameAsPrevious = false;
     let isSameAsNext = false; // To track if the current row is part of a group based on the next row
    // Check if the current row and the previous row have the same values
      // Check if the current row and the previous row are part of the same group
      if (index > 0) {
        isSameAsPrevious =
          row.cateofastname.trim().toLowerCase() === paginatedData[index - 1].cateofastname.trim().toLowerCase() &&
          row.processname.trim().toLowerCase() === paginatedData[index - 1].processname.trim().toLowerCase() &&
          row.objectname.trim().toLowerCase() === paginatedData[index - 1].objectname.trim().toLowerCase();
    }
    if (index < paginatedData.length - 1) {
        // Compare only if there's a previous row (index > 0)
        isSameAsNext =
          row.cateofastname.trim().toLowerCase() === paginatedData[index + 1].cateofastname.trim().toLowerCase() &&
          row.processname.trim().toLowerCase() === paginatedData[index + 1].processname.trim().toLowerCase() &&
          row.objectname.trim().toLowerCase() === paginatedData[index + 1].objectname.trim().toLowerCase()
      }
      // Determine if the row should be part of a colored group
    const isGrouped = isSameAsPrevious || isSameAsNext;
      // Get the selected factor provider's rate
      const selectedProvider = row.factorProviders.find(
        (provider) => provider.providerName === row.selectedFactorProvider
      ) || row.factorProviders[0]; // Default to the first provider if no match

      // Calculate "Sum" and "Multiple"
      const sum = row.sum || 0; // Assuming row.sum is coming from report2_list
      const rate = selectedProvider?.rate || 1; // If no rate, default to 1
      const multiple = (sum *selectedProvider?.rate); // Calculate the multiple
    return (
      <TableRow
        key={row.recordofceid}
        sx={{
            backgroundColor: isGrouped ?  '#e7f3fe' : '#f5f5f5',
        }}
      >
         {/* Hide columns when isSameAsPrevious is true */}
         <TableCell>{isSameAsPrevious ? '' : row.cateofastname}</TableCell>
        <TableCell>{isSameAsPrevious ? '' : row.processname}</TableCell>
        <TableCell>{isSameAsPrevious ? '' : row.objectname}</TableCell>
        <TableCell>{row.gasname}</TableCell>
          {/* Show selected factor provider name */}
          <TableCell>{selectedProvider.providerName}</TableCell>
        {renderFactorDetails(row)}
        
                  {/*<TableCell>{multiple}{selectedProvider?.unitname }</TableCell>  Render the multiple value */}
                  {/*<TableCell>{row.co2e}</TableCell>  Co2e from API */}
                  {/*<TableCell>{row.co2e * multiple}</TableCell> {/* Co2e from API */}
                  
        <TableCell>
        <Button onClick={() => handleOpenDialog(row)} variant="contained">
            {t('addFactor')}
          </Button>
        </TableCell>
        <TableCell>
        <Button onClick={() => handleOpenFactorDialog(row.index)} variant="contained">
            {t('change Factor')}
          </Button>
                </TableCell>
      </TableRow>
    );
  })}
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

         {/* Popup Dialog for "Change Factor" Button */}
     {/* Popup Dialog for "Change Factor" Button */}
<Dialog open={openFactorDialog} onClose={() => setOpenFactorDialog(false)} fullWidth maxWidth="sm">
  <DialogTitle>{t('chooseFactorProvider')}</DialogTitle>
  <DialogContent>
    {paginatedFactorProviders.map((provider, idx) => (
      <Button
        key={idx}
        fullWidth
        variant="outlined"
        onClick={() => handleSelectFactorProvider(provider)}
        sx={{ mb: 2 }}
      >
        {dialogPage * dialogRowsPerPage + idx + 1}. {provider.providerName} - {provider.version} - {provider.rate}
      </Button>
    ))}
  </DialogContent>
  <DialogActions>
    <TablePagination
      component="div"
      count={factorProviders.length}
      page={dialogPage}
      onPageChange={handleDialogChangePage}
      rowsPerPage={dialogRowsPerPage}
      onRowsPerPageChange={handleDialogRowsPerPageChange}
      rowsPerPageOptions={[5, 10, 20]} // Allow different options but default is 5
    />
    <Button onClick={() => setOpenFactorDialog(false)} color="primary">
      {t('cancel')}
    </Button>
  </DialogActions>
</Dialog>

      {/* Popup Dialog for "Add Factor" Button */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>自訂係數 (Customize Factor)</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="設備類別 (Category of Asset)"
                value={popupFormData.category}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="製程 (Process)"
                value={popupFormData.process}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="添加物 (Object)"
                value={popupFormData.object}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="排放氣體 (Gas)"
                value={popupFormData.gas}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="係數提供商 (Factor Provider)"
                value={popupFormData.factorProvider}
                onChange={(e) => setPopupFormData({ ...popupFormData, factorProvider: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="係數版本 (Version)"
                value={popupFormData.version}
                onChange={(e) => setPopupFormData({ ...popupFormData, version: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>係數等級 (Level)</InputLabel>
                <Select
                  value={popupFormData.level} // The selected level's UUID
                  onChange={(e) => setPopupFormData({ ...popupFormData, level: e.target.value })} // Store UUID on selection
                >
                  {levels.map((level) => (
                    <MenuItem key={level.uuid} value={level.uuid}>
                      {level.code} - {level.name} {/* Show name and code in the dropdown */}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={popupFormData.unit} // The selected unit's UUID
                  onChange={(e) => setPopupFormData({ ...popupFormData, unit: e.target.value })} // Store UUID on selection
                >
                  {units.map((unit) => (
                    <MenuItem key={unit.unitid} value={unit.unitid}>
                      {unit.unitname} - {unit.unittypename} {/* Show name and code in the dropdown */}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="係數 (Factor)"
                value={popupFormData.factor}
                onChange={(e) => setPopupFormData({ ...popupFormData, factor: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="係數說明 (Description of Factor)"
                value={popupFormData.description}
                onChange={(e) => setPopupFormData({ ...popupFormData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
          <Button onClick={handleSubmitFactor} color="primary" variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReportPreview;