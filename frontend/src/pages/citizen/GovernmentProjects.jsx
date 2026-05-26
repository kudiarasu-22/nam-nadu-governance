/**
 * Nam Nadu — Government Projects Page
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HardHat, Camera, ThumbsUp, AlertTriangle, FileText } from 'lucide-react';
import { Card, Badge, Button, Modal, Textarea } from '@/components/ui';
import { MOCK_PROJECTS } from '@/mock';
import { PROJECT_STATUS } from '@/constants';

export default function GovernmentProjects() {
  const { t } = useTranslation();
  const [projects] = useState(MOCK_PROJECTS);
  const [verifyModal, setVerifyModal] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          {t('projects.title')}
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
          {t('projects.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map(project => (
          <Card key={project.id} className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Badge color={project.status === 'delayed' ? 'danger' : project.status === PROJECT_STATUS.ON_HOLD ? 'warning' : 'primary'} className="mb-2 uppercase text-[10px]">
                  {t(`projects.status.${project.status}`, project.status.replace('_', ' '))}
                </Badge>
                <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">{project.name}</h2>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{project.ward} • {project.department}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-secondary-light">{t('projects.trust_score')}</p>
                <div className="flex items-center gap-1 text-success-600 font-bold text-lg">
                  <ThumbsUp className="w-4 h-4" /> {project.trust_score}/10
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 bg-surface-light dark:bg-surface-dark p-4 rounded-xl">
              <div>
                <p className="text-xs text-text-secondary-light">{t('projects.budget')}</p>
                <p className="font-semibold">₹{(project.budget / 10000000).toFixed(1)} Cr</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary-light">{t('projects.contractor')}</p>
                <p className="font-semibold text-sm line-clamp-1">{project.contractor}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-text-secondary-light">{t('projects.expected_completion')}</p>
                <p className="font-semibold text-sm">{new Date(project.end_date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mb-6 flex-1">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>{t('projects.progress')}</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-surface-light dark:bg-surface-dark rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${project.status === 'delayed' ? 'bg-danger-500' : 'bg-primary-500'}`} 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-border-light dark:border-border-dark flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1" 
                icon={FileText}
                onClick={() => {}}
              >
                {t('projects.details')}
              </Button>
              <Button 
                variant="primary" 
                className="flex-1" 
                icon={Camera}
                onClick={() => setVerifyModal(project)}
              >
                {t('projects.verify_work')}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal 
        isOpen={!!verifyModal} 
        onClose={() => setVerifyModal(null)}
        title={t('projects.verify_title', { name: verifyModal?.name })}
      >
        <div className="space-y-4">
          <div className="bg-info-50 dark:bg-info-900/20 text-info-700 dark:text-info-300 p-3 rounded-lg text-sm flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{t('projects.verify_info')}</p>
          </div>

          <div className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-light dark:hover:bg-surface-dark transition-colors">
            <Camera className="w-8 h-8 text-text-secondary-light mb-3" />
            <p className="text-sm font-medium">{t('projects.upload_photos')}</p>
            <p className="text-xs text-text-secondary-light mt-1">{t('projects.upload_support')}</p>
          </div>

          <Textarea 
            label={t('projects.feedback_label')} 
            placeholder={t('projects.feedback_placeholder')}
            rows={4}
          />

          <Button className="w-full" onClick={() => setVerifyModal(null)}>{t('projects.submit_verification')}</Button>
        </div>
      </Modal>
    </div>
  );
}
