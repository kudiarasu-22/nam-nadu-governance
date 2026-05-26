/**
 * Nam Nadu — Bottom Navigation (Mobile)
 */
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, Clock, LineChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils';

import { useAuth } from '@/context';
import { ROLES } from '@/config';

export default function BottomNav() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Only show bottom nav for citizen and volunteer
  if (!user || (user.role !== ROLES.CITIZEN && user.role !== ROLES.VOLUNTEER)) {
    return null;
  }

  const citizenItems = [
    { to: '/dashboard/citizen', icon: Home, label: t('nav.home') },
    { to: '/complaints/raise', icon: PlusCircle, label: t('nav.raise_complaint') },
    { to: '/complaints', icon: Clock, label: t('nav.track') },
    { to: '/funds', icon: LineChart, label: t('nav.funds') },
  ];

  const volunteerItems = [
    { to: '/dashboard/volunteer', icon: Home, label: t('nav.home') },
    { to: '/volunteers', icon: PlusCircle, label: 'Tasks' },
    { to: '/projects', icon: Clock, label: 'Verifications' },
    { to: '/analytics', icon: LineChart, label: 'Leaderboard' },
  ];

  const navItems = user.role === ROLES.VOLUNTEER ? volunteerItems : citizenItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-surface-card-dark/90 backdrop-blur-xl border-t border-border-light dark:border-border-dark z-50 px-4 pb-safe flex items-center justify-between shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/dashboard/citizen'}
          className={({ isActive }) => cn(
            'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
            isActive ? 'text-primary-600 dark:text-primary-400' : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-primary-500'
          )}
        >
          {({ isActive }) => (
            <>
              <item.icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}
