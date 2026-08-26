import React from 'react';
import { CheckCircle2, ShieldAlert, PhoneCall, Copy, ArrowLeft, FileText, Lock } from 'lucide-react';
import { RiskBadge, PriorityBadge } from '../components/Badge';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function AssessmentResultPage({ complaint, onReset, onViewOfficer }) {
  if (!complaint) return null;

  const refId = complaint.reference_id;
  const token = complaint.tracking_token;
  const riskLevel = complaint.risk_level;
  const riskScore = complaint.risk_score;
  const priority = complaint.priority;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied to clipboard: ${text}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Receipt Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-900 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-100 text-emerald-700 p-3 rounded-2xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Complaint Registered Successfully
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                Reference ID: <span className="font-mono text-indigo-700">{refId}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <RiskBadge level={riskLevel} score={riskScore} />
            <PriorityBadge priority={priority} />
          </div>
        </div>

        {/* Reference Code & Tracking Key Box */}
        <div className="my-6 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium block mb-1">Official Reference Code:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300">
                {refId}
              </span>
              <button
                onClick={() => copyToClipboard(refId)}
                className="p-1.5 text-slate-500 hover:text-indigo-600 bg-white rounded-lg border border-slate-200"
                title="Copy Reference ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-medium block mb-1">Private Tracking Token:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300">
                {token}
              </span>
              <button
                onClick={() => copyToClipboard(token)}
                className="p-1.5 text-slate-500 hover:text-indigo-600 bg-white rounded-lg border border-slate-200"
                title="Copy Tracking Token"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Immediate Assessment Advisory Summary */}
        {complaint.ai_assessment && (
          <div className="my-6 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm mb-3">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Real-Time AI Triage Assessment Results</span>
            </div>

            <div className="text-xs space-y-2 text-slate-300 font-sans">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Calculated Distress Score:</span>
                <span className="font-mono font-bold text-amber-300">{complaint.ai_assessment.distress_score}/100</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Assigned Priority Flag:</span>
                <span className="font-bold text-red-400">{complaint.priority}</span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-200 block mb-1">Key Risk Indicators Identified:</span>
                <div className="flex flex-wrap gap-1.5">
                  {complaint.ai_assessment.identified_indicators?.map((ind, i) => (
                    <span key={i} className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                      • {ind}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Assistance Notice */}
        <div className="my-6 bg-red-50 border border-red-200 rounded-2xl p-5 text-xs text-red-950">
          <h4 className="font-bold text-red-900 text-sm flex items-center space-x-2 mb-2">
            <PhoneCall className="w-4 h-4 text-red-600 animate-bounce" />
            <span>Need Immediate Life-Safety Emergency Help?</span>
          </h4>
          <p className="leading-relaxed">
            If you are currently in physical danger, locked in, or facing violence, please call emergency services immediately:
            <strong> Police / Emergency: 112</strong> | <strong>NHAA Helpline: 14566</strong> | <strong>Tele-MANAS: 14416</strong>.
          </p>
        </div>

        <DisclaimerBanner />

        {/* Buttons Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
          <button
            onClick={onReset}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Submit Another Report</span>
          </button>

          <button
            onClick={onViewOfficer}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md transition"
          >
            <FileText className="w-4 h-4" />
            <span>View Case on Officer Control Room Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
