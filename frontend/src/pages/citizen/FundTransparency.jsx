/**
 * Nam Nadu — Fund Transparency Dashboard
 */
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, StatCard, Badge } from '@/components/ui';
import { MOCK_FUNDS } from '@/mock';

const COLORS = ['#3f51b5', '#fbc02d', '#2e7d32', '#d32f2f', '#0288d1'];

export default function FundTransparency() {
  const { t } = useTranslation();
  const { totalBudget, spent, wardAllocations, departmentSpending } = MOCK_FUNDS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          {t('funds.title')}
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
          {t('funds.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('funds.total_budget')} value={`₹${totalBudget / 10000000}Cr`} color="primary" />
        <StatCard title={t('funds.total_spent')} value={`₹${spent / 10000000}Cr`} color="warning" />
        <StatCard title={t('funds.utilization_rate')} value={`${Math.round((spent / totalBudget) * 100)}%`} color="info" />
        <StatCard title={t('funds.projects_funded')} value="142" color="success" />
      </div>

      <Card className="bg-gradient-to-br from-surface-light to-surface-card-light dark:from-surface-dark dark:to-surface-card-dark">
        <h2 className="font-bold text-lg mb-2">{t('funds.fund_journey')}</h2>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
          {t('funds.fund_journey_desc')}
        </p>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative">
          {/* Connecting Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-border-light dark:bg-border-dark -z-10 -translate-y-1/2"></div>
          
          {MOCK_FUNDS.fundJourney.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center bg-surface-card-light dark:bg-surface-card-dark p-4 rounded-2xl shadow-sm border border-border-light dark:border-border-dark w-full md:w-48 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 text-white font-bold ${step.status === 'completed' ? 'bg-success-500' : step.status === 'in_progress' ? 'bg-primary-500' : 'bg-warning-500'}`}>
                {idx + 1}
              </div>
              <h3 className="font-bold text-center text-sm">{step.stage}</h3>
              <p className="text-xs text-text-secondary-light mt-1 font-mono">{step.amount || `${step.items} ${t('funds.pending')}`}</p>
              <Badge color={step.status === 'completed' ? 'success' : step.status === 'in_progress' ? 'primary' : 'warning'} className="mt-3 text-[10px] uppercase">
                {step.status.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-6">{t('funds.department_spending')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentSpending}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {departmentSpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-6">{t('funds.ward_budget_chart')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={wardAllocations.map(w => ({
                  name: w.name,
                  Allocated: w.allocated / 10000000,
                  Spent: w.spent / 10000000
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Bar dataKey="Allocated" fill="#3f51b5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#fbc02d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">{t('funds.top_contractors')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-light dark:bg-surface-dark text-text-secondary-light">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">{t('funds.contractor')}</th>
                <th className="px-4 py-3">{t('funds.projects')}</th>
                <th className="px-4 py-3">{t('funds.total_value')}</th>
                <th className="px-4 py-3">{t('funds.on_time')}</th>
                <th className="px-4 py-3 rounded-r-lg">{t('funds.trust_rating')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-light dark:border-border-dark">
                <td className="px-4 py-3 font-medium">{t('funds.contractors.lt', 'L&T Infrastructure')}</td>
                <td className="px-4 py-3">12</td>
                <td className="px-4 py-3">₹45.5 Cr</td>
                <td className="px-4 py-3 text-success-600 font-medium">92%</td>
                <td className="px-4 py-3">4.8/5.0</td>
              </tr>
              <tr className="border-b border-border-light dark:border-border-dark">
                <td className="px-4 py-3 font-medium">{t('funds.contractors.ramco', 'Ramco Constructions')}</td>
                <td className="px-4 py-3">8</td>
                <td className="px-4 py-3">₹12.2 Cr</td>
                <td className="px-4 py-3 text-warning-600 font-medium">75%</td>
                <td className="px-4 py-3">4.1/5.0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
