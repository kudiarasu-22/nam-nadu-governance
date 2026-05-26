/**
 * Nam Nadu — Live Activity Feed
 */
import { useEffect, useState } from 'react';
import { simulator } from '@/services/simulator';
import { timeAgo } from '@/utils';
import { Activity, AlertTriangle, ShieldAlert, AlertCircle, CheckCircle, Construction, HandHeart } from 'lucide-react';

export default function LiveActivityFeed({ maxItems = 5 }) {
  const [activities, setActivities] = useState(simulator.activityLog.slice(0, maxItems));

  useEffect(() => {
    const handleUpdate = (entry) => {
      setActivities(prev => [entry, ...prev].slice(0, maxItems));
    };
    simulator.on('activity_update', handleUpdate);
    return () => simulator.off('activity_update', handleUpdate);
  }, [maxItems]);

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-4 h-4 text-danger-500" />;
      case 'complaint': return <AlertCircle className="w-4 h-4 text-warning-500" />;
      case 'project': return <Construction className="w-4 h-4 text-primary-500" />;
      case 'volunteer': return <HandHeart className="w-4 h-4 text-success-500" />;
      default: return <Activity className="w-4 h-4 text-info-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'alert': return 'bg-danger-100 border-danger-200 dark:bg-danger-900/30 dark:border-danger-800';
      case 'complaint': return 'bg-warning-100 border-warning-200 dark:bg-warning-900/30 dark:border-warning-800';
      case 'project': return 'bg-primary-100 border-primary-200 dark:bg-primary-900/30 dark:border-primary-800';
      case 'volunteer': return 'bg-success-100 border-success-200 dark:bg-success-900/30 dark:border-success-800';
      default: return 'bg-info-100 border-info-200 dark:bg-info-900/30 dark:border-info-800';
    }
  };

  if (activities.length === 0) return null;

  return (
    <div className="relative border-l border-border-light dark:border-border-dark ml-3 space-y-5">
      {activities.map((activity) => (
        <div key={activity.id} className="relative pl-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={`absolute w-7 h-7 rounded-full -left-[14px] top-0 border-2 border-white dark:border-surface-card-dark flex items-center justify-center ${getBgColor(activity.type)}`}>
            {getIcon(activity.type)}
          </div>
          <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{activity.message}</p>
          <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-1 font-mono">
            {timeAgo(activity.timestamp)}
          </p>
        </div>
      ))}
    </div>
  );
}
