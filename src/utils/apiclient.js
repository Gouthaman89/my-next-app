// src/utils/apiClient.js

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Base URL from environment variables
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for common configurations
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    const personId = localStorage.getItem('personId'); // Retrieve personId from localStorage or fallback

    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
    }

    if (personId) {
      config.headers['X-Person-Id'] = personId; // Add personId as a custom header
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data, // Simplify response by returning only `data`
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;