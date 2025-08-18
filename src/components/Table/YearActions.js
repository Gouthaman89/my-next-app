import React from 'react';
import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    RadioGroup,
    FormControlLabel,
    Radio,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as PageController from '../../controllers/PageControllers';
const YearActions = ({ row, isEditing, onEdit, onSave, onCancel }) => {
    const { t } = useTranslation();
    return (
        <>
            <button onClick={() => (isEditing ? onSave(row) : onEdit(row))}>
                {isEditing ? t('save') : t('edit')}
            </button>
            {isEditing && <button onClick={onCancel}>{t('cancel')}</button>}
        </>
    );
};

export const YearTable = ({
    yearData,
    editingYearId,
    editedCalendarType,
    setEditedCalendarType,
    setEditingYearId,
    selectedOrgId,
    fetchYearData,
    setSnackbar,
}) => {
    const { t } = useTranslation();

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{t('year')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{t('bookkeeperCompanyName')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{t('bookkeeperName')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{t('calendarType')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{t('actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {yearData.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.year}</TableCell>
                            <TableCell>{row.bookkeepercompanyname}</TableCell>
                            <TableCell>{row.bookkeepername}</TableCell>
                            <TableCell>
                                {editingYearId === row.id ? (
                                    <RadioGroup
                                        row
                                        value={editedCalendarType}
                                        onChange={(e) => setEditedCalendarType(e.target.value)}
                                    >
                                        <FormControlLabel value="0" control={<Radio />} label={t('calendarDaily')} />
                                        <FormControlLabel value="1" control={<Radio />} label={t('calendarWorking')} />
                                    </RadioGroup>
                                ) : (
                                    row.typeofcalendar === '1' ? t('calendarWorking') : t('calendarDaily')
                                )}
                            </TableCell>
                            <TableCell>
                                <YearActions
                                    row={row}
                                    isEditing={editingYearId === row.id}
                                    onEdit={(r) => {
                                        setEditingYearId(r.id);
                                        setEditedCalendarType(r.typeofcalendar === t('calendarWorking') ? '1' : '0');
                                    }}
                                    onSave={(r) => {
                                        PageController.updateRecord('/updateyearofcarbon', r.id, {
                                            typeofcalendar: editedCalendarType,
                                            yearid: row.id,
                                        }, () => {
                                            fetchYearData(selectedOrgId);
                                            setEditingYearId(null);
                                            setSnackbar({
                                                open: true,
                                                message: t('calendarTypeUpdated'),
                                                severity: 'success',
                                            });
                                        });
                                    }}
                                    onCancel={() => setEditingYearId(null)}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default YearActions;