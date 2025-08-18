import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Container, Grid, Typography, TextField,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper
} from '@mui/material';
import QRCode from 'react-qr-code';
import { tableHeaderStyles } from '../styles/styles'; // Import the styles
import { useTranslation } from 'react-i18next';

const CorbonInformation = () => {
  const { t } = useTranslation(); // Translation hook

  const [apiData, setApiData] = useState([]);

  useEffect(() => {
    axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/carbon_report`)
      .then(response => {
        console.log('API Response:', response.data); // Check the data in console
        setApiData(response.data); // Store the API response in state
      })
      .catch(error => {
        console.error('Error fetching carbon report data:', error);
      });
  }, []);

  // Map the API response into appropriate tables
  const manufactureData = apiData.map(row => ({
    provider: row.providername,
    version: row.pkgversion,
    co2: row.sum,
    categoryOfAsset: row.cateofastname,
  }));

  const useData = apiData.map(row => ({
    asset: row.cateofastname,
    additive: row.objectname,
    process: row.processname,
    co2e: row.co2e,
    requestDate: new Date(row.createdate).toLocaleString(),
  }));

  const gasData = apiData.map(row => ({
    gas: row.gascode,
    factor: row.rate,
  }));

  return (
    <Container maxWidth={false} sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="bold">
        {t('carbonInformation')}
      </Typography>

      {/* Grid for Object Code, Object Name, Picture, and QR Code */}
      <Grid container spacing={1} sx={{ mt: 1 }}>
        {/* Object Code */}
        <Grid item xs={6}>
          <Typography variant="subtitle1">{t('objectCode')}</Typography>
          <TextField fullWidth value={apiData[0]?.assetcode || ''} disabled />
          {/* Object Name */}
          <Typography variant="subtitle1" sx={{ mt: 2 }}>{t('objectName')}</Typography>
          <TextField fullWidth value={apiData[0]?.aseetname || ''} disabled />
        </Grid>

        {/* Picture and QR Code side by side */}
        <Grid item xs={6}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between', // Align picture and QR code side by side
              alignItems: 'center',
            }}
          >
            {/* Picture */}
            <Box
              sx={{
                width: '48%',
                height: 200,
                border: '1px solid grey',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
              }}
            >
              Picture1
            </Box>

            {/* QR Code Generator */}
            <Box
              sx={{
                width: '48%',
                height: 200,
                border: '1px solid grey',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* QR Code for the Object Code */}
              {apiData[0]?.assetcode && <QRCode value={apiData[0].assetcode} size={150} />}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Manufacture Table */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight="bold">
          {t('carbonManufacture')}
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeaderStyles}>{t('factorProvider')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('version')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('co2Emission')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('categoryOfAsset')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {manufactureData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.provider}</TableCell>
                  <TableCell>{row.version}</TableCell>
                  <TableCell>{row.co2}</TableCell>
                  <TableCell>{row.categoryOfAsset}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Use Carbon Table */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight="bold">
          {t('carbonUse')}
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeaderStyles}>{t('categoryOfAsset')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('additive')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('process')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('co2eEmission')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('requestDate')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {useData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.asset}</TableCell>
                  <TableCell>{row.additive}</TableCell>
                  <TableCell>{row.process}</TableCell>
                  <TableCell>{row.co2e}</TableCell>
                  <TableCell>{row.requestDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Gas Combination Table */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight="bold">
          {t('gasCombination')}
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeaderStyles}>{t('greenGas')}</TableCell>
                <TableCell sx={tableHeaderStyles}>{t('factor')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gasData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.gas}</TableCell>
                  <TableCell>{row.factor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default CorbonInformation;