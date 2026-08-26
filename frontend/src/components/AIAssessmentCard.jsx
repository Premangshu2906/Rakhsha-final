import React from 'react';
import { Sparkles, ShieldCheck, AlertCircle, FileText, CheckSquare, UserX, Cpu, AlertTriangle } from 'lucide-react';
import { RiskBadge, PriorityBadge } from './Badge';
import DisclaimerBanner from './DisclaimerBanner';

export default function AIAssessmentCard({ assessment, riskScore, riskLevel, priority }) {
  if (!assessment) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
        AI assessment processing in progress...
      </div>
    );
  }

  const score = assessment.distress_score || riskScore || 0;
  const urgency = assessment.urgency_score || score;
  const indicators = assessment.identified_indicators || [];
  const keyPhrases = assessment.key_phrases || [];
  const actions = assessment.recommended_actions || [];

  // Gauge calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let gaugeColor = '#10B981'; // green
  if (score >= 70) gaugeColor = '#DC2626'; // red
  else if (score >= 40) gaugeColor = '#F59E0B'; // amber

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-md space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-soft-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                AI Distress &amp; Threat Assessment Report
              </h3>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Model: {assessment.model_version || 'NHAA-NLP-v1.0'} &bull; Decision Support
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <RiskBadge level={assessment.risk_classification || riskLevel} score={score} />
          <PriorityBadge priority={assessment.priority_recommended || priority} />
          {assessment.human_override && (
            <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1">
              <UserX className="w-3 h-3" />
              <span>Officer Overridden</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Gauges Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80">
        {/* Left: Circular Gauge Indicator */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-2">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="#E2E8F0"
                strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke={gaugeColor}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                {score.toFixed(0)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                / 100 Score
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 mt-2.5">Distress Severity Index</span>
        </div>

        {/* Right: Score Metrics & Urgency Bar */}
        <div className="md:col-span-8 space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="text-slate-600">Urgency &amp; Immediacy Time Index:</span>
              <span className="text-blue-700 font-mono font-bold">{urgency.toFixed(1)} / 100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(urgency, 100)}%` }}
              ></div>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Distress index is calculated through multi-factor sentiment signals, acoustic tremor indicators, physical threat tokens, and caste vulnerability markers under the SC/ST PoA Act.
          </p>
        </div>
      </div>

      {/* Identified Trauma Indicators */}
      {indicators.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Identified Distress &amp; Risk Indicators</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {indicators.map((ind, idx) => {
              const isCrit = ind.toLowerCase().includes('critical') || ind.toLowerCase().includes('threat') || ind.toLowerCase().includes('physical');
              return (
                <span
                  key={idx}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium border flex items-center space-x-1 ${
                    isCrit
                      ? 'bg-red-50 text-red-800 border-red-200 font-semibold'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <span>•</span>
                  <span>{ind}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Extracted Trigger Phrases */}
      {keyPhrases.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-slate-500 block mb-2">Detected Trigger Expressions:</span>
          <div className="flex flex-wrap gap-1.5">
            {keyPhrases.map((phrase, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-mono border border-slate-200">
                "{phrase}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Structured Case Summary */}
      {assessment.ai_case_summary && (
        <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Structured AI Case Summary (For Officer Review)</span>
          </h4>
          <p className="whitespace-pre-wrap text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
            {assessment.ai_case_summary}
          </p>
        </div>
      )}

      {/* Recommended Advisory Action Points */}
      {actions.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>Advisory Triage Action Recommendations</span>
          </h4>
          <ul className="space-y-2">
            {actions.map((act, idx) => (
              <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start space-x-2.5 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-700">{idx + 1}.</span>
                <span className="leading-relaxed">{act}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Non-Medical Advisory Disclaimer */}
      <DisclaimerBanner compact={true} />
    </div>
  );
}
