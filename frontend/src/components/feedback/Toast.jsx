/**
 * Nam Nadu — Toast Notification Component
 * Renders ephemeral toast messages from NotificationContext
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/context';
import { cn } from '@/utils';

const typeStyles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-primary-600 text-white',
};

const typeIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl shadow-elevated pointer-events-auto',
              typeStyles[toast.type] || typeStyles.info
            )}
          >
            <span className="text-lg font-bold">{typeIcons[toast.type] || typeIcons.info}</span>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button onClick={() => dismissToast(toast.id)} className="opacity-70 hover:opacity-100 text-lg">×</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
