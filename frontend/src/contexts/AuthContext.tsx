import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

      // Regular user authentication
      if (token) {
        // Mock user data - replace with actual API call
        const mockUser: User = {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          subscription: {
            plan: 'Free',
            status: 'active'
          },
          usage: {
            playgroundSessions: {
              current: 3,
              limit: 10
            },
            promptsCreated: 5
          }
        };
        setUser(mockUser);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userRole');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Mock login API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('authToken', data.token);
      
      // Set user data
      setUser(data.user);
    } catch (error) {
      // For demo purposes, use mock login
      if (email === 'user@example.com' && password === 'password') {
        const mockUser: User = {
          id: '1',
          name: 'Demo User',
          email: 'user@example.com',
          role: 'user',
          subscription: {
            plan: 'Free',
            status: 'active'
          },
          usage: {
            playgroundSessions: {
              current: 3,
              limit: 10
            },
            promptsCreated: 5
          }
        };
        
        localStorage.setItem('authToken', 'mock-token');
        setUser(mockUser);
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);

      // Mock signup API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('authToken', data.token);
      
      // Set user data
      setUser(data.user);
    } catch (error) {
      // For demo purposes, use mock signup
      const mockUser: User = {
        id: '2',
        name,
        email,
        role: 'user',
        subscription: {
          plan: 'Free',
          status: 'active'
        },
        usage: {
          playgroundSessions: {
            current: 0,
            limit: 10
          },
          promptsCreated: 0
        }
      };
      
      localStorage.setItem('authToken', 'mock-token');
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Demo admin credentials
      if (email === 'admin@promptify.com' && password === 'admin123') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

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
        throw new Error('Invalid admin credentials');
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the component
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    setUser(null);
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

      // Mock API call to refresh user data
      // In real app, this would fetch latest user data from server
      await checkAuthStatus();
    } catch (error) {
      console.error('Failed to refresh user:', error);
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
