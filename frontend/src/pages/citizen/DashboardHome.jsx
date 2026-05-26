/**
 * Nam Nadu — Citizen Home Dashboard
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, ShieldAlert, TrendingUp, CheckCircle, Clock, PlusCircle } from 'lucide-react';
import { Card, StatCard, Button, Badge } from '@/components/ui';
import { MapContainer } from '@/components/maps';
import { Marker, Popup } from 'react-leaflet';
import { useAuth } from '@/context';
import { MOCK_ALERTS } from '@/mock';
import { simulator } from '@/services/simulator';
import { complaintService, projectService } from '@/services';
import { useNavigate } from 'react-router-dom';

export default function DashboardHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, avg_resolution_time: 'N/A' });
  const [categoryChart, setCategoryChart] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // Project Modal State
  const [selectedProject, setSelectedProject] = useState(null);
  const [verifyFeedback, setVerifyFeedback] = useState('');
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch real analytics
    complaintService.getAnalytics().then(res => {
      if (res.stats) setStats(res.stats);
      if (res.charts) setCategoryChart(res.charts.category_distribution);
    }).catch(err => console.error("Failed to load analytics", err));
    
    // Fetch recent complaints for map/feed
    complaintService.getMyComplaints().then(res => {
      setRecentComplaints(res.data.slice(0, 5));
    }).catch(err => console.error("Failed to load recent complaints", err));

    // Fetch projects
    projectService.getProjects().then(res => {
      setProjects(res.items.slice(0, 5));
    }).catch(err => console.error("Failed to load projects", err));

    // Start demo mode simulation
    simulator.startDemoMode();

    const handleAlert = (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 5));
    };

    simulator.on('emergency_alert', handleAlert);

    return () => {
      simulator.off('emergency_alert', handleAlert);
      simulator.stopDemoMode();
    };
  }, []);

  const handleVerifySubmit = async () => {
    if (!verifyFeedback) return;
    setVerifyLoading(true);
    try {
      await projectService.verifyProject(selectedProject.id, verifyFeedback, verifyFile);
      // Refresh project
      const updated = await projectService.getProject(selectedProject.id);
      setSelectedProject(updated);
      setShowVerify(false);
      setVerifyFeedback('');
      setVerifyFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            {t('dashboard.welcome')}, {user?.full_name || 'Citizen'}!
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            {t('complaint.ward')}: {user?.ward || 'Anna Nagar West'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{t('dashboard.development_score')}</p>
            <p className="text-xl font-bold text-success-500">8.4 / 10</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-success-500 flex items-center justify-center bg-success-50 text-success-600 font-bold">
            A
          </div>
        </div>
      </div>

      {/* Emergency Alerts (Conditional) */}
      {alerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800" padding="p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-danger-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-danger-700 dark:text-danger-400 flex items-center gap-2">
                  {t('dashboard.emergency_alerts')}
                  <Badge color="danger" size="sm" dot>Live</Badge>
                </h3>
                <div className="mt-2 space-y-2">
                  {alerts.slice(0, 2).map(alert => (
                    <div key={alert.id} className="text-sm text-danger-600 dark:text-danger-300">
                      <strong>{t(`alerts_data.${alert.id}_title`, alert.title)}:</strong> {t(`alerts_data.${alert.id}_msg`, alert.message)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('dashboard.total_complaints')} value={stats.total.toString()} icon={Activity} color="primary" />
        <StatCard title={t('dashboard.resolved')} value={stats.resolved.toString()} icon={CheckCircle} color="success" />
        <StatCard title={t('dashboard.pending')} value={stats.pending.toString()} icon={TrendingUp} color="warning" />
        <StatCard title={t('dashboard.active_alerts')} value={alerts.length} icon={AlertTriangle} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Map & Projects */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="p-0" className="overflow-hidden">
            <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
              <h2 className="font-semibold">{t('dashboard.nearby_complaints')}</h2>
              <Button variant="ghost" size="sm">{t('common.view_all')}</Button>
            </div>
            <MapContainer center={[13.0850, 80.2100]} zoom={13} className="h-[400px] rounded-none border-0">
              {recentComplaints.filter(c => c.latitude && c.longitude).map(c => (
                <Marker key={c.id} position={[c.latitude, c.longitude]}>
                  <Popup>
                    <div className="font-semibold">{c.title}</div>
                    <div className="text-xs text-gray-500">{c.category_name || 'Issue'}</div>
                    <Badge color="warning" size="sm" className="mt-1">{t(`complaint.status.${c.status.toUpperCase()}`, c.status)}</Badge>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Card>

          <Card title={t('dashboard.ongoing_projects')}>
             <h2 className="font-semibold mb-4">{t('dashboard.ongoing_projects')}</h2>
             <div className="space-y-4">
               {projects.map(project => (
                 <div key={project.id} className="p-4 rounded-xl border border-border-light dark:border-border-dark">
                   <div className="flex justify-between items-start mb-2">
                     <div>
                       <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark">{project.name}</h3>
                       <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{project.department_name}</p>
                     </div>
                     <Badge color={project.status === 'delayed' ? 'danger' : 'primary'}>{t(`projects.status.${project.status}`, project.status)}</Badge>
                   </div>
                   <div className="mt-3 mb-3">
                     <div className="flex justify-between text-xs mb-1">
                       <span>{t('projects.progress')}</span>
                       <span>{project.progress_percentage}%</span>
                     </div>
                     <div className="w-full bg-surface-light dark:bg-surface-dark rounded-full h-2">
                       <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${project.progress_percentage}%` }}></div>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <Button variant="primary" size="sm" className="flex-1" onClick={() => {
                       projectService.getProject(project.id).then(res => {
                         setSelectedProject(res);
                         setShowVerify(false);
                       });
                     }}>{t('projects.details')}</Button>
                   </div>
                 </div>
               ))}
             </div>
          </Card>
        </div>

        {/* Right Column: Recent Activity & Quick Actions */}
        <div className="space-y-6">
          <Card className="gradient-primary text-white border-0">
            <h2 className="font-semibold mb-4 text-white">{t('dashboard.quick_actions')}</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="w-full flex-col h-auto py-3 gap-2" onClick={() => navigate('/complaints/raise')}>
                <PlusCircle className="w-6 h-6 text-primary-600" />
                <span className="text-xs">{t('dashboard.new_complaint')}</span>
              </Button>
              <Button variant="secondary" className="w-full flex-col h-auto py-3 gap-2" onClick={() => navigate('/complaints')}>
                <Clock className="w-6 h-6 text-primary-600" />
                <span className="text-xs">{t('dashboard.track_status')}</span>
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold mb-4">{t('dashboard.recent_activity')}</h2>
            <div className="relative border-l border-border-light dark:border-border-dark ml-3 space-y-6">
              {recentComplaints.map((c, i) => (
                <div key={c.id} className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-primary-500 rounded-full -left-[6.5px] top-1.5 border-2 border-white dark:border-surface-card-dark"></div>
                  <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{c.title}</p>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">{t('dashboard.status_changed_to')} <span className="font-medium">{t(`complaint.status.${c.status.toUpperCase()}`)}</span></p>
                  <p className="text-[10px] text-text-secondary-light/70 mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-light dark:bg-surface-dark border border-white/20 shadow-glass rounded-2xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                <p className="text-sm text-gray-500">{selectedProject.department_name}</p>
              </div>
              <Badge color="primary">{selectedProject.status}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="block text-gray-500">{t('projects.contractor')}</span>
                <span className="font-semibold">{selectedProject.contractor_name}</span>
              </div>
              <div>
                <span className="block text-gray-500">{t('projects.budget')}</span>
                <span className="font-semibold">₹{selectedProject.budget?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-gray-500">{t('projects.description')}</span>
                <p>{selectedProject.description}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">{t('projects.timeline')}</h3>
              <div className="space-y-3">
                {selectedProject.progress_updates.map((update, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold">{update.milestone || t('projects.update')}</span>
                      <span>{new Date(update.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm">{update.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('projects.by')}: {update.updated_by_name} • {t('projects.progress')}: {update.percentage}%</p>
                    {update.attachment_url && (
                      <a href={update.attachment_url} target="_blank" rel="noreferrer" className="text-xs text-primary-500 hover:underline mt-1 block">{t('projects.view_attachment')}</a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {!showVerify ? (
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setSelectedProject(null)}>{t('projects.close')}</Button>
                <Button variant="primary" className="flex-1" onClick={() => setShowVerify(true)}>{t('projects.verify_work')}</Button>
              </div>
            ) : (
              <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-200 dark:border-primary-800">
                <h3 className="font-semibold mb-2">{t('projects.submit_verification')}</h3>
                <textarea 
                  className="w-full p-2 mb-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                  rows="3" 
                  placeholder={t('projects.feedback_placeholder')}
                  value={verifyFeedback}
                  onChange={e => setVerifyFeedback(e.target.value)}
                />
                <input 
                  type="file" 
                  accept="image/*"
                  className="mb-4 text-sm w-full"
                  onChange={e => setVerifyFile(e.target.files[0])}
                />
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => setShowVerify(false)}>{t('projects.cancel')}</Button>
                  <Button variant="primary" className="flex-1" loading={verifyLoading} onClick={handleVerifySubmit}>{t('projects.submit_feedback')}</Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
