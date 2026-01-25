import axios, { InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../config/constants";
import { toast } from "sonner";
import {
  Customer,
  Item,
  Accessory,
  Booking,
  DashboardStats,
  Category,
} from "../types";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    // Don't show toast for 401 as we redirect to login, unless you want to
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      // Optional: toast.error("Session expired. Please login again.");
    } else {
      // Try to get specific validation error first
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        if (firstKey && errors[firstKey]?.[0]) {
          message = errors[firstKey][0];
        }
      }
      toast.error(message);
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: (credentials: any) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get<DashboardStats>("/dashboard/stats"),
  getRecentBookings: (limit = 10) =>
    api.get<Booking[]>("/dashboard/recent-bookings", { params: { limit } }),
};

// Users API
export const usersAPI = {
  getAll: (params?: any) => api.get("/users", { params }),
  getById: (id: number | string) => api.get(`/users/${id}`),
  create: (data: any) => api.post("/users", data),
  update: (id: number | string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number | string) => api.delete(`/users/${id}`),
};

// Calendar API
export const calendarAPI = {
  getWeeks: (
    month: number | string,
    year: number | string,
    categoryId?: number | string,
  ) =>
    api.get(`/calendar/weeks/${month}/${year}`, {
      params: { category_id: categoryId },
    }),
  getMonthlyCounts: (year: number | string) =>
    api.get<{ success: boolean; counts: Record<number, number> }>(
      `/calendar/counts/${year}`,
    ),
  getCategoryCounts: (month: number | string, year: number | string) =>
    api.get<{ success: boolean; counts: Record<number, number> }>(
      `/calendar/category-counts/${month}/${year}`,
    ),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params?: any) => api.get<any>("/bookings", { params }), // Backend usually returns { data: Booking[], ... }
  getById: (id: number | string) => api.get<Booking>(`/bookings/${id}`),
  create: (data: any) => api.post("/bookings", data),
  update: (id: number | string, data: any) => api.put(`/bookings/${id}`, data),
  delete: (id: number | string) => api.delete(`/bookings/${id}`),
  export: (params?: any) =>
    api.get("/bookings/export", { params, responseType: "blob" }),
  checkAvailability: (date: string) =>
    api.get<{ reserved_item_ids: number[]; prep_days: number }>(
      "/bookings/check-availability",
      { params: { date } },
    ),
  deliver: (id: number | string, data: any) =>
    api.post(`/bookings/${id}/deliver`, data),
  pay: (
    id: number | string,
    data: { payment_amount: number; payment_method: string },
  ) => api.post(`/bookings/${id}/pay`, data),
  return: (id: number | string) => api.post(`/bookings/${id}/return`),
};

// Items API
export const itemsAPI = {
  getAll: (params?: any) => api.get<{ data: Item[] }>("/items", { params }),
  getById: (id: number | string) => api.get<Item>(`/items/${id}`),
  create: (data: any) => api.post("/items", data),
  update: (id: number | string, data: any) => api.put(`/items/${id}`, data),
  delete: (id: number | string) => api.delete(`/items/${id}`),
};

// Customers API
export const customersAPI = {
  getAll: (params?: any) =>
    api.get<{ data: Customer[] }>("/customers", { params }),
  getById: (id: number | string) => api.get<Customer>(`/customers/${id}`),
  create: (data: any) => api.post("/customers", data),
  update: (id: number | string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: number | string) => api.delete(`/customers/${id}`),
};

// Accessories API
export const accessoriesAPI = {
  getAll: (params?: any) =>
    api.get<{ data: Accessory[] }>("/accessories", { params }),
  create: (data: any) => api.post("/accessories", data),
  update: (id: number | string, data: any) =>
    api.put(`/accessories/${id}`, data),
  delete: (id: number | string) => api.delete(`/accessories/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: (params?: any) =>
    api.get<{ data: Category[] }>("/categories", { params }),
  create: (data: any) => api.post("/categories", data),
};

// Reports API
export const reportsAPI = {
  bookings: (params?: any) => api.get("/reports/bookings", { params }),
  categoryWise: (params?: any) => api.get("/reports/category-wise", { params }),
  revenue: (params?: any) => api.get("/reports/revenue", { params }),
};

export default api;
