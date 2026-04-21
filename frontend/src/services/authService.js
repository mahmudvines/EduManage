import axios from 'axios';

const API_URL = 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      return { success: true, user: response.data.user };
    }
    return { success: false, message: response.data.message };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Login failed' };
  }
};

export const getProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const response = await api.get('/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.user;
  } catch {
    return null;
  }
};

export default { login, getProfile };
