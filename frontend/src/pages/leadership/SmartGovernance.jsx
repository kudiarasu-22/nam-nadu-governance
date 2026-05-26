/**
 * Nam Nadu — Smart Governance Command Center (Leadership)
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer } from '@/components/maps';
import { CircleMarker, Popup } from 'react-leaflet';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  RadialBarChart, RadialBar
} from 'recharts';
import { Card, StatCard, Badge, LiveActivityFeed, Button, Input, Select, Textarea } from '@/components/ui';
import { leadershipService } from '@/services/leadership.service';
import { 
  Shield, TrendingUp, Users, Activity, LayoutDashboard, BarChart3, 
  DollarSign, Heart, ChevronRight, CheckCircle2, Building, Landmark,
  Award, Star, MessageSquare, MapPin, Calendar, Clock, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Extra rich mock data for high fidelity presentation
const TRENDS_DATA = [
  { month: 'Jan', complaints: 240, resolved: 180 },
  { month: 'Feb', complaints: 320, resolved: 270 },
  { month: 'Mar', complaints: 280, resolved: 250 },
  { month: 'Apr', complaints: 450, resolved: 380 },
  { month: 'May', complaints: 512, resolved: 490 },
  { month: 'Jun', complaints: 480, resolved: 460 },
];

const CATEGORY_DATA = [
  { name: 'Roads & Infra', value: 412, color: '#3f51b5' },
  { name: 'Water & Sanitation', value: 328, color: '#03a9f4' },
  { name: 'Electricity', value: 245, color: '#fbc02d' },
  { name: 'Solid Waste', value: 189, color: '#43a047' },
  { name: 'Others', value: 110, color: '#9c27b0' },
];

const DEPT_PERFORMANCE = [
  { subject: 'Roads & Highways', Assigned: 120, Resolved: 98, fullMark: 150 },
  { subject: 'Metro Water', Assigned: 98, Resolved: 89, fullMark: 150 },
  { subject: 'TANGEDCO (Power)', Assigned: 86, Resolved: 82, fullMark: 150 },
  { subject: 'Corporation Sanitation', Assigned: 140, Resolved: 135, fullMark: 150 },
  { subject: 'Public Parks & Rec', Assigned: 50, Resolved: 45, fullMark: 150 },
];

const TAX_SOURCES = [
  { name: 'State GST (SGST)', amount: '₹14,250 Cr', percent: 45 },
  { name: 'Property & Land Tax', amount: '₹8,550 Cr', percent: 27 },
  { name: 'State Excise Duty', amount: '₹4,750 Cr', percent: 15 },
  { name: 'Professional Tax', amount: '₹2,530 Cr', percent: 8 },
  { name: 'Others & Cess', amount: '₹1,580 Cr', percent: 5 },
];

const CONTRACTOR_DATA = [
  { id: 1, name: 'BuildWell Corp', projects: 14, value: '₹480 Cr', completion: '96.2%', rating: 4.8, status: 'Active' },
  { id: 2, name: 'Chennai Infra Ltd', projects: 9, value: '₹320 Cr', completion: '91.5%', rating: 4.5, status: 'Active' },
  { id: 3, name: 'Tamil Nadu Builders', projects: 11, value: '₹290 Cr', completion: '88.7%', rating: 4.2, status: 'Warning' },
  { id: 4, name: 'Gopuram Contractors', projects: 6, value: '₹150 Cr', completion: '98.5%', rating: 4.9, status: 'Active' },
];

const CITIZEN_VERIFICATIONS = [
  { id: 1, user: 'Suresh Kumar', project: 'Anna Nagar West Repaving', ward: 'Ward 1', text: 'Work completed very neatly. The road looks excellent now.', rating: 5, date: '2 hours ago' },
  { id: 2, user: 'Deepika R.', project: 'T Nagar Smart Lights', ward: 'Ward 2', text: 'Streetlights installed and working. Safety increased immensely.', rating: 5, date: '5 hours ago' },
  { id: 3, user: 'Aravind S.', project: 'Adyar Sewage Desilting', ward: 'Ward 3', text: 'Desilting done. Water flow is much better, no logging.', rating: 4, date: '1 day ago' },
];

const SENTIMENTS = [
  { id: 1, user: 'Karthik Raja', sentiment: 'positive', dept: 'Sanitation', comment: 'Amazing response! Garbage cleared within 3 hours of report.', time: '10 mins ago' },
  { id: 2, user: 'Meena K.', sentiment: 'positive', dept: 'Water Supply', comment: 'Finally water pressure has been restored in 2nd Avenue. Thanks!', time: '1 hour ago' },
  { id: 3, user: 'John Doe', sentiment: 'negative', dept: 'Roads', comment: 'Pothole raised 4 days ago still pending on Elm street.', time: '3 hours ago' },
  { id: 4, user: 'Preethi S.', sentiment: 'positive', dept: 'Electricity', comment: 'Cable lines replaced in record time after the wind storm.', time: '5 hours ago' },
];

const SATISFACTION_BY_DEPT = [
  { name: 'Corporation Sanitation', score: 88, fill: '#43a047' },
  { name: 'Metro Water Supply', score: 81, fill: '#03a9f4' },
  { name: 'TANGEDCO Electricity', score: 76, fill: '#fbc02d' },
  { name: 'Public Works Roads', score: 72, fill: '#3f51b5' },
];

export default function SmartGovernance() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('home');
  const [activeTaxFlowStep, setActiveTaxFlowStep] = useState(0);

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [alertForm, setAlertForm] = useState({ title: '', description: '', severity: 'high', area: 'All Wards' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, alertsData] = await Promise.all([
          leadershipService.getAnalytics(),
          leadershipService.getAlerts()
        ]);
        setAnalytics(data);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const newAlert = await leadershipService.createAlert({
        title: alertForm.title,
        description: alertForm.description,
        severity: alertForm.severity,
        area: alertForm.area,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      });
      setAlerts([newAlert, ...alerts]);
      setIsCreatingAlert(false);
      setAlertForm({ title: '', description: '', severity: 'high', area: 'All Wards' });
    } catch (error) {
      console.error('Failed to create alert', error);
    }
  };

  if (loading || !analytics) {
    return <div className="flex h-64 items-center justify-center">Loading governance data...</div>;
  }

  const { overallDevelopmentIndex, publicTrustScore, budgetHealth, wardRankings, complaintHeatmapData, wardAllocations } = analytics;

  const tabs = [
    { id: 'home', label: 'Command Center', icon: LayoutDashboard },
    { id: 'analytics', label: 'Governance Analytics', icon: BarChart3 },
    { id: 'budget', label: 'Budget Transparency', icon: DollarSign },
    { id: 'satisfaction', label: 'Public Satisfaction', icon: Heart },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary-900/90 to-primary-800/80 dark:from-surface-card-dark dark:to-surface-card-dark/60 p-6 rounded-2xl border border-primary-800/30 dark:border-border-dark shadow-elevated">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-accent-500/20 text-accent-500 rounded-lg text-xs font-bold uppercase tracking-wider">CM Command Portal</span>
            <span className="w-2 h-2 rounded-full bg-success-500 animate-ping"></span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            {t('leadership.command_center')}
          </h1>
          <p className="text-primary-100 dark:text-text-secondary-dark mt-1 text-sm md:text-base max-w-2xl">
            Real-time executive monitoring of public sentiment, civic operations, financial pipelines, and district performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge color="success" className="px-3 py-1.5 font-bold uppercase tracking-wider text-xs border border-success-400/30">
            {t('leadership.live_sync')}
          </Badge>
          <div className="text-xs text-primary-200 dark:text-text-secondary-dark text-right hidden md:block">
            <p className="font-semibold">Last Updated</p>
            <p className="opacity-80">Just Now (Local Time)</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto p-1 bg-white/40 dark:bg-surface-card-dark/40 backdrop-blur-md rounded-xl border border-border-light dark:border-border-dark scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm transition-all duration-300 whitespace-nowrap flex-1 justify-center md:flex-none cursor-pointer ${
                isActive
                  ? 'bg-primary-600 text-white shadow-card dark:bg-primary-500'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-white/50 dark:hover:bg-surface-card-dark/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* TAB 1: COMMAND CENTER (HOME) */}
          {activeTab === 'home' && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Development Index" value={`${overallDevelopmentIndex}/10`} subtitle="State average target: 8.5" trend="up" trendValue="+0.4" icon={TrendingUp} color="primary" />
                <StatCard title="Public Trust Score" value={`${publicTrustScore}/10`} subtitle="Based on monthly sentiment" trend="up" trendValue="+0.1" icon={Users} color="success" />
                <StatCard title="Active Emergency Wards" value="4 Wards" subtitle="12 alerts today" trend="down" trendValue="-3" icon={Shield} color="danger" />
                <StatCard title="Budget Health" value={budgetHealth} subtitle="Excellent utilization rate" icon={Activity} color="info" />
              </div>

              {/* Heatmap & Operations Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 flex flex-col h-[480px]" padding="p-0">
                  <div className="p-5 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-white/50 dark:bg-surface-card-dark/30">
                    <div>
                      <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Live Incident Hotspot Map</h2>
                      <p className="text-xs text-text-secondary-light">Coordinates map depicting current citizen grievance density.</p>
                    </div>
                    <Badge color="danger" dot>Live Operations</Badge>
                  </div>
                  <div className="flex-1 w-full relative z-0">
                    <MapContainer className="h-full border-0 rounded-b-xl rounded-t-none">
                      {complaintHeatmapData.map((pt, idx) => (
                        <CircleMarker
                          key={idx}
                          center={[pt.lat, pt.lng]}
                          radius={pt.weight * 22}
                          pathOptions={{
                            color: pt.weight > 0.7 ? '#ef4444' : '#f59e0b',
                            fillColor: pt.weight > 0.7 ? '#ef4444' : '#f59e0b',
                            fillOpacity: 0.5,
                            stroke: false
                          }}
                        >
                          <Popup>
                            <div className="p-1 font-sans">
                              <p className="font-bold text-sm">High Grievance Node</p>
                              <p className="text-xs">Severity Index: {(pt.weight * 10).toFixed(1)}/10</p>
                              <p className="text-xs">Primary Category: Roads & Drainage</p>
                            </div>
                          </Popup>
                        </CircleMarker>
                      ))}
                    </MapContainer>
                  </div>
                </Card>

                <Card className="h-[480px] flex flex-col">
                  <div className="mb-4">
                    <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Executive Logs</h2>
                    <p className="text-xs text-text-secondary-light">Live updates from department officers and ward controllers.</p>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-1">
                    <LiveActivityFeed maxItems={12} />
                  </div>
                </Card>
              </div>

              {/* Ward Rankings & Budget Utilization */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="mb-4 flex justify-between items-center">
                    <div>
                      <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Top Performing Wards</h2>
                      <p className="text-xs text-text-secondary-light">Rankings based on complaint resolution and civic indices.</p>
                    </div>
                    <Badge color="primary">Weekly Update</Badge>
                  </div>
                  <div className="space-y-3">
                    {wardRankings.map((ward) => (
                      <div key={ward.rank} className="flex items-center gap-4 p-3 rounded-xl bg-white/30 dark:bg-surface-card-dark/20 border border-border-light/40 dark:border-border-dark/40 hover:bg-white/60 dark:hover:bg-surface-card-dark/40 transition-all duration-200">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          ward.rank === 1 
                            ? 'bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-400' 
                            : ward.rank === 2
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                            : 'bg-surface-light dark:bg-surface-dark text-text-secondary-light'
                        }`}>
                          #{ward.rank}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-text-primary-light dark:text-text-primary-dark text-sm">{ward.ward}</p>
                          <p className="text-xs text-text-secondary-light">Councillor: {ward.councillor}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary-600 dark:text-primary-400">{ward.score}/10</p>
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div className="bg-primary-500 h-full rounded-full" style={{ width: `${ward.score * 10}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <div className="mb-4">
                    <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">{t('leadership.budget_utilization')}</h2>
                    <p className="text-xs text-text-secondary-light">Budget allocated vs expenditure in crores.</p>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={wardAllocations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/10000000}Cr`} />
                        <Tooltip 
                          contentStyle={{ background: '#1e293b', border: '0', borderRadius: '8px', color: '#fff' }} 
                          formatter={(val) => [`₹${(val/10000000).toFixed(1)} Cr`, 'Spent']} 
                        />
                        <Bar dataKey="spent" fill="#3f51b5" radius={[6, 6, 0, 0]}>
                          {wardAllocations.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3f51b5' : '#fbc02d'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* TAB 2: GOVERNANCE ANALYTICS */}
          {activeTab === 'analytics' && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Grievances" value="1,284 Cases" subtitle="Accumulated this year" icon={Activity} color="primary" />
                <StatCard title="Resolution Rate" value="81.6%" subtitle="Avg SLA time: 42.5 hrs" trend="up" trendValue="+4.2%" icon={CheckCircle2} color="success" />
                <StatCard title="Officer Utilization" value="48 / 50 Officers" subtitle="On active duty now" icon={Users} color="info" />
                <StatCard title="Active In-App Polls" value="6 Wards" subtitle="1,490 citizen votes today" icon={Shield} color="accent" />
              </div>

              {/* Line & Pie Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <div className="mb-4">
                    <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Grievance Trends & Resolution Curve</h2>
                    <p className="text-xs text-text-secondary-light">Monthly comparison between incoming cases and successfully resolved complaints.</p>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TRENDS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#43a047" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#43a047" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: '0', borderRadius: '8px', color: '#fff' }} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Area type="monotone" dataKey="complaints" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorComplaints)" name="Reported Complaints" />
                        <Area type="monotone" dataKey="resolved" stroke="#43a047" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" name="Resolved Complaints" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card>
                  <div className="mb-4">
                    <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Categories Distribution</h2>
                    <p className="text-xs text-text-secondary-light">Top reporting sectors across the entire municipality.</p>
                  </div>
                  <div className="h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={CATEGORY_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {CATEGORY_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} complaints`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                      <span className="text-2xl font-black text-text-primary-light dark:text-text-primary-dark">1,284</span>
                      <span className="text-[10px] text-text-secondary-light uppercase tracking-wider font-bold">Total Raised</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold">
                    {CATEGORY_DATA.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-text-primary-light dark:text-text-primary-dark">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Department Radar Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <div className="mb-4">
                    <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Department Performance Index</h2>
                    <p className="text-xs text-text-secondary-light">Comparing total assigned versus closed cases across major utility departments.</p>
                  </div>
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={DEPT_PERFORMANCE}>
                        <PolarGrid strokeOpacity={0.1} />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fontSize: 9 }} />
                        <Radar name="Assigned" dataKey="Assigned" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                        <Radar name="Resolved" dataKey="Resolved" stroke="#43a047" fill="#43a047" fillOpacity={0.4} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="lg:col-span-2">
                  <div className="mb-4 flex justify-between items-center">
                    <div>
                      <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Active Emergency Broadcasts</h2>
                      <p className="text-xs text-text-secondary-light">Real-time alerts broadcasted to the citizens.</p>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => setIsCreatingAlert(!isCreatingAlert)}>
                      {isCreatingAlert ? 'Cancel' : 'Create Alert'}
                    </Button>
                  </div>
                  
                  {isCreatingAlert && (
                    <form onSubmit={handleCreateAlert} className="mb-6 p-4 border border-danger-500/30 bg-danger-50 dark:bg-danger-900/10 rounded-xl space-y-4">
                      <h3 className="font-bold text-danger-600 dark:text-danger-400">New Emergency Broadcast</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Title" required value={alertForm.title} onChange={e => setAlertForm({...alertForm, title: e.target.value})} />
                        <Select 
                          label="Severity" 
                          value={alertForm.severity} 
                          onChange={e => setAlertForm({...alertForm, severity: e.target.value})}
                          options={[{value: 'high', label: 'High'}, {value: 'critical', label: 'Critical'}]}
                        />
                      </div>
                      <Input label="Target Area (Ward/Zone)" required value={alertForm.area} onChange={e => setAlertForm({...alertForm, area: e.target.value})} />
                      <Textarea label="Message" required value={alertForm.description} onChange={e => setAlertForm({...alertForm, description: e.target.value})} />
                      <div className="flex justify-end">
                        <Button type="submit" variant="danger">Broadcast Alert</Button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    {alerts.map(alert => (
                      <div key={alert.id} className={`p-4 rounded-xl border flex items-start gap-4 ${alert.severity === 'critical' ? 'border-red-500/20 bg-red-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
                        <div className={`p-2.5 rounded-lg ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                          <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-bold text-sm ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>{alert.title}</h4>
                            <span className="text-[10px] text-text-secondary-light font-bold">{new Date(alert.created_at).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                            {alert.description}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge color={alert.severity === 'critical' ? 'danger' : 'warning'} size="sm">{alert.severity}</Badge>
                            <Badge color="default" size="sm">Target: {alert.area}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {alerts.length === 0 && !isCreatingAlert && (
                      <p className="text-sm text-gray-500 italic">No active alerts.</p>
                    )}
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* TAB 3: BUDGET TRANSPARENCY */}
          {activeTab === 'budget' && (
            <>
              {/* Dynamic Interactive Flow Header */}
              <Card className="relative overflow-hidden" padding="p-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
                <div className="p-5 border-b border-border-light dark:border-border-dark bg-white/50 dark:bg-surface-card-dark/30">
                  <h2 className="font-extrabold text-lg text-text-primary-light dark:text-text-primary-dark">The Government Fund Journey</h2>
                  <p className="text-xs text-text-secondary-light">Nam Nadu ensuring complete, end-to-end 100% accountability on tax allocation and expenditure.</p>
                </div>
                
                {/* Horizontal Step Flow */}
                <div className="grid grid-cols-5 p-4 border-b border-border-light dark:border-border-dark bg-white/20 dark:bg-surface-card-dark/10">
                  {[
                    { title: 'Tax Allocation', subtitle: 'Funds Inflow', icon: Landmark },
                    { title: 'Dept Spending', subtitle: 'Budgets Out', icon: Building },
                    { title: 'Contractors', subtitle: 'Tender Awards', icon: Users },
                    { title: 'Project Tracker', subtitle: 'On-Ground Works', icon: Activity },
                    { title: 'Citizen Audit', subtitle: 'Crowd Verified', icon: CheckCircle2 }
                  ].map((step, idx) => {
                    const StepIcon = step.icon;
                    const isActive = activeTaxFlowStep === idx;
                    const isCompleted = activeTaxFlowStep > idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveTaxFlowStep(idx)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 relative border cursor-pointer ${
                          isActive 
                            ? 'bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400' 
                            : 'border-transparent text-text-secondary-light hover:bg-gray-100/40 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 border-2 ${
                          isActive
                            ? 'bg-primary-500 text-white border-primary-500'
                            : isCompleted
                            ? 'bg-success-500 text-white border-success-500'
                            : 'bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                        </div>
                        <span className="text-xs font-bold text-center block leading-tight">{step.title}</span>
                        <span className="text-[9px] text-text-secondary-light opacity-85 block mt-0.5">{step.subtitle}</span>
                        
                        {idx < 4 && (
                          <ChevronRight className="w-4 h-4 absolute top-[28px] -right-2 text-border-light dark:text-border-dark hidden md:block" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Step Sub-views */}
                <div className="p-6 bg-white/10 dark:bg-surface-card-dark/10 min-h-[320px]">
                  {activeTaxFlowStep === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold flex items-center gap-2 text-primary-600 dark:text-primary-400">
                            <Landmark className="w-5 h-5" /> Tax Allocation Inflows (FY 2025-26)
                          </h3>
                          <p className="text-sm text-text-secondary-light leading-relaxed">
                            Total consolidated revenues collected through municipal taxes, state GST allocations, and Central infrastructure grants. These funds are pooled systematically to finance municipal development projects.
                          </p>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/20 border border-primary-200/30">
                              <span className="text-xs text-text-secondary-light font-semibold block">Total Tax Pool</span>
                              <span className="text-2xl font-black text-primary-600 dark:text-primary-400 block mt-1">₹31,660 Cr</span>
                            </div>
                            <div className="p-4 rounded-xl bg-success-50 dark:bg-success-950/20 border border-success-200/30">
                              <span className="text-xs text-text-secondary-light font-semibold block">Direct Allocation %</span>
                              <span className="text-2xl font-black text-success-600 dark:text-success-400 block mt-1">100% Tax Mapping</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary-light">Revenue Breakdown</h4>
                          <div className="space-y-3">
                            {TAX_SOURCES.map((src, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                                  <span>{src.name}</span>
                                  <span>{src.amount} ({src.percent}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                  <div className="bg-primary-500 h-full rounded-full" style={{ width: `${src.percent}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTaxFlowStep === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold flex items-center gap-2 text-primary-600 dark:text-primary-400">
                            <Building className="w-5 h-5" /> Department spending & Budgets Out
                          </h3>
                          <p className="text-sm text-text-secondary-light leading-relaxed">
                            Budget allocations mapped out to distinct utility departments based on requirements, historical data, and direct ward demand indices.
                          </p>
                          <div className="p-4 rounded-xl bg-surface-light dark:bg-slate-900/60 border border-border-light dark:border-border-dark">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold">Largest Allocator</span>
                              <Badge color="primary">Roads & Infra (42%)</Badge>
                            </div>
                            <p className="text-xs text-text-secondary-light">
                              Public Works department manages all heavy road infrastructure repaving, highway maintenance, and structural installations.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <div className="h-[200px] w-[200px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={CATEGORY_DATA}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={75}
                                  dataKey="value"
                                >
                                  {CATEGORY_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`₹${(value * 1.5).toFixed(1)} Cr`, 'Allocated']} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[10px] font-bold justify-center mt-3">
                            {CATEGORY_DATA.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                <span>{item.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTaxFlowStep === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold flex items-center gap-2 text-primary-600 dark:text-primary-400">
                            <Users className="w-5 h-5" /> Active Contractor Rankings
                          </h3>
                          <Badge color="info">Transparency Check</Badge>
                        </div>
                        <p className="text-sm text-text-secondary-light max-w-3xl">
                          Review performance ratings, audit files, and on-time completion indices of contracting companies that win government development tenders.
                        </p>
                        
                        <div className="overflow-x-auto rounded-xl border border-border-light dark:border-border-dark bg-white/40 dark:bg-surface-card-dark/40">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-100 dark:bg-gray-800 text-text-secondary-light uppercase text-[10px] font-extrabold border-b border-border-light dark:border-border-dark">
                              <tr>
                                <th className="p-3">Contractor Company</th>
                                <th className="p-3">Tenders Won</th>
                                <th className="p-3">Total Value</th>
                                <th className="p-3 text-center">Completion Rate</th>
                                <th className="p-3 text-center">Citizen Rating</th>
                                <th className="p-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light dark:divide-border-dark font-semibold">
                              {CONTRACTOR_DATA.map((c) => (
                                <tr key={c.id} className="hover:bg-white/40 dark:hover:bg-surface-card-dark/20 transition-colors">
                                  <td className="p-3 text-text-primary-light dark:text-text-primary-dark font-bold">{c.name}</td>
                                  <td className="p-3">{c.projects} Projects</td>
                                  <td className="p-3">{c.value}</td>
                                  <td className="p-3 text-center text-primary-600 dark:text-primary-400">{c.completion}</td>
                                  <td className="p-3 text-center text-amber-500">
                                    <div className="flex items-center justify-center gap-0.5">
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                      <span>{c.rating}</span>
                                    </div>
                                  </td>
                                  <td className="p-3 text-right">
                                    <Badge color={c.status === 'Active' ? 'success' : 'warning'}>{c.status}</Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTaxFlowStep === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-primary-600 dark:text-primary-400">
                          <Activity className="w-5 h-5" /> Heavy Infrastructure Project Statuses
                        </h3>
                        <p className="text-sm text-text-secondary-light">
                          Real-time execution milestones of active high-value infrastructure projects within the city wards.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-white/40 dark:bg-surface-card-dark/40 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark text-sm">Anna Nagar Main St Repaving</h4>
                                <span className="text-[10px] text-text-secondary-light">ID: #PROJ-8912 | Public Works</span>
                              </div>
                              <Badge color="success">In Progress</Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Execution Progress</span>
                                <span>82% Complete</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-success-500 h-full rounded-full" style={{ width: '82%' }}></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold text-text-secondary-light">
                              <span>Budget: ₹1.5 Cr</span>
                              <span>Target Completion: 20 days</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-white/40 dark:bg-surface-card-dark/40 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark text-sm">Velachery Drainage Desilting</h4>
                                <span className="text-[10px] text-text-secondary-light">ID: #PROJ-4521 | Sanitation</span>
                              </div>
                              <Badge color="warning">On Hold</Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Execution Progress</span>
                                <span>45% Complete</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }}></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold text-text-secondary-light">
                              <span>Budget: ₹80 Lakhs</span>
                              <span>Target Completion: 45 days</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTaxFlowStep === 4 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold flex items-center gap-2 text-primary-600 dark:text-primary-400">
                            <CheckCircle2 className="w-5 h-5" /> Citizen Crowd-Sourced Verifications
                          </h3>
                          <Badge color="success">Verified On-Ground</Badge>
                        </div>
                        <p className="text-sm text-text-secondary-light">
                          Citizen volunteers perform field audit check-ins, snapping real-time photos of projects in their wards to ensure absolute accuracy of execution reports.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {CITIZEN_VERIFICATIONS.map((v) => (
                            <div key={v.id} className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-white/40 dark:bg-surface-card-dark/40 flex flex-col justify-between space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-text-primary-light dark:text-text-primary-dark text-xs">{v.user}</span>
                                  <div className="flex items-center text-amber-500 gap-0.5 text-xs font-bold">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span>{v.rating}</span>
                                  </div>
                                </div>
                                <span className="block text-[10px] text-primary-600 dark:text-primary-400 font-bold">{v.project} ({v.ward})</span>
                                <p className="text-xs text-text-secondary-light italic font-medium leading-relaxed">
                                  "{v.text}"
                                </p>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary-light border-t border-border-light/40 dark:border-border-dark/40 pt-2">
                                <span className="flex items-center gap-1 text-success-500">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Site Photo Verified
                                </span>
                                <span>{v.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </Card>
            </>
          )}

          {/* TAB 4: PUBLIC SATISFACTION */}
          {activeTab === 'satisfaction' && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Net Sentiment Score" value="Positive (76%)" subtitle="Sentiment index: +26" trend="up" trendValue="+4.0%" icon={ThumbsUp} color="success" />
                <StatCard title="Total Feedback Logs" value="5,340 Logs" subtitle="Citizen ratings this month" icon={MessageSquare} color="primary" />
                <StatCard title="Avg Citizen Rating" value="4.2 / 5.0" subtitle="Consistent standard score" icon={Star} color="accent" />
                <StatCard title="SLA Adherence Rate" value="91.5% SLA" subtitle="Fast turnaround standard" icon={CheckCircle2} color="info" />
              </div>

              {/* Radial Bar Chart & Sentiment Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="flex flex-col h-[400px]">
                  <div className="mb-4">
                    <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Department Satisfaction Index</h2>
                    <p className="text-xs text-text-secondary-light">Based on direct, post-resolution citizen feedback surveys.</p>
                  </div>
                  <div className="flex-1 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" barSize={14} data={SATISFACTION_BY_DEPT}>
                        <RadialBar
                          minAngle={15}
                          label={{ position: 'insideStart', fill: '#fff', fontSize: 10, fontWeight: 'bold' }}
                          background
                          clockWise
                          dataKey="score"
                        />
                        <Tooltip formatter={(value) => [`${value}%`, 'Satisfaction']} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-extrabold mt-3 border-t border-border-light dark:border-border-dark pt-3">
                    {SATISFACTION_BY_DEPT.map((dept, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-text-primary-light dark:text-text-primary-dark">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.fill }}></span>
                        <span className="truncate">{dept.name} ({dept.score}%)</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="lg:col-span-2 h-[400px] flex flex-col">
                  <div className="mb-4">
                    <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Recent Citizen Sentiments</h2>
                    <p className="text-xs text-text-secondary-light">Real-time comments pulled from completed complaints.</p>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {SENTIMENTS.map((s) => (
                      <div key={s.id} className="p-3.5 rounded-xl border border-border-light dark:border-border-dark bg-white/40 dark:bg-surface-card-dark/40 hover:bg-white/60 dark:hover:bg-surface-card-dark/60 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-xs">
                              {s.user.charAt(0)}
                            </span>
                            <div>
                              <span className="font-bold text-text-primary-light dark:text-text-primary-dark text-xs block">{s.user}</span>
                              <span className="text-[10px] text-text-secondary-light">Sector: {s.dept}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge color={s.sentiment === 'positive' ? 'success' : 'danger'}>
                              {s.sentiment === 'positive' ? 'Positive' : 'Action Required'}
                            </Badge>
                            <span className="text-[10px] text-text-secondary-light font-bold">{s.time}</span>
                          </div>
                        </div>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark italic font-semibold leading-relaxed mt-1 pl-9 font-sans">
                          "{s.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
