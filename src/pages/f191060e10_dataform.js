import React, { useState } from 'react';
import { TextField, Checkbox, Button, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const DataForm = ({ fields, values, onChange, onSubmit, onApprovalCodeSubmit }) => {
    const [showDialog, setShowDialog] = useState(false);
    const [confirmationType, setConfirmationType] = useState(''); // Track chosen action
    const [approvalCode, setApprovalCode] = useState(''); // Store entered approval code

    const handleDialogOpen = (type) => {
        setConfirmationType(type);
        setApprovalCode(''); // Reset approval code input
        setShowDialog(true);
    };

    const handleDialogClose = (proceed) => {
        setShowDialog(false);
        if (proceed) {
            if (confirmationType === 'approval') {
                // Trigger approval verification with the approval code
                onApprovalCodeSubmit(values.id, approvalCode);
            } else {
                // Trigger default onSubmit for deactivation
                onSubmit();
            }
        }
    };

    return (
        <>
            <form onSubmit={(e) => e.preventDefault()}>
                {fields.map((field) => (
                    <Box key={field.name} sx={{ mb: 2 }}>
                        {field.type === 'checkbox' ? (
                            <Checkbox
                                name={field.name}
                                checked={Boolean(values[field.name])}
                                onChange={(e) =>
                                    onChange({
                                        target: { name: field.name, value: e.target.checked },
                                    })
                                }
                            />
                        ) : (
                            <TextField
                                name={field.name}
                                label={field.label}
                                value={values[field.name] || ''}
                                onChange={onChange}
                                fullWidth
                                required={field.required}
                            />
                        )}
                    </Box>
                ))}

                {/* Buttons for actions */}
                <Box sx={{ display: 'flex', gap: 10, mt: 6 }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleDialogOpen('deactivate')}
                    >
                        Deactivate Account
                    </Button>
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => handleDialogOpen('approval')}
                    >
                        Key Approval Code
                    </Button>
                   
                </Box>
            </form>

            {/* Confirmation Dialog */}
            <Dialog open={showDialog} onClose={() => handleDialogClose(false)}>
                <DialogTitle>
                    {confirmationType === 'deactivate'
                        ? 'Deactivate Account'
                        : 'Enter Approval Code'}
                </DialogTitle>
                <DialogContent>
                    {confirmationType === 'deactivate' ? (
                        <DialogContentText>
                            Are you sure you want to deactivate this account?
                        </DialogContentText>
                    ) : (
                        <>
                            <DialogContentText>
                                Please enter the approval code for verification.
                            </DialogContentText>
                            <TextField
                                label="Approval Code"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={approvalCode}
                                onChange={(e) => setApprovalCode(e.target.value)}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleDialogClose(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleDialogClose(true)}
                        color="primary"
                        autoFocus
                        disabled={confirmationType === 'approval' && !approvalCode} // Disable if no approval code
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DataForm;