import React from 'react';
import { ShieldAlert, AlertTriangle, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const total = stats.total_complaints || 0;
  const highRisk = stats.high_risk_count || 0;
  const urgentPrio = stats.urgent_priority_count || 0;
  const actionReq = stats.action_required_count || 0;
  const resolved = stats.resolved_count || 0;
  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(0) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 my-4">
      {/* High Risk Card */}
      <div className="bg-gradient-to-br from-red-50 to-red-100/60 border border-red-200 rounded-xl p-3.5 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-red-900">High Risk Queue</span>
          <div className="p-2 bg-red-600 text-white rounded-lg shadow-sm">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-red-950">{highRisk}</span>
          <span className="text-[11px] font-medium text-red-700 bg-red-200/80 px-1.5 py-0.5 rounded">Immediate Action</span>
        </div>
      </div>

      {/* Urgent Priority */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200 rounded-xl p-3.5 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Urgent Priority</span>
          <div className="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-950">{urgentPrio}</span>
          <span className="text-[11px] font-medium text-amber-700 bg-amber-200/80 px-1.5 py-0.5 rounded">Triage Priority</span>
        </div>
      </div>

      {/* Action Required */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100/60 border border-purple-200 rounded-xl p-3.5 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-900">Action Required</span>
          <div className="p-2 bg-purple-600 text-white rounded-lg shadow-sm">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-950">{actionReq}</span>
          <span className="text-[11px] font-medium text-purple-700 bg-purple-200/80 px-1.5 py-0.5 rounded">Pending Officer</span>
        </div>
      </div>

      {/* Total Complaints */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Total Registered</span>
          <div className="p-2 bg-slate-700 text-white rounded-lg shadow-sm">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{total}</span>
          <span className="text-[11px] font-medium text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">All Intake</span>
        </div>
      </div>

      {/* Resolution Rate */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200 rounded-xl p-3.5 sm:p-4 shadow-sm col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Resolution Rate</span>
          <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950">{resolutionRate}%</span>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-200/80 px-1.5 py-0.5 rounded">{resolved} Closed</span>
        </div>
      </div>
    </div>
  );
}
