/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, Select, MenuItem,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  Typography, TablePagination, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { useRouter } from 'next/router'; // For fetching reportId from URL
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { tableHeaderStyles } from '../styles/styles'; // Import the styles
// Inside ReportPreview
import { useAuth } from '../components/AuthContext'; // Import the AuthContext to access reportId
import { useGlobalContext } from '../components/GlobalContext'; // Import the GlobalContext to access reportId, orgId, year,yearid
import CheckIcon from '@mui/icons-material/Check';

const ReportPreview = () => {
  // Translation Hook
  const { t } = useTranslation(); // Translation hook
  const [openScopeDialog, setOpenScopeDialog] = useState(false); // State to control dialog visibility
  const [selectedScopeFilters, setSelectedScopeFilters] = useState([]); // State for selected filters
  const [openScopeSelectionPopup, setOpenScopeSelectionPopup] = useState(false);
  const handleOpenScopeSelectionPopup = () => {
    setOpenScopeSelectionPopup(true);
  };
  
  const handleCloseScopeSelectionPopup = () => {
    setOpenScopeSelectionPopup(false);
  };

  
  // Handle opening and closing of scope dialog
  const handleOpenScopeDialog = () => setOpenScopeDialog(true);
  const handleCloseScopeDialog = () => setOpenScopeDialog(false);
 

  // Use GlobalContext to get reportId, orgId, and year
  const { globalReportId, globalOrgId, globalYear, globalYearid } = useGlobalContext();
  
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

  const [versions, setVersions] = useState([]);
const [selectedVersion, setSelectedVersion] = useState('');


// Handler to trigger fetching when the drop-down is opened
const handleVersionDropdownOpen = () => {
  // Only fetch if versions haven't been loaded yet
  if (versions.length === 0 && globalReportId) {
    fetchVersionList(globalReportId);
  }
};

const fetchVersionList = async (reportId) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get_multiple_version_list`, {
      reportid: reportId,
    });
    // Sort descending so the latest version appears first (assumes version can be cast to Number)
    const sortedVersions = response.data.sort((a, b) => Number(b.version) - Number(a.version));
    setVersions(sortedVersions);

    // Set the selected version to the first item in the sorted list
    if (sortedVersions.length > 0) {
      setSelectedVersion(sortedVersions[0].version);
    }
  } catch (error) {
    console.error('Error fetching version list:', error);
  }
};

// ✅ New useEffect to trigger API when a version is selected
useEffect(() => {
  if (selectedVersion && globalReportId && personId) {
    fetchVersionData(globalReportId, selectedVersion, personId);
  }
}, [selectedVersion, globalReportId, personId]);

const fetchVersionData = async (globalReportId, versionNumber, personId) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get_version_data`, {
      reportid: globalReportId,
      version: versionNumber,
      personid: personId,
    });

    console.log('Version data:', response.data);

    // Update the table data using the fetched version data
    setTableData(prevTableData =>
      updateTableDataWithVersionData(response.data, prevTableData)
    );
  } catch (error) {
    console.error('Error fetching version data:', error);
  }
};

// ✅ Modify version selection handler to update the state
const handleVersionChange = (event) => {
  const newVersion = event.target.value;
  setSelectedVersion(newVersion);

  if (newVersion && globalOrgId && personId) {
    fetchVersionData(globalReportId, newVersion, personId);
  }
};

const updateTableDataWithVersionData = (versionData, tableData) => {
  return tableData.map(row => {
    // Find a matching version data entry for this row
    const matchingVersion = versionData.find(vd =>
      vd.idofrecordce === row.recordofceid &&
      vd.idofgas === row.gasid &&
      vd.idofghg === row.ghgid
    );

    if (matchingVersion) {
      return {
        ...row,
        // Update the selected factor provider to the one from version data
        selectedFactorProviderId: matchingVersion.idoffactorgas,
        // Optionally update the factor value (e.g., co2e) if you want to override it
        co2e: matchingVersion.co2e,
      };
    }
    return row;
  });
};

  // State for the table data from the API
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Data after search filter
  // State for the scope filter popup
  const [openScopeFilterDialog, setOpenScopeFilterDialog] = useState(false);
 
  const [scopeGroups, setScopeGroups] = useState([]);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Popup dialog state
  const [openFactorDialog, setOpenFactorDialog] = useState(false);
  // Remove selectedRowIndex as we're using selectedRowId
  // const [selectedRowIndex, setSelectedRowIndex] = useState(null); // For storing the selected row
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

  // State for scope details (dropdown)
  const [scopeDetails, setScopeDetails] = useState([]); 
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false); // Confirmation dialog state
  const handleOpenConfirmation = () => {
    setIsConfirmationOpen(true);
  };
  
  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false);
  };
  const handleSubmitButtonClick = () => {
    handleOpenConfirmation(); // Open the confirmation dialog
  };
  // State for the popup form values (including IDs)
  const [popupFormData, setPopupFormData] = useState({
    factorProvider: '',
    version: '',
    level: '',
    unit: '',
    unitname:'',
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

  // Add a new state to store the selected row's unique ID
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isTableDataLoaded, setIsTableDataLoaded] = useState(false); // Declare before useEffect

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
      unit:'', // Set unit to blank initially
      unitname:'' // Set unit to blank initially
    });
  };
// Function to handle scope filter popup close
const handleCloseScopeFilterDialog = () => {
  setOpenScopeFilterDialog(false);
};
  // Function to close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
// Function to handle scope filter selection change
const handleScopeFilterChange = (id) => {
  setSelectedScopeFilters((prevFilters) => {
    const updatedFilters = prevFilters.includes(id)
      ? prevFilters.filter((filter) => filter !== id) // Remove if already selected
      : [...prevFilters, id]; // Add if not selected

    // If the updated filters are empty, reset the data
    if (updatedFilters.length === 0) {
      setFilteredData(tableData); // Reset to show all data
    } else {
      // Apply filtering based on updated filters
      const filtered = tableData.filter((row) =>
        updatedFilters.some((filter) => row.ghgid && row.ghgid.includes(filter))
      );
      setFilteredData(filtered);
    }

    return updatedFilters;
  });
};


// Function to handle scope filter confirmation (apply filters)
// Function to handle scope filter confirmation (apply filters)
const handleApplyScopeFilters = () => {
  const filtered = tableData.filter((row) =>
    selectedScopeFilters.some((filter) => row.ghgid && row.ghgid.includes(filter))
  );
  setFilteredData(filtered);
  setPage(0); // Reset to the first page after filtering
  handleCloseScopeSelectionPopup();
};

// Function to clear all scope filters
const handleClearScopeFilters = () => {
  setSelectedScopeFilters([]);
  setFilteredData(tableData);
  setPage(0); // Reset to the first page after clearing filters
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
  // Add the new useEffect here
  useEffect(() => {
    if (tableData.length > 0 && conversionRates.length > 0) {
      // Avoid directly updating tableData and triggering infinite loop
      const updatedTableData = tableData.map((row) => {
        const selectedProvider = row.factorProviders.find(
          (provider) => provider.factorgasid === row.selectedFactorProviderId
        ) || row.factorProviders[0];
  
        const conversionRate = getConversionRate(row.unitid, selectedProvider.unitid);
  
        return {
          ...row,
          conversionRate,
        };
      });
  
      // Compare with the current state to avoid redundant updates
      if (JSON.stringify(updatedTableData) !== JSON.stringify(tableData)) {
        setTableData(updatedTableData);
        setFilteredData(updatedTableData); // Update the filtered data
      }
    }
  }, [tableData, conversionRates, getConversionRate]);

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
        setLevels(response.data);
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
        setUnits(response.data);
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };

    fetchUnits();
  }, []);

  // Fetch GWP Versions and set the latest as default
  useEffect(() => {
    if (isTableDataLoaded) {
      const fetchAndSetGwpVersions = async () => {
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/gwpall`);
          const gwpList = response.data;
          const sortedGwpList = gwpList.sort((a, b) => b.gwpversion - a.gwpversion);

          setGwpVersions(sortedGwpList);

          if (sortedGwpList.length > 0) {
            const firstGwp = sortedGwpList[0];
            setSelectedGwpVersion(firstGwp.gwpid);
            handleGwpVersionChange({ target: { value: firstGwp.gwpid } });
          }
        } catch (error) {
          console.error('Error fetching GWP versions:', error);
        }
      };

      fetchAndSetGwpVersions();
    }
  }, [isTableDataLoaded]); // Trigger only when table data is loaded

  const handleGwpVersionChange = async (event) => {
    const selectedGwpId = event.target.value;
    setSelectedGwpVersion(selectedGwpId);
  
    try {
      const gwpRequestData = tableData.map((row) => ({
        gwpid: selectedGwpId,
        recordofceid: row.recordofceid,
        gasid: row.gasid,
        objectid:row.objectid,
        //factorgasid: row.factorProviders?.[0]?.factorgasid || 'N/A',
      }));
  
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_gwprate`, {
        gwpid: selectedGwpId,
        records: gwpRequestData,
      });
  
      const updatedTableData = tableData.map((row) => {
        const rateData = response.data.find(
          (rateItem) => rateItem.pkgid === row.gwpid && rateItem.gasid === row.gasid && rateItem.objectid === row.objectid 
        );
  
        return {
          ...row,
          co2e: rateData ? rateData.rate : 1,
        };
      });
  
      setTableData(updatedTableData);
      setFilteredData(updatedTableData);
    } catch (error) {
      console.error('Error fetching CO2e rates:', error);
    }
  };
    

 // Fetch report data on component load based on the reportId, orgId, and year
 useEffect(() => {
  if (globalReportId && globalOrgId && globalYear && globalYearid) {
    // Fetch report data using these values
    fetchReportData(globalReportId, globalOrgId, globalYear, globalYearid);
  }
}, [globalReportId, globalOrgId, globalYear,globalYearid]);
 
// Fetch report data and merge factorProviders
const fetchReportData = async (reportId, orgId,year, yearid) => {
  try {
    // Fetch preview and custom factor data
    const previewResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_list`, {
      reportId,
      orgId,
      year,
      yearid
      });
    const customFactorResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_customizedfactor`, { 
      reportId,
      orgId,
      yearid
     });

    console.log('Preview Data:', previewResponse.data);  // Debug log for preview data
    console.log('Custom Factor Data:', customFactorResponse.data);  // Debug log for custom factor data

    // Assuming both responses return arrays of data
    const report2_list = previewResponse.data;
    const report2_customizedfactor = customFactorResponse.data;

    // Create a map from objecttype to objectids and their gasids
    const objectGasMap = {};

    report2_list.forEach((reportItem) => {
      const { gasid, objecttype, objectid } = reportItem;

      if (gasid && objecttype && objectid) {
        if (!objectGasMap[objecttype]) {
          objectGasMap[objecttype] = {}; // Initialize objecttype entry
        }

        if (!objectGasMap[objecttype][objectid]) {
          objectGasMap[objecttype][objectid] = new Set(); // Initialize objectid entry
        }

        objectGasMap[objecttype][objectid].add(gasid); // Add gasid to the set
      }
    });



      // Create an array where each entry has objecttype, objectid, and gasid
      const objectGasArray = report2_list
      .filter(reportItem => reportItem.gasid && reportItem.objecttype && reportItem.objectid)
      .map(reportItem => ({
        objecttype: reportItem.objecttype,
        objectid: reportItem.objectid,
        gasid: reportItem.gasid, // individual gasid
      }));

    // POST data to API
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
        (factor) => factor.gasid === reportItem.gasid && factor.objectid === reportItem.objectid
      );

      // Find all new custom factors for this record
      const newCustomFactors = newApiCustomData.filter(
        (factor) => factor.gasid === reportItem.gasid &&
                    (factor.objectid === reportItem.objectid || factor.objectid === null)
    );

      // Log both factors to verify if they are found correctly
      console.log('Custom Factor:', customFactors);
      console.log('New Custom Factor:', newCustomFactors);

      // Initialize factorProviders array
      const factorProviders = [];

      // Add all custom factors (if any)
      customFactors.forEach((customFactor) => {
        factorProviders.push({
          providerId: customFactor.providerid,
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
      // Set the selectedFactorProviderId to the first provider's factorgasid by default
      const selectedProviderId = factorProviders[0].factorgasid;

      return {
        ...reportItem,
        factorProviders,
        factorgasid: customFactors?.factorgasid || newCustomFactors?.factorgasid || 'N/A',
        selectedFactorProviderId: selectedProviderId,
        recordofceid: reportItem.recordofceid || `unique-id-${index}`,
        rowId: `${reportItem.recordofceid}-${reportItem.gasid}-${index}`, // Unique per row
      };
    });

    // Sort the mergedData based on the createdate
    const sortedData = mergedData.sort((a, b) => new Date(a.createdate) - new Date(b.createdate));

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
// Mark table data as loaded
setIsTableDataLoaded(true);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Handle button click to open the factor selection dialog
const handleOpenFactorDialog = (rowId) => {
  setSelectedRowId(rowId);
  const row = tableData.find(r => r.rowId === rowId);
  setFactorProviders(row?.factorProviders || []);
  setDialogPage(0);
  setDialogRowsPerPage(5);
  setOpenFactorDialog(true);
};

const [triggerRender, setTriggerRender] = useState(false);
// Handle selecting a factor provider from the dialog
const handleSelectFactorProvider = (provider) => {
  const updatedTableData = tableData.map((row) => {
    if (row.rowId === selectedRowId) {
      return {
        ...row,
        selectedFactorProviderId: provider.factorgasid,
        conversionRate: getConversionRate(row.unitid, provider.unitid),
      };
    }
    return row;
  });

  setTableData(updatedTableData);
  setFilteredData(updatedTableData);
  setOpenFactorDialog(false);
};
useEffect(() => {
  console.log('Table data updated:', tableData);
}, [tableData, triggerRender]); // Add `triggerRender` to ensure updates are logged
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
      unitName:popupFormData.unittypename,
      factorid:popupFormData.factorid,
      ghgid: popupFormData.ghgid, 
      year:popupFormData.year,
      factorcode:popupFormData.factorcode,
      personId:personId
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
// Function to handle factor provider selection change (optional, based on your logic)
const handleProviderChange = (selectedFactorgasid, rowId) => {
  const updatedTableData = tableData.map((row) => {
    if (row.rowId === rowId) {
      const selectedProviderDetails = row.factorProviders.find(
        (provider) => provider.factorgasid === selectedFactorgasid
      );

      if (selectedProviderDetails) {
        const conversionRate = getConversionRate(row.unitid, selectedProviderDetails.unitid);
        return {
          ...row,
          selectedFactorProviderId: selectedFactorgasid,
          conversionRate,
        };
      }
    }
    return row;
  });

  setTableData(updatedTableData);
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
        onChange={(e) => handleProviderChange(e.target.value, row.recordofceid)}
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
      (provider) => provider.factorgasid === row.selectedFactorProviderId
    ) || row.factorProviders[0];

    const conversionRate = row.conversionRate || 1;
 /* List of gas IDs that should force rate to 1
 const forceRateGasIds = new Set([
  "78416ab0-1dd1-40f6-b403-3aa9f7a06c75",
  "6882310c-7a0a-43f0-a29d-db45822c54c5",
  "46a4ba9e-c09b-4f01-89f2-80c85d961b21",
  "3f32c789-78d6-4f9b-b583-1c04a4cf08a3",
]);*/
    // Force selectedProvider.rate to 1 if objecttype is 2
  //  const providerRate = forceRateGasIds.has(row.gasid) ? 1 : selectedProvider.rate;
    const providerRate =  selectedProvider.rate;

    return (
      <>
      <TableCell>{selectedProvider.providerName || "N/A"}</TableCell>
        <TableCell>{selectedProvider.version || "N/A"}</TableCell>
        <TableCell>
          {providerRate || "N/A"} {selectedProvider.unitname || "N/A"}
        </TableCell>
        <TableCell>{conversionRate}</TableCell>
        <TableCell>
          {row.sum} {row.unitname}
        </TableCell>
        <TableCell>
          {(row.sum * conversionRate * providerRate).toFixed(2) || "N/A"}{" "}
          {selectedProvider.unitname || "N/A"}
        </TableCell>
        <TableCell>{row.co2e}</TableCell>
        <TableCell>
          {selectedProvider.unitname !== "公噸" ? (
            (() => {
              // Get the new conversion rate specifically for 公噸
              const newConversionRate = getConversionRate(
                selectedProvider.unitid,
                "0ef7be54-d301-4218-83b1-5e5df66c3944"
              );
              // Recalculate the value with the new conversion rate
              const recalculatedValue = (
                ((conversionRate * row.sum * providerRate * newConversionRate * row.co2e) || 0).toFixed(6)
              );
              return `${recalculatedValue} 公噸`;
            })()
          ) : (
            // Original calculation if the unit is already 公噸
            `${((row.sum * conversionRate * providerRate * row.co2e) || 0).toFixed(6)} ${
              selectedProvider.unitname || "N/A"
            }`
          )}
        </TableCell>
      </>
    );
  }

  return (
    <>
      <TableCell>N/A</TableCell>
      <TableCell>N/A</TableCell>
      <TableCell>N/A</TableCell>
      <TableCell>{row.sum}</TableCell>
    </>
  );
};

useEffect(() => {
  console.log('Table data updated:', tableData);
}, [tableData]);
const handleSubmitFinalResult = async () => {
  const finalResult = tableData.map((row) => {
    const selectedProvider = row.factorProviders.find(
      (provider) => provider.factorgasid === row.selectedFactorProviderId
    );
    var newConversionRate_send = 1;
    if (selectedProvider.unitname !== '公噸') {
      newConversionRate_send = getConversionRate(selectedProvider.unitid, "0ef7be54-d301-4218-83b1-5e5df66c3944");
    }
    const conversionRate = row.conversionRate || 1;
    // Calculate sum and rate
    const sum = row.sum || 0;
    const rate = selectedProvider?.rate || 1;
    const co2e = row.co2e || 0;
    const multiple = ((conversionRate * sum) * rate) * newConversionRate_send * co2e;

    return {
      personid: personId,
      recordofceid: row.recordofceid,
      groupofgas: row.groupofgas,
      gasid: row.gasid,
      idofghg: row.ghgid,
      objectid: row.objectid,
      pkgid: selectedProvider ? selectedProvider.pkgid : null,
      providerId: selectedProvider ? selectedProvider.providerId : null,
      factorgasid: selectedProvider ? selectedProvider.factorgasid : null,
      idofheader: globalReportId,
      sum: row.sum,
      co2e: multiple,
      gwpid: selectedGwpVersion
    };
  });

  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/final_result`, finalResult);
    console.log('API Response:', response.data);
    // Handle success
  } catch (error) {
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
const groupScopesByLid = (scopes) => {
  return scopes.reduce((acc, scope) => {
    if (!acc[scope.lidoftypeofghg]) {
      acc[scope.lidoftypeofghg] = [];
    }
    acc[scope.lidoftypeofghg].push(scope);
    return acc;
  }, {});
};

// Pagination logic
const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

 


const [groupedScopes, setGroupedScopes] = useState([]);
const groupScopesByLidOfDescOfIso = (scopes) => {
  return scopes.reduce((acc, scope) => {
    if (!acc[scope.lidofdescofiso]) {
      acc[scope.lidofdescofiso] = [];
    }
    acc[scope.lidofdescofiso].push(scope);
    return acc;
  }, {});
};
useEffect(() => {
  const fetchScopeDetails = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scopedetails`);
      const scopeData = response.data;

      // Group data by `lidofdescofiso`
      const grouped = groupScopesByLidOfDescOfIso(scopeData);
      setGroupedScopes(Object.entries(grouped)); // Convert grouped object to an array for rendering
    } catch (error) {
      console.error('Error fetching scope details:', error);
    }
  };

  fetchScopeDetails();
}, []);


 

 


return (
  <Container disableGutters maxWidth={false} sx={{ mt: 1 }}>
    <Typography variant="h4" sx={{ mb: 1, textAlign: 'center' }}>
      {t('reportPreview')}
    </Typography>

   {/* Single Card for the Top Section */}
<Grid container justifyContent="center" sx={{ mb: 1}}>
  <Grid item xs={14} md={14}>
  <Paper
  elevation={3}
  sx={{
    padding: 2,
    borderRadius: 2,
    backgroundColor: '#f9f9f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap', // Allows wrapping on smaller screens
    gap: 2, // Adds spacing between items
  }}
>
  {/* Organization */}
  <Box sx={{ textAlign: 'center', minWidth: '50px' }}>
    <Typography
      variant="subtitle1"
      sx={{ color: 'text.secondary', fontWeight: 'medium' }}
    >
      {t('organization')}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
      {formData.organization || t('noData')}
    </Typography>
  </Box>

  {/* Requestor */}
  <Box sx={{ textAlign: 'center', minWidth: '50px' }}>
    <Typography
      variant="subtitle1"
      sx={{ color: 'text.secondary', fontWeight: 'medium' }}
    >
      {t('requestor')}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
      {formData.requestor || t('noData')}
    </Typography>
  </Box>

  {/* Year */}
  <Box sx={{ textAlign: 'center', minWidth: '50px' }}>
    <Typography
      variant="subtitle1"
      sx={{ color: 'text.secondary', fontWeight: 'medium' }}
    >
      {t('year')}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
      {formData.year || t('noData')}
    </Typography>
  </Box>

  {/* Format Template */}
  <Box sx={{ textAlign: 'center', minWidth: '100px' }}>
    <Typography
      variant="subtitle1"
      sx={{ color: 'text.secondary', fontWeight: 'medium' }}
    >
      {t('formatTemplate')}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
      {formData.reportname || t('noData')}
    </Typography>
  </Box>

  {/* Print Date */}
  <Box sx={{ textAlign: 'center', minWidth: '100px' }}>
    <Typography
      variant="subtitle1"
      sx={{ color: 'text.secondary', fontWeight: 'medium' }}
    >
      {t('printDate')}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
      {formData.printDate || t('noData')}
    </Typography>
  </Box>

  {/* GWP Version Dropdown */}
  <FormControl fullWidth sx={{ maxWidth: '250px' }}>
  <InputLabel id="gwp-version-select-label">{t('gwpVersion')}</InputLabel>
  <Select
    labelId="gwp-version-select-label"
    id="gwp-version-select"
    value={selectedGwpVersion || ''}
    label="GWP Version"
    onChange={handleGwpVersionChange}
  >
    {gwpVersions.map((gwp) => (
      <MenuItem key={gwp.gwpid} value={gwp.gwpid}>
        {gwp.gwpname} ({gwp.gwpversion})
      </MenuItem>
    ))}
  </Select>
</FormControl>
  
<FormControl fullWidth sx={{ maxWidth: '100px' }}>
  <InputLabel id="version-select-label">{t('version')}</InputLabel>
  <Select
    labelId="version-select-label"
    id="version-select"
    value={selectedVersion}
    label="Version"
    onChange={handleVersionChange}
    onOpen={handleVersionDropdownOpen}
  >
    {versions.map((versionItem) => (
      <MenuItem key={versionItem.uuid} value={versionItem.version}>
        {versionItem.version}
      </MenuItem>
    ))}
  </Select>
</FormControl>
  {/* Search Text Box */}
  <TextField
    fullWidth
    sx={{ maxWidth: '200px' }}
    placeholder={t('searchPlaceholder') || 'Search'}
    variant="outlined"
    value={searchText}
    onChange={handleSearchChange}
    label={t('search')}
  />
   <Button variant="contained" onClick={handleOpenScopeSelectionPopup}>
  {t('scopeSelection')}
</Button>
<Button 
  variant="contained" 
  color="primary"
  sx={{ ml: 1 }}
  onClick={handleSubmitButtonClick}
>
  {t('submit')}
</Button>
</Paper>
  </Grid>

 

 

{/* Scope Selection Dialog */}
<Dialog
  open={openScopeSelectionPopup}
  onClose={handleCloseScopeSelectionPopup}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>{t('scopeSelection')}</DialogTitle>
  <DialogContent>
    <Typography variant="h6" sx={{ mb: 2 }}>
      {t('availableScopes')}
    </Typography>
    <Box sx={{ maxHeight: '800px', overflowY: 'auto' }}>
      {groupedScopes.length > 0 ? (
        groupedScopes.map(([lidofdescofiso, scopes]) => (
          <Box key={scopes.uuid} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {lidofdescofiso}
            </Typography>
            <Grid container spacing={3}>
              {scopes.map((scope) => {
                const isSelected = selectedScopeFilters.includes(scope.uuid);
                return (
                  <Grid item xs={3} key={scope.uuid}>
                    <Button
                      variant={isSelected ? 'contained' : 'outlined'}
                      onClick={() => handleScopeFilterChange(scope.uuid)}
                      sx={{
                        width: '100%',
                        borderColor: isSelected ? 'primary.main' : 'grey.400',
                        backgroundColor: isSelected ? 'primary.light' : 'transparent',
                        color: isSelected ? 'white' : 'text.primary',
                        padding: '10px 16px',
                        fontSize: '0.875rem',
                        minHeight: '40px',
                      }}
                      startIcon={isSelected ? <CheckIcon /> : null}
                    >
                      {scope.scopetype}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t('noScopeDetailsAvailable')}
        </Typography>
      )}
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseScopeSelectionPopup} color="primary">
      {t('close')}
    </Button>
    <Button onClick={handleApplyScopeFilters} color="primary" variant="contained">
      {t('applyFilters')}
    </Button>
  </DialogActions>
</Dialog>
   
    </Grid>
 
          

<Dialog
  open={isConfirmationOpen}
  onClose={handleCloseConfirmation}
  fullWidth
  maxWidth="xs"
>
  <DialogTitle>{t('confirmSubmission')}</DialogTitle>
  <DialogContent>
    <Typography variant="body1">
      {t('areYouSureCreate')}
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseConfirmation} color="primary">
      {t('cancel')}
    </Button>
    <Button
      onClick={() => {
        handleSubmitFinalResult(); // Call the submit function
        handleCloseConfirmation(); // Close the dialog
      }}
      color="primary"
      variant="contained"
    >
      {t('ok')}
    </Button>
  </DialogActions>
</Dialog>
    
     

    {/* Table Section */}
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Table sortDirection={false}> {/* Disable default sorting */}
        <TableHead>
          <TableRow>
            <TableCell sx={tableHeaderStyles}>{t('categoryOfAsset')}</TableCell>
            <TableCell sx={tableHeaderStyles}>{t('process')}</TableCell>
            <TableCell sx={tableHeaderStyles}>{t('object')}</TableCell>
            <TableCell sx={tableHeaderStyles}>{t('gas')}</TableCell>
            <TableCell sx={tableHeaderStyles}>{t('heatvalue')}</TableCell>
            <TableCell sx={tableHeaderStyles}>{t('factorProvider')}</TableCell>
            <TableCell sx={tableHeaderStyles}>{t('version')}</TableCell>
            <TableCell sx={tableHeaderStyles}>{t('rate')}</TableCell>
            <TableCell sx={tableHeaderStyles}>{t('Unit conversion ratio')}</TableCell> {/* Conversion Rate Column */}
            <TableCell sx={tableHeaderStyles}>{t('sum')}</TableCell> {/* Sum Column */}  
            <TableCell sx={tableHeaderStyles}>{t('emission')}</TableCell> {/* Multiple Column */}
            <TableCell sx={tableHeaderStyles}>{t('Co2e-Rate')}</TableCell> {/* Co2e Rate Column */}
            <TableCell sx={tableHeaderStyles}>{t('Co2e')}</TableCell> {/* Co2e Column */}
            <TableCell sx={tableHeaderStyles}>{t('action')}</TableCell>
            <TableCell sx={tableHeaderStyles}>{t('changefactor')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map((row, index) => {
            // Determine grouping based on categoryOfAsset, process, and object
            let isSameAsPrevious = false;
            let isSameAsNext = false; // To track if the current row is part of a group based on the next row

            // Check if the current row and the previous row have the same values
            if (index > 0) {
              isSameAsPrevious =
              row.cateofastname.trim().toLowerCase() === paginatedData[index - 1].cateofastname.trim().toLowerCase() &&
                row.processname.trim().toLowerCase() === paginatedData[index - 1].processname.trim().toLowerCase() &&
                row.objectname.trim().toLowerCase() === paginatedData[index - 1].objectname.trim().toLowerCase();
            }

            // Check if the current row and the next row have the same values
            if (index < paginatedData.length - 1) {
              isSameAsNext =
                row.cateofastname.trim().toLowerCase() === paginatedData[index + 1].cateofastname.trim().toLowerCase() &&
                row.processname.trim().toLowerCase() === paginatedData[index + 1].processname.trim().toLowerCase() &&
                row.objectname.trim().toLowerCase() === paginatedData[index + 1].objectname.trim().toLowerCase();
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
            const multiple = sum * rate; // Calculate the multiple

            return (
              <TableRow
              key={row.rowId}
      
                sx={{
                  backgroundColor: isGrouped ? '#e7f3fe' : '#f5f5f5',
                }}
              >
                {/* Hide columns when isSameAsPrevious is true */}
                <TableCell>{isSameAsPrevious ? '' : row.cateofastname}</TableCell>
                <TableCell>{isSameAsPrevious ? '' : row.processname}</TableCell>
                <TableCell>{isSameAsPrevious ? '' : row.objectname}</TableCell>
                <TableCell>{row.gasname}</TableCell>
                <TableCell>{row.heatvalue}</TableCell>
                {/* Show selected factor provider name */} 
                {renderFactorDetails(row)}
                <TableCell>
  <Button
    onClick={() => handleOpenDialog(row)}
    variant="contained"
    sx={{
      padding: '4px 8px', // Smaller padding
      fontSize: '0.75rem', // Smaller font size
      minWidth: 'auto', // Prevent extra width
      lineHeight: 1.2, // Adjust line height
      textTransform: 'none', // Prevent uppercase text if not needed
    }}
  >
    {t('addFactor')}
  </Button>
</TableCell>
<TableCell>
  <Button
    onClick={() => handleOpenFactorDialog(row.rowId)}
    variant="contained"
    sx={{
      padding: '4px 8px', // Smaller padding
      fontSize: '0.75rem', // Smaller font size
      minWidth: 'auto', // Prevent extra width
      lineHeight: 1.2, // Adjust line height
      textTransform: 'none', // Prevent uppercase text if not needed
    }}
  >
    {t('changefactor')}
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
    <Dialog open={openFactorDialog} onClose={() => setOpenFactorDialog(false)} fullWidth maxWidth="sm">
  <DialogTitle>{t('chooseFactorProvider')}</DialogTitle>
  <DialogContent>
    {paginatedFactorProviders.map((provider, idx) => (
      <Button
        key={`${provider.factorgasid}-${idx}`}
        fullWidth
        variant="outlined"
        onClick={() => handleSelectFactorProvider(provider)}
        sx={{ mb: 2 }}
      >
        {/* Include unitname in the button text */}
        {dialogPage * dialogRowsPerPage + idx + 1}. {provider.providerName} - {provider.version} - {provider.rate} ({provider.unitname || t('N/A')})
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
      rowsPerPageOptions={[5, 10, 20]}
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
   value={units.some(unit => unit.unitid === popupFormData.unit) ? popupFormData.unit : ''}// The selected unit's UUID
    onChange={(e) => {
      const selectedUnit = units.find((unit) => unit.unitid === e.target.value); // Find the selected unit
      setPopupFormData({ 
        ...popupFormData, 
        unit: e.target.value, // Store UUID
        unittypename: selectedUnit ? selectedUnit.unittypename : '', // Fetch the unittypename
      });
    }}
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