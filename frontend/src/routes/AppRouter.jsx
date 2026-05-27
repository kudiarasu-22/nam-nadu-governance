/**
 * Nam Nadu — App Router
 * Central routing configuration with role-based route protection & lazy loading
 */
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout, AuthLayout } from '@/layouts';
import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '@/config/roles';
import { FullPageLoader } from '@/components/feedback/LoadingSpinner';
import RoleRedirect from './RoleRedirect';
import MLAProtectedRoute from './MLAProtectedRoute';
import CMProtectedRoute from './CMProtectedRoute';

// Auth pages (small — eager loaded)
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import NotFoundPage from '@/pages/NotFoundPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import LandingPage from '@/pages/LandingPage';
import LeadershipPage from '@/pages/LeadershipPage';
import MLARegister from '@/pages/leadership/MLARegister';
import CMLogin from '@/pages/leadership/CMLogin';

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
const MLALogin = lazy(() => import('@/pages/leadership/MLALogin'));
const MLADashboard = lazy(() => import('@/pages/leadership/MLADashboard'));
const CMDashboard = lazy(() => import('@/pages/leadership/CMDashboard'));

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
const leadershipRoles = [ROLES.COUNCILLOR, ROLES.LEADERSHIP_ADMIN, ROLES.MLA, ROLES.CM_ADMIN];
const volunteerRoles = [ROLES.VOLUNTEER];
const mlaRoles = [ROLES.MLA];
const cmRoles = [ROLES.CM_ADMIN];

export default function AppRouter() {
  return (
    <Routes>
      {/* Landing Page (Root) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/leadership" element={<LeadershipPage />} />

      {/* Auth routes (no sidebar) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/mla/login" element={<LazyPage><MLALogin /></LazyPage>} />
        <Route path="/leadership/register" element={<MLARegister />} />
        <Route path="/cm/login" element={<CMLogin />} />
      </Route>

      {/* Protected app routes (with sidebar + navbar) */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        {/* Default dashboard — redirects to role-specific dashboard */}
        <Route path="/dashboard" element={<RoleRedirect />} />

        {/* Dashboard routes — role-gated */}
        <Route path="/dashboard/citizen" element={<ProtectedRoute allowedRoles={[...citizenRoles, ...leadershipRoles]}><LazyPage><CitizenHome /></LazyPage></ProtectedRoute>} />
        <Route path="/dashboard/officer" element={<ProtectedRoute allowedRoles={officerRoles}><LazyPage><OfficerHome /></LazyPage></ProtectedRoute>} />
        <Route path="/dashboard/leadership" element={<ProtectedRoute allowedRoles={leadershipRoles}><LazyPage><SmartGovernance /></LazyPage></ProtectedRoute>} />
        <Route path="/dashboard/volunteer" element={<ProtectedRoute allowedRoles={[...volunteerRoles, ...leadershipRoles]}><LazyPage><VolunteerHome /></LazyPage></ProtectedRoute>} />

        {/* Citizen features */}
        <Route path="/complaints/raise" element={<ProtectedRoute allowedRoles={citizenRoles}><LazyPage><RaiseComplaint /></LazyPage></ProtectedRoute>} />
        <Route path="/complaints" element={<ProtectedRoute allowedRoles={[...citizenRoles, ...officerRoles, ...leadershipRoles]}><LazyPage><ComplaintTracking /></LazyPage></ProtectedRoute>} />
        <Route path="/projects" element={<LazyPage><GovernmentProjects /></LazyPage>} />
        <Route path="/funds" element={<ProtectedRoute allowedRoles={[...citizenRoles, ...leadershipRoles]}><LazyPage><FundTransparency /></LazyPage></ProtectedRoute>} />
        <Route path="/voting" element={<ProtectedRoute allowedRoles={citizenRoles}><LazyPage><PublicVoting /></LazyPage></ProtectedRoute>} />

        {/* Officer features */}
        <Route path="/complaints/manage" element={<ProtectedRoute allowedRoles={officerRoles}><LazyPage><ComplaintManagement /></LazyPage></ProtectedRoute>} />
        <Route path="/emergency" element={<ProtectedRoute allowedRoles={[...officerRoles, ...leadershipRoles]}><LazyPage><EmergencyControl /></LazyPage></ProtectedRoute>} />
        <Route path="/emergency/alerts" element={<ProtectedRoute allowedRoles={citizenRoles}><LazyPage><EmergencyAlerts /></LazyPage></ProtectedRoute>} />
        <Route path="/projects/manage" element={<ProtectedRoute allowedRoles={officerRoles}><LazyPage><OfficerProjects /></LazyPage></ProtectedRoute>} />

        {/* Volunteer features */}
        <Route path="/volunteers" element={<ProtectedRoute allowedRoles={[...volunteerRoles, ...officerRoles, ...leadershipRoles]}><LazyPage><VolunteerTasks /></LazyPage></ProtectedRoute>} />

        {/* Placeholder pages */}
        <Route path="/departments" element={<ProtectedRoute allowedRoles={[...officerRoles, ...leadershipRoles]}><DashboardPlaceholder /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute allowedRoles={officerRoles}><LazyPage><DepartmentAnalytics /></LazyPage></ProtectedRoute>} />
        <Route path="/settings" element={<DashboardPlaceholder />} />
      </Route>

      {/* Error pages */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
      
      {/* Isolated Leadership Routes */}
      <Route path="/dashboard/mla" element={
        <MLAProtectedRoute>
          <div className="min-h-screen bg-surface-light dark:bg-surface-dark p-4 md:p-6 lg:p-8">
            <LazyPage><MLADashboard /></LazyPage>
          </div>
        </MLAProtectedRoute>
      } />
      <Route path="/dashboard/cm" element={
        <CMProtectedRoute>
          <div className="min-h-screen bg-surface-light dark:bg-surface-dark p-4 md:p-6 lg:p-8">
            <LazyPage><CMDashboard /></LazyPage>
          </div>
        </CMProtectedRoute>
      } />
    </Routes>
  );
}
