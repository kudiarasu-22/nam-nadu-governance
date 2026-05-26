/**
 * Nam Nadu — App Router
 * Central routing configuration with role-based route protection & lazy loading
 */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@/layouts';
import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '@/config/roles';
import { FullPageLoader } from '@/components/feedback/LoadingSpinner';
import RoleRedirect from './RoleRedirect';

// Auth pages (small — eager loaded)
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import NotFoundPage from '@/pages/NotFoundPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

// Lazy-loaded Citizen Pages
const CitizenHome = lazy(() => import('@/pages/citizen/DashboardHome'));
const RaiseComplaint = lazy(() => import('@/pages/citizen/RaiseComplaint'));
const ComplaintTracking = lazy(() => import('@/pages/citizen/ComplaintTracking'));
const GovernmentProjects = lazy(() => import('@/pages/citizen/GovernmentProjects'));
const FundTransparency = lazy(() => import('@/pages/citizen/FundTransparency'));
const EmergencyAlerts = lazy(() => import('@/pages/citizen/EmergencyAlerts'));
const PublicVoting = lazy(() => import('@/pages/citizen/PublicVoting'));

// Lazy-loaded Officer Pages
const OfficerHome = lazy(() => import('@/pages/officer/DashboardHome'));
const ComplaintManagement = lazy(() => import('@/pages/officer/ComplaintManagement'));
const OfficerProjects = lazy(() => import('@/pages/officer/ProjectManagement'));
const EmergencyControl = lazy(() => import('@/pages/officer/EmergencyControl'));
const DepartmentAnalytics = lazy(() => import('@/pages/officer/DepartmentAnalytics'));

// Lazy-loaded Leadership Pages
const SmartGovernance = lazy(() => import('@/pages/leadership/SmartGovernance'));

// Lazy-loaded Volunteer Pages
const VolunteerHome = lazy(() => import('@/pages/volunteer/DashboardHome'));
const VolunteerTasks = lazy(() => import('@/pages/volunteer/VolunteerTasks'));

// Suspense wrapper for lazy-loaded pages
function LazyPage({ children }) {
  return <Suspense fallback={<FullPageLoader />}>{children}</Suspense>;
}

// Placeholder for future dashboard pages
function DashboardPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6">
        <span className="text-4xl">🏗️</span>
      </div>
      <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">Coming Soon</h2>
      <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-md">
        This dashboard module is under development. The foundation architecture is ready for integration.
      </p>
    </div>
  );
}

// Role groupings
const citizenRoles = [ROLES.CITIZEN];
const officerRoles = [ROLES.OFFICER, ROLES.LEADERSHIP_ADMIN];
const leadershipRoles = [ROLES.COUNCILLOR, ROLES.LEADERSHIP_ADMIN];
const volunteerRoles = [ROLES.VOLUNTEER];

export const router = createBrowserRouter([
  // Auth routes (no sidebar)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // Protected app routes (with sidebar + navbar)
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      // Default dashboard — redirects to role-specific dashboard
      { path: 'dashboard', element: <RoleRedirect /> },

      // Dashboard routes — role-gated
      { path: 'dashboard/citizen', element: <ProtectedRoute allowedRoles={[...citizenRoles, ...leadershipRoles]}><LazyPage><CitizenHome /></LazyPage></ProtectedRoute> },
      { path: 'dashboard/officer', element: <ProtectedRoute allowedRoles={officerRoles}><LazyPage><OfficerHome /></LazyPage></ProtectedRoute> },
      { path: 'dashboard/leadership', element: <ProtectedRoute allowedRoles={leadershipRoles}><LazyPage><SmartGovernance /></LazyPage></ProtectedRoute> },
      { path: 'dashboard/volunteer', element: <ProtectedRoute allowedRoles={[...volunteerRoles, ...leadershipRoles]}><LazyPage><VolunteerHome /></LazyPage></ProtectedRoute> },

      // Citizen features
      { path: 'complaints/raise', element: <ProtectedRoute allowedRoles={citizenRoles}><LazyPage><RaiseComplaint /></LazyPage></ProtectedRoute> },
      { path: 'complaints', element: <ProtectedRoute allowedRoles={[...citizenRoles, ...officerRoles, ...leadershipRoles]}><LazyPage><ComplaintTracking /></LazyPage></ProtectedRoute> },
      { path: 'projects', element: <LazyPage><GovernmentProjects /></LazyPage> },
      { path: 'funds', element: <ProtectedRoute allowedRoles={[...citizenRoles, ...leadershipRoles]}><LazyPage><FundTransparency /></LazyPage></ProtectedRoute> },
      { path: 'voting', element: <ProtectedRoute allowedRoles={citizenRoles}><LazyPage><PublicVoting /></LazyPage></ProtectedRoute> },

      // Officer features
      { path: 'complaints/manage', element: <ProtectedRoute allowedRoles={officerRoles}><LazyPage><ComplaintManagement /></LazyPage></ProtectedRoute> },
      { path: 'emergency', element: <ProtectedRoute allowedRoles={[...officerRoles, ...leadershipRoles]}><LazyPage><EmergencyControl /></LazyPage></ProtectedRoute> },
      { path: 'emergency/alerts', element: <ProtectedRoute allowedRoles={citizenRoles}><LazyPage><EmergencyAlerts /></LazyPage></ProtectedRoute> },
      { path: 'projects/manage', element: <ProtectedRoute allowedRoles={officerRoles}><LazyPage><OfficerProjects /></LazyPage></ProtectedRoute> },

      // Volunteer features
      { path: 'volunteers', element: <ProtectedRoute allowedRoles={[...volunteerRoles, ...officerRoles, ...leadershipRoles]}><LazyPage><VolunteerTasks /></LazyPage></ProtectedRoute> },

      // Placeholder pages
      { path: 'departments', element: <ProtectedRoute allowedRoles={[...officerRoles, ...leadershipRoles]}><DashboardPlaceholder /></ProtectedRoute> },
      { path: 'analytics', element: <ProtectedRoute allowedRoles={officerRoles}><LazyPage><DepartmentAnalytics /></LazyPage></ProtectedRoute> },
      { path: 'settings', element: <DashboardPlaceholder /> },
    ],
  },

  // Error pages
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

export default router;
