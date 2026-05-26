/**
 * Nam Nadu — Volunteer Tasks
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, Button, EmptyState } from '@/components/ui';
import { MOCK_VOLUNTEER_TASKS } from '@/mock';
import { CheckCircle2, ShieldCheck, Droplet } from 'lucide-react';

export default function VolunteerTasks() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState(MOCK_VOLUNTEER_TASKS);

  const getIcon = (type) => {
    switch(type) {
      case 'verification': return ShieldCheck;
      case 'health': return Droplet;
      default: return CheckCircle2;
    }
  };

  const claimTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'claimed' } : t));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          {t('volunteer.available_tasks')}
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
          {t('volunteer.tasks_description')}
        </p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState title={t('volunteer.no_tasks')} description={t('volunteer.no_tasks_desc')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map(task => {
            const Icon = getIcon(task.type);
            return (
              <Card key={task.id} className={task.status === 'claimed' ? 'opacity-60 grayscale' : ''}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 text-primary-600 rounded-lg dark:bg-primary-900/30 dark:text-primary-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">{task.title}</h3>
                      <p className="text-sm text-text-secondary-light">{task.ward}</p>
                    </div>
                  </div>
                  <Badge color={task.urgency === 'high' ? 'danger' : 'primary'}>{task.points} pts</Badge>
                </div>
                
                {task.status === 'open' ? (
                  <Button variant="primary" className="w-full" onClick={() => claimTask(task.id)}>
                    {t('volunteer.claim_task')}
                  </Button>
                ) : (
                  <Button variant="secondary" className="w-full" disabled>
                    {t('volunteer.claimed')}
                  </Button>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
