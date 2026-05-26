/**
 * Nam Nadu — Auth Layout
 * Layout for login/register pages with branded background
 */
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context';
import { getDefaultDashboard } from '@/config/roles';
import { FullPageLoader } from '@/components/feedback/LoadingSpinner';

export default function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <FullPageLoader />;
  if (isAuthenticated) return <Navigate to={getDefaultDashboard(user?.role)} replace />;

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="w-32 h-32 mb-8">
            <img 
              src="/tn_logo.svg" 
              alt="Government of Tamil Nadu" 
              className="w-full h-full object-contain drop-shadow-xl bg-white rounded-full p-2"
            />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-2">
            Nam Nadu
          </h1>
          <h2 className="text-4xl font-bold text-white/90 mb-5">
            நம் நாடு
          </h2>
          <p className="text-base font-medium text-accent-400 mb-6">
            Nam Nadu — நம் நாடு <span className="opacity-50 mx-2">|</span> Built for the People of Tamil Nadu
          </p>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            Empowering governance through transparency, accountability, and citizen engagement.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-white/70">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">📊</span>
              <span>Real-time project tracking</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">📝</span>
              <span>Transparent complaint resolution</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">🤝</span>
              <span>Community-driven governance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form area */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-light dark:bg-surface-dark">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
