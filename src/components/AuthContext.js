import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [personId, setPersonId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(true); // To manage loading state for profile fetching
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedPersonId = localStorage.getItem('personId');
    const savedReportId = localStorage.getItem('reportId');

    if (savedToken && savedPersonId) {
      setToken(savedToken);
      setPersonId(savedPersonId);
      setReportId(savedReportId);

      // Fetch profile only if it is not already loaded
      if (!profile) {
        fetchProfile(savedToken, savedPersonId);
      } else {
        setLoading(false); // Avoid fetching if already available
      }
    } else {
      setLoading(false);
      if (router.pathname !== '/login') {
        router.push('/login');
      }
    }
}, [router, profile]); // Add `profile` as a dependency

  const fetchProfile = async (token, personId) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/profile`,
        { personid: personId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProfile(response.data[0]);
    } catch (error) {
      console.error('Error fetching profile:', error);
      logout(); // Logout the user if fetching the profile fails (e.g., token is invalid)
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken, newPersonId) => {
    setToken(newToken);
    setPersonId(newPersonId);
    localStorage.setItem('token', newToken);
    localStorage.setItem('personId', newPersonId);
    fetchProfile(newToken, newPersonId);
    router.push('/profile');
  };

  const setGlobalReportId = (newReportId) => {
    setReportId(newReportId);
    localStorage.setItem('reportId', newReportId);
  };

  const logout = () => {
    setToken(null);
    setPersonId(null);
    setProfile(null);
    setReportId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('personId');
    localStorage.removeItem('reportId');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        personId,
        profile,
        reportId,
        login,
        logout,
        setGlobalReportId,
        loading,
      }}
    >
      {!loading ? children : <div>Loading...</div>} {/* Display a loading indicator or skeleton while loading */}
    </AuthContext.Provider>
  );
}