// Mock API configuration - Update your api.js to use mock endpoints
// Or temporarily replace the API calls

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Mock API endpoints
export const authAPI = {
  signup: (data) => api.post('/auth/mock-signup', data),
  login: (data) => api.post('/auth/mock-login', data),
};

export const categoriesAPI = {
  getAll: () => api.get('/mock-categories'),
  create: (data) => api.post('/mock-categories', data),
  update: (id, data) => api.put(`/mock-categories/${id}`, data),
  delete: (id) => api.delete(`/mock-categories/${id}`),
};

export const budgetsAPI = {
  getByMonth: (month, year) => api.get(`/mock-budgets?month=${month}&year=${year}`),
  createOrUpdate: (data) => api.post('/mock-budgets', data),
  delete: (id) => api.delete(`/mock-budgets/${id}`),
};

export const expensesAPI = {
  getByMonth: (month, year) => api.get(`/mock-expenses?month=${month}&year=${year}`),
  create: (data) => api.post('/mock-expenses', data),
  update: (id, data) => api.put(`/mock-expenses/${id}`, data),
  delete: (id) => api.delete(`/mock-expenses/${id}`),
  checkBudget: (data) => api.post('/mock-expenses/check-budget', data),
};

export const reportsAPI = {
  getMonthly: (month, year) => api.get(`/mock-reports/monthly?month=${month}&year=${year}`),
};

export default api;

