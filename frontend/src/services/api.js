/**
 * api.js — Axios Configuration & API Helper Functions
 * ===================================================
 * Configures base URL and automatically attaches JWT access token to headers.
 */

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor to attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token expiry / unauth errors gracefully
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: handle token logout or redirect
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
