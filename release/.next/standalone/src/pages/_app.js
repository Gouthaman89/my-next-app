import '../styles/globals.css';
import Layout from '../components/Layout';
import { appWithTranslation } from 'next-i18next';
import '../i18n'; // Ensure the correct path for i18n configuration
import { AuthProvider, useAuth } from '../components/AuthContext';
import { GlobalProvider } from '../components/GlobalContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../components/theme'; // Make sure the theme path is correct

function AuthRedirect({ children }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!token && router.pathname !== '/login') {
        // Redirect to login if not authenticated
        router.push('/login');
      } else if (token && router.pathname === '/') {
        // Redirect to profile page if authenticated and on the root page
        router.push('/profile');
      }
    }
  }, [token, loading, router]);

  if (loading) {
    // Use a more user-friendly loading indicator, like a spinner
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  return children; // Render children when not loading
}

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <AuthProvider>
      <GlobalProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthRedirect>
            {getLayout(<Component {...pageProps} />)}
          </AuthRedirect>
        </ThemeProvider>
      </GlobalProvider>
    </AuthProvider>
  );
}

export default appWithTranslation(MyApp);