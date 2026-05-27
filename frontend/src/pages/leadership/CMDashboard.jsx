/**
 * Nam Nadu — CM Super Admin Unified Portal
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, StatCard, Badge, Button } from '@/components/ui';
import { leadershipService } from '@/services/leadership.service';
import {
  TrendingUp, Activity, CheckCircle2, Star, Users, MapPin, Search, Filter,
  ShieldCheck, UserCog, Building2, Briefcase, FileText, Settings, Download, Megaphone,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import Input, { Select } from '@/components/ui/Input';

import CitizenHome from '@/pages/citizen/DashboardHome';
import OfficerHome from '@/pages/officer/DashboardHome';
import MLADashboard from './MLADashboard';

import { useAuth } from '@/context';

const cmSidebarSections = [
  {
    title: 'Command Center',
    items: [
      { id: 'overview', label: 'Dashboard Overview', icon: Activity },
    ]
  },
  {
    title: 'Portals Monitoring',
    items: [
      { id: 'citizen', label: 'Citizen Portal', icon: UserCog },
      { id: 'officer', label: 'Officer Portal', icon: ShieldCheck },
      { id: 'mla', label: 'MLA Portal', icon: Building2 },
    ]
  },
  {
    title: 'Statewide Tracking',
    items: [
      { id: 'complaints', label: 'Complaints', icon: FileText },
      { id: 'projects', label: 'Projects', icon: Briefcase },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'reports', label: 'Reports', icon: Download },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  }
];

export default function CMDashboard() {
  const { t } = useTranslation();
  const { cmLogout: logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [stats, setStats] = useState(null);
  const [mlas, setMlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drill-down State
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedMlaId, setSelectedMlaId] = useState('all');
  const [viewAsMlaId, setViewAsMlaId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, mlasData] = await Promise.all([
          leadershipService.getCmStats(),
          leadershipService.getAllMlas()
        ]);
        setStats(statsData);
        setMlas(mlasData);
      } catch (err) {
        console.error('Failed to fetch CM data', err);
        setError('Could not load CM Super Admin Dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-center">Initializing Super Admin Command Center...</div>;
  if (error) return <div className="text-red-500 p-6">{error}</div>;

  const topMlas = stats?.top_mlas ?? [];
  let filteredMlas = mlas;
  if (selectedDistrict !== 'all') filteredMlas = filteredMlas.filter(m => m.district === selectedDistrict);
  if (selectedWard !== 'all') filteredMlas = filteredMlas.filter(m => m.ward === selectedWard);
  if (selectedMlaId !== 'all') filteredMlas = filteredMlas.filter(m => m.mla_id === selectedMlaId);
  
  const districts = [...new Set(mlas.map(m => m.district))];
  const wards = [...new Set(mlas.filter(m => selectedDistrict === 'all' || m.district === selectedDistrict).map(m => m.ward))];
  const mlaOptions = [...new Set(mlas.filter(m => 
    (selectedDistrict === 'all' || m.district === selectedDistrict) && 
    (selectedWard === 'all' || m.ward === selectedWard)
  ))];

  // Helper to generate mock MLA data for "View As" since API doesn't allow CM to fetch it
  const generateMockMlaData = (mla) => {
    return {
      profile: { name: mla.name, mla_id: mla.mla_id, political_party: mla.party, ward_id: mla.ward, district_id: mla.district },
      performance: { overall_score: mla.performance_score, performance_label: mla.performance_label },
      complaints: Array(Math.floor(Math.random() * 50) + 10).fill().map((_, i) => ({
        id: i, title: `Mock Complaint ${i}`, status: Math.random() > 0.5 ? 'completed' : 'pending', 
        priority: Math.random() > 0.8 ? 'high' : 'medium', created_at: new Date().toISOString()
      })),
      projects: [],
      alerts: []
    };
  };

  const renderContent = () => {
    if (viewAsMlaId) {
      const selectedMla = mlas.find(m => m.mla_id === viewAsMlaId);
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-warning-500/10 to-warning-600/5 dark:from-warning-900/20 dark:to-transparent p-4 rounded-xl border border-warning-200 dark:border-warning-900/50 shadow-sm">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setViewAsMlaId(null)} className="border-warning-300 text-warning-700 dark:text-warning-500 hover:bg-warning-50"><ArrowLeft className="w-4 h-4 mr-2"/> Exit View</Button>
              <div>
                <h2 className="font-extrabold text-warning-800 dark:text-warning-500 flex items-center gap-2"><Building2 className="w-5 h-5"/> Monitoring As: {selectedMla?.name}</h2>
                <p className="text-xs font-bold text-warning-600/70 dark:text-warning-400/70 uppercase tracking-widest mt-0.5">Read-Only Mode • Super Admin Override</p>
              </div>
            </div>
          </div>
          {/* Re-use MLA Dashboard perfectly with simulated isolated data. Action buttons disabled internally via predefinedData */}
          <div className="opacity-95">
            <MLADashboard predefinedData={generateMockMlaData(selectedMla)} />
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-2xl border border-blue-800 shadow-elevated">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider">Chief Minister's Command Center</span>
                  <span className="w-2 h-2 rounded-full bg-success-500 animate-ping"></span>
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">Tamil Nadu State Monitor</h1>
                <p className="text-blue-100 mt-1">Unified super-admin visibility across all districts and departments.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              <StatCard title="Total Complaints" value={stats?.total_complaints ?? 0} icon={FileText} color="primary" />
              <StatCard title="Pending" value={Math.floor((stats?.total_complaints ?? 0) * 0.4)} icon={Activity} color="warning" />
              <StatCard title="Resolved" value={stats?.resolved_complaints ?? 0} icon={CheckCircle2} color="success" />
              <StatCard title="Active Projects" value={142} icon={Briefcase} color="info" />
              <StatCard title="Emergencies" value={5} icon={Megaphone} color="danger" />
              <StatCard title="Total MLAs" value={mlas.length} icon={Users} color="primary" />
              <StatCard title="Officer Score" value="82%" icon={Star} color="success" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h2 className="font-bold text-lg mb-4">🏆 Top Performing MLAs</h2>
                <div className="space-y-3">
                  {topMlas.map((mla, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/30 dark:bg-surface-card-dark/20 border border-border-light/40 hover:border-primary-300 cursor-pointer transition-colors" onClick={() => setSelectedMlaId(mla.mla_id)}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-accent-100 text-accent-700">#{idx + 1}</div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{mla.name}</p>
                        <p className="text-xs text-text-secondary-light">{mla.ward_name} ({mla.party})</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-600">{mla.score}/10</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="font-bold text-lg mb-4">Statewide Resolution Trend</h2>
                <div className="w-full h-[250px]">
                  <ResponsiveContainer>
                    <LineChart data={[{name:'Jan', v:65}, {name:'Feb', v:70}, {name:'Mar', v:72}, {name:'Apr', v:81}, {name:'May', v:85}]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={3} dot={{r:4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'citizen':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-info-200 bg-info-50/30">
              <h2 className="font-extrabold text-info-800 flex items-center gap-2"><UserCog className="w-5 h-5"/> Citizen Activity Monitor</h2>
              <p className="text-xs font-medium text-info-600 mt-1">Statewide citizen engagement and complaint creation trends.</p>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <StatCard title="Registered Citizens" value={245100} icon={Users} color="primary" />
              <StatCard title="Complaints Today" value={1205} icon={Activity} color="warning" />
              <StatCard title="Avg Resolution Time" value="48 Hrs" icon={CheckCircle2} color="success" />
            </div>
            <Card>
              <h3 className="font-bold text-lg mb-4">Recent Citizen Grievances</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 uppercase text-[10px] font-black text-text-secondary-light">
                    <tr><th className="p-3">Citizen</th><th className="p-3">District</th><th className="p-3">Category</th><th className="p-3">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {Array(5).fill().map((_, i) => (
                      <tr key={i}>
                        <td className="p-3 font-bold">User {Math.floor(Math.random() * 1000)}</td>
                        <td className="p-3 text-text-secondary-light">Chennai</td>
                        <td className="p-3">Water Supply</td>
                        <td className="p-3"><Badge color="warning">Pending</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );

      case 'officer':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-primary-200 bg-primary-50/30">
              <h2 className="font-extrabold text-primary-800 flex items-center gap-2"><ShieldCheck className="w-5 h-5"/> Officer Operations Monitor</h2>
              <p className="text-xs font-medium text-primary-600 mt-1">Monitor officer workloads, SLA breaches, and resolution efficiency.</p>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <StatCard title="Active Officers" value={452} icon={Users} color="info" />
              <StatCard title="SLA Breaches" value={89} icon={AlertTriangle} color="danger" />
              <StatCard title="Clearance Rate" value="78%" icon={CheckCircle2} color="success" />
            </div>
          </div>
        );

      case 'mla':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-border-light shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-extrabold text-lg">MLA Directory & Performance</h2>
                  <p className="text-xs text-text-secondary-light mt-1">Select an MLA to drill down and monitor their exact view.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-text-secondary-light uppercase text-[10px] font-black tracking-widest">
                    <tr>
                      <th className="p-4">MLA Name</th>
                      <th className="p-4">Constituency</th>
                      <th className="p-4 text-center">Score</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {filteredMlas.map(mla => (
                      <tr key={mla.mla_id} className="hover:bg-primary-50/50 transition-colors">
                        <td className="p-4 font-bold">{mla.name} <span className="block text-[10px] font-normal text-text-secondary-light">{mla.party}</span></td>
                        <td className="p-4">{mla.ward} <span className="block text-[10px] text-text-secondary-light">{mla.district}</span></td>
                        <td className="p-4 text-center font-black text-primary-600">{mla.performance_score}/10</td>
                        <td className="p-4 text-right">
                          <Button variant="outline" size="sm" onClick={() => setViewAsMlaId(mla.mla_id)}>Monitor Ward</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );

      case 'complaints':
        return (
          <div className="space-y-6 animate-fade-in">
             <Card className="border-border-light shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="font-extrabold text-lg flex items-center gap-2"><FileText className="w-5 h-5"/> Statewide Complaints Matrix</h2>
                    <p className="text-xs text-text-secondary-light mt-1">Aggregated grievance tracking across all active districts.</p>
                  </div>
                  <Badge color="danger" className="font-bold">42 Escalations</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-text-secondary-light uppercase text-[10px] font-black tracking-widest">
                      <tr>
                        <th className="p-4">Complaint ID</th>
                        <th className="p-4">District/Ward</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Age</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                      {Array(8).fill().map((_, i) => (
                        <tr key={i} className="hover:bg-primary-50/50 transition-colors">
                          <td className="p-4 font-bold text-primary-600">#TN-{Math.floor(Math.random() * 90000) + 10000}</td>
                          <td className="p-4">
                            <span className="block font-medium">{filteredMlas[i % filteredMlas.length]?.district || 'Chennai'}</span>
                            <span className="block text-[10px] text-text-secondary-light">{filteredMlas[i % filteredMlas.length]?.ward || 'Ward 10'}</span>
                          </td>
                          <td className="p-4">{['Roads', 'Water', 'Electricity', 'Sanitation'][i % 4]}</td>
                          <td className="p-4"><Badge color={i % 3 === 0 ? 'warning' : 'danger'}>{i % 3 === 0 ? 'Pending' : 'Escalated'}</Badge></td>
                          <td className="p-4 text-right font-bold text-text-secondary-light">{i + 2} Days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </Card>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-primary-200 shadow-md bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/10 dark:to-bg-dark">
              <h2 className="font-extrabold text-primary-800 dark:text-primary-400 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5"/> State Infrastructure Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(4).fill().map((_, i) => (
                  <div key={i} className="p-4 bg-white dark:bg-surface-card-dark rounded-xl border border-border-light shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold">{['Metro Phase II', 'Highway Expansion', 'Water Treatment Plant', 'Smart City Grid'][i]}</h4>
                      <Badge color="info">Active</Badge>
                    </div>
                    <p className="text-xs text-text-secondary-light">Budget: ₹{(Math.random() * 50 + 10).toFixed(1)} Crores</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span>Progress</span>
                        <span>{Math.floor(Math.random() * 50) + 30}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.floor(Math.random() * 50) + 30}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6 animate-fade-in">
             <Card>
                <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5"/> District Performance Analytics</h2>
                <div className="h-[300px] w-full mt-6">
                  <ResponsiveContainer>
                    <BarChart data={[
                      { name: 'Chennai', resolved: 450, pending: 120 },
                      { name: 'Coimbatore', resolved: 320, pending: 80 },
                      { name: 'Madurai', resolved: 210, pending: 95 },
                      { name: 'Salem', resolved: 180, pending: 40 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                      <YAxis axisLine={false} tickLine={false} fontSize={12} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend />
                      <Bar dataKey="resolved" name="Resolved Cases" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                      <Bar dataKey="pending" name="Pending Cases" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </Card>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <h2 className="font-extrabold text-lg mb-6 flex items-center gap-2"><Download className="w-5 h-5"/> Data Exports & Reporting</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border border-border-light rounded-xl hover:shadow-md transition-shadow text-center">
                  <FileText className="w-8 h-8 text-danger-500 mx-auto mb-3" />
                  <h4 className="font-bold mb-1">Statewide PDF Report</h4>
                  <p className="text-xs text-text-secondary-light mb-4">Complete summary of all districts.</p>
                  <Button variant="danger" size="sm" className="w-full">Download PDF</Button>
                </div>
                <div className="p-6 border border-border-light rounded-xl hover:shadow-md transition-shadow text-center">
                  <Activity className="w-8 h-8 text-success-500 mx-auto mb-3" />
                  <h4 className="font-bold mb-1">Performance CSV</h4>
                  <p className="text-xs text-text-secondary-light mb-4">Raw data for Officer and MLA scores.</p>
                  <Button variant="outline" size="sm" className="w-full border-success-200 text-success-700 hover:bg-success-50">Export CSV</Button>
                </div>
                <div className="p-6 border border-border-light rounded-xl hover:shadow-md transition-shadow text-center">
                  <Briefcase className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                  <h4 className="font-bold mb-1">Budget Allocation</h4>
                  <p className="text-xs text-text-secondary-light mb-4">Project budgets and expenditures.</p>
                  <Button variant="primary" size="sm" className="w-full">Export XLSX</Button>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-text-secondary-light">
            <Settings className="w-12 h-12 mb-4 opacity-50" />
            <p>This command module ({activeTab}) is being synchronized with state databases.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[85vh] bg-bg-light dark:bg-bg-dark border border-border-light rounded-2xl overflow-hidden shadow-sm">
      {/* Super Admin Internal Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 bg-surface-sidebar-light dark:bg-surface-sidebar-dark border-r border-border-light overflow-y-auto">
        <div className="p-4 border-b border-border-light sticky top-0 bg-surface-sidebar-light dark:bg-surface-sidebar-dark z-10">
          <h2 className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Super Admin</h2>
          <p className="text-[10px] font-bold text-text-secondary-light uppercase tracking-widest mt-1">Command Center</p>
        </div>
        
        <div className="p-3 space-y-6 flex-1">
          {cmSidebarSections.map(section => (
            <div key={section.title}>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-text-secondary-light mb-2">{section.title}</p>
              <div className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id && !viewAsMlaId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setViewAsMlaId(null); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                        : 'text-text-secondary-light hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary-light'
                      }`}
                    >
                      <span className="flex items-center gap-3"><Icon className="w-4 h-4" /> {item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border-light">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-danger-600 bg-danger-50 hover:bg-danger-100 rounded-lg transition-colors"
          >
            Logout Super Admin
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-surface-light dark:bg-surface-dark relative flex flex-col">
        {/* Global Hierarchical Drill-down Filter Bar */}
        {!viewAsMlaId && (
          <div className="sticky top-0 z-20 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-md border-b border-border-light px-6 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary-light">
              <MapPin className="w-4 h-4 text-primary-500" />
              <span>Hierarchical State Filter</span>
            </div>
            <div className="flex items-center gap-3">
              <Select 
                options={[{value:'all', label:'All Districts'}, ...districts.map(d => ({value:d, label:d}))]}
                value={selectedDistrict} onChange={e => { setSelectedDistrict(e.target.value); setSelectedWard('all'); setSelectedMlaId('all'); }} 
                className="w-40 h-9 bg-white"
              />
              <ChevronRight className="w-4 h-4 text-text-secondary-light" />
              <Select 
                options={[{value:'all', label:'All Wards'}, ...wards.map(w => ({value:w, label:w}))]}
                value={selectedWard} onChange={e => { setSelectedWard(e.target.value); setSelectedMlaId('all'); }} 
                className="w-40 h-9 bg-white" disabled={selectedDistrict === 'all'}
              />
              <ChevronRight className="w-4 h-4 text-text-secondary-light" />
              <Select 
                options={[{value:'all', label:'All MLAs'}, ...mlaOptions.map(m => ({value:m.mla_id, label:m.name}))]}
                value={selectedMlaId} onChange={e => setSelectedMlaId(e.target.value)} 
                className="w-48 h-9 bg-white" disabled={selectedWard === 'all'}
              />
            </div>
          </div>
        )}
        
        <div className="p-4 md:p-6 flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
