import React from 'react';

export function RiskBadge({ level, score }) {
  const normLevel = (level || 'LOW').toUpperCase();

  const configs = {
    HIGH: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      dot: 'bg-red-500'
    },
    MODERATE: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500'
    },
    LOW: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500'
    }
  };

  const config = configs[normLevel] || configs.LOW;

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      <span>{normLevel} RISK</span>
      {score !== undefined && (
        <span className="font-mono text-[11px] opacity-75 font-normal">
          ({typeof score === 'number' ? score.toFixed(0) : score})
        </span>
      )}
    </span>
  );
}

export function StatusBadge({ status }) {
  const normStatus = (status || 'NEW').toUpperCase();

  const styles = {
    NEW: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_REVIEW: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    ACTION_REQUIRED: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
    ESCALATED: 'bg-red-50 text-red-700 border-red-200 font-bold',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CLOSED: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const label = normStatus.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${styles[normStatus] || styles.NEW}`}>
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const normPriority = (priority || 'NORMAL').toUpperCase();

  const styles = {
    CRITICAL: 'bg-red-600 text-white font-bold shadow-sm',
    URGENT: 'bg-amber-500 text-white font-semibold shadow-sm',
    NORMAL: 'bg-slate-100 text-slate-700 border border-slate-200 font-medium'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] tracking-wide ${styles[normPriority] || styles.NORMAL}`}>
      {normPriority}
    </span>
  );
}
