/**
 * Nam Nadu — MLA Protected Route Component
 * Strictly isolated for MLA Dashboard
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context';
import { FullPageLoader } from '@/components/feedback/LoadingSpinner';

export default function MLAProtectedRoute({ children }) {
  const { isMlaAuthenticated, isLoading, mlaUser } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageLoader />;

  if (!isMlaAuthenticated || mlaUser?.role !== 'mla') {
    return <Navigate to="/mla/login" state={{ from: location }} replace />;
  }

  return children;
}
