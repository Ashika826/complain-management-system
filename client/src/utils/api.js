import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

// Create axios instance with default configs
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Set auth token for requests
const setAuthToken = token => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Simplified API methods
export default {
  setAuthToken,
  
  // GET request
  get: async (url) => {
    try {
      return await api.get(url);
    } catch (error) {
      throw error;
    }
  },
  
  // POST request
  post: async (url, data) => {
    try {
      return await api.post(url, data);
    } catch (error) {
      throw error;
    }
  },
  
  // PUT request
  put: async (url, data) => {
    try {
      return await api.put(url, data);
    } catch (error) {
      throw error;
    }
  },
  
  // PATCH request
  patch: async (url, data) => {
    try {
      return await api.patch(url, data);
    } catch (error) {
      throw error;
    }
  },
  
  // DELETE request
  delete: async (url) => {
    try {
      return await api.delete(url);
    } catch (error) {
      throw error;
    }
  }
};