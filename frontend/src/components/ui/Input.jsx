/**
 * Nam Nadu — Input Component
 * Form input with label, error message, icon support
 */
import { forwardRef, useState } from 'react';
import { cn } from '@/utils';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  rightIcon: RightIcon,
  type = 'text',
  className,
  inputClassName,
  required = false,
  disabled = false,
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const isPassword = type === 'password';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          disabled={disabled}
          className={cn(
            'w-full rounded-lg border bg-white dark:bg-surface-card-dark px-4 py-2.5 text-sm',
            'text-text-primary-light dark:text-text-primary-dark',
            'placeholder:text-text-secondary-light/50 dark:placeholder:text-text-secondary-dark/50',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
            error
              ? 'border-danger-500 focus:ring-danger-500/30 focus:border-danger-500'
              : 'border-border-light dark:border-border-dark',
            Icon && 'pl-10',
            (RightIcon || isPassword) && 'pr-10',
            disabled && 'opacity-50 cursor-not-allowed bg-surface-light dark:bg-surface-dark',
            inputClassName
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
            tabIndex={-1}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        )}
        {RightIcon && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark">
            <RightIcon className="w-4 h-4" />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;

/**
 * Select Component
 */
export const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select...',
  className,
  required = false,
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className="w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-card-dark px-4 py-2.5 text-sm text-text-primary-light dark:text-text-primary-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

/**
 * Textarea Component
 */
export const Textarea = forwardRef(({
  label,
  error,
  className,
  required = false,
  rows = 4,
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          'w-full rounded-lg border bg-white dark:bg-surface-card-dark px-4 py-2.5 text-sm resize-y',
          'text-text-primary-light dark:text-text-primary-dark',
          'placeholder:text-text-secondary-light/50 dark:placeholder:text-text-secondary-dark/50',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
          error ? 'border-danger-500' : 'border-border-light dark:border-border-dark',
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
