import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

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
    return <Navigate to={redirectTo || "/auth/login"} state={{ from: location }} replace />;
  }

  // If admin access is required but user is not admin
  if (requireAdmin && (!user || user.role !== 'admin')) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
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
