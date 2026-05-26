/**
 * Nam Nadu — Button Component
 * Reusable button with multiple variants, sizes, and states
 */
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

const variants = {
  primary: 'bg-primary-700 hover:bg-primary-800 text-white shadow-md hover:shadow-lg',
  secondary: 'bg-white dark:bg-surface-card-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-primary-50 dark:hover:bg-primary-900/20',
  accent: 'bg-accent-500 hover:bg-accent-600 text-primary-900 shadow-md hover:shadow-lg',
  danger: 'bg-danger-500 hover:bg-danger-600 text-white shadow-md',
  ghost: 'bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-700 dark:text-primary-300',
  link: 'bg-transparent text-primary-600 dark:text-primary-400 hover:underline p-0',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
  xl: 'px-8 py-4 text-lg rounded-xl',
  icon: 'p-2 rounded-lg',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  onClick,
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
