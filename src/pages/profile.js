import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import axios from 'axios';
import {
  Box,
  Card,
  Typography,
  Grid,
  Avatar,
  Container,
  Alert,
} from '@mui/material';
import Loader from '../components/Loader/loader';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { token, personId } = useAuth(); // Get the token and personId from AuthContext
  const [profile, setProfile] = useState(null); // State to store profile data
  const [error, setError] = useState(null); // State to handle errors

  // Fetch profile data when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      if (!personId || personId === '') {
        setError(t('invalidPersonID'));
        return;
      }

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/profile`, // API endpoint
          {
            personid: personId, // Send personId in the body
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include token in headers
            },
          }
        );
        // Set the profile data from API response
        setProfile(response.data[0]);
      } catch (error) {
        console.error(t('errorFetchingProfileData'), error);
        setError(t('failedToFetchProfileData'));
      }
    };

    if (token && personId) {
      fetchProfile(); // Fetch profile data if token and personId are available
    }
  }, [token, personId, t]);

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return <Loader />;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card sx={{ p: 4, boxShadow: 3 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Avatar and Name */}
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar sx={{ width: 120, height: 120 }}>
              <AccountCircleIcon sx={{ fontSize: 80 }} />
            </Avatar>
          </Grid>

          {/* Profile Info */}
          <Grid item xs={12} sm={8}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {profile.name}
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" color="textSecondary">
                <strong>{t('email')}:</strong> {profile.email}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                <strong>{t('phone')}:</strong> {profile.tel || t('notAvailable')}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                <strong>{t('personID')}:</strong> {profile.pid}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Additional Section for Future Info */}
      <Box sx={{ mt: 4 }}>
        <Card sx={{ p: 3, boxShadow: 2 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
            {t('additionalInformation')}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {t('additionalInformationDescription')}
          </Typography>
        </Card>
      </Box>
    </Container>
  );
};

export default ProfilePage;