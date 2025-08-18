import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public'; // A better icon for ESG
import { styled, keyframes } from '@mui/system';

// Keyframes for the background gradient animation
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Keyframes for the floating shapes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

// The main container with the animated gradient background
const RootContainer = styled('div')({
  height: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: 0,
  padding: 0,
  overflow: 'hidden',
  background: 'linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #1b5e20)', // A more futuristic, deep color palette
  backgroundSize: '400% 400%',
  animation: `${gradientAnimation} 18s ease infinite`,
  position: 'relative',
});

// A container for the floating decorative shapes
const ShapesContainer = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  zIndex: 1,
});

// Individual floating shape
const Shape = styled('div')(({ theme, size, top, left, delay, duration }) => ({
  position: 'absolute',
  top: top,
  left: left,
  width: size,
  height: size,
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '50%',
  animation: `${float} ${duration || '6s'} ease-in-out infinite`,
  animationDelay: delay,
}));

// The main login form card with an enhanced glassmorphic effect
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: '420px',
  backgroundColor: 'rgba(15, 32, 39, 0.4)', // Darker, more translucent
  borderRadius: '16px',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  color: '#ffffff',
  zIndex: 2,
}));

// Custom styled TextField for a futuristic look
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& label.Mui-focused': {
    color: '#43cea2', // Teal focus color for label
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)', // Lighter label color
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)', // Default border
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)', // Hover border
    },
    '&.Mui-focused fieldset': {
      borderColor: '#43cea2', // Teal focus border
      boxShadow: '0 0 15px rgba(67, 206, 162, 0.5)', // Glow effect
    },
    '& input': {
      color: '#ffffff', // White input text
    },
  },
}));

// Custom styled Button with a vibrant gradient and hover effect
const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5),
  fontWeight: 'bold',
  background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
  boxShadow: '0 4px 20px rgba(67, 206, 162, 0.4)',
  color: '#fff',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(67, 206, 162, 0.6)',
  },
}));

// Title component with gradient text
const Title = styled(Typography)({
    fontWeight: 'bold',
    color: '#FFFFFF',
    background: 'linear-gradient(90deg, #FFFFFF 30%, #43cea2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
});

// The Login API function (unchanged)
const loginApi = async ({ userCode, password }) => {
  // ... (your existing API call logic remains the same)
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/loginweb`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userCode, password }),
  });
  if (!response.ok) throw new Error('Login failed');
  const data = await response.json();
  return { token: data.access_token, personId: data.personid };
};


const LoginPage = () => {
  const { login } = useAuth();
  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userCode || !password) {
      setError('Please enter both user code and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { token, personId } = await loginApi({ userCode, password });
      login(token, personId);
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RootContainer>
      <ShapesContainer>
        <Shape size="200px" top="10%" left="5%" delay="0s" />
        <Shape size="100px" top="70%" left="15%" delay="2s" />
        <Shape size="150px" top="25%" left="80%" delay="1s" duration="8s" />
        <Shape size="80px" top="85%" left="90%" delay="4s" />
        <Shape size="50px" top="50%" left="50%" delay="3s" duration="10s" />
      </ShapesContainer>

      <StyledPaper elevation={12}>
        <PublicIcon sx={{ fontSize: 60, mb: 2, color: '#43cea2' }} />
        <Title variant="h4" gutterBottom>
          EZ Tracker
        </Title>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 4, textAlign: 'center' }}>
          Smart ESG Insights for a Sustainable Future.
        </Typography>
        
        <Box
          component="form"
          onSubmit={handleLogin}
          noValidate
          sx={{
            width: '100%',
            mt: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <StyledTextField
            variant="outlined"
            margin="normal"
            fullWidth
            label="User Code"
            name="userCode"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            autoComplete="off"
            autoFocus
          />
          <StyledTextField
            variant="outlined"
            margin="normal"
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          <StyledButton type="submit" fullWidth variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </StyledButton>
        </Box>
      </StyledPaper>
    </RootContainer>
  );
};

LoginPage.getLayout = function PageLayout(page) {
  return <>{page}</>;
};

export default LoginPage;