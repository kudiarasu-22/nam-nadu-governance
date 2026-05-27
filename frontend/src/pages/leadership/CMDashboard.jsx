/**
 * Nam Nadu — CM Admin Dashboard
 */
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, StatCard, Badge } from '@/components/ui';
import { leadershipService } from '@/services/leadership.service';
import {
  TrendingUp, Activity, CheckCircle2, Star, Users
} from 'lucide-react';

export default function CMDashboard() {
  const [stats, setStats] = useState(null);
  const [mlas, setMlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError('Could not load CM Dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading State metrics...</div>;
  if (error) return <div className="text-red-500 p-6">{error}</div>;

  const topMlas = stats?.top_mlas ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-2xl border border-blue-800 shadow-elevated">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider">Chief Minister's Office</span>
            <span className="w-2 h-2 rounded-full bg-success-500 animate-ping"></span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Tamil Nadu Assembly Monitor
          </h1>
          <p className="text-blue-100 mt-1 text-sm md:text-base">
            State-wide executive monitoring of all elected members and overall development index.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total MLAs Monitored" value={mlas.length} icon={Users} color="primary" />
        <StatCard title="State Avg Performance" value={`${(stats?.avg_mla_score ?? 0).toFixed(1)}/10`} icon={Star} color="accent" />
        <StatCard title="Total Grievances" value={stats?.total_complaints ?? 0} icon={Activity} color="warning" />
        <StatCard title="State Resolution Rate" value={`${(stats?.resolution_rate ?? 0).toFixed(1)}%`} icon={CheckCircle2} color="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <div className="mb-4">
            <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Top Performing MLAs</h2>
          </div>
          <div className="space-y-3">
            {topMlas.length === 0 ? (
              <p className="text-sm text-text-secondary-light italic">No MLA performance data yet.</p>
            ) : (
              topMlas.map((mla, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/30 dark:bg-surface-card-dark/20 border border-border-light/40">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-accent-100 text-accent-700">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{mla.name}</p>
                    <p className="text-xs text-text-secondary-light">{mla.ward_name} ({mla.party})</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{mla.score}/10</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* All MLAs Directory */}
        <Card>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">MLA Directory</h2>
            <Badge color="info">Live Sync</Badge>
          </div>
          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 dark:bg-gray-800 text-text-secondary-light uppercase text-[10px] font-extrabold sticky top-0">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Ward</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3 text-right">Label</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {mlas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-text-secondary-light italic">No MLAs registered yet.</td>
                  </tr>
                ) : (
                  mlas.map(mla => (
                    <tr key={mla.mla_id} className="hover:bg-black/5">
                      <td className="p-3 font-bold">{mla.name} <span className="block text-[10px] font-normal text-text-secondary-light">{mla.party}</span></td>
                      <td className="p-3">{mla.ward} <span className="block text-[10px] text-text-secondary-light">{mla.district}</span></td>
                      <td className="p-3 text-center font-bold">{mla.performance_score}/10</td>
                      <td className="p-3 text-right">
                        <Badge color={mla.performance_label === 'Excellent' ? 'success' : 'primary'}>{mla.performance_label}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
