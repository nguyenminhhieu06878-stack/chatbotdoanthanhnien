import axios from 'axios';

// Use empty base URL for Vercel serverless functions
const API_URL = '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a separate client for direct Railway uploads
const RAILWAY_API_URL = 'https://chatbotdoanthanhnien-production.up.railway.app';

const railwayApi = axios.create({
  baseURL: RAILWAY_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
export { API_URL, railwayApi, RAILWAY_API_URL };
