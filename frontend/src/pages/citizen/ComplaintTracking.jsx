/**
 * Nam Nadu — Complaint Tracking Page
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, MessageSquare, CheckCircle, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import { Card, Badge, Input, Button } from '@/components/ui';
import { complaintService } from '@/services';
import { useNotifications } from '@/context';

export default function ComplaintTracking() {
  const { t } = useTranslation();
  const { showToast } = useNotifications();
  
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reopenLoading, setReopenLoading] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [showReopen, setShowReopen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Status mappings for timeline
  const timelineStages = [
    { key: 'SUBMITTED', label: t('complaint.status.SUBMITTED') },
    { key: 'UNDER_REVIEW', label: t('complaint.status.UNDER_REVIEW') },
    { key: 'ASSIGNED', label: t('complaint.status.ASSIGNED') },
    { key: 'WORK_STARTED', label: t('complaint.status.WORK_STARTED') },
    { key: 'IN_PROGRESS', label: t('complaint.status.IN_PROGRESS') },
    { key: 'INSPECTION_PENDING', label: t('complaint.status.INSPECTION_PENDING') },
    { key: 'CITIZEN_VERIFICATION', label: t('complaint.status.CITIZEN_VERIFICATION') },
    { key: 'COMPLETED', label: t('complaint.status.COMPLETED') },
  ];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getMyComplaints();
      setComplaints(res.data);
      if (res.data.length > 0) {
        handleSelectComplaint(res.data[0]);
      }
    } catch (error) {
      showToast('Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchComplaints();
      return;
    }
    setLoading(true);
    try {
      const res = await complaintService.trackComplaint(searchQuery.trim());
      setComplaints([res]);
      handleSelectComplaint(res);
    } catch (error) {
      showToast(t('complaint.not_found'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectComplaint = async (complaint) => {
    setSelectedComplaint(complaint);
    setShowReopen(false);
    setReopenReason('');
    
    try {
      const logs = await complaintService.getTimeline(complaint.id);
      
      // Compute timeline state based on logs and current status
      // Real app might have more complex logic to map logs exactly to stages
      
      const currentStatusIndex = timelineStages.findIndex(s => s.key.toLowerCase() === complaint.status.toLowerCase());
      
      const constructedTimeline = timelineStages.map((stage, idx) => {
        // Find log matching this stage loosely or fallback
        const matchingLog = logs.find(l => l.action_type.toLowerCase() === stage.key.toLowerCase());
        
        let done = false;
        let current = false;
        
        if (complaint.status.toLowerCase() === 'reopened') {
          // If reopened, everything before REOPEN is done, but let's just mark SUBMITTED as done for simplicity
          done = idx === 0;
          current = idx === 1;
        } else {
          done = idx < currentStatusIndex || complaint.status.toLowerCase() === 'completed';
          current = idx === currentStatusIndex && complaint.status.toLowerCase() !== 'completed';
        }

        return {
          status: stage.label,
          date: matchingLog ? new Date(matchingLog.created_at).toLocaleString() : '',
          user: matchingLog ? matchingLog.user_name : '',
          done,
          current
        };
      });
      
      // If reopened, append a special reopen stage
      if (complaint.status.toLowerCase() === 'reopened') {
        const reopenLog = logs.find(l => l.action_type.toLowerCase() === 'reopened');
        constructedTimeline.splice(1, 0, {
          status: t('complaint.status.REOPENED'),
          date: reopenLog ? new Date(reopenLog.created_at).toLocaleString() : '',
          done: true,
          current: false,
          user: 'You'
        });
      }

      setTimeline(constructedTimeline);
    } catch (error) {
      console.error(error);
      showToast('Failed to load timeline', 'error');
    }
  };

  const handleReopen = async () => {
    if (!reopenReason || reopenReason.length < 10) {
      showToast('Please provide a valid reason (min 10 characters)', 'error');
      return;
    }
    
    setReopenLoading(true);
    try {
      await complaintService.reopen(selectedComplaint.id, reopenReason);
      showToast('Complaint reopened successfully', 'success');
      fetchComplaints();
    } catch (error) {
      showToast(error?.response?.data?.detail || 'Failed to reopen complaint', 'error');
    } finally {
      setReopenLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            {t('complaint.track_title')}
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
            {t('complaint.track_description')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              icon={Search} 
              placeholder={t('complaint.search_placeholder')} 
              className="flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="primary" className="px-4" onClick={handleSearch}>{t('nav.track')}</Button>
            <Button variant="secondary" icon={Filter} className="px-3" />
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <p className="text-sm text-center text-gray-500 py-10">{t('complaint.loading')}</p>
            ) : complaints.length === 0 ? (
              <p className="text-sm text-center text-gray-500 py-10">{t('complaint.no_complaints')}</p>
            ) : complaints.map(c => (
              <Card 
                key={c.id} 
                padding="p-4" 
                className={`cursor-pointer transition-colors ${selectedComplaint?.id === c.id ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                onClick={() => handleSelectComplaint(c)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-primary-600 dark:text-primary-400 font-bold">{c.complaint_number || `#CMP-${c.id}`}</span>
                  <Badge color={c.status === 'in_progress' ? 'primary' : c.status === 'completed' ? 'success' : c.status === 'reopened' ? 'danger' : 'default'} size="sm">
                    {t(`complaint.status.${c.status.toUpperCase()}`)}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm line-clamp-1">{c.title}</h3>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Details */}
        <div className="lg:col-span-2">
          {selectedComplaint ? (
            <Card padding="p-0" className="overflow-hidden">
              <div className="p-6 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{selectedComplaint.title}</h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      <Badge color="default">{selectedComplaint.category_name || 'General'}</Badge>
                      <span>•</span>
                      <span>{selectedComplaint.location_string || 'Location Auto-Detected'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge color={selectedComplaint.priority === 'urgent' ? 'danger' : 'warning'}>
                      {selectedComplaint.priority} priority
                    </Badge>
                    {selectedComplaint.is_draft && (
                      <Badge color="default">DRAFT</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Timeline */}
                <div>
                  <h3 className="font-semibold mb-4">{t('complaint.status_timeline')}</h3>
                  <div className="relative border-l-2 border-border-light dark:border-border-dark ml-3 space-y-6">
                    {timeline.map((item, idx) => (
                      <div key={idx} className={`relative pl-6 ${!item.done && !item.current && 'opacity-50'}`}>
                        <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 border-2 border-white dark:border-surface-card-dark ${item.current ? 'bg-primary-500 ring-4 ring-primary-100 dark:ring-primary-900' : item.done ? 'bg-success-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        <p className={`text-sm font-semibold ${item.current ? 'text-primary-600 dark:text-primary-400' : 'text-text-primary-light dark:text-text-primary-dark'}`}>{item.status}</p>
                        {item.user && <p className="text-xs text-text-secondary-light mt-0.5">{t('projects.by')}: {item.user}</p>}
                        {item.date && <p className="text-[10px] text-text-secondary-light mt-1">{item.date}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="space-y-6">
                  {selectedComplaint.media && selectedComplaint.media.length > 0 && (
                    <div>
                       <h4 className="text-sm font-semibold mb-3">{t('complaint.attached_media')}</h4>
                       <div className="grid grid-cols-2 gap-2">
                         {selectedComplaint.media.map(m => (
                           <a key={m.id} href={m.file_url} target="_blank" rel="noreferrer" className="block w-full h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-border-light dark:border-border-dark flex items-center justify-center relative">
                             {m.media_type === 'image' ? (
                               <img src={m.file_url} className="w-full h-full object-cover" alt="attachment" />
                             ) : (
                               <div className="text-xs font-semibold text-gray-500">[{m.media_type.toUpperCase()}]</div>
                             )}
                           </a>
                         ))}
                       </div>
                    </div>
                  )}

                  {selectedComplaint.status.toLowerCase() === 'completed' && !showReopen && (
                    <Button variant="danger" className="w-full" icon={RotateCcw} onClick={() => setShowReopen(true)}>
                      {t('complaint.reopen_complaint')}
                    </Button>
                  )}

                  {showReopen && (
                    <div className="space-y-3 bg-danger-50 dark:bg-danger-900/10 p-4 rounded-xl border border-danger-200 dark:border-danger-800/30">
                      <h4 className="text-sm font-bold text-danger-700 dark:text-danger-400">{t('complaint.reopen_complaint')}</h4>
                      <p className="text-xs text-danger-600 dark:text-danger-300">{t('complaint.reopen_warning')}</p>
                      <Input 
                        placeholder={t('complaint.reopen_placeholder')} 
                        value={reopenReason}
                        onChange={(e) => setReopenReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button variant="secondary" className="flex-1" onClick={() => setShowReopen(false)}>{t('common.cancel')}</Button>
                        <Button variant="danger" className="flex-1" loading={reopenLoading} onClick={handleReopen}>{t('complaint.confirm_reopen')}</Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Citizen verification button removed because it lacks backend API */}
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-text-secondary-light">
              {!loading && t('complaint.select_to_view')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
