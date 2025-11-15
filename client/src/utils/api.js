import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login (handled by ProtectedRoute)
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API - Using mock endpoints for testing
export const authAPI = {
  signup: (data) => api.post('/auth/mock-signup', data),
  login: (data) => api.post('/auth/mock-login', data),
};

// Categories API - Using mock endpoints for testing
export const categoriesAPI = {
  getAll: () => api.get('/mock-categories'),
  create: (data) => api.post('/mock-categories', data),
  update: (id, data) => api.put(`/mock-categories/${id}`, data),
  delete: (id) => api.delete(`/mock-categories/${id}`),
};

// Budgets API - Using mock endpoints for testing
export const budgetsAPI = {
  getByMonth: (month, year) => api.get(`/mock-budgets?month=${month}&year=${year}`),
  createOrUpdate: (data) => api.post('/mock-budgets', data),
  delete: (id) => api.delete(`/mock-budgets/${id}`),
};

// Expenses API - Using mock endpoints for testing
export const expensesAPI = {
  getByMonth: (month, year) => api.get(`/mock-expenses?month=${month}&year=${year}`),
  create: (data) => api.post('/mock-expenses', data),
  update: (id, data) => api.put(`/mock-expenses/${id}`, data),
  delete: (id) => api.delete(`/mock-expenses/${id}`),
  checkBudget: (data) => api.post('/mock-expenses/check-budget', data),
};

// Reports API - Using mock endpoints for testing
export const reportsAPI = {
  getMonthly: (month, year) => api.get(`/mock-reports/monthly?month=${month}&year=${year}`),
};

export default api;

