import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests if available
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

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentBookings: (limit = 10) => api.get('/dashboard/recent-bookings', { params: { limit } }),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Time Slots API
export const timeSlotsAPI = {
  getAll: () => api.get('/time-slots'),
  getById: (id) => api.get(`/time-slots/${id}`),
  create: (data) => api.post('/time-slots', data),
  bulkCreate: (data) => api.post('/time-slots/bulk', data),
  update: (id, data) => api.put(`/time-slots/${id}`, data),
  delete: (id) => api.delete(`/time-slots/${id}`),
};

// Calendar API
export const calendarAPI = {
  getWeeks: (month, year) => api.get(`/calendar/weeks/${month}/${year}`),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  export: (params) => api.get('/bookings/export', { params, responseType: 'blob' }),
};

// Reports API
export const reportsAPI = {
  bookings: (params) => api.get('/reports/bookings', { params }),
  categoryWise: (params) => api.get('/reports/category-wise', { params }),
  revenue: (params) => api.get('/reports/revenue', { params }),
};

export default api;
