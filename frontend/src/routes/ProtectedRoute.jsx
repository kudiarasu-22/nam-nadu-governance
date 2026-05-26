/**
 * Nam Nadu — Protected Route Component
 * Wraps routes that require authentication and optionally specific roles
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context';
import { FullPageLoader } from '@/components/feedback/LoadingSpinner';

/**
 * ProtectedRoute — requires authentication
 * @param {string[]} allowedRoles - Optional array of roles allowed to access this route
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
