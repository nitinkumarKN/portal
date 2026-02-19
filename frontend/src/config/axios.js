import axios from 'axios';

// Configure axios defaults
// For production on Render, use the production URL
const isDevelopment = import.meta.env.MODE === 'development';
const baseURL = import.meta.env.VITE_API_URL || 
  (isDevelopment ? 'http://localhost:5000' : 'https://portalback-dsr4.onrender.com');

axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

console.log('API Base URL:', baseURL);

export default axios;
