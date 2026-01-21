import api from './api';

const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.accessToken) {
      localStorage.setItem('access_token', response.data.accessToken);
    }
    
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
    this.clearTokens();
  },

  async me() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getToken() {
    return localStorage.getItem('access_token');
  },

  clearTokens() {
    localStorage.removeItem('access_token');
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/api/auth/refresh;';
  },
};

export default authService;