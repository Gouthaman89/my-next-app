import React from 'react';
import { Box, Typography, Button, Card } from '@mui/material';
//import { useNavigate } from 'react-router-dom';

const UnderConstruction = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                textAlign: 'center',
            }}
        >
            <Card sx={{ p: 4, boxShadow: 3 }}>
                <Typography variant="h4" gutterBottom color="primary">
                    🚧 Under Construction 🚧
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    This feature is currently under development. Please check back later!
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate(-1)} // Navigate back to the previous page
                >
                    Go Back
                </Button>
            </Card>
        </Box>
    );
};

export default UnderConstruction;