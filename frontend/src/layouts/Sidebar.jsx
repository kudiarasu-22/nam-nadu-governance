/**
 * Nam Nadu — Sidebar Navigation
 * Collapsible sidebar with role-based menu items
 */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context';
import { useIsMobile } from '@/hooks';
import { ROLES, hasPermission } from '@/config/roles';
import { cn } from '@/utils';

// Navigation items grouped by section
const getNavItems = (role, t) => [
  {
    section: t('nav.main', 'Main'),
    items: [
      { label: t('nav.dashboard', 'Dashboard'), path: '/dashboard', icon: '📊', roles: Object.values(ROLES) },
    ],
  },
  {
    section: t('nav.services', 'Services'),
    items: [
      { label: t('nav.complaints', 'Complaints'), path: '/complaints', icon: '📝', roles: [ROLES.CITIZEN] },
      { label: t('nav.complaints', 'Complaints'), path: '/complaints/manage', icon: '📝', roles: [ROLES.OFFICER, ROLES.COUNCILLOR, ROLES.LEADERSHIP_ADMIN] },
      { label: t('nav.projects', 'Projects'), path: '/projects', icon: '🏗️', roles: [ROLES.CITIZEN] },
      { label: t('nav.projects', 'Projects'), path: '/projects/manage', icon: '🏗️', roles: [ROLES.OFFICER, ROLES.COUNCILLOR, ROLES.LEADERSHIP_ADMIN] },
      { label: t('nav.voting', 'Voting'), path: '/voting', icon: '🗳️', roles: [ROLES.CITIZEN] },
      { label: t('nav.departments', 'Departments'), path: '/departments', icon: '🏛️', roles: [ROLES.OFFICER, ROLES.COUNCILLOR, ROLES.LEADERSHIP_ADMIN] },
    ],
  },
  {
    section: t('nav.management', 'Management'),
    items: [
      { label: t('nav.volunteers', 'Volunteers'), path: '/volunteers', icon: '🤝', roles: [ROLES.VOLUNTEER, ROLES.OFFICER, ROLES.LEADERSHIP_ADMIN] },
      { label: t('nav.funds', 'Fund Allocation'), path: '/funds', icon: '💰', roles: [ROLES.CITIZEN, ROLES.COUNCILLOR, ROLES.LEADERSHIP_ADMIN] },
      { label: t('nav.analytics', 'Analytics'), path: '/analytics', icon: '📈', roles: [ROLES.OFFICER, ROLES.COUNCILLOR, ROLES.LEADERSHIP_ADMIN] },
    ],
  },
  {
    section: t('nav.system', 'System'),
    items: [
      { label: t('nav.alerts', 'Emergency Alerts'), path: '/emergency', icon: '🚨', roles: [ROLES.CITIZEN, ROLES.OFFICER, ROLES.LEADERSHIP_ADMIN] },
      { label: t('nav.settings', 'Settings'), path: '/settings', icon: '⚙️', roles: Object.values(ROLES) },
    ],
  },
].map((section) => ({
  ...section,
  items: section.items.filter((item) => item.roles.includes(role)),
})).filter((section) => section.items.length > 0);

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const navItems = getNavItems(user?.role || ROLES.CITIZEN, t);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'sidebar bg-surface-sidebar-light dark:bg-surface-sidebar-dark border-r border-border-light dark:border-border-dark',
          collapsed && !isMobile && 'collapsed',
          isMobile && isOpen && 'open'
        )}
      >
        {/* Logo and Branding Header */}
        <div className={cn("flex flex-col border-b border-border-light dark:border-border-dark", collapsed && !isMobile ? "p-4 items-center" : "p-6")}>
          <div className={cn("transition-all duration-300", collapsed && !isMobile ? "w-10 h-10" : "w-24 h-24 mb-6")}>
            <img 
              src="/tn_logo.svg" 
              alt="Government of Tamil Nadu" 
              className="w-full h-full object-contain drop-shadow-md bg-white rounded-full p-1"
            />
          </div>
          
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <h1 className="text-4xl font-extrabold text-text-primary-light dark:text-white tracking-tight mb-1">
                Nam Nadu
              </h1>
              <h2 className="text-3xl font-bold text-text-primary-light dark:text-white/90 mb-5">
                நம் நாடு
              </h2>
              <p className="text-sm font-medium text-accent-600 dark:text-accent-400 mb-6">
                Nam Nadu — நம் நாடு <span className="opacity-50 mx-1">|</span> Built for the People of Tamil Nadu
              </p>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed pr-2">
                Empowering governance through transparency, accountability, and citizen engagement.
              </p>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((section) => (
            <div key={section.section} className="mb-4">
              {(!collapsed || isMobile) && (
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                  {section.section}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={isMobile ? onClose : undefined}
                      className={({ isActive }) => cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:text-primary-700 dark:hover:text-primary-300',
                        collapsed && !isMobile && 'justify-center'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      {(!collapsed || isMobile) && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-border-light dark:border-border-dark p-3">
          <div className={cn('flex items-center gap-3 px-3 py-2', collapsed && !isMobile && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {user?.full_name?.[0] || 'U'}
            </div>
            {(!collapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-text-primary-light dark:text-text-primary-dark">{user?.full_name || 'User'}</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark capitalize">{user?.role || 'citizen'}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-1',
              collapsed && !isMobile && 'justify-center'
            )}
          >
            <span className="text-lg">🚪</span>
            {(!collapsed || isMobile) && <span>{t('common.logout', 'Logout')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
