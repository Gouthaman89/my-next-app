import axios from 'axios';

// Create an Axios instance with the base API URL
export const api = axios.create({
  baseURL: 'http://localhost:8000', // Replace with your actual API base URL
  headers: {
    'Content-Type': 'application/json', // Ensure correct headers for API requests
  },
});

// Function to handle login API calls
export const loginApi = async (email, password) => {
  try {
    // Send POST request to the API with email and password
    const response = await api.post('/api/auth/login', { email, password });

    // Check if the response was successful and contains the token
    if (response.data && response.data.access_token) {
      return { token: response.data.access_token }; // Return the access token
    } else {
      throw new Error('Invalid response from server'); // Handle case where token is missing
    }
  } catch (error) {
    // Handle errors, including network issues and invalid credentials
    if (error.response) {
      // If server returned an error response
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      // If the request was made but no response was received
      throw new Error('Network error. Please try again.');
    } else {
      // If something else caused the error
      throw new Error('An unknown error occurred. Please try again.');
    }
  }
};