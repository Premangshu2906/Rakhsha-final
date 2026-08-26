import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, UserCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { getOfficerComplaints } from '../api';
import { RiskBadge, StatusBadge } from '../components/Badge';

export default function FollowUpMonitoringPage({ onSelectComplaint }) {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFollowUpData = async () => {
      setIsLoading(true);
      try {
        const res = await getOfficerComplaints({ limit: 50 });
        // Filter cases with follow ups or high risk
        const followUpCases = res.filter(c => c.follow_ups?.length > 0 || c.risk_level === 'HIGH');
        setComplaints(followUpCases);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFollowUpData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Calendar className="w-4 h-4" />
          <span>Active Case Follow-Up & Protection Monitoring</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">
          Scheduled Welfare Checks & High-Risk Case Tracking
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Mandatory follow-up tracking board for protection officers to ensure ongoing victim safety and verify emergency dispatch outcomes.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Active Monitoring Tasks ({complaints.length} cases)</span>
          <span className="text-xs text-slate-500 font-normal">Assigned Duty Officer: Inspector Priya Sharma</span>
        </h3>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
            Loading follow-up schedule board...
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No active follow-up tasks scheduled at present.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c.id)}
                className="bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-xl p-4 transition cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-sm text-indigo-900">{c.reference_id}</span>
                    <div className="text-xs font-semibold text-slate-800 mt-0.5">
                      {c.complainant_name || 'Anonymous'} ({c.state_region})
                    </div>
                  </div>
                  <RiskBadge level={c.risk_level} score={c.risk_score} />
                </div>

                <div className="text-xs text-slate-600 line-clamp-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  "{c.raw_input_text}"
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Follow-up Status:</span>
                    <StatusBadge status={c.status} />
                  </div>

                  <span className="text-indigo-600 font-bold flex items-center space-x-1">
                    <span>Inspect Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
