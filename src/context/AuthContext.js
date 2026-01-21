import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Initial auth check on app load
   */
  useEffect(() => {
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initAuth = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        setUser(null);
        return;
      }

      const res = await api.get('/auth/me');
      setUser(res.data.user);
      handleRedirect(res.data.user);
    } catch (err) {
      authService.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Centralised redirect logic
   */
  const handleRedirect = (u) => {
    if (!u) {
      navigate('/login', { replace: true });
      return;
    }

    if (u.status !== 'ACTIVE') {
      navigate('/pending', { replace: true });
      return;
    }

    // Force password change for agency-created technicians
    if (
      u.role === 'TECHNICIAN' &&
      u.agencyId &&
      localStorage.getItem('passwordChanged') !== 'true'
    ) {
      navigate('/change-password', { replace: true });
      return;
    }

    navigate('/dashboard', { replace: true });

  };

  /**
   * Login
   */
  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      handleRedirect(res.user);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Login failed',
      };
    }
  };

  /**
   * Register (technician / business only)
   */
  const register = async (data) => {
    try {
      const res = await authService.register(data);
      setUser(res.user);
      navigate('/verify', { replace: true });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Registration failed',
      };
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (_) {
      // ignore
    } finally {
      authService.clearTokens();
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  /**
   * Refresh user (used by SocketContext)
   */
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      handleRedirect(res.data.user);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
 