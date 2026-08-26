import React from 'react';
import { BarChart2, PieChart as PieIcon, ShieldAlert } from 'lucide-react';

export default function RiskChart({ stats }) {
  if (!stats) return null;

  const total = stats.total_complaints || 1;
  const highPercent = Math.round(((stats.high_risk_count || 0) / total) * 100);
  const modPercent = Math.round(((stats.moderate_risk_count || 0) / total) * 100);
  const lowPercent = Math.round(((stats.low_risk_count || 0) / total) * 100);

  const categories = stats.category_breakdown || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-4">
      {/* Risk Distribution Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">AI Risk Level Distribution</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Triage Analytics</span>
        </div>

        {/* Visual Progress Bars */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-red-700 flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <span>HIGH RISK ({stats.high_risk_count || 0} cases)</span>
              </span>
              <span className="text-red-900 font-mono">{highPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div className="bg-red-600 h-3 rounded-full transition-all duration-500" style={{ width: `${highPercent}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-amber-700 flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>MODERATE RISK ({stats.moderate_risk_count || 0} cases)</span>
              </span>
              <span className="text-amber-900 font-mono">{modPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div className="bg-amber-500 h-3 rounded-full transition-all duration-500" style={{ width: `${modPercent}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-emerald-700 flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>LOW RISK ({stats.low_risk_count || 0} cases)</span>
              </span>
              <span className="text-emerald-900 font-mono">{lowPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div className="bg-emerald-500 h-3 rounded-full transition-all duration-500" style={{ width: `${lowPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Complaint Category Spread</h3>
          </div>
          <span className="text-xs text-slate-500">Real-Time Intake</span>
        </div>

        <div className="space-y-2.5">
          {Object.keys(categories).length === 0 ? (
            <div className="text-xs text-slate-400 py-4 text-center">No categories recorded yet</div>
          ) : (
            Object.entries(categories).map(([cat, count]) => {
              const catPercent = Math.round((count / total) * 100);
              const label = cat.replace('_', ' ');
              return (
                <div key={cat} className="flex items-center text-xs">
                  <span className="w-36 font-medium text-slate-700 truncate">{label}</span>
                  <div className="flex-1 mx-2 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${catPercent}%` }}></div>
                  </div>
                  <span className="w-12 text-right font-mono font-semibold text-slate-800">{count} ({catPercent}%)</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
