import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getCurrentUser, isAuthenticated } from '../lib/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isAuthenticated()) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(email, password);
      setUser(response.employee);
      
      return { user: response.employee, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message);
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(
        email, 
        password, 
        userData.name || '',
        userData.position || '',
        userData.department_id || null,
        userData.phone || ''
      );
      setUser(response.employee);
      
      return { user: response.employee, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error.message);
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      authAPI.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error.message);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.updateProfile(profileData);
      setUser(response.employee);
      
      return { user: response.employee, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.message);
      return { user: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    employee: user, // Alias for components expecting 'employee'
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    userRole: user?.role || 'employee',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
