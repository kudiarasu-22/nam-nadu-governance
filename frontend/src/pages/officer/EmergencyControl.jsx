/**
 * Nam Nadu — Emergency Control Center (Officer)
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Send } from 'lucide-react';
import { Card, Input, Textarea, Button, Badge } from '@/components/ui';
import { MOCK_ALERTS } from '@/mock';
import { timeAgo } from '@/utils';

export default function EmergencyControl() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleDispatch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-2xl p-6 flex items-start gap-4">
        <div className="p-3 bg-danger-100 text-danger-600 dark:bg-danger-900/50 dark:text-danger-400 rounded-xl">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-danger-700 dark:text-danger-400">{t('emergency.control_title')}</h1>
          <p className="text-danger-600 dark:text-danger-300 text-sm mt-1">
            {t('emergency.control_desc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-danger-200 dark:border-danger-800/50">
          <h2 className="font-semibold text-lg mb-4">{t('emergency.dispatch_title')}</h2>
          <div className="space-y-4">
            <Input label={t('emergency.alert_title_label')} placeholder={t('emergency.alert_title_placeholder')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label={t('emergency.target_ward')} placeholder={t('emergency.target_ward_placeholder')} />
              <Input label={t('emergency.severity_level')} placeholder="Critical" value="Critical" disabled />
            </div>
            <Textarea label={t('emergency.message_label')} placeholder={t('emergency.message_placeholder')} rows={4} />
            <Button variant="danger" className="w-full" icon={Send} loading={loading} onClick={handleDispatch}>
              {t('emergency.broadcast')}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="font-semibold text-lg">{t('emergency.recent_broadcasts')}</h2>
          {MOCK_ALERTS.map(alert => (
            <Card key={alert.id} className="opacity-80">
              <div className="flex justify-between items-start mb-2">
                <Badge color={alert.severity === 'critical' ? 'danger' : 'warning'}>{alert.severity}</Badge>
                <span className="text-xs text-text-secondary-light">{timeAgo(alert.created_at)}</span>
              </div>
              <h3 className="font-medium">{alert.title}</h3>
              <p className="text-sm text-text-secondary-light mt-1">{alert.message}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
