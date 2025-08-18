import React, { useEffect } from 'react'; // Import useEffect
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { token } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // If the user is not authenticated, redirect to the login page
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  // Only render the home page if the user is authenticated
  if (!token) {
    return null; // Prevent rendering while checking authentication
  }

  return (
    <div>
      <h1>{t('home')}</h1>
    </div>
  );
}