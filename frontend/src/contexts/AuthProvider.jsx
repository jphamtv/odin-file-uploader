// src/contexts/AuthProvider.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { authApi } from "../services/api";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    try {
      setError(null);
      const data = await authApi.login(email, password);
      setIsAuthenticated(true);
      setUser(data.user);
      return data;
    } catch (error) {
      setError(error.message);
      setIsAuthenticated(false);
      setUser(null);
      throw error; // Re-throw to handle in the UI
    }
  };

  const register = async (email, password) => {
    try {
      setError(null);
      const data = await authApi.register(email, password);
      setIsAuthenticated(true);
      setUser(data.user);
      return data;
    } catch (error) {
      setError(error.message);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const data = await authApi.logout();
      setIsAuthenticated(false);
      setUser(null);
      return data;
    } catch (error) {
      setError(error.message);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await authApi.checkAuthStatus();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      setError(error.message);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
