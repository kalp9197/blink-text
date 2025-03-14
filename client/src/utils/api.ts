import axios from "axios";
import { toast } from "react-hot-toast";

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include credentials in requests
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear the token
      localStorage.removeItem("token");
      // Show error message
      toast.error("Session expired. Please log in again.");
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Text related API endpoints
export const textApi = {
  // Create a new text
  create: (data: {
    content: string;
    expirationMinutes: number;
    viewOnce: boolean;
    isProtected?: boolean;
    password?: string;
    maxViews?: number;
    customExpiryDate?: string;
    isMarkdown?: boolean;
  }) => api.post("/texts", data),

  // Get a text by access token
  getText: (accessToken: string, password?: string) => {
    const config = password ? { headers: { "X-Password": password } } : {};
    return api.get(`/texts/${accessToken}`, config);
  },

  // Alias for getText to maintain backward compatibility
  get: (accessToken: string, password?: string) => {
    const config = password ? { headers: { "X-Password": password } } : {};
    return api.get(`/texts/${accessToken}`, config);
  },

  // Get text history for authenticated users
  getHistory: () => api.get("/texts/history"),

  // Get user's texts with pagination
  getUserTexts: (page = 1, limit = 50) =>
    api.get(`/texts/history?page=${page}&limit=${limit}`),

  // Delete a text (for authenticated users)
  deleteText: (id: string) => api.delete(`/texts/${id}`),

  // Alias for deleteText to maintain backward compatibility
  delete: (id: string) => api.delete(`/texts/${id}`),
};

// Auth related API endpoints
export const authApi = {
  // Register a new user
  register: (name: string, email: string, password: string) =>
    api.post("/auth/register", { name, email, password }),

  // Login a user
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  // Get current user profile
  getProfile: () => api.get("/auth/me"),

  // Logout (client-side only, no server call)
  logout: () => {
    localStorage.removeItem("token");
    return Promise.resolve();
  },
};

export default api;
