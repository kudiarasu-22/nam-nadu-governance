/**
 * Nam Nadu — Complaint Management (Officer)
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ArrowRight } from 'lucide-react';
import { Card, Table, Badge, Button, Input, Modal, Select, Textarea } from '@/components/ui';
import { officerService } from '@/services/officer.service';
import { COMPLAINT_STATUS } from '@/constants';

export default function ComplaintManagement() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', priority: '', comment: '' });
  const [updating, setUpdating] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await officerService.getComplaints();
      setComplaints(res.data || []);
    } catch (error) {
      console.error('Failed to fetch complaints', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleOpenModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateData({
      status: complaint.status,
      priority: complaint.priority,
      comment: ''
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedComplaint) return;
    try {
      setUpdating(true);
      await officerService.updateComplaint(selectedComplaint.id, updateData);
      setIsModalOpen(false);
      fetchComplaints();
    } catch (error) {
      console.error('Failed to update complaint', error);
    } finally {
      setUpdating(false);
    }
  };

  const filteredData = complaints.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toString().includes(searchTerm);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const columns = [
    { 
      key: 'id', 
      header: 'ID',
      render: (val) => <span className="font-mono text-xs">#CMP-{val}</span>
    },
    { key: 'title', header: 'Complaint Details', render: (val, row) => (
      <div>
        <p className="font-medium">{val}</p>
        <p className="text-xs text-text-secondary-light">{row.location}</p>
      </div>
    ) },
    { key: 'category', header: 'Category' },
    { key: 'priority', header: 'Priority', render: (val) => (
      <Badge color={val === 'urgent' ? 'danger' : val === 'high' ? 'warning' : 'primary'}>{val}</Badge>
    )},
    { key: 'status', header: 'Status', render: (val) => (
      <Badge color={val === COMPLAINT_STATUS.COMPLETED ? 'success' : val === COMPLAINT_STATUS.IN_PROGRESS ? 'primary' : 'warning'}>
        {val.replace('_', ' ')}
      </Badge>
    )},
    { key: 'actions', header: '', render: (_, row) => (
      <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => handleOpenModal(row)} />
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            {t('officer.complaint_management')}
          </h1>
        </div>
      </div>

      <Card padding="p-0" className="overflow-hidden">
        <div className="p-4 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row gap-4 bg-surface-light dark:bg-surface-dark/50">
          <Input 
            icon={Search} 
            placeholder={t('officer.search_placeholder')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <Button variant={filterStatus === 'all' ? 'primary' : 'secondary'} onClick={() => setFilterStatus('all')}>{t('officer.all')}</Button>
            <Button variant={filterStatus === COMPLAINT_STATUS.PENDING ? 'primary' : 'secondary'} onClick={() => setFilterStatus(COMPLAINT_STATUS.PENDING)}>{t('officer.pending')}</Button>
            <Button variant={filterStatus === COMPLAINT_STATUS.ASSIGNED ? 'primary' : 'secondary'} onClick={() => setFilterStatus(COMPLAINT_STATUS.ASSIGNED)}>{t('officer.assigned')}</Button>
            <Button variant={filterStatus === COMPLAINT_STATUS.IN_PROGRESS ? 'primary' : 'secondary'} onClick={() => setFilterStatus(COMPLAINT_STATUS.IN_PROGRESS)}>{t('officer.in_progress')}</Button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-text-secondary-light">Loading complaints...</div>
        ) : (
          <Table 
            columns={columns}
            data={filteredData}
          />
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Update Complaint #CMP-${selectedComplaint?.id}`}
      >
        {selectedComplaint && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">{selectedComplaint.title}</h3>
              <p className="text-sm text-text-secondary-light">{selectedComplaint.description}</p>
            </div>
            
            <Select 
              label="Update Status"
              value={updateData.status}
              onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
              options={[
                { value: COMPLAINT_STATUS.ASSIGNED, label: 'Assigned' },
                { value: COMPLAINT_STATUS.WORK_STARTED, label: 'Work Started' },
                { value: COMPLAINT_STATUS.IN_PROGRESS, label: 'In Progress' },
                { value: COMPLAINT_STATUS.INSPECTION_PENDING, label: 'Inspection Pending' },
                { value: COMPLAINT_STATUS.CITIZEN_VERIFICATION, label: 'Citizen Verification' },
                { value: COMPLAINT_STATUS.COMPLETED, label: 'Completed' },
                { value: COMPLAINT_STATUS.REJECTED, label: 'Rejected' },
              ]}
            />

            <Select 
              label="Priority"
              value={updateData.priority}
              onChange={(e) => setUpdateData({...updateData, priority: e.target.value})}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />

            <Textarea 
              label="Add Remark / Comment"
              placeholder="Explain the update..."
              value={updateData.comment}
              onChange={(e) => setUpdateData({...updateData, comment: e.target.value})}
            />

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleUpdate} isLoading={updating}>Save Updates</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
