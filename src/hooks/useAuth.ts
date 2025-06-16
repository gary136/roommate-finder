import { useState, useEffect } from 'react';
import { authAPI, QuickSignupData } from '../services/apiService';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  onboardingCompleted: boolean;
  profileCompleteness: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('userData');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const quickSignup = async (data: QuickSignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authAPI.quickSignup(data);
      
      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        return { success: true };
      }
      
      return { success: false, error: response.message || 'Signup failed' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        return { success: true };
      }
      
      return { success: false, error: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  };

  return {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    quickSignup,
    login,
    logout
  };
};
