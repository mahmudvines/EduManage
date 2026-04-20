import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${apiUrl}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            setUser(response.data.data);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error('Auth restore error', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    restoreUser();
  }, [apiUrl]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
      if (response.data.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  }, [apiUrl]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    // Also update localStorage user object if needed (for other components)
    const token = localStorage.getItem('token');
    if (token && updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, []);

  const updateAvatar = useCallback((avatarUrl) => {
    setUser(prev => ({ ...prev, avatar: avatarUrl }));
    const token = localStorage.getItem('token');
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        userObj.avatar = avatarUrl;
        localStorage.setItem('user', JSON.stringify(userObj));
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};
