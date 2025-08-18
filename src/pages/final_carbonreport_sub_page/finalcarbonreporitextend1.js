import React, { useEffect, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/router'; // Import useRouter
import axios from 'axios';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    CircularProgress,
} from '@mui/material';
import { useGlobalContext } from '../../components/GlobalContext';
import { useTranslation } from 'react-i18next';

const CarbonReportExtended = forwardRef((props, ref) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { version } = router.query; // Extract version from the URL query string
    const { globalReportId, globalOrgId, globalYear } = useGlobalContext();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        if (globalReportId && globalOrgId && globalYear) {
            fetchData(globalReportId, globalOrgId, globalYear);
        }
    }, [globalReportId, globalOrgId, globalYear]);

    // Function to fetch report data from the server
    const fetchData = async (reportId, orgId, year) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_table4`,
                {
                    reportId,
                    orgId,
                    year,
                    version
                }
            );
            setReportData(response.data);
        } catch (error) {
            console.error(t('errorFetchingReportData'), error);
        } finally {
            setLoading(false);
        }
    };

    // Memoize calculation of scope values and totals
    const {
        scope1Fixed,
        scope1Mobile,
        scope1Process,
        scope1Fugitive,
        totalScope1,
        scope2PurchasedElectricity,
        scope3Total,
        totalEmissions
    } = useMemo(() => {
        const lookup = {};
        reportData.forEach((item) => {
            lookup[item.scopeid] = item.gassum || 0;
        });

        const scope1Fixed = lookup['22ac58c5-38ed-489e-a7ba-e6056bbfc4b9'] || 0;
        const scope1Mobile = lookup['7798e62e-3df9-4617-a3e6-4a2d28c92286'] || 0;
        const scope1Process = lookup['d9130004-ba64-4af4-bd42-7d1592d99016'] || 0;
        const scope1Fugitive = lookup['75ac1067-1be2-445e-a731-04bdb9125d26'] || 0;
        const totalScope1 = scope1Fixed + scope1Mobile + scope1Process + scope1Fugitive;

        const scope2PurchasedElectricity = lookup['aacab754-b393-488f-ab44-6acb78c57cd2'] || 0;

        const getTotalEmissions = (scope) => {
            return reportData
                .filter((item) => item.scopecode === scope && item.gassum !== null)
                .reduce((acc, curr) => acc + (curr.gassum || 0), 0);
        };
        const scope3Total = getTotalEmissions("3") || 0;

        const totalEmissions = scope1Fixed + scope1Mobile + scope1Process + scope1Fugitive + scope2PurchasedElectricity + scope3Total;

        return {
            scope1Fixed,
            scope1Mobile,
            scope1Process,
            scope1Fugitive,
            totalScope1,
            scope2PurchasedElectricity,
            scope3Total,
            totalEmissions
        };
    }, [reportData]);
        
    // Function to calculate percentage
    const calculatePercentage = (value, total) => {
        if (!total) return '0.00%';
        if (!value) return '0.00%';
        return ((value / total) * 100).toFixed(2) + '%';
    };

    // Expose getRows function for Excel export
    useImperativeHandle(ref, () => ({
      getRows: () => {
        return [
          { scope: t('scope'), scope1_fixed: t('fixedEmissions'), scope1_mobile: t('mobileEmissions'), scope1_process: t('processEmissions'), scope1_fugitive: t('fugitiveEmissions'), scope2: t('energyIndirectEmissions'), scope3: t('otherIndirectEmissions'), total: t('totalEmissionsNote') },
          { scope: t('emissions'), scope1_fixed: scope1Fixed.toFixed(3), scope1_mobile: scope1Mobile.toFixed(3), scope1_process: scope1Process.toFixed(3), scope1_fugitive: scope1Fugitive.toFixed(3), scope2: scope2PurchasedElectricity.toFixed(3), scope3: scope3Total.toFixed(3), total: totalEmissions.toFixed(3) },
          { scope: '', scope1_fixed: '', scope1_mobile: '', scope1_process: '', scope1_fugitive: '', scope2: '', scope3: '', total: '' },
          { scope: t('totalScope1'), scope1_fixed: totalScope1.toFixed(3), scope1_mobile: '', scope1_process: '', scope1_fugitive: '', scope2: '', scope3: '', total: '' },
          { scope: t('percentage'), scope1_fixed: calculatePercentage(scope1Fixed, totalEmissions), scope1_mobile: calculatePercentage(scope1Mobile, totalEmissions), scope1_process: calculatePercentage(scope1Process, totalEmissions), scope1_fugitive: calculatePercentage(scope1Fugitive, totalEmissions), scope2: calculatePercentage(scope2PurchasedElectricity, totalEmissions), scope3: calculatePercentage(scope3Total, totalEmissions), total: '100.00%' },
          { scope: t('totalScope1Percentage'), scope1_fixed: calculatePercentage(totalScope1, totalEmissions), scope1_mobile: '', scope1_process: '', scope1_fugitive: '', scope2: '', scope3: '', total: '' },
        ];
      }
    }));

    return (
        <Box sx={{ p: 2, mt: 3 }}>
            {/* Header */}
            <Typography variant="h5" align="center" gutterBottom>
                {t('summaryTable4')}
            </Typography>

            {loading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '300px',
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table aria-label={t('scopeBasedEmissionsTable')}>
                        <TableHead>
                            <TableRow>
                                <TableCell rowSpan={2}>{t('scope')}</TableCell>
                                <TableCell colSpan={4} align="center">
                                    {t('scope1')}
                                </TableCell>
                                <TableCell colSpan={3} align="center">
                                    {t('scope2')}
                                </TableCell>
            
                                <TableCell rowSpan={2} align="center">
                                    {t('totalEmissionsNote')}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center">
                                    {t('fixedEmissions')}
                                </TableCell>
                                <TableCell align="center">
                                    {t('processEmissions')}
                                </TableCell>
                                <TableCell align="center">
                                    {t('mobileEmissions')}
                                </TableCell>
                                <TableCell align="center">
                                    {t('fugitiveEmissions')}
                                </TableCell>
                                <TableCell align="center">
                                    {t('energyIndirectEmissions')}
                                </TableCell>
                                <TableCell align="center">
                                    {t('Outsourcing steam')}
                                </TableCell>
                                <TableCell align="center">
                                    {t('otherIndirectEmissions')}
                                </TableCell>
                               
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* Data Row */}
                            <TableRow>
                                <TableCell rowSpan={2}>
                                    {t('emissions')}
                                </TableCell>
                                <TableCell align="center">
                                    {scope1Fixed.toFixed(3)}
                                </TableCell>
                                <TableCell align="center">
                                    {scope1Process.toFixed(3)}
                                </TableCell>
                                <TableCell align="center">
                                    {scope1Mobile.toFixed(3)}
                                </TableCell>
                                
                                <TableCell align="center">
                                    {scope1Fugitive.toFixed(3)}
                                </TableCell>
                                <TableCell rowSpan={2} align="center">
                                    {scope2PurchasedElectricity.toFixed(3)}
                                </TableCell>
                              <TableCell rowSpan={2}align="center">
                                    000.000
                                </TableCell>
                                <TableCell rowSpan={2}align="center">
                                    {scope3Total.toFixed(3)}
                                </TableCell>
                                <TableCell rowSpan={2}align="center">
                                    {totalEmissions.toFixed(3)}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell colSpan={4}align="center">
                                    {totalScope1.toFixed(3)}
                                </TableCell>
                            </TableRow>
                            {/* Percentage Row */}
                            <TableRow>
                                <TableCell rowSpan={2}>{t('percentage')}</TableCell>
                                <TableCell align="center">
                                    {calculatePercentage(
                                        scope1Fixed,
                                        totalEmissions
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    {calculatePercentage(
                                        scope1Process,
                                        totalEmissions
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    {calculatePercentage(
                                        scope1Mobile,
                                        totalEmissions
                                    )}
                                </TableCell>
                                
                                <TableCell align="center">
                                    {calculatePercentage(
                                        scope1Fugitive,
                                        totalEmissions
                                    )}
                                </TableCell>
                                <TableCell rowSpan={2}align="center">
                                    {calculatePercentage(
                                        scope2PurchasedElectricity,
                                        totalEmissions
                                    )}
                                </TableCell>
                                <TableCell rowSpan={2}align="center"> 0.0%</TableCell>
                                <TableCell rowSpan={2}align="center"> {calculatePercentage(
                                        scope3Total,
                                        totalEmissions
                                    )}</TableCell>
                               
                                <TableCell rowSpan={2} align="center">
                                    100.00%
                                </TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell colSpan={4}align="center">
                            {calculatePercentage(
                                        totalScope1,
                                        totalEmissions
                                    )}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Notes Section */}
            <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 2 }}
            >
                {t('notes')}
            </Typography>
        </Box>
    );
});

export default React.memo(CarbonReportExtended);
 