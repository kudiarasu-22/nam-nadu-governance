/**
 * Nam Nadu — Skeleton Loading Components
 */
import { cn } from '@/utils';

export function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded', className)} {...props} />;
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn('glass-card p-6 space-y-4', className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-8 flex-1" />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => <Skeleton key={j} className="h-6 flex-1" />)}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
