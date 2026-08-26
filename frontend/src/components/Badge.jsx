import React from 'react';

export function RiskBadge({ level, score }) {
  let badgeStyle = "bg-slate-100 text-slate-800 border-slate-300";
  let label = level || "LOW";

  if (level === "HIGH") {
    badgeStyle = "bg-red-50 text-red-700 border-red-200 font-bold animate-pulse";
  } else if (level === "MODERATE") {
    badgeStyle = "bg-amber-50 text-amber-800 border-amber-300 font-semibold";
  } else if (level === "LOW") {
    badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200 font-medium";
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs border ${badgeStyle}`}>
      <span className={`w-2 h-2 rounded-full ${
        level === "HIGH" ? "bg-red-600" : level === "MODERATE" ? "bg-amber-500" : "bg-emerald-500"
      }`}></span>
      <span>{label} RISK</span>
      {score !== undefined && (
        <span className="text-[11px] opacity-80 font-mono">({score.toFixed(0)})</span>
      )}
    </span>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    NEW: "bg-blue-50 text-blue-700 border-blue-200",
    IN_REVIEW: "bg-indigo-50 text-indigo-700 border-indigo-200",
    ACTION_REQUIRED: "bg-purple-50 text-purple-700 border-purple-200",
    ESCALATED: "bg-red-100 text-red-800 border-red-300 font-bold",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CLOSED: "bg-slate-100 text-slate-600 border-slate-200"
  };

  const label = status ? status.replace('_', ' ') : 'NEW';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${styles[status] || styles.NEW}`}>
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const styles = {
    CRITICAL: "bg-red-600 text-white font-extrabold shadow-sm",
    URGENT: "bg-amber-500 text-white font-bold",
    NORMAL: "bg-slate-200 text-slate-700 font-medium"
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] ${styles[priority] || styles.NORMAL}`}>
      {priority || 'NORMAL'}
    </span>
  );
}
