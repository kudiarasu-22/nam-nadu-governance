/**
 * Nam Nadu — Loading Spinner
 */
import { cn } from '@/utils';

export default function LoadingSpinner({ size = 'md', className }) {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn('border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin', sizeClass)} />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-light dark:bg-surface-dark">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">Loading...</p>
      </div>
    </div>
  );
}
