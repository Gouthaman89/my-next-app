import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Button,
    Box,
} from '@mui/material';

const PersonManagementPopupDataTable = ({ columns, rows, onAssignPerson }) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleChangePage = (event, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        {columns.map((col) => (
                            <TableCell key={col.field} sx={{ fontWeight: 'bold' }}>
                                {col.label}
                            </TableCell>
                        ))}
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                        <TableRow key={row.id}>
                            {columns.map((col) => (
                                <TableCell key={col.field}>{row[col.field]}</TableCell>
                            ))}
                            <TableCell>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={() => onAssignPerson(row)}
                                >
                                    Assign Person
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </TableContainer>
    );
};

export default PersonManagementPopupDataTable; // Default export