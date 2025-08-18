import { useTheme } from '@mui/material/styles'; 

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ArrowDownward,
  ArrowUpward,
  Search,
  UploadFile as UploadIcon,
  Refresh as RefreshIcon,
  ArrowBackIos,
  ArrowForwardIos,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
 
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import iconv from 'iconv-lite-umd';
import withAuth from '../components/withAuth';
import Loader from '../components/Loader/loader';
import { useGlobalContext } from '../components/GlobalContext';
import { useDropzone } from 'react-dropzone';
import ImageIcon from '@mui/icons-material/Image';
import { TablePagination, TableFooter } from '@mui/material';
import { format, parseISO } from 'date-fns';
import {
  apGetUnits,
  apFetchAssetsByOrg,
  apGetAssetImages,
  apUploadAssetImage,
  apDeleteAssetImage,
  apDeleteAsset,
  apSaveAsset,
  apPublishAssetData,
} from '../models/pagemodel';



const AssetUploadPage = () => {
  // Refresh handler for new buttons
  const handleRefresh = () => {
    if (globalOrgId) fetchAssets(globalOrgId);
  };
  const tableRef = useRef();
  // Import globalOrgId from context
  const { globalOrgId } = useGlobalContext();
  const { t } = useTranslation();
  const theme = useTheme();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assetData, setAssetData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [viewUploadedData, setViewUploadedData] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [currentAsset, setCurrentAsset] = useState({});
  const [orderBy, setOrderBy] = useState('code');
  const [order, setOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState(''); // State for search text
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false); // State for delete confirmation dialog
  const [assetToDelete, setAssetToDelete] = useState(null); // State for the asset to delete
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Unit List and Selection State
  const [unitList, setUnitList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');

  // Image Upload States
  const [openImageUpload, setOpenImageUpload] = useState(false); // Control Image Upload Dialog
  const [uploadedFiles, setUploadedFiles] = useState([]); // Store selected files
  const [previewUrls, setPreviewUrls] = useState([]); // Store image preview URLs
  const [selectedAsset, setSelectedAsset] = useState(null); // To know which asset is being updated

  const [openImageViewer, setOpenImageViewer] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentAssetForImages, setCurrentAssetForImages] = useState(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  // Image loading state for the image viewer dialog
  const [imagesLoading, setImagesLoading] = useState(false);
// Checkbox handler for 'inactive'
const handleInactiveChange = (e) => {
  const checked = e.target.checked;
  setCurrentAsset((prev) => ({
    ...prev,
    inactive: checked,
    dateofinactive: checked ? format(new Date(), 'yyyy-MM-dd') : '',
  }));
};
// AssetCsvUploader component for CSV upload (stub, should be implemented or imported)
const AssetCsvUploader = ({ onSuccess }) => {
  // Dummy uploader, replace with real implementation
  return (
    <Button
      variant="outlined"
      component="label"
      startIcon={<UploadIcon />}
    >
      {t('Upload CSV')}
      <input
        type="file"
        accept=".csv"
        hidden
        onChange={onSuccess}
      />
    </Button>
  );
};

  // Fetch Data on Mount (unit list only)
  useEffect(() => {
    fetchUnitList();
  }, []);

  useEffect(() => {
    if (globalOrgId) {
      fetchAssets(globalOrgId);
    }
  }, [globalOrgId]);

  // Fetch Unit List
  const fetchUnitList = async () => {
  try {
    setLoading(true);
    const data = await apGetUnits();
    setUnitList(data || []);
  } catch (error) {
    console.error('Error fetching unit list:', error);
  } finally {
    setLoading(false);
  }
};

  // Fetch assets based on organization
 const fetchAssets = async (orgId) => {
  try {
    setLoading(true);
    const data = await apFetchAssetsByOrg(orgId);
    setAssets(Array.isArray(data) ? data : (data?.rows || []));
  } catch (error) {
    console.error('Error fetching assets:', error);
  } finally {
    setLoading(false);
  }
};
  const handleViewImages = async (asset) => {
    setCurrentAssetForImages(asset);
    setImagesLoading(true);
    try {
      const res = await apGetAssetImages(asset.uuid);
      const fetchedImages = res?.images || res || [];
      setImages(fetchedImages);
      setSelectedImage(fetchedImages[0] || null);
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]);
      setSelectedImage(null);
    } finally {
      setImagesLoading(false);
    }
    setOpenImageViewer(true);
  };

  // Handle file upload and parse
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFileName(file.name);

    // Close the preview dialog first to reset for new uploads
    setOpenPreviewDialog(false);

    if (file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        const decodedString = new TextDecoder('utf-8').decode(uint8Array);//iconv.decode(uint8Array, 'big5');

        Papa.parse(decodedString, {
          header: false,
          skipEmptyLines: true,
          complete: (result) => {
            // Custom logic: row 2 is headers, row 3+ is data
            if (result.data.length >= 2) {
              const headerRow = result.data[1]; // Row 2 = keys. code,assetname,belong,manufacturer,serious,noofmanufacturer,ischp,yearofproduction,yearofbuy,comment,position,capacity
              const dataRows = result.data.slice(2); // Row 3+ = values
              const headers = Object.values(headerRow);
              const formattedData = dataRows.map((row) => {
                const rowObj = {};
                headers.forEach((key, index) => {
                  rowObj[key] = row[index];
                });
                return rowObj;
              });

              // ✅ Validation: ensure required fields exist in all rows
              const requiredFields = ['code', 'name'];
              const invalidRows = formattedData.filter((row, idx) =>
                requiredFields.some((key) => !row[key] || row[key].toString().trim() === '')
              );

              if (invalidRows.length > 0) {
                alert(`There are ${invalidRows.length} rows with missing required fields (code or name). Please check the CSV.`);
                console.warn('Invalid rows:', invalidRows);
                return;
              }

              setAssetData(formattedData);
              setOpenPreviewDialog(true);
            } else {
              console.error('CSV file must contain at least 3 rows (including headers)');
            }
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          },
        });
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        setAssetData(jsonData);
        // Open the preview dialog after parsing
        setOpenPreviewDialog(true);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Handle Add Asset
  const handleAddAsset = () => {
    setCurrentAsset({
      code: '',
      assetname: '',
      belong: '',
      manufacturer: '',
      serious: '',
      noofmanufacturer: '',
      ischp: false,
      yearofproduction: '',
      yearofbuy: '',
      comment: '',
      inactive: false,
      capacity: 0
    });
    setSelectedUnit('');
    setIsEditing(false);
    setOpenDialog(true);
  };

  // Handle Edit Asset
  const handleEditAsset = (asset) => {
    setCurrentAsset(asset);
    // Set selected unit to a valid unitid from unitList or fallback to ''
    const matchingUnit = unitList.find(unit => unit.unitid === asset.unitid);
    setSelectedUnit(matchingUnit ? matchingUnit.unitid : '');
    setIsEditing(true);
    setOpenDialog(true);
  };

  // Handle Delete Asset - Open confirmation dialog
  const handleDeleteAsset = (asset) => {
    setAssetToDelete(asset);
    setOpenConfirmDelete(true);
  };

  // Handle Confirm Delete Asset
  const confirmDeleteAsset = async () => {
  try {
    await apDeleteAsset(assetToDelete.uuid);
    fetchAssets(globalOrgId);
    setOpenConfirmDelete(false);
  } catch (error) {
    console.error('Error deleting asset:', error);
  }
};

  // Handle Cancel Delete Asset
  const cancelDeleteAsset = () => {
    setOpenConfirmDelete(false);
  };

  // Handle Save Asset (Add or Update)
  const handleSaveAsset = async () => {
  try {
    const payload = {
      ...currentAsset,
      orgId: globalOrgId,
      unitid: selectedUnit,
      defaultunit: !!selectedUnit,
    };
    await apSaveAsset(payload, isEditing);
    fetchAssets(globalOrgId);
    setOpenDialog(false);
  } catch (error) {
    console.error('Error saving asset:', error);
  }
};

  // Handle Publish Uploaded Data
  const handlePublishData = async () => {
  try {
    await apPublishAssetData(globalOrgId, assetData);
    fetchAssets(globalOrgId);
    setOpenPreviewDialog(false);
    setAssetData([]);
    setFileName('');
  } catch (error) {
    console.error('Error publishing asset data:', error);
  }
};

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property) => (event) => {
    handleRequestSort(event, property);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const orderComp = comparator(a[0], b[0]);
      if (orderComp !== 0) return orderComp;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  // Filter assets based on searchQuery
  const filteredAssets = assets.filter((asset) =>
    Object.values(asset).some((value) =>
      typeof value === 'string'
        ? value.toLowerCase().includes(searchQuery.toLowerCase())
        : false // Ignore non-string values for search
    )
  );

  // Pagination slice for table display
  const sortedAssets = stableSort(filteredAssets, getComparator(order, orderBy));
  const displayedAssets = sortedAssets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Initialize useDropzone
  const onDrop = useCallback(
    (acceptedFiles) => {
      // Filter out files with invalid extensions (extra safety)
      const validFiles = acceptedFiles.filter((file) => {
        const validExtensions = ['image/jpeg', 'image/png', 'image/gif'];
        if (validExtensions.includes(file.type)) {
          return true;
        } else {
          console.error(`Skipped "${file.name}" because an invalid file extension was provided.`);
          return false;
        }
      });

      if (validFiles.length !== acceptedFiles.length) {
        alert('Some files were skipped because they have invalid extensions. Only JPEG, PNG, and GIF files are allowed.');
      }

      // Generate preview URLs for the images
      const previews = validFiles.map((file) => URL.createObjectURL(file));

      // Append the new files and previews to the existing state
      setUploadedFiles((prevFiles) => [...prevFiles, ...validFiles]);
      setPreviewUrls((prevUrls) => [...prevUrls, ...previews]);
    },
    []
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
    fileRejections,
  } = useDropzone({
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
    },
    onDrop,
    multiple: true,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        rejection.errors.forEach((error) => {
          if (error.code === 'file-invalid-type') {
            console.error(`Skipped "${rejection.file.name}" because an invalid file extension was provided.`);
          }
        });
      });
      alert('Some files were skipped because they have invalid extensions. Only JPEG, PNG, and GIF files are allowed.');
    },
  });
  const handleImageUploadOpen = (asset) => {
    setSelectedAsset(asset); // Set the asset to know which one you're uploading images for
    setOpenImageUpload(true); // Open the image upload dialog
    setUploadedFiles([]); // Clear previously uploaded files
    setPreviewUrls([]); // Clear previously uploaded previews
  };

  // Handle image upload confirmation
  const handleUploadConfirm = async () => {
    if (!selectedAsset || !selectedAsset.uuid) {
      console.error('No selected asset or asset UUID found.');
      return;
    }

    // TODO: get personId from your auth/global context if required by API
    // Example:
    // const { personId } = useGlobalContext();  // if available there
    // For now, we’ll pass it only if truthy:
    const maybePersonId = undefined; // <- replace with your actual person id if you have it

    const results = [];
    for (const file of uploadedFiles) {
      try {
        // apUploadAssetImage currently appends 'image'; include filename
        // If your backend expects 'file', change 'image' at the helper
        const formData = new FormData();
        formData.append('image', file, file.name);
        formData.append('assetId', selectedAsset.uuid);
        if (maybePersonId) formData.append('personID', maybePersonId);

        // You can call the helper directly with a prebuilt formData:
        // but since apUploadAssetImage builds it internally, either:
        //  A) modify apUploadAssetImage to accept FormData, OR
        //  B) reuse your helper and ensure it passes file.name
        // Here we’ll call the helper but with filename support:
        await apUploadAssetImage(file, selectedAsset.uuid, maybePersonId);

        results.push({ file: file.name, ok: true });
      } catch (error) {
        // Surface server error details to console for debugging
        const status = error?.response?.status;
        const data = error?.response?.data;
        console.error('Upload failed:', { file: file.name, status, data, error });

        results.push({ file: file.name, ok: false, status, data });
      }
    }

    const failed = results.filter(r => !r.ok);
    if (failed.length === 0) {
      alert('All images uploaded successfully!');
      setOpenImageUpload(false);
    } else {
      // Show a concise message, details are in console
      alert(`There was an error uploading ${failed.length} file(s). Please check the console for details and try again.`);
    }

    // Cleanup previews
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setUploadedFiles([]);

    // After upload, fetch images and try to preserve selected image if possible
    if (selectedAsset && selectedAsset.uuid) {
      try {
        const res = await apGetAssetImages(selectedAsset.uuid);
        const fetchedImages = res?.images || res || [];
        setImages(fetchedImages);
        // Try to keep the currently selected image if it still exists
        const stillSelected = selectedImage && fetchedImages.find(img => img.url === selectedImage.url);
        setSelectedImage(stillSelected || fetchedImages[0] || null);
      } catch (error) {
        console.error('Error fetching images after upload:', error);
        setImages([]);
        setSelectedImage(null);
      }
    }
  };
  const handleDeleteImage = async (image) => {
  if (!currentAssetForImages || !currentAssetForImages.uuid) {
    console.error('No asset selected for image deletion.');
    return;
  }
  try {
    await apDeleteAssetImage(image.url, currentAssetForImages.uuid);
    setImages((prevImages) => prevImages.filter((img) => img.url !== image.url));
    if (selectedImage?.url === image.url) {
      setSelectedImage(images[0] || null);
    }
    alert('Image deleted successfully!');
  } catch (error) {
    console.error('Error deleting image:', error);
    alert('Failed to delete the image. Please try again.');
  }
};

  // Close the upload dialog
  const handleUploadClose = () => {
    setOpenImageUpload(false);
    // Revoke object URLs to avoid memory leaks
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setUploadedFiles([]);
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Container disableGutters maxWidth={false} sx={{ mt: 3 }}>
          <Box sx={{ maxWidth: '1700px', margin: '0 auto' }}>
            {/* Title and action buttons as per new design */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  mb: 2,
                  pb: 1,
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  {t('Asset Upload')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddAsset}>
                    {t('Add Asset')}
                  </Button>
                  <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
                    {t('Refresh')}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => (window.location.href = '/asset_template.csv')}
                  >
                    {t('Download Sample')}
                  </Button>
                  <AssetCsvUploader onSuccess={handleFileUpload} />
                </Box>
              </Box>
            </Paper>

            {/* Asset Table with CRUD Actions */}
            {filteredAssets.length > 0 && (
              <Card>
                <CardContent sx={{ flex: 4, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    {/* Add scrollable-table-container for horizontal and vertical scroll */}
                    <TableContainer
                      sx={{
                         
                        overflowX: 'auto',
                        border: '1px solid #ccc',
                        position: 'relative'
                      }}
                    >
                      <Table stickyHeader>
                        <TableHead
                          sx={{
                            position: 'sticky',
                            top: 0,
                            backgroundColor: 'white',
                            zIndex: 2
                          }}
                        >
                          <TableRow>
                            {/* Dynamic headers except uuid and unitid and actions */}
                            {Object.keys(filteredAssets[0])
                              .filter((key) => key !== 'uuid' && key !== 'unitid')
                              .map((key) => (
                                <TableCell
                                  key={key}
                                  sortDirection={orderBy === key ? order : false}
                                  onClick={createSortHandler(key)}
                                  sx={{ cursor: 'pointer' }}
                                >
                                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {t(key).toUpperCase()}
                                    {orderBy === key && (
                                      <span>
                                        {order === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                                      </span>
                                    )}
                                  </Typography>
                                </TableCell>
                              ))}
                            {/* Add Capacity column if not already present */}
                            {!Object.keys(filteredAssets[0]).includes('capacity') && (
                              <TableCell
                                sortDirection={orderBy === 'capacity' ? order : false}
                                onClick={createSortHandler('capacity')}
                                sx={{ cursor: 'pointer' }}
                              >
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                  {t('Capacity').toUpperCase()}
                                  {orderBy === 'capacity' && (
                                    <span>
                                      {order === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                                    </span>
                                  )}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell
                              sx={{
                                position: 'sticky',
                                right: 0,
                                backgroundColor: 'white',
                                zIndex: 3,
                                minWidth: 120
                              }}
                            >
                             
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayedAssets.map((asset) => (
                            <TableRow key={asset.uuid}>
                              {/* Render asset fields, excluding uuid and unitid */}
                              {Object.entries(asset)
                                .filter(([key]) => key !== 'uuid' && key !== 'unitid')
                                .map(([key, value]) => (
                                  <TableCell key={key}>
                                    {typeof value === 'boolean' ? (
                                      <Checkbox checked={value} disabled />
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          wordBreak: 'keep-all',
                                          maxWidth: 200,
                                          display: 'inline-block',
                                          fontFamily: 'Arial, Noto Sans TC, Microsoft JhengHei, sans-serif',
                                        }}
                                      >
                                        {value ?? ''}
                                      </Typography>
                                    )}
                                  </TableCell>
                                ))}
                              {/* Show Capacity column if not present in asset fields */}
                              {!Object.keys(asset).includes('capacity') && (
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      wordBreak: 'keep-all',
                                      maxWidth: 200,
                                      display: 'inline-block',
                                      fontFamily: 'Arial, Noto Sans TC, Microsoft JhengHei, sans-serif',
                                    }}
                                  >
                                    {asset.capacity || ''}
                                  </Typography>
                                </TableCell>
                              )}
                              <TableCell
                                sx={{
                                  position: 'sticky',
                                  right: 0,
                                  backgroundColor: 'white',
                                  zIndex: 3,
                                  minWidth: 120
                                }}
                              >
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                  <IconButton onClick={() => handleEditAsset(asset)} color="primary">
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton onClick={() => handleDeleteAsset(asset)} color="error">
                                    <DeleteIcon />
                                  </IconButton> 
                                  <IconButton onClick={() => handleViewImages(asset)} color="info">
                                    <ImageIcon />
                                  </IconButton>
                                   
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {/* TablePagination OUTSIDE the scrollable-table-container to keep it fixed */}
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={filteredAssets.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={(e, newPage) => setPage(newPage)}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                      sx={{ '& .MuiTablePagination-toolbar': { minHeight: 40, py: 0 } }}
                    />
                   
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>

      {/* Image Upload Dialog */}
      <Dialog open={openImageUpload} onClose={handleUploadClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('Upload Images')}</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              border: '2px dashed #ccc',
              padding: 4,
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: '#fafafa',
              cursor: 'pointer',
            }}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <Typography variant="body1" color="primary">
                {t('Drop the files here...')}
              </Typography>
            ) : (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {t('Drag & drop images here or click to select files')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('Supported formats: JPEG, PNG, GIF')}
                </Typography>
              </>
            )}
          </Box>

          {/* Display Uploaded Files with Image Previews */}
          {uploadedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">{t('Files to Upload')}:</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {uploadedFiles.map((file, index) => (
                  <Box key={index} sx={{ textAlign: 'center' }}>
                    <img
                      src={previewUrls[index]}
                      alt={file.name}
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <Typography variant="body2">{file.name}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadClose} color="secondary">
            {t('Cancel')}
          </Button>
          <Button
            onClick={handleUploadConfirm}
            color="primary"
            variant="contained"
            disabled={uploadedFiles.length === 0}
          >
            {t('Upload')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={openConfirmDelete} onClose={cancelDeleteAsset}>
        <DialogTitle>{t('Confirm Delete Asset')}</DialogTitle>
        <DialogContent>
          {assetToDelete && (
            <Box>
              <Typography variant="body1">{t('Are you sure you want to delete this asset?')}</Typography>
              <Typography variant="body2">
                <strong>{t('Asset Code')}:</strong> {assetToDelete.code}
              </Typography>
              <Typography variant="body2">
                <strong>{t('Asset Name')}:</strong> {assetToDelete.assetname}
              </Typography>
              {/* Include other asset details as needed */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteAsset}>{t('Cancel')}</Button>
          <Button onClick={confirmDeleteAsset} color="primary" variant="contained">
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog for Uploaded Data */}
      <Dialog
        open={openPreviewDialog}
        onClose={() => setOpenPreviewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{t('Preview Uploaded Data')}</DialogTitle>
        <DialogContent>
          <Box className="scrollable-table-container" sx={{ maxHeight: '70vh' }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 800 }} aria-label="service factor table">
                <TableHead>
                  <TableRow>
                    {assetData.length > 0 &&
                      Object.keys(assetData[0]).map((key) => (
                        <TableCell key={key}>
                          <Typography variant="body1">{t(key)}</Typography>
                        </TableCell>
                      ))}
                    {/* Add Capacity header if not present */}
                    {assetData.length > 0 && !Object.keys(assetData[0]).includes('capacity') && (
                      <TableCell>
                        <Typography variant="body1">{t('Capacity')}</Typography>
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assetData.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, idx) => (
                        <TableCell key={idx}>
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordBreak: 'keep-all',
                              maxWidth: 200,
                              display: 'inline-block',
                              fontFamily: 'Arial, Noto Sans TC, Microsoft JhengHei, sans-serif',
                            }}
                          >
                            {value ?? ''}
                          </Typography>
                        </TableCell>
                      ))}
                      {/* Add Capacity cell if not present */}
                      {!Object.keys(row).includes('capacity') && (
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordBreak: 'keep-all',
                              maxWidth: 200,
                              display: 'inline-block',
                              fontFamily: 'Arial, Noto Sans TC, Microsoft JhengHei, sans-serif',
                            }}
                          >
                            {row.capacity || ''}
                          </Typography>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)}>{t('Cancel')}</Button>
          <Button color="primary" variant="contained" onClick={handlePublishData}>
            {t('Publish')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Asset Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{isEditing ? t('Edit Asset') : t('Add Asset')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* Asset Code field with example placeholder moved to label */}
            <TextField
              required
              label={`${t('Asset Code')} * (${t('e.g., 電號')})`}
              value={currentAsset.code}
              onChange={(e) => setCurrentAsset({ ...currentAsset, code: e.target.value })}
              margin="dense"
              error={!currentAsset.code}
              sx={{ flex: '1 1 45%' }}
            />
            {/* Asset Name field with example placeholder moved to label */}
            <TextField
              required
              label={`${t('Asset Name')} * (${t('e.g., 電錶')})`}
              value={currentAsset.assetname}
              onChange={(e) => setCurrentAsset({ ...currentAsset, assetname: e.target.value })}
              margin="dense"
              error={!currentAsset.assetname}
              sx={{ flex: '1 1 45%' }}
            />
            {/* Belong field with example placeholder moved to label */}
            <TextField
              label={`${t('Belong')} (${t('e.g., 財務部')})`}
              value={currentAsset.belong}
              onChange={(e) => setCurrentAsset({ ...currentAsset, belong: e.target.value })}
              margin="dense"
              sx={{ flex: '1 1 45%' }}
            />
            {/* Manufacturer field with example placeholder moved to label */}
            <TextField
              label={`${t('Manufacturer')} (${t('e.g., TECO')})`}
              value={currentAsset.manufacturer}
              onChange={(e) => setCurrentAsset({ ...currentAsset, manufacturer: e.target.value })}
              margin="dense"
              sx={{ flex: '1 1 45%' }}
            />
            {/* Serial Number field with example placeholder moved to label */}
            <TextField
              label={`${t('Serial Number')} (${t('e.g., T100')})`}
              value={currentAsset.serious}
              onChange={(e) => setCurrentAsset({ ...currentAsset, serious: e.target.value })}
              margin="dense"
              sx={{ flex: '1 1 45%' }}
            />
            {/* No of Manufacturer field with example placeholder moved to label */}
            <TextField
              label={`${t('No of Manufacturer')} (${t('e.g., T100001')})`}
              type="text"
              value={currentAsset.noofmanufacturer}
              onChange={(e) =>
                setCurrentAsset({
                  ...currentAsset,
                  noofmanufacturer: e.target.value,
                })
              }
              margin="dense"
              sx={{ flex: '1 1 45%' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={currentAsset.ischp}
                  onChange={(e) => setCurrentAsset({ ...currentAsset, ischp: e.target.checked })}
                />
              }
              label={t('Is CHP')}
              sx={{ flex: '1 1 45%', minWidth: 200 }}
            />
            {/* Year of Production field as native number input */}
            <TextField
              label={`${t('Year of Production')} (${t('e.g., 2006')})`}
              type="number"
              value={currentAsset.yearofproduction || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (!isNaN(value) && value.length <= 4) {
                  setCurrentAsset({ ...currentAsset, yearofproduction: value });
                }
              }}
              margin="dense"
              inputProps={{ min: '1900', max: new Date().getFullYear().toString() }}
              sx={{ flex: '1 1 45%' }}
            />
            {/* Year of Purchase field with year-only date picker */}
            <TextField
  label={`${t('Year of Purchase')} (${t('e.g., 2010')})`}
  type="number"
  placeholder="e.g. 2010"
  inputProps={{ min: 1900, max: 2099, step: 1 }}
  value={currentAsset.yearofbuy || ''}
  onChange={(e) => {
    setCurrentAsset({ ...currentAsset, yearofbuy: e.target.value });
  }}
  margin="dense"
  sx={{ flex: '1 1 45%' }}
/>
            {/* Comment field with example placeholder moved to label */}
            <TextField
              label={`${t('Comment')} (${t('e.g., 購買時為二手')})`}
              value={currentAsset.comment}
              onChange={(e) => setCurrentAsset({ ...currentAsset, comment: e.target.value })}
              margin="dense"
              sx={{ flex: '1 1 45%' }}
            />
            {/* Capacity field with example placeholder moved to label */}
            <TextField
              label={`${t('Capacity')} (${t('e.g., 1.5')})`}
              type="number"
              value={currentAsset.capacity !== undefined ? currentAsset.capacity : 0}
              onChange={(e) => setCurrentAsset({ ...currentAsset, capacity: Number(e.target.value) })}
              margin="dense"
              sx={{ flex: '1 1 45%' }}
            />
            {/* Unit selection, shown only if capacity is entered */}
            {currentAsset.capacity && (
              <FormControl margin="dense" sx={{ flex: '1 1 45%' }}>
                <InputLabel>{t('Unit')}</InputLabel>
                <Select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  label={t('Unit')}
                >
                  {unitList.map((unit) => (
                    <MenuItem key={unit.unitid} value={unit.unitid}>
                      {unit.unitname}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {/* Position field with example placeholder moved to label */}
            <TextField
              label={`${t('Position')} (${t('e.g., 倉庫A棟2F走道旁')})`}
              value={currentAsset.position || ''}
              onChange={(e) => setCurrentAsset({ ...currentAsset, position: e.target.value })}
              margin="dense"
              sx={{ flex: '1 1 45%' }}
            />
            <TextField
              label={t('Date of Inactivation')}
              type="date"
              value={
                currentAsset.dateofinactive
                  ? format(new Date(currentAsset.dateofinactive), 'yyyy-MM-dd')
                  : ''
              }
              onChange={(e) =>
                setCurrentAsset({
                  ...currentAsset,
                  dateofinactive: e.target.value,
                })
              }
              margin="dense"
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ flex: '1 1 45%' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={currentAsset.inactive || false}
                  onChange={handleInactiveChange}
                />
              }
              label={t('Inactive')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('Cancel')}</Button>
          <Button
            onClick={handleSaveAsset}
            variant="contained"
            color="primary"
            disabled={!currentAsset.code || !currentAsset.assetname}
          >
            {isEditing ? t('Update') : t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openImageViewer}
        onClose={() => { setIsDeleteMode(false); setOpenImageViewer(false); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
              onClick={() => {
                setOpenImageViewer(false);
                handleImageUploadOpen(currentAssetForImages);
              }}
            >
              {t('Upload')}
            </Button>
            <Button
              variant="outlined"
              color={isDeleteMode ? 'inherit' : 'error'}
              startIcon={isDeleteMode ? <VisibilityIcon /> : <DeleteIcon />}
              onClick={() => setIsDeleteMode((v) => !v)}
            >
              {isDeleteMode ? t('View Mode') : t('Delete Mode')}
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {imagesLoading ? (
            <Loader />
          ) : images.length > 0 ? (
            <Box>
              {/* Large Image with navigation arrows and blur/delete mode */}
              <Box
                sx={{
                  position: 'relative',
                  textAlign: 'center',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Left Arrow Button */}
                <IconButton
                  aria-label="previous image"
                  onClick={() => {
                    if (!images.length) return;
                    const idx = images.findIndex(img => img === selectedImage);
                    const prevIdx = (idx - 1 + images.length) % images.length;
                    setSelectedImage(images[prevIdx]);
                  }}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                  }}
                  size="large"
                >
                  <ArrowBackIos />
                </IconButton>
                {/* Large Image */}
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <img
                    src={selectedImage.url}
                    alt="Selected"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px',
                      borderRadius: '8px',
                      filter: isDeleteMode ? 'blur(3px)' : 'none',
                      display: 'block',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                  />
                  {isDeleteMode && (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <IconButton
                        onClick={() => setConfirmDeleteOpen(true)}
                        sx={{ pointerEvents: 'auto', backgroundColor: 'rgba(255,255,255,0.8)' }}
                      >
                        <DeleteIcon sx={{ fontSize: 64 }} color="error" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                {/* Right Arrow Button */}
                <IconButton
                  aria-label="next image"
                  onClick={() => {
                    if (!images.length) return;
                    const idx = images.findIndex(img => img === selectedImage);
                    const nextIdx = (idx + 1) % images.length;
                    setSelectedImage(images[nextIdx]);
                  }}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                  }}
                  size="large"
                >
                  <ArrowForwardIos />
                </IconButton>
              </Box>

              {/* Thumbnails with Delete Mode Overlay */}
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
                {images.map((img, idx) => (
                  <Box key={idx} sx={{ position: 'relative', width: '80px', height: '80px' }}>
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        filter: isDeleteMode ? 'blur(3px)' : 'none',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        border: selectedImage === img ? '2px solid blue' : '1px solid #ccc',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedImage(img)}
                    >
                      <img
                        src={img.url}
                        alt={`Asset Image ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          display: 'block',
                        }}
                      />
                    </Box>
                    {isDeleteMode && (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pointerEvents: 'none',
                        }}
                      >
                        <IconButton
                          onClick={() => setConfirmDeleteOpen(true)}
                          sx={{
                            pointerEvents: 'auto',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 32 }} color="error" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1">
                {t('No images available. Please upload images.')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => {
                  setOpenImageViewer(false);
                  handleImageUploadOpen(currentAssetForImages);
                }}
                sx={{ mt: 2 }}
              >
                {t('Upload Images')}
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setIsDeleteMode(false); setOpenImageViewer(false); }}>{t('Close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Image Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>{t('Confirm Delete')}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {t('Do you want to delete this image?')}
          </Typography>
           
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>{t('Cancel')}</Button>
          
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              try {
                await handleDeleteImage(selectedImage);
              } finally {
                setConfirmDeleteOpen(false);
                setIsDeleteMode(false);
              }
            }}
          >
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
      )}
    </>
  );
};

export default withAuth(AssetUploadPage);

