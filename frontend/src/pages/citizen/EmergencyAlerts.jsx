/**
 * Nam Nadu — Emergency Alerts Page
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ShieldAlert, CloudRain, Zap, HeartPulse } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { MOCK_ALERTS } from '@/mock';
import { simulator } from '@/services/simulator';
import { timeAgo } from '@/utils';

export default function EmergencyAlerts() {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const handleAlert = (alert) => {
      setAlerts(prev => [alert, ...prev]);
    };
    simulator.on('emergency_alert', handleAlert);
    return () => simulator.off('emergency_alert', handleAlert);
  }, []);

  const getIcon = (title) => {
    if (title.toLowerCase().includes('rain') || title.toLowerCase().includes('flood')) return CloudRain;
    if (title.toLowerCase().includes('power')) return Zap;
    if (title.toLowerCase().includes('health')) return HeartPulse;
    return AlertTriangle;
  };

  const filteredAlerts = alerts.filter(a => filter === 'all' || a.severity === filter);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            {t('alerts.title')}
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            {t('alerts.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('all')}>{t('alerts.all')}</Button>
          <Button variant={filter === 'critical' ? 'danger' : 'secondary'} size="sm" onClick={() => setFilter('critical')}>{t('alerts.critical')}</Button>
          <Button variant={filter === 'medium' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('medium')}>{t('alerts.medium')}</Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center p-8 text-text-secondary-light">{t('alerts.no_alerts')}</div>
        ) : (
          filteredAlerts.map(alert => {
            const Icon = getIcon(alert.title);
            const isCritical = alert.severity === 'critical';
            return (
              <Card 
                key={alert.id} 
                className={isCritical ? 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800' : ''}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${isCritical ? 'bg-danger-100 text-danger-600 dark:bg-danger-900/50 dark:text-danger-400' : 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3 className={`font-bold text-lg ${isCritical ? 'text-danger-700 dark:text-danger-400' : 'text-text-primary-light dark:text-text-primary-dark'}`}>
                        {t(`alerts_data.${alert.id}_title`, alert.title)}
                      </h3>
                      <div className="flex items-center gap-2">
                        {isCritical && <Badge color="danger" size="sm" dot>{t('alerts.live')}</Badge>}
                        <span className="text-xs text-text-secondary-light">{timeAgo(alert.created_at)}</span>
                      </div>
                    </div>
                    <p className={`text-sm ${isCritical ? 'text-danger-600 dark:text-danger-300 font-medium' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
                      {t(`alerts_data.${alert.id}_msg`, alert.message)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
