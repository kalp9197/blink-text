import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "./api";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Compute isAuthenticated based on user existence
  const isAuthenticated = user !== null;

  useEffect(() => {
    // Check if user is logged in
    const checkUserLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        // Set Authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Get user profile
        const response = await authApi.getProfile();
        setUser(response.data.user);
      } catch (err) {
        console.error("Authentication error:", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApi.login(email, password);

      // Store token
      localStorage.setItem("token", response.data.token);

      // Set Authorization header
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      // Set user
      setUser(response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApi.register(name, email, password);

      // Store token
      localStorage.setItem("token", response.data.token);

      // Set Authorization header
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      // Set user
      setUser(response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token
    localStorage.removeItem("token");

    // Remove Authorization header
    delete axios.defaults.headers.common["Authorization"];

    // Clear user
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
