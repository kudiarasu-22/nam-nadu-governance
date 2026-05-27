/**
 * Nam Nadu — CM Protected Route Component
 * Strictly isolated for CM Dashboard
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context';
import { FullPageLoader } from '@/components/feedback/LoadingSpinner';

export default function CMProtectedRoute({ children }) {
  const { isCmAuthenticated, isLoading, cmUser } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageLoader />;

  if (!isCmAuthenticated || cmUser?.role !== 'cm_admin') {
    return <Navigate to="/cm/login" state={{ from: location }} replace />;
  }

  return children;
}
