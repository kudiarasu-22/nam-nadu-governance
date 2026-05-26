/**
 * Nam Nadu — Empty State Component
 */
import { Inbox } from 'lucide-react';
import { cn } from '@/utils';

export default function EmptyState({ 
  icon: Icon = Inbox, 
  title = "No Data Available", 
  description = "There is nothing to display here right now.", 
  action,
  className
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center rounded-2xl border-2 border-dashed border-border-light dark:border-border-dark", className)}>
      <div className="w-16 h-16 rounded-full bg-surface-light dark:bg-surface-dark flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-text-secondary-light dark:text-text-secondary-dark opacity-50" />
      </div>
      <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-2">{title}</h3>
      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark max-w-sm mx-auto mb-6">
        {description}
      </p>
      {action}
    </div>
  );
}
