// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost/lung-cancer-api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Erreur API:', error.response.data);
    } else if (error.request) {
      console.error('Pas de réponse du serveur');
    } else {
      console.error('Erreur:', error.message);
    }
    return Promise.reject(error);
  }
);

// API Authentication
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/api/register.php', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'inscription' };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/api/login.php', credentials);
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la connexion' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default api;