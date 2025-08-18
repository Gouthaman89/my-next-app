import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router'; // Import useRouter
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Button } from '@mui/material';
import CarbonReportExtended from './final_carbonreport_sub_page/finalcarbonreporitextend1';
import SideBySideTables from './final_carbonreport_sub_page/finalreport34';
import Report2List1 from './final_carbonreport_sub_page/report2_list1';
import Report2List2 from './final_carbonreport_sub_page/report2_list2';
import Report2List3 from './final_carbonreport_sub_page/report2_list3';
import Report2List4 from './final_carbonreport_sub_page/report2_list4';
import Report2List5 from './final_carbonreport_sub_page/report2_list5';
import Report2List6 from './final_carbonreport_sub_page/report2_list6';
import Report2List7 from './final_carbonreport_sub_page/report2_list7';
import { useGlobalContext } from '../components/GlobalContext'; // Import the GlobalContext to access reportId, orgId, year
import { useTranslation } from 'react-i18next';


const CarbonReport = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { version } = router.query; // Extract version from the URL query string
    // Use GlobalContext to get reportId, orgId, and year
    const { globalReportId, globalOrgId, globalYear } = useGlobalContext();

    const [loading, setLoading] = useState(true);
    const [loadingTable2, setLoadingTable2] = useState(true);
    const [dataTable1, setDataTable1] = useState([]);
    const [dataTable2, setDataTable2] = useState([]);

    // Gases for the table headers (map gas codes to display names)
    const gases = {
      CO2: 'CO\u2082',
      CH4: 'CH\u2084',
      N2O: 'N\u2082O',
      HFCS: 'HFCs',
      PFCS: 'PFCs',
      SF6: 'SF\u2086',
      NF3: 'NF\u2083'
    };

    // Fetch data for Table 1 and Table 2
    useEffect(() => {
        if (globalReportId && globalOrgId && globalYear) {
            fetchTable1Data(globalReportId, globalOrgId, globalYear);
            fetchTable2Data(globalReportId, globalOrgId, globalYear);
        }
    }, [globalReportId, globalOrgId, globalYear]);

    const fetchTable1Data = async (reportId, orgId, year) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_table2`, { reportId, orgId, year, version });
            setDataTable1(response.data);
        } catch (error) {
            console.error(t('errorFetchingTable1Data'), error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTable2Data = async (reportId, orgId, year) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_table3`, { reportId, orgId, year, version });
            setDataTable2(response.data);
        } catch (error) {
            console.error(t('errorFetchingTable2Data'), error);
        } finally {
            setLoadingTable2(false);
        }
    };

    // Function to calculate total emissions for Table 1
    const calculateTotalEmissions1 = () => {
        return dataTable1.reduce((total, gas) => {
            return total + (gas.gassum || 0);
        }, 0);
    };

    // Function to calculate percentage for each gas in Table 2
    const calculatePercentage1 = (gassum) => {
        const totalEmissions = calculateTotalEmissions1();
        return totalEmissions ? ((gassum || 0) / totalEmissions) * 100 : 0;
    };

    // Function to calculate total emissions for Table 2
    const calculateTotalEmissions = () => {
        return dataTable2.reduce((total, gas) => {
            return total + (gas.gassum || 0);
        }, 0);
    };

    // Function to calculate percentage for each gas in Table 2
    const calculatePercentage = (gassum) => {
        const totalEmissions = calculateTotalEmissions();
        return totalEmissions ? ((gassum || 0) / totalEmissions) * 100 : 0;
    };

    // Excel download function: combine all data into a single sheet
    // To include report2List1~report2List6, we need to access their data here.
    // We'll use refs and expose a getRows function from each component.
    // Set up refs for each report2List component
    const report2List1Ref = React.useRef();
    const report2List2Ref = React.useRef();
    const report2List3Ref = React.useRef();
    const report2List4Ref = React.useRef();
    const report2List5Ref = React.useRef();
    const report2List6Ref = React.useRef();
    const report2List7Ref = React.useRef();
    // Refs for CarbonReportExtended and SideBySideTables
    const carbonReportExtendedRef = React.useRef();
    const sideBySideTablesRef = React.useRef();
    // Ref to prevent duplicate prefetches
    const didInitialPrefetch = React.useRef(false);

    // Helper: Export to Excel using exceljs
    const exportToExcel = async (data, headers, sheetName, filename = 'report.xlsx') => {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(sheetName);
      // Setup columns
      sheet.columns = headers.map(h => ({
        header: h.label,
        key: h.key,
        width: h.width || 20
      }));
      // Style header
      sheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE4E4E4' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      // Add data
      data.forEach(row => {
        sheet.addRow(row);
      });
      // Save file (if filename provided)
      if (filename) {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        saveAs(blob, filename);
      }
      return { workbook, sheet };
    };

    // Loader to ensure all section data is loaded before Excel generation
    const loadAllSectionsData = async () => {
      if (!globalReportId || !globalOrgId || !globalYear) return; // wait for context to be ready
      await Promise.all([
        report2List1Ref.current?.loadData?.(),
        report2List2Ref.current?.loadData?.(),
        report2List3Ref.current?.loadData?.(),
        report2List4Ref.current?.loadData?.(),
        report2List5Ref.current?.loadData?.(),
        report2List6Ref.current?.loadData?.(),
        report2List7Ref.current?.loadData?.(),
        carbonReportExtendedRef.current?.loadData?.(),
        sideBySideTablesRef.current?.loadData?.(),
      ]);
    };

    // Load all sections only after report/org/year are ready, and only once
    useEffect(() => {
      if (!globalReportId || !globalOrgId || !globalYear) return;
      if (didInitialPrefetch.current) return;
      didInitialPrefetch.current = true;
      loadAllSectionsData();
    }, [globalReportId, globalOrgId, globalYear]);

    // Download all sheets to Excel using exceljs
    const downloadToExcel = async () => {
      await loadAllSectionsData(); // Ensure all sections have loaded data
      const report2List1 = report2List1Ref.current?.getRows?.() || [];
      const report2List2 = report2List2Ref.current?.getRows?.() || [];
      const report2List3 = report2List3Ref.current?.getRows?.() || [];
      const report2List4 = report2List4Ref.current?.getRows?.() || [];
      const report2List5 = report2List5Ref.current?.getRows?.() || [];
      const report2List6 = report2List6Ref.current?.getRows?.() || [];
      const report2List7 = report2List7Ref.current?.getRows?.() || [];
      // Section 8 tables
      const [summaryTable4Rows] = [(() => {
        let reportData = carbonReportExtendedRef.current?.reportData || [];
        let tFunc = t;
        if (carbonReportExtendedRef.current?.t) tFunc = carbonReportExtendedRef.current.t;
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
        const calculatePercentage = (value, total) => {
          if (!total) return '0.00%';
          if (!value) return '0.00%';
          return ((value / total) * 100).toFixed(2) + '%';
        };
        return [
          { scope: tFunc('scope'), scope1_fixed: tFunc('fixedEmissions'), scope1_mobile: tFunc('mobileEmissions'), scope1_process: tFunc('processEmissions'), scope1_fugitive: tFunc('fugitiveEmissions'), scope2: tFunc('energyIndirectEmissions'), scope3: tFunc('otherIndirectEmissions'), total: tFunc('totalEmissionsNote') },
          { scope: tFunc('emissions'), scope1_fixed: scope1Fixed.toFixed(3), scope1_mobile: scope1Mobile.toFixed(3), scope1_process: scope1Process.toFixed(3), scope1_fugitive: scope1Fugitive.toFixed(3), scope2: scope2PurchasedElectricity.toFixed(3), scope3: scope3Total.toFixed(3), total: totalEmissions.toFixed(3) },
          { scope: '', scope1_fixed: '', scope1_mobile: '', scope1_process: '', scope1_fugitive: '', scope2: '', scope3: '', total: '' },
          { scope: tFunc('totalScope1'), scope1_fixed: totalScope1.toFixed(3), scope1_mobile: '', scope1_process: '', scope1_fugitive: '', scope2: '', scope3: '', total: '' },
          { scope: tFunc('percentage'), scope1_fixed: calculatePercentage(scope1Fixed, totalEmissions), scope1_mobile: calculatePercentage(scope1Mobile, totalEmissions), scope1_process: calculatePercentage(scope1Process, totalEmissions), scope1_fugitive: calculatePercentage(scope1Fugitive, totalEmissions), scope2: calculatePercentage(scope2PurchasedElectricity, totalEmissions), scope3: calculatePercentage(scope3Total, totalEmissions), total: '100.00%' },
          { scope: tFunc('totalScope1Percentage'), scope1_fixed: calculatePercentage(totalScope1, totalEmissions), scope1_mobile: '', scope1_process: '', scope1_fugitive: '', scope2: '', scope3: '', total: '' },
        ];
      })()];
      // Get new structured table 5 and 6 data
      const { summaryTable5, summaryTable6 } = sideBySideTablesRef.current?.getRows?.() || {};

      // Define headers for each sheet
      const headers1 = [
        { key: 'carbonyear', label: t('carbonyear')  },
        { key: 'controlno', label: t('controlno') },
        { key: 'companyname', label: t('companyname') },
        { key: 'taxcode', label: t('taxcode') },
        { key: 'organizationcode', label: t('organizationcode')},
        { key: 'owner', label: t('owner')},
        { key: 'contactname', label: t('contactname')},
        { key: 'tel', label: t('tel') },
        { key: 'email', label: t('email')},
        { key: 'fax', label: t('fax')},
        { key: 'mobile', label: t('mobile')  },
        { key: 'industrycode', label: t('industrycode')  },
        { key: 'industryname', label: t('industryname') },
        { key: 'reason', label: t('reason')  },
        { key: 'accordto', label: t('accordto') },
        { key: 'ispermit', label: t('ispermit') },
        { key: 'institution', label: t('institution') },
        { key: 'comment', label: t('comment')  },
      ];
      const headers2 = [
        { key: 'certificate', label: t('certificate') },
        { key: 'competent', label: t('competent') },
        { key: 'city', label: t('city') },
        { key: 'area', label: t('area') },
        { key: 'postcode', label: t('postcode') },
        { key: 'neighborhood', label: t('neighborhood') },
        { key: 'village', label: t('village') },
        { key: 'address', label: t('address') },
        { key: 'combinname', label: t('combinname') },
        { key: 'combinname2', label: t('combinname2') },
        { key: 'combinname3', label: t('combinname3') },
      ];
      const headers3 = [
        { key: 'processno', label: t('processno') },
        { key: 'processcode', label: t('processcode') },
        { key: 'processname', label: t('processname') },
        { key: 'assetno', label: t('assetno') },
        { key: 'assetcode', label: t('assetcode') },
        { key: 'assetname', label: t('assetname') },
        { key: 'objecttype', label: t('objecttype') },
        { key: 'objectcode', label: t('objectcode') },
        { key: 'objectname', label: t('objectname') },
        { key: 'isbiomess', label: t('isbiomess') },
        { key: 'isdirect', label: t('isdirect') },
        { key: 'scopetype', label: t('scopetype') },
        { key: 'scopesubtype', label: t('scopesubtype') },
        { key: 'hasco2', label: t('hasco2') },
        { key: 'hasch4', label: t('hasch4') },
        { key: 'hasn2o', label: t('hasn2o') },
        { key: 'hashfcs', label: t('hashfcs') },
        { key: 'haspfcs', label: t('haspfcs') },
        { key: 'hassf6', label: t('hassf6') },
        { key: 'hasnf3', label: t('hasnf3') },
        { key: 'ischp', label: t('ischp') },
        { key: 'comment', label: t('comment') }
      ];
      const headers4 = [
        { key: 'processno', label: t('processno') },
        { key: 'processcode', label: t('processcode') },
        { key: 'processname', label: t('processname') },
        { key: 'assetno', label: t('assetno') },
        { key: 'assetcode', label: t('assetcode') },
        { key: 'assetname', label: t('assetname') },
        { key: 'objecttype', label: t('objecttype') },
        { key: 'objectcode', label: t('objectcode') },
        { key: 'objectname', label: t('objectname') },
        { key: 'isbiomess', label: t('isbiomess') },
        { key: 'isdirect', label: t('isdirect') },
        { key: 'scopetype', label: t('scopetype') },
        { key: 'scopesubtype', label: t('scopesubtype') },
        { key: 'scope2provider', label: t('scope2provider') },
        { key: 'amount', label: t('amount') },
        { key: 'unitname', label: t('unitname') },
        { key: 'percentage', label: t('percentage') },
        { key: 'otherunit', label: t('otherunit') },
        { key: 'dsname', label: t('dsname') },
        { key: 'dep', label: t('dep') },
        { key: 'measurefreq', label: t('measurefreq') },
        { key: 'measureequip', label: t('measureequip') },
        { key: 'correctionfreq', label: t('correctionfreq') },
        { key: 'emissionmethod', label: t('emissionmethod') },
        { key: 'lhv', label: t('lhv') },
        { key: 'lhvunit', label: t('lhvunit') },
        { key: 'moisturepercentage', label: t('moisturepercentage') },
        { key: 'carbonpercentage', label: t('carbonpercentage') },
        { key: 'comment', label: t('comment') }
      ];
      const headers5 = [
        { key: 'processno', label: t('processno') },
        { key: 'processcode', label: t('processcode') },
        { key: 'processname', label: t('processname') },
        { key: 'assetno', label: t('assetno') },
        { key: 'assetcode', label: t('assetcode') },
        { key: 'assetname', label: t('assetname') },
        { key: 'objecttype', label: t('objecttype') },
        { key: 'objectcode', label: t('objectcode') },
        { key: 'objectname', label: t('objectname') },
        { key: 'isbiomess', label: t('isbiomess') },
        { key: 'isdirect', label: t('isdirect') },
        { key: 'scopetype', label: t('scopetype') },
        { key: 'amount', label: t('amount') },
        { key: 'unitname', label: t('unitname') },
        { key: 'percentage', label: t('percentage') },
        { key: 'emissionmethod', label: t('emissionmethod') },
        { key: 'gas', label: t('gas') },
        { key: 'hvfactor', label: t('hvfactor') },
        { key: 'hvunitname', label: t('hvunitname') },
        { key: 'factor', label: t('factor') },
        { key: 'factorunit', label: t('factorunit') },
        { key: 'factorfrom', label: t('factorfrom') },
        { key: 'levelfactor', label: t('levelfactor') },
        { key: 'emissions', label: t('emissions') },
        { key: 'gwp', label: t('GWP') },
        { key: 'co2e', label: t('co2e') },
        { key: 'emissionstotal', label: t('emissionstotal') },
        { key: 'biomesstotal', label: t('biomesstotal') },
        { key: 'emissionpercentage', label: t('emissionpercentage') },
        { key: 'absco2e', label: t('absco2e') }
      ];
      const headers6 = [
        { key: 'processno', label: t('processno') },
        { key: 'processcode', label: t('processcode') },
        { key: 'assetno', label: t('assetno') },
        { key: 'assetcode', label: t('assetcode') },
        { key: 'objectcode', label: t('objectcode') },
        { key: 'objectname', label: t('objectname') },
        { key: 'errorlevel', label: t('errorlevel') },
        { key: 'reliability', label: t('reliability') },
        { key: 'correctionlevel', label: t('correctionlevel') },
        { key: 'credibility', label: t('credibility') },
        { key: 'owner', label: t('owner') },
        { key: 'isdirect', label: t('isdirect') },
        { key: 'scopetype', label: t('scopesubtype') },
        { key: 'categoryofds', label: t('catogoryofds') },
        { key: 'errorfactorlevel', label: t('errorlevel2') },
        { key: 'errorleveltotal', label: t('errorleveltotal') },
        { key: 'emissionpercentage', label: t('emissionpercentage') },
        { key: 'scorerange', label: t('scorerange') },
        { key: 'weightavg', label: t('weightavg') }
      ];
      const headers7 = [
        { key: 'processno', label: t('processno') },
        { key: 'assetno', label: t('assetno') },
        { key: 'objectcode', label: t('objectcode') },
        { key: 'objectname', label: t('objectname') },
        { key: 'uncertaintydslower', label: t('uncertaintydslower') },
        { key: 'uncertaintydsupper', label: t('uncertaintydsupper') },
        { key: 'datafrom', label: t('datafrom') },
        { key: 'dsdep', label: t('dsdep') },
        { key: 'gas', label: t('gas') },
        { key: 'co2e', label: t('co2e') },
        { key: 'uncertaintyfactorlower', label: t('uncertaintyfactorlower') },
        { key: 'uncertaintyfactorupper', label: t('uncertaintyfactorupper') },
        { key: 'uncertaintyfactorfrom', label: t('uncertaintyfactorfrom') },
        { key: 'factordep', label: t('factordep') },
        { key: 'uncertaintygaslower', label: t('uncertaintygaslower') },
        { key: 'uncertaintygasupper', label: t('uncertaintygasupper') },
        { key: 'uncertaintyemissionlower', label: t('uncertaintyemissionlower') },
        { key: 'uncertaintyemissionupper', label: t('uncertaintyemissionupper') }
      ];

      // Create a workbook and add all sheets
      const workbook = new ExcelJS.Workbook();
      // Sheet1
      const sheet1 = workbook.addWorksheet('Sheet1');
      sheet1.columns = headers1.map(h => ({ header: h.label, key: h.key, width: h.width || 20 }));
      sheet1.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4E4E4' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      (report2List1 || []).forEach(row => sheet1.addRow(row));
      // Sheet2
      const sheet2 = workbook.addWorksheet('Sheet2');
      sheet2.columns = headers2.map(h => ({ header: h.label, key: h.key, width: h.width || 20 }));
      sheet2.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4E4E4' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      (report2List2 || []).forEach(row => sheet2.addRow(row));
      // Sheet3
      const sheet3 = workbook.addWorksheet('Sheet3');
      sheet3.columns = headers3.map(h => ({ header: h.label, key: h.key, width: h.width || 20 }));
      sheet3.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4E4E4' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      (report2List3 || []).forEach(row => sheet3.addRow(row));
      // Sheet4
      const sheet4 = workbook.addWorksheet('Sheet4');
      sheet4.columns = headers4.map(h => ({ header: h.label, key: h.key, width: h.width || 20 }));
      sheet4.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4E4E4' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      (report2List4 || []).forEach(row => sheet4.addRow(row));
      // Sheet5
      const sheet5 = workbook.addWorksheet('Sheet5');
      sheet5.columns = headers5.map(h => ({ header: h.label, key: h.key, width: h.width || 20 }));
      sheet5.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4E4E4' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      (report2List5 || []).forEach(row => sheet5.addRow(row));
      // Sheet6
      const sheet6 = workbook.addWorksheet('Sheet6');
      sheet6.columns = headers6.map(h => ({ header: h.label, key: h.key, width: h.width || 20 }));
      sheet6.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4E4E4' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      (report2List6 || []).forEach(row => sheet6.addRow(row));
      // Sheet7
      const sheet7 = workbook.addWorksheet('Sheet7');
      sheet7.columns = headers7.map(h => ({ header: h.label, key: h.key, width: h.width || 20 }));
      sheet7.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4E4E4' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      (report2List7 || []).forEach(row => sheet7.addRow(row));

      // Sheet8: Section 8 summary tables
      const sheet8 = workbook.addWorksheet('Sheet8');
      // Compose all rows for Sheet 8, including new Table 5 & 6 structure
      const section8CombinedData = [
        [], // spacer
        [t('newTableHeader')],
        [t('electricity'), t('steam'), t('thermalPower'), t('windPower'), t('hydropower'), t('geothermal'), t('tidal'), t('otherRenewable'), t('nuclear'), t('other'), t('otherPowerGeneration'), t('plantSteamGeneration')],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [],
        [t('summaryTable2')],
        ['', 'CO2', 'CH4', 'N2O', 'HFCS', 'PFCS', 'SF6', 'NF3', t('totalEmissions')],
        [
          t('emissions'),
          (dataTable1.find(g => g.code === 'CO2')?.gassum || 0).toFixed(12),
          (dataTable1.find(g => g.code === 'CH4')?.gassum || 0).toFixed(12),
          (dataTable1.find(g => g.code === 'N2O')?.gassum || 0).toFixed(12),
          (dataTable1.find(g => g.code === 'HFCS')?.gassum || 0).toFixed(12),
          (dataTable1.find(g => g.code === 'PFCS')?.gassum || 0).toFixed(12),
          (dataTable1.find(g => g.code === 'SF6')?.gassum || 0).toFixed(12),
          (dataTable1.find(g => g.code === 'NF3')?.gassum || 0).toFixed(12),
          calculateTotalEmissions1().toFixed(12)
        ],
        [
          t('percentage'),
          `${calculatePercentage1(dataTable1.find(g => g.code === 'CO2')?.gassum || 0).toFixed(2)}%`,
          `${calculatePercentage1(dataTable1.find(g => g.code === 'CH4')?.gassum || 0).toFixed(2)}%`,
          `${calculatePercentage1(dataTable1.find(g => g.code === 'N2O')?.gassum || 0).toFixed(2)}%`,
          `${calculatePercentage1(dataTable1.find(g => g.code === 'HFCS')?.gassum || 0).toFixed(2)}%`,
          `${calculatePercentage1(dataTable1.find(g => g.code === 'PFCS')?.gassum || 0).toFixed(2)}%`,
          `${calculatePercentage1(dataTable1.find(g => g.code === 'SF6')?.gassum || 0).toFixed(2)}%`,
          `${calculatePercentage1(dataTable1.find(g => g.code === 'NF3')?.gassum || 0).toFixed(2)}%`,
          `100%`
        ],
        [],
        [t('additionalTablesHeader')],
        ['', 'CO2', 'CH4', 'N2O', 'HFCS', 'PFCS', 'SF6', 'NF3', t('totalEmissions')],
        [
          t('emissions'),
          (dataTable2.find(g => g.code === 'CO2')?.gassum || 0).toFixed(2),
          (dataTable2.find(g => g.code === 'CH4')?.gassum || 0).toFixed(2),
          (dataTable2.find(g => g.code === 'N2O')?.gassum || 0).toFixed(2),
          (dataTable2.find(g => g.code === 'HFCS')?.gassum || 0).toFixed(2),
          (dataTable2.find(g => g.code === 'PFCS')?.gassum || 0).toFixed(2),
          (dataTable2.find(g => g.code === 'SF6')?.gassum || 0).toFixed(2),
          (dataTable2.find(g => g.code === 'NF3')?.gassum || 0).toFixed(2),
          calculateTotalEmissions().toFixed(2)
        ],
        [
          t('percentage'),
          `${calculatePercentage(dataTable2.find(g => g.code === 'CO2')?.gassum || 0).toFixed(2)}%`,
          `${calculatePercentage(dataTable2.find(g => g.code === 'CH4')?.gassum || 0).toFixed(2)}%`,
          `${calculatePercentage(dataTable2.find(g => g.code === 'N2O')?.gassum || 0).toFixed(2)}%`,
          `${calculatePercentage(dataTable2.find(g => g.code === 'HFCS')?.gassum || 0).toFixed(2)}%`,
          `${calculatePercentage(dataTable2.find(g => g.code === 'PFCS')?.gassum || 0).toFixed(2)}%`,
          `${calculatePercentage(dataTable2.find(g => g.code === 'SF6')?.gassum || 0).toFixed(2)}%`,
          `${calculatePercentage(dataTable2.find(g => g.code === 'NF3')?.gassum || 0).toFixed(2)}%`,
          `100%`
        ],
        [],
        [t('summaryTable4')],
        [],
        ...summaryTable4Rows.map(obj => Object.values(obj)),
        // Table 5: Data Rating Results
        [summaryTable5?.title || t('summary_table5_title')],
        [t('level'), t('count'), t('average_score')],
        ...(summaryTable5?.rows || []).map(r => [r.Level, r.Count, r.AverageScore]),
        [],
        // Table 6: Uncertainty Quantification Assessment Results
        [summaryTable6?.title || t('summary_table6_title')],
        [
          t('uncertainty_summary_emission_sum'),
          t('uncertainty_summary_total_emission'),
          t('uncertainty_summary_total'),
          t('uncertainty_summary_lower'),
          t('uncertainty_summary_upper')
        ],
        [
          summaryTable6?.data?.emissionSum1,
          summaryTable6?.data?.totalEmission,
          t('uncertainty_summary_lower'),
          t('uncertainty_summary_upper'),
          ''
        ],
        [
          t('uncertainty_summary_emission_ratio'),
          summaryTable6?.data?.emissionRatio,
          summaryTable6?.data?.lowerBound,
          summaryTable6?.data?.upperBound,
          ''
        ]
      ];
      // Write all rows to Sheet8 and keep track of row indices for styling/merging
      section8CombinedData.forEach((row, idx) => {
        sheet8.addRow(row);
      });
      // Styling for section 8: bold for headers
      // Find row indices for Table 5 and Table 6 sections
      let table5TitleRow = section8CombinedData.findIndex(r => Array.isArray(r) && r[0] && r[0].includes('Summary Table 5'));
      let table6TitleRow = section8CombinedData.findIndex(r => Array.isArray(r) && r[0] && r[0].includes('Summary Table 6'));
      // Table 5 header row is next row
      let table5HeaderRow = table5TitleRow + 2;
      let table6HeaderRow = table6TitleRow + 2;
      // Table 6 data rows
      let table6Row1 = table6HeaderRow + 1;
      let table6Row2 = table6HeaderRow + 2;
      let table6Row3 = table6HeaderRow + 3;

      // General styling for section headers
      [2,6,10,14].forEach(rowIdx => {
        if (sheet8.getRow(rowIdx+1)) {
          sheet8.getRow(rowIdx+1).font = { bold: true };
          sheet8.getRow(rowIdx+1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4E4E4' } };
        }
      });
      // Table 5 styling
      if (sheet8.getRow(table5TitleRow+1)) {
        sheet8.getRow(table5TitleRow+1).font = { bold: true };
        sheet8.getRow(table5TitleRow+1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4E4E4' } };
      }
      if (sheet8.getRow(table5HeaderRow)) {
        sheet8.getRow(table5HeaderRow).font = { bold: true };
        sheet8.getRow(table5HeaderRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4E4E4' } };
      }
      // Table 6 styling
      if (sheet8.getRow(table6TitleRow+1)) {
        sheet8.getRow(table6TitleRow+1).font = { bold: true };
        sheet8.getRow(table6TitleRow+1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4E4E4' } };
      }
      if (sheet8.getRow(table6HeaderRow)) {
        sheet8.getRow(table6HeaderRow).font = { bold: true };
        sheet8.getRow(table6HeaderRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4E4E4' } };
      }
      // Table 6 merged cells and background for headers
      // Merge columns for "本清冊之總不確定性" (columns 3, 4, 5 in Excel, i.e., C,D,E)
      if (sheet8.getRow(table6HeaderRow)) {
        sheet8.mergeCells(table6HeaderRow, 3, table6HeaderRow, 5);
        // Set fill for merged header
        for (let col = 3; col <= 5; col++) {
          const cell = sheet8.getRow(table6HeaderRow).getCell(col);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4E4E4' } };
          cell.font = { bold: true };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      }
      // Merge columns for "95%信賴區間下限" and "95%信賴區間上限" row (row after header)
      if (sheet8.getRow(table6Row2)) {
        sheet8.mergeCells(table6Row2, 3, table6Row2, 3); // single cell, but for symmetry
        sheet8.mergeCells(table6Row2, 4, table6Row2, 4);
        sheet8.mergeCells(table6Row2, 5, table6Row2, 5);
        // Set fill for merged
        [3,4,5].forEach(col => {
          const cell = sheet8.getRow(table6Row2).getCell(col);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F7F7' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      }
      // Merge columns for "進行不確定性評估之排放量佔總排放量之比例" (row 3 col 1) across two columns
      if (sheet8.getRow(table6Row3)) {
        sheet8.mergeCells(table6Row3, 1, table6Row3, 2);
        // Set fill for merged
        [1,2].forEach(col => {
          const cell = sheet8.getRow(table6Row3).getCell(col);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F7F7' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      }
      // Save file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      saveAs(blob, `carbon_report_${globalYear || 'data'}.xlsx`);
    };

    // State for active section (for conditional rendering)
    const [activeSection, setActiveSection] = useState('section1');

    // Track per-button loading state and whether each section has finished initial load
    const [sectionLoading, setSectionLoading] = useState({
      section1: false, section2: false, section3: false, section4: false,
      section5: false, section6: false, section7: false, section8: false,
    });
    const [sectionLoaded, setSectionLoaded] = useState({
      section1: false, section2: false, section3: false, section4: false,
      section5: false, section6: false, section7: false, section8: false,
    });

    // Helper to wait until a condition is true (polling)
    const waitFor = (cond, { interval = 150, timeout = 15000 } = {}) =>
      new Promise((resolve, reject) => {
        const start = Date.now();
        const id = setInterval(() => {
          if (cond()) {
            clearInterval(id);
            resolve();
          } else if (Date.now() - start > timeout) {
            clearInterval(id);
            reject(new Error('Timeout waiting for condition'));
          }
        }, interval);
      });

    // Map section -> loader function (should resolve when section's data is ready)
    const sectionLoaders = {
      section1: () => report2List1Ref.current?.loadData?.(),
      section2: () => report2List2Ref.current?.loadData?.(),
      section3: () => report2List3Ref.current?.loadData?.(),
      section4: () => report2List4Ref.current?.loadData?.(),
      section5: () => report2List5Ref.current?.loadData?.(),
      section6: () => report2List6Ref.current?.loadData?.(),
      section7: () => report2List7Ref.current?.loadData?.(),
      // Section 8 depends on table1/table2 fetches + subcomponents
      section8: async () => {
        if (!globalReportId || !globalOrgId || !globalYear) return;
        await Promise.all([
          carbonReportExtendedRef.current?.loadData?.(),
          sideBySideTablesRef.current?.loadData?.(),
        ]);
        // Wait until both top tables finished loading
        await waitFor(() => !loading && !loadingTable2);
      },
    };

    // Mark section8 as loaded when both top tables are done
    useEffect(() => {
      if (!loading && !loadingTable2) {
        setSectionLoaded(prev => ({ ...prev, section8: true }));
      }
    }, [loading, loadingTable2]);

    // After initial prefetch, mark sections that have getRows data as loaded
    useEffect(() => {
      const maybeMark = (key, ref) => {
        if (ref.current?.getRows?.()?.length >= 0) {
          setSectionLoaded(prev => ({ ...prev, [key]: true }));
        }
      };
      maybeMark('section1', report2List1Ref);
      maybeMark('section2', report2List2Ref);
      maybeMark('section3', report2List3Ref);
      maybeMark('section4', report2List4Ref);
      maybeMark('section5', report2List5Ref);
      maybeMark('section6', report2List6Ref);
      maybeMark('section7', report2List7Ref);
    }, []);

    // Handler to show section by setting activeSection and loading if needed
    const handleShowSection = async (section) => {
      setActiveSection(section);
      setSectionLoading(prev => ({ ...prev, [section]: true }));
      try {
        const loader = sectionLoaders[section];
        if (loader) {
          await loader();
        }
        setSectionLoaded(prev => ({ ...prev, [section]: true }));
      } catch (e) {
        console.error('Failed to load data for', section, e);
      } finally {
        setSectionLoading(prev => ({ ...prev, [section]: false }));
      }
    };

    // Compute flag for download button
    const allSectionsLoaded = Object.values(sectionLoaded).every(Boolean);
    return (
        <>
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 1000,
              backgroundColor: '#fff',
              padding: '8px 16px',
              borderBottom: '1px solid #ccc',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <Button
              variant="outlined"
              onClick={downloadToExcel}
              disabled={!allSectionsLoaded}
              sx={{
                borderColor: '#14b781',
                backgroundColor: allSectionsLoaded ? '#fff' : '#f7f7f7',
                color: '#14b781',
                fontWeight: '500',
                fontSize: '14px',
                cursor: allSectionsLoaded ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: allSectionsLoaded ? '#f2f2f2' : '#f7f7f7',
                },
              }}
              onMouseEnter={e => {
                if (allSectionsLoaded) e.target.style.backgroundColor = '#f2f2f2';
              }}
              onMouseLeave={e => {
                if (allSectionsLoaded) e.target.style.backgroundColor = '#fff';
              }}
            >
              {!allSectionsLoaded ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <span>{t('preparing')}</span>
                </Box>
              ) : (
                t('download_excel')
              )}
            </Button>
            {['1', '2', '3', '4', '5', '6', '7', '8'].map((section) => (
              <Button
                key={section}
                variant="outlined"
                onClick={() => handleShowSection(`section${section}`)}
                sx={{
                  borderColor: '#14b781',
                  color: '#14b781',
                  fontWeight: '500',
                  fontSize: '14px',
                  '&:hover': {
                    backgroundColor: '#f2f2f2',
                  },
                }}
              >
                {sectionLoading[`section${section}`] ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <span>{t('loading')}</span>
                  </Box>
                ) : (
                  t(`section${section}`)
                )}
              </Button>
            ))}
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1650px' }}>
              {/* Always-mounted section tables, toggled by display */}
              <Box sx={{ display: activeSection === 'section1' ? 'block' : 'none' }}>
                <Report2List1 ref={report2List1Ref} />
              </Box>
              <Box sx={{ display: activeSection === 'section2' ? 'block' : 'none' }}>
                <Report2List2 ref={report2List2Ref} />
              </Box>
              <Box sx={{ display: activeSection === 'section3' ? 'block' : 'none' }}>
                <Report2List3 ref={report2List3Ref} />
              </Box>
              <Box sx={{ display: activeSection === 'section4' ? 'block' : 'none' }}>
                <Report2List4 ref={report2List4Ref} />
              </Box>
              <Box sx={{ display: activeSection === 'section5' ? 'block' : 'none' }}>
                <Report2List5 ref={report2List5Ref} />
              </Box>
              <Box sx={{ display: activeSection === 'section6' ? 'block' : 'none' }}>
                <Report2List6 ref={report2List6Ref} />
              </Box>
              <Box sx={{ display: activeSection === 'section7' ? 'block' : 'none' }}>
                <Report2List7 ref={report2List7Ref} />
              </Box>
              <Box sx={{ display: activeSection === 'section8' ? 'block' : 'none' }}>
                 <Typography variant="h5" align="center" gutterBottom sx={{ mt: 4 }}>
                    { }
                  </Typography>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TableContainer component={Paper}>
                      <div style={{ overflowX: 'auto', width: '100%' }}>
                        <Table   aria-label={t('newTable')}>
                          <TableHead>
                            <TableRow>
                                <TableCell>{t('electricity')}</TableCell>
                                <TableCell>{t('windPower')}</TableCell>
                                <TableCell>{t('hydropower')}</TableCell>
                                <TableCell>{t('geothermal')}</TableCell>
                                <TableCell>{t('tidal')}</TableCell>
                                <TableCell>{t('otherRenewable')}</TableCell>
                                <TableCell>{t('nuclear')}</TableCell>
                                <TableCell>{t('Other renewable energy notes')}</TableCell>
                                <TableCell>{t('other')}</TableCell>
                                <TableCell>{t('otherPowerGeneration')}</TableCell>
                                <TableCell>{t('Other power generation notes')}</TableCell>
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
                        </div>
                      </TableContainer>
                  )}

                  <Typography variant="h5" align="center" gutterBottom sx={{ mt: 4 }}>
                    {t('summaryTable2')}
                  </Typography>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                     
                      <TableContainer component={Paper}> 
                          <Table   aria-label={t('carbonEmissionsTable1')}>
                            <TableHead>
                              <TableRow>
                                <TableCell>{t('gas')}</TableCell>
                                {Object.entries(gases).map(([gasKey, gasLabel]) => (
                                  <TableCell key={gasKey} align="right">{gasLabel}</TableCell>
                                ))}
                                <TableCell align="right">{t('totalEmissions-11')}</TableCell>
                                <TableCell align="right">{t('biomassEmissions')}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>{t('emissions')}</TableCell>
                                {Object.entries(gases).map(([gasKey, gasLabel]) => {
                                  const gasData = dataTable1.find(item => item.code.toUpperCase() === gasKey);
                                  return (
                                    <TableCell key={gasKey} align="right">
                                      {gasData?.gassum ? gasData.gassum.toFixed(12) : '0.00000'}
                                    </TableCell>
                                  );
                                })}
                                <TableCell align="right">{calculateTotalEmissions1().toFixed(12)}</TableCell>
                                <TableCell align="right">0.0000</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>{t('percentage')}</TableCell>
                                {Object.entries(gases).map(([gasKey, gasLabel]) => {
                                  const gasData = dataTable1.find(item => item.code.toUpperCase() === gasKey);
                                  const percentage = gasData?.gassum ? calculatePercentage1(gasData.gassum).toFixed(2) : "0.00";
                                  return (
                                    <TableCell key={gasKey} align="right">
                                      {`${percentage}%`}
                                    </TableCell>
                                  );
                                })}
                                <TableCell align="right">100%</TableCell>
                                <TableCell align="right"></TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                         
                      </TableContainer>
                   
                  )}

                  <Typography variant="body2" color="textSecondary" sx={{ mt: 4 }}>
                    {t('notes')}
                  </Typography>

                  <Typography variant="h5" align="center" gutterBottom sx={{ mt: 4 }}>
                    {t('additionalTablesHeader')}
                  </Typography>
                  {loadingTable2 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                     
                      <TableContainer component={Paper}> 
                          <Table   aria-label={t('carbonEmissionsTable2')}>
                            <TableHead>
                              <TableRow>
                                <TableCell>{t('gas')}</TableCell>
                                {Object.entries(gases).map(([gasKey, gasLabel]) => (
                                  <TableCell key={gasKey} align="right">{gasLabel}</TableCell>
                                ))}
                                <TableCell align="right">{t('totalEmissions')}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>{t('emissions')}</TableCell>
                                {Object.entries(gases).map(([gasKey, gasLabel]) => {
                                  const gasData = dataTable2.find(item => item.code.toUpperCase() === gasKey);
                                  return (
                                    <TableCell key={gasKey} align="right">
                                      {gasData?.gassum ? gasData.gassum.toFixed(2) : '0.00'}
                                    </TableCell>
                                  );
                                })}
                                <TableCell align="right">{calculateTotalEmissions().toFixed(2)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>{t('percentage')}</TableCell>
                                {Object.entries(gases).map(([gasKey, gasLabel]) => {
                                  const gasData = dataTable2.find(item => item.code.toUpperCase() === gasKey);
                                  return (
                                    <TableCell key={gasKey} align="right">
                                      {gasData?.gassum ? calculatePercentage(gasData.gassum).toFixed(2) + "%" : "0.00%"}
                                    </TableCell>
                                  );
                                })}
                                <TableCell align="right">100%</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                       
                      </TableContainer>
                   
                  )}

                  <Box sx={{ mt: 4 }}>
                    <CarbonReportExtended ref={carbonReportExtendedRef} />
                  </Box>
                  <Box sx={{ mt: 4 }}>
                    <SideBySideTables ref={sideBySideTablesRef} />
                  </Box>
                </Box>
              </Box>
            </Box>
          
        </>
    );
};

export default CarbonReport;