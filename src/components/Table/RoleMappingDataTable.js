// src/components/Table/RoleMappingDataTable.js

import React from 'react';
import PropTypes from 'prop-types';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';

/**
 * RoleMappingDataTable Component
 * A reusable table component using Material-UI's DataGrid.
 */
const RoleMappingDataTable = ({ title, columns, rows, onRowClick, onAdd, onDelete }) => {
    return (
        <Box sx={{ flex: 1, p: 2, border: '1px solid #ddd', borderRadius: '8px', height: 400 }}>
            {title && (
                <Box sx={{ marginBottom: '16px' }}>
                    <h3>{title}</h3>
                </Box>
            )}

            <DataGrid
                rows={rows}
                columns={[
                    ...columns,
                    {
                        field: 'actions',
                        headerName: 'Actions',
                        width: 150,
                        sortable: false,
                        filterable: false,
                        renderCell: (params) => (
                            <Box>
                                {onAdd && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAdd(params.row);
                                        }}
                                        sx={{ mr: 1 }}
                                    >
                                        Add
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(params.row);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </Box>
                        ),
                    },
                ]}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                onRowClick={onRowClick}
                disableSelectionOnClick
            />
        </Box>
    );
};

RoleMappingDataTable.propTypes = {
    title: PropTypes.string,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            field: PropTypes.string.isRequired,
            headerName: PropTypes.string.isRequired,
            width: PropTypes.number,
            type: PropTypes.string,
            renderCell: PropTypes.func,
        })
    ).isRequired,
    rows: PropTypes.arrayOf(PropTypes.object).isRequired,
    onRowClick: PropTypes.func,
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
};

RoleMappingDataTable.defaultProps = {
    title: '',
    onRowClick: null,
    onAdd: null,
    onDelete: null,
};

export default RoleMappingDataTable;