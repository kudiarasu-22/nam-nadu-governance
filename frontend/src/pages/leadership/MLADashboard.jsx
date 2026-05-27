/**
 * Nam Nadu — MLA Dashboard (Isolated for specific Ward/Constituency)
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, StatCard, Badge, Button } from '@/components/ui';
import { leadershipService } from '@/services/leadership.service';
import { 
  Shield, TrendingUp, Users, Activity, CheckCircle2, AlertTriangle, 
  MapPin, UserCheck, Star, Megaphone, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '@/components/ui/Input';


export default function MLADashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newAlert, setNewAlert] = useState({ title: '', description: '', severity: 'high', area: '' });
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profData, perfData, compData, projData, alertsData] = await Promise.all([
          leadershipService.getProfile(),
          leadershipService.getPerformance(),
          leadershipService.getComplaints(),
          leadershipService.getProjects(),
          leadershipService.getAlerts()
        ]);
        setProfile(profData);
        setPerformance(perfData);
        setComplaints(compData);
        setProjects(projData);
        setAlerts(alertsData);
      } catch (err) {
        console.error('Failed to fetch MLA data', err);
        setError('Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-text-secondary-light">Loading MLA secure data...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }

  // Calculate metrics from complaints
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === 'completed').length;
  const pendingComplaints = totalComplaints - resolvedComplaints;

  const complaintStatusData = [
    { name: 'Resolved', value: resolvedComplaints, color: '#43a047' },
    { name: 'Pending', value: pendingComplaints, color: '#f59e0b' },
  ];

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const created = await leadershipService.createAlert(newAlert);
      setAlerts([created, ...alerts]);
      setNewAlert({ title: '', description: '', severity: 'high', area: '' });
      setIsCreatingAlert(false);
    } catch (err) {
      console.error('Failed to create alert', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-accent-900 to-accent-700 p-6 rounded-2xl border border-accent-600/30 shadow-elevated">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider">Constituency Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Welcome, {profile?.name}
          </h1>
          <p className="text-accent-100 mt-1 text-sm md:text-base flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {user?.ward_name || `Ward ID: ${profile?.ward_id}`} — Exclusive access to your constituency's data.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/10">
          <div>
            <p className="text-xs text-accent-100 uppercase tracking-widest font-bold">Party</p>
            <p className="text-white font-extrabold">{profile?.political_party}</p>
          </div>
          <div className="h-8 w-px bg-white/20 mx-2"></div>
          <div>
            <p className="text-xs text-accent-100 uppercase tracking-widest font-bold">Performance</p>
            <p className="text-white font-extrabold">{performance?.performance_label}</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Overall Score" value={`${performance?.overall_score}/10`} subtitle="Performance Index" icon={Star} color="accent" />
        <StatCard title="Citizen Satisfaction" value={`${performance?.citizen_satisfaction_score}/10`} subtitle="Direct feedback" trend="up" icon={Users} color="success" />
        <StatCard title="Grievances Resolved" value={`${performance?.complaint_resolution_percent}%`} subtitle={`${resolvedComplaints} completed`} icon={CheckCircle2} color="primary" />
        <StatCard title="Escalations" value={performance?.escalation_count} subtitle="Needs immediate attention" icon={AlertTriangle} color="danger" />
      </div>

      {/* Charts & Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Complaints Chart */}
        <Card className="lg:col-span-1">
          <div className="mb-4">
            <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Constituency Grievances</h2>
            <p className="text-xs text-text-secondary-light">Status of complaints in your ward.</p>
          </div>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complaintStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complaintStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-0">
              <span className="text-2xl font-black text-text-primary-light dark:text-text-primary-dark">{totalComplaints}</span>
              <span className="text-[10px] text-text-secondary-light uppercase tracking-wider font-bold">Total</span>
            </div>
          </div>
        </Card>

        {/* Projects List */}
        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Active Infrastructure Projects</h2>
            <p className="text-xs text-text-secondary-light">Monitoring on-ground developments in your ward.</p>
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {projects.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No projects found for your ward.</p>
            ) : (
              projects.map(proj => (
                <div key={proj.id} className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-white/40 dark:bg-surface-card-dark/40 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark text-sm">{proj.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary-light">
                      <span className="font-semibold text-primary-600 dark:text-primary-400">₹{(proj.budget/100000).toFixed(2)} Lakhs</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge color={proj.status === 'completed' ? 'success' : 'primary'}>{proj.status}</Badge>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold">{proj.progress}%</span>
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${proj.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Emergency Alerts Module */}
      <Card className="mt-6 border-danger-200 dark:border-danger-900/30">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-light dark:border-border-dark">
          <div>
            <h2 className="font-bold text-lg text-danger-600 flex items-center gap-2">
              <Megaphone className="w-5 h-5" /> Emergency Alerts
            </h2>
            <p className="text-xs text-text-secondary-light">Broadcast urgent issues directly to active officers in your ward.</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setIsCreatingAlert(!isCreatingAlert)}>
            {isCreatingAlert ? 'Cancel' : <><Plus className="w-4 h-4 mr-1" /> Raise Alert</>}
          </Button>
        </div>

        <AnimatePresence>
          {isCreatingAlert && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleCreateAlert} className="bg-danger-50 dark:bg-danger-900/10 p-4 rounded-xl border border-danger-200 dark:border-danger-800 mb-6 space-y-4">
                <Input 
                  label="Alert Title" 
                  value={newAlert.title} 
                  onChange={e => setNewAlert({...newAlert, title: e.target.value})} 
                  required 
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-text-secondary-light uppercase tracking-wider">Description</label>
                  <textarea 
                    className="w-full rounded-xl bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark px-4 py-3 focus:outline-none focus:ring-2 focus:ring-danger-500/50"
                    rows="3"
                    value={newAlert.description}
                    onChange={e => setNewAlert({...newAlert, description: e.target.value})}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="danger">Broadcast to Officers</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No active alerts.</p>
          ) : (
            alerts.map(a => (
              <div key={a.id} className="p-4 rounded-xl border border-danger-100 bg-white shadow-sm flex items-start gap-4">
                <div className="p-2 bg-danger-100 text-danger-600 rounded-full">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-danger-700">{a.title}</h4>
                  <p className="text-sm text-text-secondary-light mt-1">{a.description}</p>
                  <p className="text-xs font-semibold text-danger-500 mt-2">Broadcasted on {new Date(a.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

    </div>
  );
}
