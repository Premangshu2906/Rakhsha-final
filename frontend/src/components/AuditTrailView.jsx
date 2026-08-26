import React from 'react';
import { History, UserCheck, Shield, Clock } from 'lucide-react';

export default function AuditTrailView({ auditLogs }) {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-500">
        No audit log history recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm my-4">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-4">
        <History className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-slate-900 text-sm sm:text-base">Immutable Audit Log & Action Trail</h3>
      </div>

      <div className="space-y-3">
        {auditLogs.map((log) => (
          <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-1">
              <span className="font-bold text-indigo-950 flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>{log.actor_name}</span>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase">
                  {log.action}
                </span>
              </span>
              <span className="text-slate-400 font-mono flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </span>
            </div>
            <p className="text-slate-700 font-sans leading-normal pl-5">
              {log.details}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
