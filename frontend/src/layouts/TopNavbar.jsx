/**
 * Nam Nadu — Top Navbar
 * Fixed top navigation bar with search, notifications, theme toggle
 */
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme, useNotifications, useAuth } from '@/context';
import { useClickOutside } from '@/hooks';
import { timeAgo, cn } from '@/utils';
import { complaintService } from '@/services';

export default function TopNavbar({ sidebarCollapsed, onToggleSidebar }) {
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markRead, markAllRead, setNotifications } = useNotifications();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useClickOutside(() => setShowNotifications(false));

  useEffect(() => {
    // Isolated roles (MLA, CM_ADMIN) do not have standard citizen notifications.
    // Fetching here with their isolated tokens will cause a 401 error since
    // the backend expects an integer User ID, triggering an interceptor loop.
    if (user && !['mla', 'cm_admin'].includes(user.role)) {
      complaintService.getNotifications()
        .then(data => setNotifications(data))
        .catch(err => console.error("Failed to fetch notifications", err));
    }
  }, [user, setNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await complaintService.markNotificationRead(id);
      markRead(id);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('namnadu_lang', newLang);
  };

  const translateNotificationTitle = (title) => {
    // Fallback translation for common notification titles
    const normalized = title.toLowerCase().replace(/ /g, '_');
    return t(`notifications.title_${normalized}`, title);
  };

  const translateNotificationMessage = (msg) => {
    if (msg.includes('status changed to:')) {
       const parts = msg.split('status changed to:');
       const prefix = parts[0].trim(); // e.g., Complaint #102
       const status = parts[1].trim();
       return `${prefix} ${t('dashboard.status_changed_to')} ${t(`complaint.status.${status.toUpperCase()}`, status)}`;
    }
    if (msg.includes('assigned to Officer')) {
       const [prefix, officer] = msg.split('assigned to Officer');
       return `${prefix} ${t('notifications.assigned_to_officer')} ${officer.trim()}`;
    }
    return t(`notifications.msg_${msg.toLowerCase().replace(/ /g, '_')}`, msg);
  };

  return (
    <header className={cn('top-navbar bg-white/80 dark:bg-surface-card-dark/80 backdrop-blur-xl border-b border-border-light dark:border-border-dark', sidebarCollapsed && 'sidebar-collapsed')}>
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left: Menu toggle + Search */}
        <div className="flex items-center gap-4">
          <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" aria-label="Toggle sidebar">
            <svg className="w-5 h-5 text-text-primary-light dark:text-text-primary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:flex items-center gap-2 bg-surface-light dark:bg-surface-dark rounded-xl px-4 py-2 w-72">
            <svg className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder={t('common.search')} className="bg-transparent text-sm w-full outline-none text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light/50" />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button onClick={toggleLanguage} className="px-3 py-1 text-xs font-bold rounded-lg border border-border-light dark:border-border-dark hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors uppercase flex items-center gap-2">
            <span className={i18n.language === 'en' ? 'text-primary-600' : 'text-gray-400 font-normal'}>English</span>
            <span className="text-gray-300">|</span>
            <span className={i18n.language === 'ta' ? 'text-primary-600' : 'text-gray-400 font-normal'}>தமிழ்</span>
          </button>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" aria-label="Toggle theme">
            <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors relative" aria-label="Notifications">
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-surface-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-elevated z-50 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
                  <h3 className="font-semibold text-sm">{t('common.notifications')}</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline">{t('common.mark_all_read')}</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-8 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">{t('common.no_notifications')}</p>
                  ) : (
                    notifications.slice(0, 10).map((notif) => (
                      <div key={notif.id} onClick={() => handleMarkRead(notif.id)} className={cn('px-4 py-3 border-b border-border-light dark:border-border-dark cursor-pointer hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors', !notif.is_read && 'bg-primary-50/30 dark:bg-primary-900/5')}>
                        <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{translateNotificationTitle(notif.title)}</p>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">{translateNotificationMessage(notif.message)}</p>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">{timeAgo(notif.created_at)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium ml-2">
            {user?.full_name?.[0] || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
