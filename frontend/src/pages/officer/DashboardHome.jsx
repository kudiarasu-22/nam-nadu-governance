/**
 * Nam Nadu — Officer Dashboard Home
 */
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context';
import { useState, useEffect } from 'react';
import { Card, StatCard, Badge, LiveActivityFeed, Button } from '@/components/ui';
import { officerService } from '@/services/officer.service';
import { COMPLAINT_STATUS } from '@/constants';
import { CheckCircle, AlertCircle, Clock, Building } from 'lucide-react';

export default function DashboardHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, complaintsData] = await Promise.all([
          officerService.getDashboardStats(),
          officerService.getComplaints()
        ]);
        setStats(statsData);
        setComplaints(complaintsData.data || []);
      } catch (error) {
        console.error('Failed to fetch officer data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !stats) {
    return <div className="flex h-64 items-center justify-center">Loading dashboard...</div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            {t('officer.portal')}
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1 flex items-center gap-2">
            <Building className="w-4 h-4" /> {user?.department_name || 'Public Works Department'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge color="success" size="lg" className="px-4 py-2 text-sm">
            {t('officer.status_on_duty')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('officer.active_complaints')} value={stats.active_complaints} trend="down" trendValue="-5%" icon={AlertCircle} color="warning" />
        <StatCard title={t('officer.resolved_today')} value={stats.resolved_today} icon={CheckCircle} color="success" />
        <StatCard title={t('officer.avg_resolution')} value={stats.avg_resolution_time} trend="down" trendValue="Faster by 12h" icon={Clock} color="primary" />
        <StatCard title={t('officer.escalated')} value={stats.escalated_complaints} icon={AlertCircle} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="font-semibold mb-4 text-lg">{t('officer.action_required')}</h2>
          <div className="space-y-4">
            {complaints.filter(c => c.status === COMPLAINT_STATUS.ASSIGNED).map(c => (
              <div key={c.id} className="p-4 rounded-xl border border-border-light dark:border-border-dark flex flex-col sm:flex-row gap-4 justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-text-secondary-light">#CMP-{c.id}</span>
                    <Badge color="warning" size="sm">{t('officer.action_needed')}</Badge>
                    {c.priority === 'urgent' && <Badge color="danger" size="sm">Urgent</Badge>}
                  </div>
                  <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark">{c.title}</h3>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">{c.location} • {new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="secondary" size="sm" className="flex-1 sm:flex-none">{t('officer.view')}</Button>
                  <Button variant="primary" size="sm" className="flex-1 sm:flex-none">{t('officer.start_work')}</Button>
                </div>
              </div>
            ))}
            {complaints.filter(c => c.status === COMPLAINT_STATUS.ASSIGNED).length === 0 && (
              <div className="p-8 text-center text-text-secondary-light border border-dashed rounded-xl">
                {t('officer.no_actions')}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold mb-4 text-lg">{t('officer.live_activity')}</h2>
          <LiveActivityFeed maxItems={6} />
        </Card>
      </div>
    </div>
  );
}
