import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // or your actual API base URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ❗ Response interceptor: handle 401 Unauthorized (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Optional: redirect to sign-in
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);
export default api;