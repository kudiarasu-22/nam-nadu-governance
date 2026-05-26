import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui';
import { officerService } from '@/services/officer.service';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DepartmentAnalytics() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await officerService.getComplaints();
        setComplaints(res.data || []);
      } catch (error) {
        console.error('Failed to fetch analytics data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Compute stats
  const statusCounts = complaints.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const resolutionData = [
    { name: 'Resolved', value: statusCounts['resolved'] || 0 },
    { name: 'Pending', value: statusCounts['pending'] || 0 },
    { name: 'Assigned', value: statusCounts['assigned'] || 0 },
    { name: 'In Progress', value: statusCounts['in_progress'] || 0 },
    { name: 'Rejected', value: statusCounts['rejected'] || 0 },
  ].filter(d => d.value > 0);

  const categoryCounts = complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.keys(categoryCounts).map(key => ({
    name: key,
    count: categoryCounts[key]
  }));

  const wardCounts = complaints.reduce((acc, c) => {
    const ward = c.ward || 'Unknown';
    acc[ward] = (acc[ward] || 0) + 1;
    return acc;
  }, {});

  const wardData = Object.keys(wardCounts).map(key => ({
    ward: key,
    complaints: wardCounts[key]
  }));

  if (loading) {
    return <div className="p-8 text-center text-text-secondary-light">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          Department Analytics
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
          Performance and trends across your department.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold mb-4 text-lg">Complaint Resolution Status</h2>
          <div className="h-[300px]">
            {resolutionData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-text-secondary-light text-sm">No complaint data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resolutionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {resolutionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold mb-4 text-lg">Issue Category Trends</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-semibold mb-4 text-lg">Ward Performance (Volume)</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={wardData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="ward" />
                <PolarRadiusAxis />
                <Radar name="Complaints" dataKey="complaints" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
