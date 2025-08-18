import { useRouter } from 'next/router';
import { useAuth } from './AuthContext';
import { useEffect, useState } from 'react';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { token } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true); // State to track loading

    useEffect(() => {
      // Check authentication status
      if (!token) {
        // If no token, redirect to login page
        router.push('/login');
      } else {
        // Token exists, allow the component to render
        setIsLoading(false);
      }
    }, [token, router]);

    // Display loading indicator while authentication status is being checked
    if (isLoading) {
      return <div>Loading...</div>; // You can customize this loading message
    }

    // Once authenticated, render the wrapped component
    return <WrappedComponent {...props} />;
  };
};

export default withAuth;