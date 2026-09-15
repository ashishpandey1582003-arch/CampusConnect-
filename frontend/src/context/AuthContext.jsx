import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../hooks/useAxios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on application load
  const checkUserLoggedIn = async () => {
    try {
      const response = await api.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  // Login Student or Admin
  const login = async (email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      email = email.toLowerCase();
      const endpoint = role === 'admin' ? '/api/auth/admin/login' : '/api/auth/student/login';
      const response = await api.post(endpoint, { email, password });
      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        setUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      console.error('Login error:', err);
      const errMsg =
        err.response?.data?.error ||
        (err.message === 'Network Error'
          ? 'Server is starting up. Please wait 15-20 seconds and try again.'
          : err.message) ||
        'Login failed. Please try again.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Register Student (Multipart FormData for PDF/Image uploads)
  const registerStudent = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/student/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        setUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Register Admin
  const registerAdmin = async (adminData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/admin/register', adminData);
      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        setUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/api/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Update profile in Auth state
  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    error,
    login,
    registerStudent,
    registerAdmin,
    logout,
    updateProfileState,
    checkUserLoggedIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
