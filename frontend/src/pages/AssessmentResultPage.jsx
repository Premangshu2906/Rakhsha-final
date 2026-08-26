import React from 'react';
import { 
  CheckCircle2, ShieldAlert, PhoneCall, Copy, ArrowLeft, FileText, 
  Lock, Printer, Download, Sparkles, Scale, AlertOctagon, UserCheck 
} from 'lucide-react';
import { RiskBadge, PriorityBadge } from '../components/Badge';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function AssessmentResultPage({ complaint, onReset, onViewOfficer }) {
  if (!complaint) return null;

  const refId = complaint.reference_id;
  const token = complaint.tracking_token;
  const riskLevel = complaint.risk_level;
  const riskScore = complaint.risk_score;
  const priority = complaint.priority;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ${label} to clipboard: ${text}`);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      {/* Top Receipt Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-red-600 to-indigo-600"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="bg-emerald-500/20 text-emerald-400 p-3.5 rounded-2xl border border-emerald-400/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                <span>✓ Grievance Registered &amp; Encrypted</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                Official Docket Ref: <span className="font-mono text-indigo-400">{refId}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <RiskBadge level={riskLevel} score={riskScore} />
            <PriorityBadge priority={priority} />
          </div>
        </div>

        {/* Reference Code & Tracking Key Box */}
        <div className="my-6 p-5 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block mb-1.5">Official Reference Docket ID:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-white bg-slate-900 px-3 py-2 rounded-xl border border-slate-700 select-all">
                {refId}
              </span>
              <button
                onClick={() => copyToClipboard(refId, 'Reference ID')}
                className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-700 transition"
                title="Copy Reference ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-medium block mb-1.5">Private Verification Token:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-amber-300 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700 select-all">
                {token}
              </span>
              <button
                onClick={() => copyToClipboard(token, 'Tracking Token')}
                className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-700 transition"
                title="Copy Tracking Token"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Immediate Assessment Advisory Summary */}
        {complaint.ai_assessment && (
          <div className="my-6 bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-inner">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm mb-4">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Real-Time AI Distress &amp; Threat Triage Result</span>
            </div>

            <div className="text-xs space-y-3 text-slate-300">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
                <span>Calculated Distress Score:</span>
                <span className="font-mono font-extrabold text-sm text-amber-400">
                  {complaint.ai_assessment.distress_score}/100
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
                <span>Assigned Statutory Priority:</span>
                <span className="font-bold text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded border border-red-800">
                  {complaint.priority}
                </span>
              </div>

              <div className="pt-2">
                <span className="font-semibold text-slate-200 block mb-2">Identified Risk &amp; Atrocity Indicators:</span>
                <div className="flex flex-wrap gap-2">
                  {complaint.ai_assessment.identified_indicators?.map((ind, i) => (
                    <span key={i} className="bg-slate-900 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] border border-slate-700 font-medium">
                      • {ind}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Call Box */}
        <div className="my-6 bg-red-950/70 border border-red-800/80 rounded-2xl p-5 text-xs text-red-200">
          <h4 className="font-bold text-red-100 text-sm flex items-center space-x-2 mb-2">
            <PhoneCall className="w-4 h-4 text-red-400 animate-bounce" />
            <span>Need Immediate Life-Safety Emergency Help?</span>
          </h4>
          <p className="leading-relaxed text-red-200">
            If you are currently in physical danger, locked in, or facing active threats, call emergency dispatch immediately:
            <strong className="text-white"> Police: 112</strong> | <strong className="text-white">NHAA Atrocities Helpline: 14566</strong>.
          </p>
        </div>

        <DisclaimerBanner compact={true} />

        {/* Action Buttons Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-800">
          <button
            onClick={onReset}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center space-x-2 transition border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Submit Another Grievance</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintReceipt}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span>Print Docket Slip</span>
            </button>

            <button
              onClick={onViewOfficer}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-lg transition"
            >
              <FileText className="w-4 h-4" />
              <span>Inspect on Officer Console &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
