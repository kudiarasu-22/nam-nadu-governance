/**
 * Nam Nadu — Role-based Dashboard Redirect
 * Redirects authenticated users to their role-specific dashboard
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context';
import { getDefaultDashboard } from '@/config/roles';

export default function RoleRedirect() {
  const { user } = useAuth();
  return <Navigate to={getDefaultDashboard(user?.role)} replace />;
}
