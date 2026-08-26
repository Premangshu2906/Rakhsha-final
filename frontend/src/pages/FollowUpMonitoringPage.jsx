import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, UserCheck, AlertTriangle, ArrowRight, Shield } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 text-slate-900">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-sm">
        <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Calendar className="w-4 h-4" />
          <span>Active Case Follow-Up &amp; Protection Monitoring</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Scheduled Welfare Checks &amp; High-Risk Case Tracking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Mandatory follow-up monitoring board for protection officers to ensure ongoing victim safety, verify emergency police response, and confirm legal aid assignment.
        </p>
      </div>

      {/* Cases Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <span>Active Monitoring Tasks ({complaints.length} cases)</span>
          </h3>
          <span className="text-xs text-slate-400">Assigned: District Nodal Protection Officer</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500 animate-pulse space-y-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>Loading active follow-up schedule board...</div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No active follow-up tasks scheduled at present.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c.id)}
                className="bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200 rounded-2xl p-5 transition cursor-pointer flex flex-col justify-between space-y-3.5 shadow-soft-sm hover:shadow-soft-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-sm text-blue-700">{c.reference_id}</span>
                    <div className="text-xs font-semibold text-slate-800 mt-0.5">
                      {c.complainant_name || 'Anonymous'} &bull; {c.state_region}
                    </div>
                  </div>
                  <RiskBadge level={c.risk_level} score={c.risk_score} />
                </div>

                <div className="text-xs text-slate-600 line-clamp-2 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed font-sans">
                  "{c.raw_input_text}"
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/80">
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Status:</span>
                    <StatusBadge status={c.status} />
                  </div>

                  <span className="text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1">
                    <span>Inspect Dossier</span>
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
