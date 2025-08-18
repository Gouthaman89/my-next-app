import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,CircularProgress, } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router'; // Import useRouter
import { useGlobalContext } from '../../components/GlobalContext'; // Import the GlobalContext to access reportId, orgId, year
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader/loader'; // Import the Loader component

const SideBySideTables = forwardRef((props, ref) => {
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();
  const router = useRouter();
  const { version } = router.query; // Extract version from the URL query string
  // Use GlobalContext to get reportId, orgId, and year
  const { globalReportId, globalOrgId, globalYear } = useGlobalContext();
  const [reportData, setReportData] = useState({
    groupedByReliofdsscore: { '1': 0, '2': 0 },
    totalTpd: '0.00'
  });
  const [uncertaintyData, setUncertaintyData] = useState({
    emissionSum1: 0,
    emissionSum2: 0,
    uncertaintyPercentage: 0,
    lowerBound: 0,
    upperBound: 0
  });

  // Fetch data from the API
  useEffect(() => {
    // Fetch data only when the globalReportId, globalOrgId, and globalYear are available
    if (globalReportId && globalOrgId && globalYear) {
      fetchData(globalReportId, globalOrgId, globalYear);
    }
  }, [globalReportId, globalOrgId, globalYear]);

  const fetchData = async (reportId, orgId, year) => {
    try {
      // Fetch report data for first table
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_table5`, {
        reportId,
        orgId,
        year,
        version
      });
      setReportData(response.data);
             // Fetch uncertainty data
             const uncertaintyResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report_uncertainty`, {
              reportId,
              orgId,
              year,
              version
          });
  
      // Calculate sums
      const data = uncertaintyResponse.data;
      const emissionSum1 = data.reduce((sum, item) => sum + item.co2e, 0);
          const lowerBound = data.reduce((sum, item) => sum + item.uncertainlower, 0);
      const upperBound = data.reduce((sum, item) => sum + item.uncertainupper, 0);

      const responseTable4 = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_table4`, {
          reportId,
          orgId,
          year,
          version
      });
      const dataLookup1 = responseTable4.data;
      // Preprocess reportData into a lookup object
    const dataLookup = {};
    dataLookup1.forEach((item) => {
        const key = item.scopeid;
        dataLookup[key] = item.gassum || 0;
    });


      const scope1Process = dataLookup['d9130004-ba64-4af4-bd42-7d1592d99016'] || 0;
      const scope1Mobile = dataLookup['7798e62e-3df9-4617-a3e6-4a2d28c92286'] || 0;
      const scope1Fugitive = dataLookup['75ac1067-1be2-445e-a731-04bdb9125d26'] || 0;
      const scope1Fixed = dataLookup['22ac58c5-38ed-489e-a7ba-e6056bbfc4b9'] || 0;
      const totalScope1 = scope1Fixed + scope1Mobile + scope1Process + scope1Fugitive;

      const scope2PurchasedElectricity = dataLookup['aacab754-b393-488f-ab44-6acb78c57cd2'] || 0;
  // **Define getTotalEmissions function before using it**
  const getTotalEmissions = (scope) => {
    const total = dataLookup1
        .filter((item) => item.scopecode === scope && item.gassum !== null)
        .reduce((acc, curr) => acc + (curr.gassum || 0), 0);
    return total || 0;
};
      const scope3Total = getTotalEmissions("3") || 0;

      const totalemission = scope1Process + scope1Mobile + scope1Fugitive + scope1Fixed + scope2PurchasedElectricity + scope3Total;

      setUncertaintyData({
          emissionSum1,
          lowerBound,
          upperBound,
          totalemission: totalemission.toFixed(3)
      });
      } catch (error) {
          console.error(t('errorFetchingReportData'), error);
      } finally {
          setLoading(false);
      }
  };

  // Expose getRows to parent via ref
  useImperativeHandle(ref, () => ({
    getRows: () => {
      // Return table data for Excel export as structured objects for Table 5 and Table 6
      return {
        summaryTable5: {
          title: t('summaryTable5'),
          rows: [
            {
              Level: t('lessThan10Points'),
              Count: reportData.groupedByReliofdsscore['1'],
              AverageScore: reportData.totalTpd,
            },
            {
              Level: t('between10And19Points'),
              Count: reportData.groupedByReliofdsscore['2'],
              AverageScore: '',
            },
            {
              Level: t('between19And27Points'),
              Count: reportData.groupedByReliofdsscore['3'],
              AverageScore: '',
            }
          ]
        },
        summaryTable6: {
          title: t('summaryTable6'),
          data: {
            emissionSum1: uncertaintyData.emissionSum1?.toFixed(3) || '',
            totalEmission: uncertaintyData.totalemission || '',
            emissionRatio:
              (uncertaintyData.totalemission && uncertaintyData.emissionSum1)
                ? ((uncertaintyData.emissionSum1 / uncertaintyData.totalemission) * 100).toFixed(2) + '%'
                : '',
            lowerBound:
              (uncertaintyData.totalemission && uncertaintyData.lowerBound)
                ? ((uncertaintyData.lowerBound / uncertaintyData.totalemission) * 100).toFixed(2) + '%'
                : '',
            upperBound:
              (uncertaintyData.totalemission && uncertaintyData.upperBound)
                ? ((uncertaintyData.upperBound / uncertaintyData.totalemission) * 100).toFixed(2) + '%'
                : ''
          }
        }
      };
    }
  }), [reportData, uncertaintyData]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Main Title */}
   

      {/* Grid for Two Tables Side by Side */}
      <Grid container spacing={2}>
        {/* Table 1: Rating Scores */}
        <Grid item xs={6}>
        <Typography variant="h5" align="center" gutterBottom>
                          {t('summaryTable5')}
                      </Typography>
                       {/* Loading Indicator for Table 1 */}
                                  {loading ? (
                                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                                        
     
      {loading && <Loader />}
      {!loading && <div>Your app content</div>}
   
 
                                      </Box>
                                  ) : (
          <TableContainer component={Paper}>
            <Table aria-label={t('ratingScores')}>
              <TableHead>
              <TableRow>
                <TableCell   align="center">{t('level')}</TableCell>
                  <TableCell align="center">{t('firstLevel')}</TableCell>
                  <TableCell align="center">{t('secondLevel')}</TableCell>
                  <TableCell align="center">{t('secondLevel')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow >
                  <TableCell align="center" >{t('ratingRange')}</TableCell>
                  <TableCell align="center" >X {'<'} 10{t('points')}</TableCell>
                  <TableCell align="center" >10{t('points')} {'≤'} X {'<'} 19{t('points')}</TableCell>
                  <TableCell align="center" >19 {'≤'} X {'<'} 27{t('points')}</TableCell>

                </TableRow>
                <TableRow>
                  <TableCell align="center">{t('count')}</TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#f5f5f5' }}>{reportData.groupedByReliofdsscore['1']}</TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#f5f5f5' }}>{reportData.groupedByReliofdsscore['2']}</TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#f5f5f5' }}>{reportData.groupedByReliofdsscore['3']}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="center" >{t('averageScore')}</TableCell>
                  <TableCell colSpan={1} align="center"sx={{ backgroundColor: '#f5f5f5' }} >{reportData.totalTpd}</TableCell>
                  <TableCell colSpan={1} align="center" >{t('inventoryLevel')}</TableCell>
                  <TableCell rowSpan={1} align="center"sx={{ backgroundColor: '#f5f5f5' }}>{t('firstLevel')}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
                                  )}
        </Grid>

        {/* Table 2: Uncertainty Evaluation */}
        <Grid item xs={6}>
          <Typography variant="h5" align="center" gutterBottom>
                          {t('summaryTable6')}
                      </Typography>
                       {/* Loading Indicator for Table 1 */}
                                  {loading ? (
                                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                                          <CircularProgress />
                                      </Box>
                                  ) : (
          <TableContainer component={Paper}>
            <Table aria-label={t('uncertaintyEvaluation')}>
              <TableHead>
                
                  </TableHead>
                  <TableBody>
                <TableRow sx={{ height: '57px' }}>
                  <TableCell     align="center">{t('totalEmissionsForUncertaintyAssessment')}</TableCell>
                  <TableCell   align="center">{t('totalAbsoluteEmissions')}</TableCell>
                  <TableCell  rowSpan={2} colSpan={2}  align="center"> {t('totalInventoryUncertainty')}</TableCell>
                </TableRow>
              
                <TableRow>
                  <TableCell    align="center"sx={{ backgroundColor: '#f5f5f5' }}>{uncertaintyData.emissionSum1.toFixed(3)}</TableCell>
                  <TableCell    align="center"sx={{ backgroundColor: '#f5f5f5' }}>{uncertaintyData.totalemission}</TableCell>                  
                </TableRow>
                <TableRow>
                <TableCell colSpan={2} align="center">{t('uncertaintyAssessmentPercentage')}</TableCell>
                  <TableCell align="center">{t('lowerBound95CI')}</TableCell>
                  <TableCell align="center">{t('upperBound95CI')}
                  
                </TableCell>
                </TableRow>
                <TableRow>
                <TableCell colSpan={2} align="center"sx={{ backgroundColor: '#f5f5f5' }}> {((uncertaintyData.emissionSum1.toFixed(3)/uncertaintyData.totalemission)*100).toFixed(3)}%</TableCell>
                  <TableCell align="center"sx={{ backgroundColor: '#f5f5f5' }}>{((uncertaintyData.lowerBound.toFixed(2)/uncertaintyData.totalemission)*100).toFixed(3)}%</TableCell>
                  <TableCell align="center"sx={{ backgroundColor: '#f5f5f5' }}>{((uncertaintyData.upperBound.toFixed(2)/uncertaintyData.totalemission)*100).toFixed(3)}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
                                  )}
        </Grid>
      </Grid>
    </Box>
  );
});

export default SideBySideTables;