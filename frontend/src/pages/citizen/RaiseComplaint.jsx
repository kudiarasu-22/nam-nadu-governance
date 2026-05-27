/**
 * Nam Nadu — Raise Complaint Page
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, MapPin, Mic, Send, AlertCircle, Save, X, File as FileIcon } from 'lucide-react';
import { Card, Button, Input, Select, Textarea } from '@/components/ui';
import { LocationPicker } from '@/components/maps';
import { MAP_DEFAULTS } from '@/constants';
import { useNotifications } from '@/context';
import { masterService, complaintService } from '@/services';

export default function RaiseComplaint() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(false);
  
  const [form, setForm] = useState({
    categoryId: '',
    title: '',
    description: '',
    severity: 'medium',
    location: MAP_DEFAULTS.CENTER,
    districtId: '',
    wardId: '',
    areaId: '',
    locationDetailId: '',
    fallbackLandmark: ''
  });

  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [areas, setAreas] = useState([]);
  const [locationDetails, setLocationDetails] = useState([]);
  
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  console.log("RaiseComplaint rendered/mounted");

  useEffect(() => {
    console.log("RaiseComplaint initial useEffect fired");
    console.log("Calling getCategories...");
    masterService.getCategories().then(data => {
      setCategories(data.map(c => ({ value: c.id, label: c.name })));
    }).catch(err => {
      console.error(err);
      showToast('Failed to load categories', 'error');
    });
    console.log("Calling getDistricts...");
    masterService.getDistricts().then(data => {
      console.log("getDistricts success", data);
      setDistricts(data.map(d => ({ value: d.id, label: d.name })));
    }).catch(err => {
      console.error(err);
      showToast('Failed to load districts', 'error');
    });
  }, []);

  useEffect(() => {
    if (form.districtId) {
      console.log(`Calling getWards for districtId: ${form.districtId}...`);
      masterService.getWards(form.districtId).then(data => {
        setWards(data.map(w => ({ value: w.id, label: `${w.ward_number} - ${w.ward_name || ''}` })));
        setForm(f => ({ ...f, wardId: '', areaId: '', locationDetailId: '' }));
      }).catch(err => {
        console.error(err);
        showToast('Failed to load wards', 'error');
      });
    } else {
      setWards([]);
    }
  }, [form.districtId]);

  useEffect(() => {
    if (form.wardId) {
      console.log(`Calling getAreas for wardId: ${form.wardId}...`);
      masterService.getAreas(form.wardId).then(data => {
        setAreas(data.map(a => ({ value: a.id, label: a.name })));
        setForm(f => ({ ...f, areaId: '', locationDetailId: '' }));
      }).catch(err => {
        console.error(err);
        showToast('Failed to load areas', 'error');
      });
    } else {
      setAreas([]);
    }
  }, [form.wardId]);

  useEffect(() => {
    if (form.areaId) {
      console.log(`Calling getLocationDetails for areaId: ${form.areaId}...`);
      masterService.getLocationDetails(form.areaId).then(data => {
        setLocationDetails(data.map(l => ({ value: l.id, label: l.street_name || l.landmark })));
        setForm(f => ({ ...f, locationDetailId: '' }));
      }).catch(err => {
        console.error(err);
        showToast('Failed to load location details', 'error');
      });
    } else {
      setLocationDetails([]);
    }
  }, [form.areaId]);

  const severities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const handleLocationDetect = () => {
    if (navigator.geolocation) {
      showToast('Detecting location...', 'info');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          try {
            const data = await masterService.detectLocation(lat, lng);
            if (data.district) {
              const fetchedWards = await masterService.getWards(data.district.id);
              setWards(fetchedWards.map(w => ({ value: w.id, label: `${w.ward_number} - ${w.ward_name || ''}` })));
            }
            if (data.ward) {
              const fetchedAreas = await masterService.getAreas(data.ward.id);
              setAreas(fetchedAreas.map(a => ({ value: a.id, label: a.name })));
            }
            if (data.area) {
              const fetchedLocs = await masterService.getLocationDetails(data.area.id);
              setLocationDetails(fetchedLocs.map(l => ({ value: l.id, label: l.street_name || l.landmark })));
            }
            setForm({ 
              ...form, 
              location: [lat, lng],
              districtId: data.district?.id || '',
              wardId: data.ward?.id || '',
              areaId: data.area?.id || '',
              locationDetailId: data.location_detail?.id || ''
            });
            showToast('Location auto-filled successfully', 'success');
          } catch (error) {
            showToast('Could not auto-detect nearest ward/area', 'error');
            setForm({ ...form, location: [lat, lng] });
          }
        },
        () => showToast('Failed to get GPS coordinates. Please select on map.', 'error')
      );
    }
  };

  const simulateDuplicateCheck = (desc) => {
    if (desc.length > 20) {
      setDuplicateCheck(true);
      setTimeout(() => setDuplicateCheck(false), 2000);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
      const maxSize = 50 * 1024 * 1024; // 50MB
      
      const validFiles = newFiles.filter(f => {
        if (!allowedTypes.includes(f.type)) {
          showToast(`${f.name} is not a supported format.`, 'error');
          return false;
        }
        if (f.size > maxSize) {
          showToast(`${f.name} exceeds 50MB limit.`, 'error');
          return false;
        }
        return true;
      });
      
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const submitComplaint = async (isDraft) => {
    if (isDraft) setDraftLoading(true);
    else setLoading(true);
    
    try {
      const payload = {
        category_id: form.categoryId || 1, // Fallbacks for drafts
        district_id: form.districtId || 1,
        ward_id: form.wardId || 1,
        area_id: form.areaId || 1,
        location_detail_id: form.locationDetailId === 'other' ? null : (form.locationDetailId || null),
        fallback_landmark: form.fallbackLandmark || '',
        title: form.title || 'Draft Complaint',
        description: form.description || 'Draft Description',
        latitude: form.location[0],
        longitude: form.location[1],
        severity: form.severity
      };

      const complaint = await complaintService.create(payload, isDraft);
      
      // Upload files
      for (const file of files) {
        await complaintService.uploadMedia(complaint.id, file);
      }
      
      showToast(isDraft ? 'Complaint saved as draft' : `Complaint submitted successfully! Ticket: ${complaint.complaint_number}`, 'success', 6000);
      setForm({ 
        categoryId: '', title: '', description: '', severity: 'medium', 
        location: MAP_DEFAULTS.CENTER,
        districtId: '', wardId: '', areaId: '', locationDetailId: '', fallbackLandmark: ''
      });
      setFiles([]);
      if (!isDraft) {
        navigate('/complaints');
      }
    } catch (error) {
      showToast(error?.response?.data?.detail || 'An error occurred', 'error');
    } finally {
      setLoading(false);
      setDraftLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          {t('complaint.raise')}
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
          {t('complaint.raise_description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={e => { e.preventDefault(); submitComplaint(false); }} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Select 
                  label={t('complaint.district')} 
                  options={districts.map(d => ({...d, label: t(`location.${d.label.replace(/ /g, '_').toLowerCase()}`, d.label)}))}
                  placeholder={t('common.select')}
                  value={form.districtId}
                  onChange={e => setForm({...form, districtId: e.target.value})}
                  required
                />
                <Select 
                  label={t('complaint.ward')} 
                  options={wards}
                  placeholder={t('common.select')}
                  value={form.wardId}
                  onChange={e => setForm({...form, wardId: e.target.value})}
                  required
                  disabled={!form.districtId}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Select 
                  label={t('complaint.area')} 
                  options={areas}
                  placeholder={t('common.select')}
                  value={form.areaId}
                  onChange={e => setForm({...form, areaId: e.target.value})}
                  required
                  disabled={!form.wardId}
                />
                <Select 
                  label={t('complaint.street')} 
                  options={[...locationDetails, {value: 'other', label: t('complaint.other_landmark')}]}
                  placeholder={t('common.select')}
                  value={form.locationDetailId}
                  onChange={e => setForm({...form, locationDetailId: e.target.value})}
                  required
                  disabled={!form.areaId}
                />
              </div>

              {form.locationDetailId === 'other' && (
                <Input 
                  label={t('complaint.manual_landmark')} 
                  placeholder={t('complaint.manual_landmark_placeholder')}
                  value={form.fallbackLandmark}
                  onChange={e => setForm({...form, fallbackLandmark: e.target.value})}
                  required
                />
              )}

              <Select 
                label={t('complaint.category')} 
                options={categories.map(c => ({...c, label: t(`categories.${c.label.replace(/ /g, '_').toLowerCase()}`, c.label)}))}
                placeholder={t('common.select')}
                value={form.categoryId}
                onChange={e => setForm({...form, categoryId: e.target.value})}
                required
              />
              
              <Input 
                label={t('complaint.title')} 
                placeholder={t('complaint.title_placeholder')}
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                required
              />

              <div className="space-y-1.5">
                <Textarea 
                  label={t('complaint.description')} 
                  placeholder={t('complaint.desc_placeholder')}
                  rows={5}
                  value={form.description}
                  onChange={e => {
                    setForm({...form, description: e.target.value});
                    simulateDuplicateCheck(e.target.value);
                  }}
                  required
                />
                {duplicateCheck && (
                  <div className="flex items-center gap-2 text-xs text-warning-500 bg-warning-50 dark:bg-warning-900/20 p-2 rounded">
                    <AlertCircle className="w-4 h-4" />
                    <span>{t('complaint.duplicate_check')}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Select 
                  label={t('complaint.severity')} 
                  options={severities.map(s => ({...s, label: t(`complaint.severities.${s.value}`, s.label)}))}
                  value={form.severity}
                  onChange={e => setForm({...form, severity: e.target.value})}
                />
              </div>

              <div className="pt-4 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => submitComplaint(true)} loading={draftLoading} icon={Save}>
                  {t('complaint.save_draft')}
                </Button>
                <Button type="submit" loading={loading} icon={Send} iconPosition="right">
                  {t('complaint.submit')}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={t('complaint.location')} padding="p-0">
            <div className="p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-surface-light dark:bg-surface-dark/50">
              <h3 className="font-semibold text-sm">{t('complaint.pin_location')}</h3>
              <Button variant="ghost" size="sm" onClick={handleLocationDetect} icon={MapPin} className="text-xs py-1">
                {t('complaint.detect_location')}
              </Button>
            </div>
            <LocationPicker 
              position={form.location} 
              onPositionChange={(pos) => setForm({...form, location: pos})} 
              className="h-[250px] border-0 rounded-none rounded-b-xl"
            />
          </Card>

          <Card title={t('complaint.attachments')} padding="p-4">
            <h3 className="font-semibold text-sm mb-3">{t('complaint.media_attachments')}</h3>
            
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".jpg,.jpeg,.png,.pdf,.mp4" 
            />
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div 
                className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark mb-2" />
                <span className="text-xs font-medium text-primary-600">{t('complaint.upload_media')}</span>
              </div>
              <div className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer opacity-50">
                <Mic className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark mb-2" />
                <span className="text-xs font-medium text-primary-600">{t('complaint.record_voice')}</span>
                <span className="text-[10px] text-gray-500 mt-1">{t('common.coming_soon')}</span>
              </div>
            </div>
            
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-text-secondary-light">{t('complaint.selected_files')}</p>
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-surface-light dark:bg-surface-dark rounded border border-border-light dark:border-border-dark text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileIcon className="w-4 h-4 text-primary-500 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <button onClick={() => removeFile(idx)} className="text-danger-500 hover:bg-danger-50 p-1 rounded">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
          </Card>
        </div>
      </div>
    </div>
  );
}
