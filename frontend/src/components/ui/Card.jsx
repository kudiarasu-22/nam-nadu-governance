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

import { useEffect, useState } from 'react';

/**
 * AnimatedCounter — Animates a number from 0 to value
 */
function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) {
      setCount(value);
      return;
    }
    if (start === end) return;
    
    let totalDuration = 1000;
    let incrementTime = (totalDuration / end);
    
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime > 10 ? incrementTime : 10);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{typeof value === 'number' || !isNaN(parseInt(value)) ? count : value}</span>;
}

/**
 * StatCard — Dashboard statistic card with icon, value, and label
 */
export function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'primary', className }) {
  const colorClasses = {
    primary: 'from-primary-700 to-primary-500',
    accent: 'from-accent-600 to-accent-400',
    success: 'from-success-600 to-success-400',
    warning: 'from-warning-500 to-warning-400',
    danger: 'from-danger-600 to-danger-400',
    info: 'from-info-500 to-info-400',
  };

  return (
    <Card variant="default" className={cn('relative overflow-hidden group', className)}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-white/0 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">{title}</p>
          <p className="mt-1 text-3xl font-black text-text-primary-light dark:text-text-primary-dark tracking-tight">
            <AnimatedCounter value={value} />
          </p>
          {subtitle && (
            <p className="mt-1 text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">{subtitle}</p>
          )}
          {trend && (
            <div className={cn('mt-2 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full inline-flex', trend === 'up' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600')}>
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-2xl bg-gradient-to-br shadow-lg group-hover:-translate-y-1 group-hover:shadow-xl transition-all duration-300', colorClasses[color])}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </Card>
  );
}
