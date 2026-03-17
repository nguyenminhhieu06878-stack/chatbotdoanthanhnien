import axios from 'axios';

// Use empty base URL for Vercel serverless functions
const API_URL = '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
export { API_URL };
