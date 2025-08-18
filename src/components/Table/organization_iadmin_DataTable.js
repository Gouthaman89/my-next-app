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
    Modal,
    Typography,
} from '@mui/material';

const DataTable = ({ columns, rows, onEdit, onDelete, onSendEmail, onReset, onAddPerson, onRemovePerson, showActions }) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(15);

    // State to control "Under Construction" Modal
    const [underConstructionOpen, setUnderConstructionOpen] = React.useState(false);

    // Ensure the current page is within the valid range
    React.useEffect(() => {
        if (page > Math.ceil(rows.length / rowsPerPage) - 1) {
            setPage(0); // Reset to the first page if the current page is invalid
        }
    }, [rows, rowsPerPage, page]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0); // Reset to the first page when rows per page changes
    };

    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {columns.map((col) => (
                                <TableCell
                                    key={col.field}
                                    sx={{
                                        fontWeight: 'bold',
                                        color: 'primary.main',
                                    }}
                                >
                                    {col.label}
                                </TableCell>
                            ))}
                            {showActions && (
                                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    Actions
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                            <TableRow key={row.id}>
                                {columns.map((col) => (
                                    <TableCell key={col.field}>
                                        {typeof row[col.field] === 'boolean'
                                            ? row[col.field]
                                                ? 'Active'
                                                : 'inActive'
                                            : row[col.field]}
                                    </TableCell>
                                ))}
                               {showActions && (
    <TableCell>
        <Box
            sx={{
                display: 'flex',
                gap: 1,
                justifyContent: 'center',
            }}
        >
            {!row.bookkeepername || row.bookkeepername === 'N/A' ? (
                // If there's no bookkeeper or it's "N/A", show "Add Person"
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => onAddPerson(row)}
                >
                    Add Person
                </Button>
            ) : (
                // If there is a bookkeeper, show "Remove Person"
                <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    onClick={() => onRemovePerson(row)}
                >
                    Remove Person
                </Button>
            )}
        </Box>
    </TableCell>
)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 15]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Under Construction Modal */}
            <Modal
                open={underConstructionOpen}
                onClose={() => setUnderConstructionOpen(false)}
            >
                <Box
                    sx={{
                        p: 4,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        borderRadius: 2,
                        minWidth: '300px',
                        margin: 'auto',
                        mt: '20%',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        🚧 Under Construction 🚧
                    </Typography>
                    <Typography variant="body1">
                        This feature is currently under development. Please check back later!
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => setUnderConstructionOpen(false)}
                    >
                        Close
                    </Button>
                </Box>
            </Modal>
        </>
    );
};

export default DataTable;