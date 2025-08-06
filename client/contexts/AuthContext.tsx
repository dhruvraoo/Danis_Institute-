import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  notifyLoginSuccess, 
  notifyLoginError, 
  notifyLogout, 
  notifySessionExpired,
  notifyNetworkError 
} from '@/utils/notifications';
import { 
  getCurrentSessionId, 
  clearSessionData,
  cleanupExpiredData 
} from '@/utils/simpleSessionManager';

// Types
interface Student {
  id: number;
  name: string;
  email: string;
  roll_id: string;
  student_class: {
    id: number;
    name: string;
    grade_level: number;
    section: string;
  };
  subjects_selected: {
    id: number;
    name: string;
    code: string;
  }[];
  user_type: 'student';
}

interface Faculty {
  id: number;
  name: string;
  email: string;
  user_type: 'faculty';
}

interface Principal {
  id: number;
  name: string;
  email: string;
  user_type: 'principal';
}

type User = Student | Faculty | Principal;

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, userType: 'student' | 'faculty' | 'principal') => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  // Initialize authentication on app startup
  useEffect(() => {
    initializeSessionAndAuth();
  }, []);

  // Simplified session and authentication initialization
  const initializeSessionAndAuth = async () => {
    try {
      console.log('🚀 Initializing authentication...');
      
      // Simple cleanup
      cleanupExpiredData();
      
      // Try to restore authentication
      await checkAuth();
      
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  };

  // Initialize authentication from localStorage
  const initializeAuth = () => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedUser && storedToken) {
        console.log('🔄 Found cached authentication, verifying with server...');
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: true,
          error: null,
        });
        return true;
      }
    } catch (e) {
      console.error('Error parsing cached user data:', e);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
    }
    return false;
  };

  // Simplified authentication check
  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication...');
      
      // Get auth token from localStorage
      const authToken = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch('http://127.0.0.1:8000/accounts/api/check-auth/', {
        credentials: 'include',
        headers,
      });
      
      const data = await response.json();
      
      if (data.success && data.authenticated && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  };

  // Simplified login function
  const login = async (email: string, password: string, userType: 'student' | 'faculty' | 'principal'): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('🔐 Attempting login for:', email, 'as', userType);
      
      const response = await fetch(`http://127.0.0.1:8000/accounts/api/${userType}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('🔐 Login response:', data);

      if (data.success && data.user) {
        // Store user and auth token in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.auth_token) {
          localStorage.setItem('auth_token', data.auth_token);
        }
        
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          loading: false,
          error: null,
        });
        
        notifyLoginSuccess(data.user?.name || 'User');
        return true;
      } else {
        const errorMessage = data.message || 'Login failed';
        notifyLoginError(errorMessage);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'Network error. Please try again.';
      notifyNetworkError();
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return false;
    }
  };

  // Simplified logout function
  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      console.log('🚪 Logging out');
      
      // Call logout endpoint
      await fetch('http://127.0.0.1:8000/accounts/api/logout/', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage data
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      clearSessionData();
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
      
      notifyLogout();
    }
  };

  // Simplified set user function
  const setUser = (user: User | null) => {
    if (user) {
      console.log('👤 Setting user:', user.name);
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    } else {
      console.log('👤 Clearing user data');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  };

  // Clear error function
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Periodic auth check (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (authState.isAuthenticated) {
        console.log('⏰ Periodic auth check');
        checkAuth();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [authState.isAuthenticated]);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    checkAuth,
    clearError,
    setUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;