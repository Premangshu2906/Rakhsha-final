import React from 'react';
import { History, CheckCircle2, Shield, User, Clock, AlertTriangle } from 'lucide-react';

export default function AuditTrailView({ auditLogs }) {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft-sm text-xs text-slate-500 text-center">
        No audit trail activity events recorded for this docket yet.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-soft-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900">Official Case Audit Trail &amp; Chain of Custody</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">{auditLogs.length} Events Recorded</span>
      </div>

      {/* Visual Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {auditLogs.map((log, index) => {
          const isOverride = log.action && log.action.includes('OVERRIDE');
          return (
            <div key={log.id || index} className="relative group">
              {/* Timeline Dot */}
              <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                isOverride ? 'border-amber-500 bg-amber-50' : 'border-blue-600 bg-blue-50'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isOverride ? 'bg-amber-500' : 'bg-blue-600'}`}></div>
              </div>

              {/* Event Content Box */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{log.performed_by || 'Duty Officer'}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </span>
                </div>

                <div className="text-slate-800 font-semibold pt-0.5">
                  Action: <span className="text-blue-700 font-mono">{log.action}</span>
                </div>

                {log.details && (
                  <p className="text-slate-600 whitespace-pre-wrap leading-relaxed pt-1 border-t border-slate-200/60 mt-1">
                    {log.details}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
