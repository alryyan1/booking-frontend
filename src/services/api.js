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

// Items API
export const itemsAPI = {
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
};

// Customers API
export const customersAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Accessories API
export const accessoriesAPI = {
  getAll: () => api.get('/accessories'),
  getById: (id) => api.get(`/accessories/${id}`),
  create: (data) => api.post('/accessories', data),
  update: (id, data) => api.put(`/accessories/${id}`, data),
  delete: (id) => api.delete(`/accessories/${id}`),
};

// Settings API
export const settingsAPI = {
  getAll: () => api.get('/settings'),
  getByKey: (key) => api.get(`/settings/${key}`),
  update: (data) => api.post('/settings', data),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  deliver: (id, data) => api.post(`/bookings/${id}/deliver`, data),
  return: (id) => api.post(`/bookings/${id}/return`),
  export: (params) => api.get('/bookings/export', { params, responseType: 'blob' }),
};

// Reports API
export const reportsAPI = {
  bookings: (params) => api.get('/reports/bookings', { params }),
  categoryWise: (params) => api.get('/reports/category-wise', { params }),
  revenue: (params) => api.get('/reports/revenue', { params }),
};

export default api;
