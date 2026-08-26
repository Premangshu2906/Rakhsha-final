import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

const RISK_COLORS = {
  HIGH: '#DC2626',
  MODERATE: '#F59E0B',
  LOW: '#10B981'
};

const CATEGORY_COLORS = ['#2563EB', '#14B8A6', '#8B5CF6', '#F59E0B', '#EC4899', '#64748B'];

export default function RiskChart({ stats }) {
  if (!stats) return null;

  const riskData = [
    { name: 'HIGH', count: stats.high_risk_count || 0, color: RISK_COLORS.HIGH },
    { name: 'MODERATE', count: stats.moderate_risk_count || 0, color: RISK_COLORS.MODERATE },
    { name: 'LOW', count: stats.low_risk_count || 0, color: RISK_COLORS.LOW }
  ];

  const categoryData = Object.entries(stats.category_distribution || {}).map(([key, val], idx) => ({
    name: key.replace(/_/g, ' '),
    count: val,
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700 space-y-0.5 font-sans">
          <p className="font-bold">{label || payload[0].name}</p>
          <p className="text-slate-300">
            Cases: <strong className="text-white font-mono">{payload[0].value}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 my-4">
      {/* Chart 1: Risk Severity Distribution */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-soft-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">AI Risk Classification Volume</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Real-Time Triage</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Category Breakdown */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-soft-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <PieIcon className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-sm text-slate-900">Incident Category Breakdown</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">PoA &amp; Crime Types</span>
        </div>

        <div className="h-60 w-full flex items-center justify-center">
          {categoryData.length === 0 ? (
            <div className="text-xs text-slate-400">No incident category data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
