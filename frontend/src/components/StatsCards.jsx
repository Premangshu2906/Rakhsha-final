import React from 'react';
import { ShieldAlert, AlertTriangle, FileText, CheckCircle2, Clock, Activity, ArrowUpRight } from 'lucide-react';

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const total = stats.total_complaints || 0;
  const highRisk = stats.high_risk_count || 0;
  const urgentPrio = stats.urgent_priority_count || 0;
  const actionReq = stats.action_required_count || 0;
  const resolved = stats.resolved_count || 0;
  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(0) : 0;

  const cardItems = [
    {
      title: 'High Risk Queue',
      val: highRisk,
      sub: 'Immediate Intervention',
      icon: ShieldAlert,
      color: 'text-red-600',
      bg: 'bg-red-50/80',
      border: 'border-red-100',
      iconBg: 'bg-red-100 text-red-600'
    },
    {
      title: 'Urgent Priority',
      val: urgentPrio,
      sub: 'Expedited Triage',
      icon: AlertTriangle,
      color: 'text-amber-700',
      bg: 'bg-amber-50/80',
      border: 'border-amber-100',
      iconBg: 'bg-amber-100 text-amber-700'
    },
    {
      title: 'Action Required',
      val: actionReq,
      sub: 'Pending Officer Review',
      icon: Clock,
      color: 'text-blue-700',
      bg: 'bg-blue-50/80',
      border: 'border-blue-100',
      iconBg: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'Total Registered Cases',
      val: total,
      sub: 'All Intake Channels',
      icon: FileText,
      color: 'text-slate-900',
      bg: 'bg-white',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700'
    },
    {
      title: 'Resolution Rate',
      val: `${resolutionRate}%`,
      sub: `${resolved} Closed Cases`,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-100 text-emerald-700'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 my-4">
      {cardItems.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            className={`${item.bg} border ${item.border} rounded-2xl p-4 sm:p-5 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {item.title}
              </span>
              <div className={`p-2 rounded-xl ${item.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${item.color}`}>
                {item.val}
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-0.5 block">
                {item.sub}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
