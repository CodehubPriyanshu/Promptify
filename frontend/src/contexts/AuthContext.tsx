import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { showErrorToast, handleApiResponse, isAuthError } from '@/utils/errorHandler';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  subscription: {
    plan: string;
    status: 'active' | 'inactive' | 'cancelled';
    expiresAt?: string;
  };
  usage: {
    playgroundSessions: {
      current: number;
      limit: number;
    };
    promptsCreated: number;
  };
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const adminToken = localStorage.getItem('adminToken');
      const userRole = localStorage.getItem('userRole');

      if (!token && !adminToken) {
        setIsLoading(false);
        return;
      }

      // Check for admin authentication
      if (adminToken && userRole === 'admin') {
        const mockAdminUser: User = {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@promptify.com',
          role: 'admin',
          subscription: {
            plan: 'Admin',
            status: 'active'
          },
          usage: {
            playgroundSessions: {
              current: 0,
              limit: 999999
            },
            promptsCreated: 0
          }
        };
        setUser(mockAdminUser);
        setIsLoading(false);
        return;
      }

      // Regular user authentication - verify with backend
      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data?.user) {
              // Map backend user data to frontend User interface
              const userData: User = {
                id: data.data.user._id || data.data.user.id,
                name: data.data.user.name,
                email: data.data.user.email,
                role: data.data.user.role || 'user',
                subscription: {
                  plan: data.data.user.plan?.name || 'Free',
                  status: data.data.user.subscription?.status || 'active'
                },
                usage: {
                  playgroundSessions: {
                    current: data.data.user.usage?.playgroundSessions?.current || 0,
                    limit: data.data.user.usage?.playgroundSessions?.limit || 10
                  },
                  promptsCreated: data.data.user.usage?.promptsCreated || 0
                },
                avatar: data.data.user.avatar
              };
              setUser(userData);
            } else {
              throw new Error('Invalid user data received');
            }
          } else {
            throw new Error('Token validation failed');
          }
        } catch (apiError) {
          console.error('API auth check failed:', apiError);
          // Clear invalid token
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userRole');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, use status text
          errorMessage = `Login failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success || !data.data?.token || !data.data?.user) {
        throw new Error('Invalid response from server');
      }

      // Store token
      localStorage.setItem('authToken', data.data.token);

      // Map backend user data to frontend User interface
      const userData: User = {
        id: data.data.user._id || data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        role: data.data.user.role || 'user',
        subscription: {
          plan: data.data.user.plan?.name || 'Free',
          status: data.data.user.subscription?.status || 'active'
        },
        usage: {
          playgroundSessions: {
            current: data.data.user.usage?.playgroundSessions?.current || 0,
            limit: data.data.user.usage?.playgroundSessions?.limit || 10
          },
          promptsCreated: data.data.user.usage?.promptsCreated || 0
        },
        avatar: data.data.user.avatar
      };

      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      showErrorToast(error, 'Login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, use status text
          errorMessage = `Registration failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success || !data.data?.token || !data.data?.user) {
        throw new Error('Invalid response from server');
      }

      // Store token
      localStorage.setItem('authToken', data.data.token);

      // Map backend user data to frontend User interface
      const userData: User = {
        id: data.data.user._id || data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        role: data.data.user.role || 'user',
        subscription: {
          plan: data.data.user.plan?.name || 'Free',
          status: data.data.user.subscription?.status || 'active'
        },
        usage: {
          playgroundSessions: {
            current: data.data.user.usage?.playgroundSessions?.current || 0,
            limit: data.data.user.usage?.playgroundSessions?.limit || 10
          },
          promptsCreated: data.data.user.usage?.promptsCreated || 0
        },
        avatar: data.data.user.avatar
      };

      setUser(userData);
    } catch (error) {
      console.error('Signup error:', error);
      showErrorToast(error, 'Registration');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Make API call to admin login endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Admin login failed');
      }

      const data = await response.json();

      // Store admin token
      localStorage.setItem('adminToken', data.data.token);
      localStorage.setItem('userRole', 'admin');

      // Set user data
      setUser(data.data.user);
    } catch (error) {
      // Fallback to demo credentials for development
      if (email === 'admin@promptify.com' && password === 'admin123') {
        const mockAdminUser: User = {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@promptify.com',
          role: 'admin',
          subscription: {
            plan: 'Admin',
            status: 'active'
          },
          usage: {
            playgroundSessions: {
              current: 0,
              limit: 999999
            },
            promptsCreated: 0
          }
        };

        // Store admin tokens
        localStorage.setItem('adminToken', 'mock-admin-token');
        localStorage.setItem('userRole', 'admin');

        // Set user data
        setUser(mockAdminUser);
      } else {
        throw error; // Re-throw to be handled by the component
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      // Call logout endpoint to update last active time
      const token = localStorage.getItem('authToken');
      if (token) {
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(error => {
          console.error('Logout API call failed:', error);
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and user state
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userRole');
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      await checkAuthStatus();
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = 'Failed to send reset email';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = `Failed to send reset email: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Don't throw error even if user doesn't exist for security
      return data.message || 'Password reset link has been sent to your email';
    } catch (error) {
      console.error('Forgot password error:', error);
      showErrorToast(error, 'Forgot Password');
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = 'Failed to reset password';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = `Failed to reset password: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Password reset failed');
      }

      return data.message || 'Password has been reset successfully';
    } catch (error) {
      console.error('Reset password error:', error);
      showErrorToast(error, 'Reset Password');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    adminLogin,
    signup,
    logout,
    updateUser,
    refreshUser,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
