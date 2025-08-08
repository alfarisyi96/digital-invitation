'use client';

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  created_at: string;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<User>('/auth/me');
      
      if (response.success && response.data) {
        setUser(response.data);
        apiClient.setUserData(response.data);
      } else {
        setUser(null);
        apiClient.clearUserData();
      }
    } catch (error) {
      setUser(null);
      apiClient.clearUserData();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{ user: User }>('/auth/login', {
        email,
        password,
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        apiClient.setUserData(response.data.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, clear client-side data
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      apiClient.clearUserData();
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions?.includes(permission) || user.role === 'super_admin';
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  useEffect(() => {
    // Check if user data exists in localStorage on mount
    const userData = apiClient.getUserData();
    if (userData) {
      setUser(userData);
    }
    
    // Only check auth status with server if not on login page to prevent redirect loops
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      checkAuth();
    } else {
      // If on login page and no localStorage data, set loading to false
      if (!userData) {
        setIsLoading(false);
      }
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
