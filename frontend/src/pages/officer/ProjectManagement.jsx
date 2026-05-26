/**
 * Nam Nadu — Project Management (Officer)
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Card, Badge, Button, Table, Modal, Select, Input, Textarea } from '@/components/ui';
import { officerService } from '@/services/officer.service';

export default function ProjectManagement() {
  const { t } = useTranslation();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', percentage: 0, comment: '' });
  const [updating, setUpdating] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await officerService.getProjects();
      setProjects(res.data || []);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenModal = (project) => {
    setSelectedProject(project);
    setUpdateData({
      status: project.status,
      percentage: project.progress_percentage || 0,
      comment: ''
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedProject) return;
    try {
      setUpdating(true);
      await officerService.updateProject(selectedProject.id, {
        status: updateData.status,
        percentage: parseFloat(updateData.percentage),
        comment: updateData.comment
      });
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error('Failed to update project', error);
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', render: (val) => <span className="font-mono text-xs text-text-secondary-light">#PRJ-{val}</span> },
    { key: 'name', header: 'Project Details', render: (val, row) => (
      <div>
        <p className="font-medium text-text-primary-light dark:text-text-primary-dark">{val}</p>
        <p className="text-xs text-text-secondary-light">{row.ward} • {row.contractor_name}</p>
      </div>
    ) },
    { key: 'budget', header: t('projects.budget'), render: (val) => `₹${((val||0)/10000000).toFixed(1)} Cr` },
    { key: 'progress_percentage', header: t('projects.progress'), render: (val, row) => (
      <div className="w-full max-w-[150px]">
        <div className="flex justify-between text-xs mb-1">
          <span>{val}%</span>
        </div>
        <div className="w-full bg-surface-light dark:bg-surface-dark rounded-full h-1.5">
          <div className={`h-1.5 rounded-full ${row.status === 'delayed' ? 'bg-danger-500' : 'bg-primary-500'}`} style={{ width: `${val}%` }}></div>
        </div>
      </div>
    ) },
    { key: 'status', header: 'Status', render: (val) => (
      <Badge color={val === 'delayed' ? 'danger' : val === 'in_progress' ? 'primary' : val === 'completed' ? 'success' : 'warning'}>
        {val.replace('_', ' ')}
      </Badge>
    )},
    { key: 'actions', header: '', render: (_, row) => <Button variant="ghost" size="sm" icon={ArrowRight} onClick={() => handleOpenModal(row)} /> }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          {t('officer.project_management')}
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
          {t('officer.project_management_desc')}
        </p>
      </div>

      <Card padding="p-0">
        {loading ? (
          <div className="p-8 text-center text-text-secondary-light">Loading projects...</div>
        ) : (
          <Table columns={columns} data={projects} />
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Update Project #PRJ-${selectedProject?.id}`}
      >
        {selectedProject && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">{selectedProject.name}</h3>
              <p className="text-sm text-text-secondary-light">{selectedProject.ward} • Budget: ₹{((selectedProject.budget||0)/10000000).toFixed(1)} Cr</p>
            </div>
            
            <Select 
              label="Update Status"
              value={updateData.status}
              onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
              options={[
                { value: 'proposed', label: 'Proposed' },
                { value: 'approved', label: 'Approved' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'on_hold', label: 'On Hold' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />

            <Input 
              label="Progress Percentage (%)"
              type="number"
              min="0"
              max="100"
              value={updateData.percentage}
              onChange={(e) => setUpdateData({...updateData, percentage: e.target.value})}
            />

            <Textarea 
              label="Progress Note / Milestone"
              placeholder="Describe the update..."
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
