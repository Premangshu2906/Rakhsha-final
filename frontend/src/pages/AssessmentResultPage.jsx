import React from 'react';
import { 
  CheckCircle2, ShieldAlert, PhoneCall, Copy, ArrowLeft, FileText, 
  Lock, Printer, Sparkles, Scale, HeartHandshake, ChevronRight, UserCheck, Shield 
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

  const handlePrint = () => {
    window.print();
  };

  // Score circular gauge calculation
  const scoreNum = typeof riskScore === 'number' ? riskScore : (complaint.ai_assessment?.distress_score || 0);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scoreNum / 100) * circumference;

  let gaugeColor = '#10B981';
  if (scoreNum >= 70) gaugeColor = '#DC2626';
  else if (scoreNum >= 40) gaugeColor = '#F59E0B';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 text-slate-900">
      {/* Top Confirmation Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-soft-md space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Grievance Recorded Confidentially
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Complaint Submitted Successfully
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <RiskBadge level={riskLevel} score={riskScore} />
            <PriorityBadge priority={priority} />
          </div>
        </div>

        {/* Official Reference ID & Tracking Token Box */}
        <div className="p-5 sm:p-6 bg-slate-50/90 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium block mb-1.5">Official Reference Docket ID:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 select-all shadow-soft-sm">
                {refId}
              </span>
              <button
                onClick={() => copyToClipboard(refId, 'Reference ID')}
                className="p-2 text-slate-500 hover:text-blue-600 bg-white rounded-xl border border-slate-200 transition shadow-soft-sm"
                title="Copy Reference ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-medium block mb-1.5">Private Verification Token:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-blue-700 bg-white px-3 py-2 rounded-xl border border-slate-200 select-all shadow-soft-sm">
                {token}
              </span>
              <button
                onClick={() => copyToClipboard(token, 'Tracking Token')}
                className="p-2 text-slate-500 hover:text-blue-600 bg-white rounded-xl border border-slate-200 transition shadow-soft-sm"
                title="Copy Tracking Token"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Immediate Assessment Summary */}
        {complaint.ai_assessment && (
          <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
            <div className="flex items-center space-x-2 text-blue-800 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Triage Distress &amp; Risk Assessment Summary</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-4 flex items-center space-x-4">
                <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r={radius} stroke="#E2E8F0" strokeWidth="7" fill="transparent" />
                    <circle 
                      cx="40" cy="40" r={radius} 
                      stroke={gaugeColor} strokeWidth="7" 
                      strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
                      strokeLinecap="round" fill="transparent" 
                    />
                  </svg>
                  <span className="absolute font-mono font-extrabold text-slate-900 text-lg">
                    {scoreNum.toFixed(0)}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Distress Index</span>
                  <span className="text-[11px] text-slate-500">Calculated score out of 100</span>
                </div>
              </div>

              <div className="sm:col-span-8 space-y-2 text-xs text-slate-700">
                <div className="flex justify-between border-b border-blue-100 pb-1.5">
                  <span className="text-slate-500">Assigned Priority Level:</span>
                  <span className="font-bold text-red-600">{complaint.priority}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-500 block mb-1">Key Indicators Identified:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {complaint.ai_assessment.identified_indicators?.map((ind, i) => (
                      <span key={i} className="bg-white text-slate-800 px-2.5 py-0.5 rounded-lg border border-blue-200 text-[11px] font-medium shadow-soft-sm">
                        • {ind}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* What Happens Next? - Visual Workflow Timeline */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
            <HeartHandshake className="w-4 h-4 text-blue-600" />
            <span>What happens next?</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] inline-flex items-center justify-center mb-1">1</span>
              <strong className="block text-emerald-950 font-bold">Submitted</strong>
              <span className="text-[10px] text-emerald-700">Docket Encrypted</span>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] inline-flex items-center justify-center mb-1">2</span>
              <strong className="block text-blue-950 font-bold">AI Assessment</strong>
              <span className="text-[10px] text-blue-700">Triaged in Real-Time</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold text-[10px] inline-flex items-center justify-center mb-1">3</span>
              <strong className="block text-slate-900 font-bold">Human Review</strong>
              <span className="text-[10px] text-slate-500">Duty Nodal Officer</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold text-[10px] inline-flex items-center justify-center mb-1">4</span>
              <strong className="block text-slate-900 font-bold">Assistance</strong>
              <span className="text-[10px] text-slate-500">Legal Aid &amp; Police</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="w-5 h-5 rounded-full bg-slate-700 text-white font-bold text-[10px] inline-flex items-center justify-center mb-1">5</span>
              <strong className="block text-slate-900 font-bold">Follow-Up</strong>
              <span className="text-[10px] text-slate-500">Status Verification</span>
            </div>
          </div>
        </div>

        {/* Emergency Helplines Notice */}
        <div className="p-5 bg-red-50/80 border border-red-200/80 rounded-2xl text-xs text-red-950 flex items-start space-x-3.5">
          <PhoneCall className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-900 text-xs sm:text-sm">
              In immediate danger? Connect with Emergency Units
            </h4>
            <p className="text-red-800 leading-relaxed text-xs">
              If you are facing active threats, call <strong>Police SOS: 112</strong> or <strong>NHAA Helpline: 14566</strong> immediately.
            </p>
          </div>
        </div>

        <DisclaimerBanner compact={true} />

        {/* Action Buttons Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onReset}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center space-x-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Submit Another Complaint</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-soft-sm flex items-center space-x-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Docket Receipt</span>
            </button>

            <button
              onClick={onViewOfficer}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition"
            >
              <FileText className="w-4 h-4" />
              <span>View in Officer Dashboard &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
