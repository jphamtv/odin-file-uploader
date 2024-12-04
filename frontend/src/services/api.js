// src/services/api.js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const defaultOptions = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
};

export const authApi = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  register: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Register failed');
    }

    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      ...defaultOptions,
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Logout failed');
    }

    return response.json();
  },

  checkAuthStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      ...defaultOptions
    });

    if (!response.ok) return { authenticated: false, user: null };
    return response.json();
  }
};
