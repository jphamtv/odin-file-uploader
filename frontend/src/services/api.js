// src/services/api.js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const defaultOptions = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
};

const handleApiError = async (response, defaultMessage) => {
  if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || defaultMessage);
    }
};

export const authApi = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    await handleApiError(response, 'Login failed');
    return response.json();
  },

  register: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    await handleApiError(response, 'Register failed');
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      ...defaultOptions,
      method: 'GET',
    });

    await handleApiError(response, 'Logout failed');
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

export const fileApi = {
  upload: async (file, folderId = null) => {
    if (!(file instanceof File)) {
      throw new Error('Upload requires a File object');
    }
    
    const options = {
      ...defaultOptions,
      method: 'POST',
      headers: {} // Override default headers
    };

    // Create FormData and append file
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
      ...options,
      body: formData
    });

    await handleApiError(response, 'Upload failed');
    return response.json();
  },

  download: async (fileId) => {
    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/download`, {
      ...defaultOptions,
      method: 'GET'
    });

    await handleApiError(response, 'Download failed');

    // Return blob for file download
    return response.blob();
  },

  // Utility to handle the actual browser download
  downloadFile: (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  },

  getFiles: async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/files`,
      {
        ...defaultOptions,
        method: 'GET'
      }
    );

    await handleApiError(response, 'Failed to fetch files');
    return response.json();
  },

  delete: async (fileId) => {
    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/delete`, {
      ...defaultOptions,
      method: 'DELETE',
    });

    await handleApiError(response, 'File delete failed');
    return response.json();
  },
};
