/**
 * Nam Nadu — Card Component
 * Glassmorphism card with hover effects
 */
import { motion } from 'framer-motion';
import { cn } from '@/utils';

const cardVariants = {
  default: 'glass-card',
  solid: 'bg-white dark:bg-surface-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-card',
  gradient: 'gradient-primary text-white rounded-xl shadow-elevated',
  flat: 'bg-surface-light dark:bg-surface-card-dark rounded-xl',
};

export default function Card({
  children,
  variant = 'default',
  className,
  hoverable = true,
  onClick,
  padding = 'p-6',
  animate = true,
  ...props
}) {
  const Component = animate ? motion.div : 'div';

  return (
    <Component
      className={cn(
        cardVariants[variant],
        padding,
        hoverable && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...(animate ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: 'easeOut' },
        whileHover: hoverable ? { y: -4, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' } : {},
      } : {})}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * StatCard — Dashboard statistic card with icon, value, and label
 */
export function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'primary', className }) {
  const colorClasses = {
    primary: 'from-primary-700 to-primary-500',
    accent: 'from-accent-600 to-accent-400',
    success: 'from-success-600 to-success-400',
    danger: 'from-danger-600 to-danger-400',
    info: 'from-info-500 to-info-400',
  };

  return (
    <Card variant="default" className={cn('relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">{title}</p>
          <p className="mt-2 text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">{subtitle}</p>
          )}
          {trend && (
            <div className={cn('mt-2 flex items-center gap-1 text-sm font-medium', trend === 'up' ? 'text-success-500' : 'text-danger-500')}>
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-xl bg-gradient-to-br', colorClasses[color])}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </Card>
  );
}
