import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { showErrorToast } from '@/utils/errorHandler';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  // Check for token expiry and handle automatic logout
  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = localStorage.getItem('authToken');
      const adminToken = localStorage.getItem('adminToken');

      if (token || adminToken) {
        try {
          // Decode JWT to check expiry (basic check without verification)
          const tokenToCheck = token || adminToken;
          const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
          const currentTime = Date.now() / 1000;

          if (payload.exp && payload.exp < currentTime) {
            console.log('Token expired, logging out...');
            logout();
            showErrorToast(new Error('Your session has expired. Please log in again.'), 'Session');
          }
        } catch (error) {
          // If token is malformed, clear it
          console.error('Invalid token format:', error);
          logout();
        }
      }
    };

    // Check token expiry on mount and every 5 minutes
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [logout]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Store the attempted URL for redirect after login
    const redirectPath = redirectTo || "/auth/login";
    const state = location.pathname !== redirectPath ? { from: location } : undefined;
    return <Navigate to={redirectPath} state={state} replace />;
  }

  // If admin access is required but user is not admin
  if (requireAdmin && (!user || user.role !== 'admin')) {
    const state = location.pathname !== "/admin/login" ? { from: location } : undefined;
    return <Navigate to="/admin/login" state={state} replace />;
  }

  // If user is authenticated but trying to access auth pages, redirect appropriately
  if (isAuthenticated && (location.pathname === '/auth/login' || location.pathname === '/auth/signup')) {
    // If admin user, redirect to admin dashboard, otherwise to user dashboard
    const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // If admin is authenticated but trying to access admin login, redirect to admin dashboard
  if (isAuthenticated && user?.role === 'admin' && location.pathname === '/admin/login') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
