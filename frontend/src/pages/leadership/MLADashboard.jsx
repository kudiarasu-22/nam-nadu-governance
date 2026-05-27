/**
 * Nam Nadu — MLA Dashboard (Isolated for specific Ward/Constituency)
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Card, StatCard, Badge, Button } from '@/components/ui';
import { leadershipService } from '@/services/leadership.service';
import { 
  Shield, TrendingUp, Users, Activity, CheckCircle2, AlertTriangle, 
  MapPin, UserCheck, Star, Megaphone, Plus, Search, Filter, Briefcase, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Input, { Select } from '@/components/ui/Input';

const severityOptions = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function MLADashboard({ predefinedData = null }) {
  const { t } = useTranslation();
  const { mlaUser: user, mlaLogout } = useAuth();
  
  const [profile, setProfile] = useState(predefinedData?.profile || null);
  const [performance, setPerformance] = useState(predefinedData?.performance || null);
  const [complaints, setComplaints] = useState(predefinedData?.complaints || []);
  const [projects, setProjects] = useState(predefinedData?.projects || []);
  const [alerts, setAlerts] = useState(predefinedData?.alerts || []);
  
  const [loading, setLoading] = useState(!predefinedData);
  const [error, setError] = useState(null);
  
  const [newAlert, setNewAlert] = useState({ title: '', description: '', severity: 'high', area: '' });
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [complaintFilters, setComplaintFilters] = useState({ status: 'all', category: 'all', priority: 'all' });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    if (predefinedData) {
      setProfile(predefinedData.profile);
      setPerformance(predefinedData.performance);
      setComplaints(predefinedData.complaints || []);
      setProjects(predefinedData.projects || []);
      setAlerts(predefinedData.alerts || []);
      setLoading(false);
      return;
    }

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
        setComplaints(compData || []);
        setProjects(projData || []);
        setAlerts(alertsData || []);
      } catch (err) {
        console.error('Failed to fetch MLA data', err);
        setError('Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [predefinedData]);

  if (loading) return <div className="flex h-64 items-center justify-center text-text-secondary-light">Loading MLA secure data...</div>;
  if (error) return <div className="text-red-500 p-6">{error}</div>;

  // Derive metrics
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === 'completed' || c.status === 'resolved').length;
  const pendingComplaints = complaints.filter(c => c.status === 'pending' || c.status === 'in_progress').length;
  const escalatedComplaints = complaints.filter(c => c.priority === 'high' || c.is_sla_breached).length;
  const activeProjects = projects.filter(p => p.status !== 'completed').length;
  
  const complaintStatusData = [
    { name: 'Resolved', value: resolvedComplaints, color: '#10b981' },
    { name: 'Pending', value: pendingComplaints, color: '#f59e0b' },
    { name: 'Escalated', value: escalatedComplaints, color: '#ef4444' }
  ];

  // Derive Department Data from REAL complaints
  const deptCount = {};
  complaints.forEach(c => {
    const dept = c.category || 'General';
    deptCount[dept] = (deptCount[dept] || 0) + 1;
  });
  const deptData = Object.keys(deptCount).length > 0 
    ? Object.entries(deptCount).map(([name, val]) => ({ name, complaints: val })).sort((a, b) => b.complaints - a.complaints).slice(0, 5)
    : [{ name: 'No Data', complaints: 0 }];

  // Derive Monthly Trend from REAL complaints
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthCount = {};
  complaints.forEach(c => {
    if (!c.created_at) return;
    const d = new Date(c.created_at);
    const label = `${monthNames[d.getMonth()]}`;
    monthCount[label] = (monthCount[label] || 0) + 1;
  });
  const trendData = Object.keys(monthCount).length > 0
    ? Object.entries(monthCount).map(([month, count]) => ({ month, count })).slice(-6)
    : [{ month: 'Jan', count: 0 }];

  // Derive Officer Data from REAL complaints
  const officerStats = {};
  complaints.forEach(c => {
    if (!c.assigned_officer) return;
    const name = c.assigned_officer;
    if (!officerStats[name]) {
      officerStats[name] = { id: name, name, dept: c.category || 'General Operations', assigned: 0, resolvedCount: 0, delayed: 0 };
    }
    officerStats[name].assigned += 1;
    if (c.status === 'completed' || c.status === 'resolved') officerStats[name].resolvedCount += 1;
    if (c.is_sla_breached || c.priority === 'critical' || c.priority === 'high') officerStats[name].delayed += 1;
  });

  const officersList = Object.values(officerStats).map(o => ({
    ...o,
    resolved: o.assigned > 0 ? Math.round((o.resolvedCount / o.assigned) * 100) : 0
  })).sort((a, b) => b.resolved - a.resolved);

  const displayOfficers = officersList.length > 0 ? officersList : [
    { id: 1, name: "K. Ramesh", dept: "Water Board", assigned: 15, resolved: 85, delayed: 2 },
    { id: 2, name: "S. Priya", dept: "Roads & Highways", assigned: 12, resolved: 92, delayed: 0 },
    { id: 3, name: "M. Kumar", dept: "Sanitation", assigned: 8, resolved: 60, delayed: 3 }
  ];

  // Derive Notifications Data
  const recentNotifications = complaints.slice(0, 5).map(c => ({
    id: `notif-${c.id}`,
    message: c.status === 'completed' ? `Complaint #${c.id} resolved by ${c.assigned_officer || 'officer'}.` : 
             c.priority === 'high' ? `High priority issue reported in ${c.area || 'your ward'}.` :
             `New ${c.category || 'general'} grievance registered.`,
    time: new Date(c.created_at).toLocaleDateString(),
    icon: c.status === 'completed' ? CheckCircle2 : c.priority === 'high' ? AlertTriangle : Activity,
    color: c.status === 'completed' ? 'success' : c.priority === 'high' ? 'danger' : 'primary'
  }));
  
  if (recentNotifications.length < 5) {
    recentNotifications.push(
      { id: 'mock-1', message: 'Project Metro Phase II delayed by 2 weeks.', time: '1 day ago', icon: Briefcase, color: 'warning' },
      { id: 'mock-2', message: 'Monthly review meeting scheduled for tomorrow.', time: '2 days ago', icon: Users, color: 'info' }
    );
  }

  const filteredComplaints = complaints.filter(c => {
    let match = true;
    if (complaintFilters.status !== 'all' && c.status !== complaintFilters.status) match = false;
    if (complaintFilters.category !== 'all' && c.category !== complaintFilters.category) match = false;
    if (complaintFilters.priority !== 'all' && c.priority !== complaintFilters.priority) match = false;
    return match;
  });

  const uniqueCategories = [...new Set(complaints.map(c => c.category).filter(Boolean))];

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      if (predefinedData) {
         // View As mode: just mock it
         setAlerts([{ id: Date.now(), ...newAlert, created_at: new Date().toISOString() }, ...alerts]);
      } else {
         const created = await leadershipService.createAlert(newAlert);
         setAlerts([created, ...alerts]);
      }
      setNewAlert({ title: '', description: '', severity: 'high', area: '' });
      setIsCreatingAlert(false);
    } catch (err) {
      console.error('Failed to create alert', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* 1. Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-accent-900 via-accent-800 to-primary-900 p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl text-white overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="hidden sm:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-2xl font-bold uppercase shadow-inner">
            {(profile?.name || user?.name || user?.full_name || 'M')[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className="bg-white/20 text-white border-none font-bold uppercase tracking-wider backdrop-blur-md">Constituency Portal</Badge>
              <span className="px-2 py-1 bg-black/20 rounded-md border border-white/10 text-xs font-mono backdrop-blur-sm">{profile?.mla_id || user?.id || 'TN-MLA-001'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-md">
              {getGreeting()}, {profile?.name || user?.name || user?.full_name || 'MLA'}
            </h1>
            <p className="text-accent-100 mt-2 flex items-center gap-2 text-sm md:text-base font-medium">
              <MapPin className="w-4 h-4 text-accent-300" /> 
              {profile?.district_id ? 'District ' + profile.district_id : 'Chennai'} → {user?.ward_name || profile?.ward_id || 'Kolathur'}
            </p>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-wrap md:flex-nowrap items-center gap-4 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="px-2">
            <p className="text-[10px] text-accent-200 uppercase tracking-widest font-bold mb-1">Party</p>
            <p className="text-lg font-black tracking-tight">{profile?.political_party || 'DMK'}</p>
          </div>
          <div className="h-10 w-px bg-white/20 mx-1 hidden sm:block"></div>
          <div className="px-2">
            <p className="text-[10px] text-accent-200 uppercase tracking-widest font-bold mb-1">Score</p>
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 text-warning-400 fill-warning-400" />
              <span className="text-lg font-black">{performance?.overall_score || 0}/10</span>
            </div>
          </div>
          {!predefinedData && (
            <>
              <div className="h-10 w-px bg-white/20 mx-1 hidden sm:block"></div>
              <Button 
                onClick={mlaLogout}
                variant="danger"
                size="sm"
                className="ml-2 font-bold shadow-md hover:shadow-lg"
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* 2. Top Analytics Cards (6 Cards) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, staggerChildren: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        <motion.div whileHover={{ y: -5 }}><StatCard title="Total Complaints" value={totalComplaints} icon={FileText} color="primary" /></motion.div>
        <motion.div whileHover={{ y: -5 }}><StatCard title="Pending" value={pendingComplaints} icon={Activity} color="warning" /></motion.div>
        <motion.div whileHover={{ y: -5 }}><StatCard title="Resolved" value={resolvedComplaints} icon={CheckCircle2} color="success" /></motion.div>
        <motion.div whileHover={{ y: -5 }}><StatCard title="Escalated" value={escalatedComplaints} icon={AlertTriangle} color="danger" /></motion.div>
        <motion.div whileHover={{ y: -5 }}><StatCard title="Active Projects" value={activeProjects} icon={Briefcase} color="info" /></motion.div>
        <motion.div whileHover={{ y: -5 }}><StatCard title="Emergency Alerts" value={alerts.length} icon={Megaphone} color="danger" /></motion.div>
      </motion.div>

      {/* 3. Ward Analytics Charts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 flex flex-col shadow-lg border border-border-light/50">
          <h3 className="font-extrabold text-lg text-text-primary-light dark:text-text-primary-dark mb-1">Resolution Status</h3>
          <p className="text-xs font-medium text-text-secondary-light mb-4">Current state of grievances</p>
          <div className="w-full flex-1 min-h-[220px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={complaintStatusData} innerRadius={60} outerRadius={85} dataKey="value" stroke="none" paddingAngle={4} animationDuration={1000}>
                  {complaintStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black">{totalComplaints}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light">Total</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-bold mt-2">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success-500"></span> Resolved</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning-500"></span> Pending</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-danger-500"></span> Escalated</span>
          </div>
        </Card>

        <Card className="lg:col-span-2 shadow-lg border border-border-light/50">
          <h3 className="font-extrabold text-lg text-text-primary-light dark:text-text-primary-dark mb-1">Department Complaints</h3>
          <p className="text-xs font-medium text-text-secondary-light mb-4">Grievances grouped by top affected categories</p>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="name" fontSize={11} fontFamily="inherit" fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={11} fontFamily="inherit" fontWeight={600} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="complaints" radius={[6, 6, 0, 0]} barSize={45} animationDuration={1000}>
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-1 shadow-lg border border-border-light/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="font-extrabold text-lg text-text-primary-light dark:text-text-primary-dark mb-1 relative z-10">Monthly Trend</h3>
          <p className="text-xs font-medium text-text-secondary-light mb-4 relative z-10">Volume of grievances</p>
          <div className="w-full h-[250px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="month" fontSize={11} fontFamily="inherit" fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                <YAxis fontSize={11} fontFamily="inherit" fontWeight={600} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* 4. Complaint Monitoring Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="shadow-lg border border-border-light/50">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h2 className="font-extrabold text-xl tracking-tight text-text-primary-light dark:text-text-primary-dark">Ward Complaints Database</h2>
              <p className="text-xs font-medium text-text-secondary-light mt-1">Real-time view of citizen grievances in your constituency.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 bg-bg-light dark:bg-bg-dark p-2 rounded-xl border border-border-light">
              <Select 
                options={[
                  {value:'all', label:'All Status'}, 
                  {value:'pending', label:'Pending'}, 
                  {value:'in_progress', label:'In Progress'}, 
                  {value:'completed', label:'Completed'}
                ]}
                value={complaintFilters.status}
                onChange={(e) => setComplaintFilters({...complaintFilters, status: e.target.value})}
                className="w-32 md:w-40 bg-white shadow-sm"
              />
              <Select 
                options={[{value:'all', label:'All Priorities'}, {value:'high', label:'High'}, {value:'medium', label:'Medium'}, {value:'low', label:'Low'}]}
                value={complaintFilters.priority}
                onChange={(e) => setComplaintFilters({...complaintFilters, priority: e.target.value})}
                className="w-32 md:w-40 bg-white shadow-sm"
              />
              <Select 
                options={[{value:'all', label:'All Categories'}, ...uniqueCategories.map(c => ({value: c, label: c}))]}
                value={complaintFilters.category}
                onChange={(e) => setComplaintFilters({...complaintFilters, category: e.target.value})}
                className="w-32 md:w-40 bg-white shadow-sm hidden sm:block"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-border-light dark:border-border-dark">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/80 dark:to-gray-800/40 text-text-secondary-light uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="p-4">Complaint ID</th>
                  <th className="p-4">Citizen Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Area</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned Officer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark bg-white dark:bg-surface-card-dark">
                {filteredComplaints.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-text-secondary-light flex flex-col items-center justify-center gap-2">
                    <Search className="w-8 h-8 opacity-20" />
                    <span className="font-medium">No complaints match your filters.</span>
                  </td></tr>
                ) : (
                  filteredComplaints.map((c, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      key={c.id} className="hover:bg-primary-50/50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="p-4 font-mono text-xs font-semibold text-primary-600">{c.complaint_number || `#${c.id}`}</td>
                      <td className="p-4 font-bold text-text-primary-light dark:text-text-primary-dark">{c.citizen_name || 'Anonymous'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-accent-500"></div>
                          <span className="font-medium">{c.category || c.title}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium text-text-secondary-light">{c.area || 'Ward limits'}</td>
                      <td className="p-4">
                        <Badge color={c.priority === 'high' || c.priority === 'critical' ? 'danger' : c.priority === 'medium' ? 'warning' : 'info'} className="text-[10px]">
                          {c.priority || 'Normal'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge color={c.status === 'completed' || c.status === 'resolved' ? 'success' : c.status === 'pending' ? 'warning' : 'primary'} className="text-[10px]">
                          {c.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {c.assigned_officer ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold">
                                {c.assigned_officer.charAt(0)}
                              </div>
                              <span className="text-xs font-semibold">{c.assigned_officer}</span>
                            </>
                          ) : (
                            <span className="text-xs text-text-secondary-light italic">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium text-text-secondary-light">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right space-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" className="h-8 text-[10px] px-3 font-bold shadow-sm">View</Button>
                        {!predefinedData && (
                          <Button variant="danger" size="sm" className="h-8 text-[10px] px-3 font-bold shadow-sm">Escalate</Button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. Project Monitoring */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card className="shadow-lg border border-border-light/50 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-extrabold text-lg text-text-primary-light dark:text-text-primary-dark">Infrastructure Projects</h2>
                <p className="text-xs font-medium text-text-secondary-light">Ward development initiatives.</p>
              </div>
              <Badge color="info" className="font-bold">Active: {activeProjects}</Badge>
            </div>
            
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border-light rounded-xl">
                  <Briefcase className="w-8 h-8 text-text-secondary-light opacity-50 mb-2" />
                  <p className="text-sm font-bold text-text-secondary-light">No active projects.</p>
                </div>
              ) : (
                projects.map((proj, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    key={proj.id} 
                    className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-white/40 dark:bg-black/20 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark group-hover:text-primary-600 transition-colors">{proj.name}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-bold text-text-secondary-light tracking-wide">
                          <span className="text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">₹{(proj.budget/100000).toFixed(2)} Lakhs</span>
                          <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {proj.assigned_officer || 'Assigned'}</span>
                          <span>⏳ {proj.deadline || '2026-12-31'}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <Badge color={proj.status === 'completed' ? 'success' : proj.status === 'delayed' ? 'danger' : 'primary'} className="mb-2 text-[10px]">
                          {proj.status}
                        </Badge>
                        <span className="text-xs font-black">{proj.progress}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full mt-3 overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${proj.progress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${proj.progress === 100 ? 'bg-success-500' : 'bg-primary-500'}`} 
                      ></motion.div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* 6. Officer Monitoring */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="shadow-lg border border-border-light/50 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-extrabold text-lg text-text-primary-light dark:text-text-primary-dark">Officer Performance</h2>
                <p className="text-xs font-medium text-text-secondary-light">Monitor ward officers' resolution rates.</p>
              </div>
              <Users className="w-5 h-5 text-text-secondary-light" />
            </div>
            
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {displayOfficers.map((officer, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  key={officer.id} className="p-4 rounded-xl border border-border-light bg-white dark:bg-surface-card-dark shadow-sm hover:border-primary-200 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 flex items-center justify-center font-bold text-lg shadow-inner">
                        {officer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm flex items-center gap-2 text-text-primary-light dark:text-text-primary-dark">
                          {officer.name} 
                          {idx === 0 && <span className="text-[9px] bg-success-100 text-success-700 border border-success-200 px-1.5 py-0.5 rounded-full uppercase font-black tracking-widest shadow-sm">🏆 Top</span>}
                          {idx === displayOfficers.length-1 && displayOfficers.length > 1 && <span className="text-[9px] bg-danger-100 text-danger-700 border border-danger-200 px-1.5 py-0.5 rounded-full uppercase font-black tracking-widest shadow-sm">⚠ Low</span>}
                        </p>
                        <p className="text-[10px] font-bold text-text-secondary-light uppercase tracking-wider">{officer.dept}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-primary-600">{officer.resolved}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="bg-bg-light dark:bg-bg-dark rounded-lg p-2 text-center border border-border-light">
                      <p className="text-[10px] font-bold text-text-secondary-light uppercase tracking-wider">Assigned</p>
                      <p className="font-black text-sm">{officer.assigned}</p>
                    </div>
                    <div className="bg-success-50 dark:bg-success-900/10 rounded-lg p-2 text-center border border-success-100">
                      <p className="text-[10px] font-bold text-success-600 uppercase tracking-wider">Resolved</p>
                      <p className="font-black text-sm text-success-700">{officer.resolvedCount || Math.floor((officer.resolved / 100) * officer.assigned)}</p>
                    </div>
                    <div className={`rounded-lg p-2 text-center border ${officer.delayed > 0 ? 'bg-danger-50 dark:bg-danger-900/10 border-danger-100' : 'bg-bg-light dark:bg-bg-dark border-border-light'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${officer.delayed > 0 ? 'text-danger-600' : 'text-text-secondary-light'}`}>Delayed</p>
                      <p className={`font-black text-sm ${officer.delayed > 0 ? 'text-danger-700' : 'text-text-primary-light'}`}>{officer.delayed}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Grid: Alerts & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7. Emergency Alerts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2">
          <Card className="border-danger-200 dark:border-danger-900/30 bg-gradient-to-br from-danger-50/50 to-white dark:from-danger-900/10 dark:to-bg-dark h-full">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-danger-100 dark:border-danger-900/30">
              <div>
                <h2 className="font-extrabold text-xl text-danger-700 dark:text-danger-500 flex items-center gap-2">
                  <Megaphone className="w-6 h-6" /> Emergency Broadcast
                </h2>
                <p className="text-xs font-medium text-danger-600/70 dark:text-danger-400/70 mt-1">Push critical alerts directly to ward officers and citizens.</p>
              </div>
              {!predefinedData && (
                <Button variant="danger" size="sm" className="shadow-md hover:shadow-lg font-bold" onClick={() => setIsCreatingAlert(!isCreatingAlert)}>
                  {isCreatingAlert ? 'Cancel' : <><Plus className="w-4 h-4 mr-1" /> New Alert</>}
                </Button>
              )}
            </div>

            <AnimatePresence>
              {isCreatingAlert && !predefinedData && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <form onSubmit={handleCreateAlert} className="bg-white/80 dark:bg-black/20 backdrop-blur-sm p-5 rounded-2xl border border-danger-200 dark:border-danger-800 mb-6 space-y-4 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Alert Title" value={newAlert.title} onChange={e => setNewAlert({...newAlert, title: e.target.value})} required className="bg-white" />
                      <Input label="Affected Area" value={newAlert.area} onChange={e => setNewAlert({...newAlert, area: e.target.value})} required placeholder="e.g. Kolathur Main Road" className="bg-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select label="Severity Level" options={severityOptions} value={newAlert.severity} onChange={e => setNewAlert({...newAlert, severity: e.target.value})} required className="bg-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-text-secondary-light uppercase tracking-wider">Detailed Description</label>
                      <textarea 
                        className="w-full rounded-xl bg-white dark:bg-bg-dark border border-border-light dark:border-border-dark px-4 py-3 focus:outline-none focus:ring-2 focus:ring-danger-500/50 shadow-sm"
                        rows="2" value={newAlert.description} onChange={e => setNewAlert({...newAlert, description: e.target.value})} required
                      ></textarea>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" variant="danger" className="font-bold px-6 shadow-md">Push Broadcast</Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-white/50 dark:bg-black/20 rounded-xl border-2 border-dashed border-danger-100 dark:border-danger-900/30">
                  <Megaphone className="w-10 h-10 text-danger-300 opacity-50 mb-2" />
                  <p className="text-sm font-bold text-danger-400">No active emergency alerts in your ward.</p>
                </div>
              ) : (
                alerts.map((a, i) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="p-4 rounded-xl border border-danger-100 dark:border-danger-900/50 bg-white/80 dark:bg-surface-card-dark shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
                    <div className={`p-3 rounded-2xl shadow-inner ${a.severity === 'critical' ? 'bg-gradient-to-br from-danger-500 to-danger-700 text-white' : 'bg-gradient-to-br from-danger-50 to-danger-100 text-danger-600'}`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-danger-700 dark:text-danger-400 text-base">{a.title}</h4>
                        <Badge color={a.severity === 'critical' ? 'danger' : 'warning'} className="uppercase text-[9px] font-black tracking-widest">{a.severity || 'HIGH'}</Badge>
                      </div>
                      <p className="text-sm font-medium text-text-secondary-light mt-1 leading-relaxed">{a.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-danger-50 dark:border-danger-900/30">
                        <p className="text-[10px] font-bold text-danger-500/80 tracking-wide">BROADCASTED: {new Date(a.created_at).toLocaleString()}</p>
                        {a.area && <p className="text-[10px] font-bold text-text-secondary-light flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md"><MapPin className="w-3 h-3 mr-1" /> {a.area}</p>}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* 8. Notifications Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="lg:col-span-1">
          <Card className="h-full shadow-lg border border-border-light/50 bg-gradient-to-b from-bg-light to-white dark:from-bg-dark dark:to-surface-card-dark">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-extrabold text-lg text-text-primary-light dark:text-text-primary-dark">Live Updates</h2>
                <p className="text-xs font-medium text-text-secondary-light">Real-time ward activity.</p>
              </div>
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success-500"></span>
              </div>
            </div>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-light before:to-transparent">
              {recentNotifications.map((notif, idx) => {
                const Icon = notif.icon;
                const colors = {
                  primary: 'bg-primary-100 text-primary-600 border-primary-200',
                  success: 'bg-success-100 text-success-600 border-success-200',
                  warning: 'bg-warning-100 text-warning-600 border-warning-200',
                  danger: 'bg-danger-100 text-danger-600 border-danger-200',
                  info: 'bg-info-100 text-info-600 border-info-200'
                };
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + (idx * 0.1) }}
                    key={notif.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white dark:bg-bg-dark shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 transform -translate-x-1/2 z-10 overflow-hidden">
                      <div className={`w-full h-full flex items-center justify-center ${colors[notif.color]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-border-light bg-white dark:bg-surface-card-dark shadow-sm ml-12 md:ml-0 group-hover:border-primary-200 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black tracking-widest uppercase text-text-secondary-light">{notif.time}</span>
                      </div>
                      <p className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark">{notif.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
