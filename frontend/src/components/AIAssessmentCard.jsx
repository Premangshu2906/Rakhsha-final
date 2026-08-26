import React from 'react';
import { Cpu, ShieldCheck, AlertCircle, FileText, CheckSquare, Sparkles, UserX, AlertOctagon } from 'lucide-react';
import { RiskBadge, PriorityBadge } from './Badge';
import DisclaimerBanner from './DisclaimerBanner';

export default function AIAssessmentCard({ assessment, riskScore, riskLevel, priority }) {
  if (!assessment) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-500">
        AI Assessment data pending processing...
      </div>
    );
  }

  const score = assessment.distress_score || riskScore || 0;
  const urgency = assessment.urgency_score || score;
  const indicators = assessment.identified_indicators || [];
  const keyPhrases = assessment.key_phrases || [];
  const actions = assessment.recommended_actions || [];

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 my-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="bg-indigo-600/30 p-2 rounded-xl border border-indigo-500/40 text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base sm:text-lg text-white">AI Stress & Trauma Assessment Report</h3>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            <span className="text-xs text-slate-400 font-mono">Model: {assessment.model_version || 'NHAA-NLP-v1.0'}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <RiskBadge level={assessment.risk_classification || riskLevel} score={score} />
          <PriorityBadge priority={assessment.priority_recommended || priority} />
          {assessment.human_override && (
            <span className="bg-purple-900/80 text-purple-200 border border-purple-600 px-2 py-0.5 rounded text-xs font-semibold flex items-center space-x-1">
              <UserX className="w-3 h-3" />
              <span>Overridden by Officer</span>
            </span>
          )}
        </div>
      </div>

      {/* Distress Gauge & Urgency Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 p-4 bg-slate-900/90 rounded-xl border border-slate-800">
        {/* Distress Score Gauge */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-300">Distress & Trauma Score:</span>
            <span className={`text-lg font-extrabold font-mono ${
              score >= 70 ? 'text-red-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {score.toFixed(1)} / 100
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${
                score >= 70 ? 'bg-red-600' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(score, 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Calculated based on physical threat, distress, coercion, and panic intensity markers.
          </p>
        </div>

        {/* Urgency Score */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-300">Urgency Time Index:</span>
            <span className="text-lg font-extrabold font-mono text-indigo-400">
              {urgency.toFixed(1)} / 100
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className="bg-indigo-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(urgency, 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Evaluates immediate temporal danger, hostage, or time-critical emergency phrases.
          </p>
        </div>
      </div>

      {/* Identified Trauma Indicators */}
      <div className="mb-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Identified Distress & Risk Indicators</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {indicators.map((ind, idx) => (
            <span
              key={idx}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${
                ind.includes('CRITICAL') || ind.includes('Physical Threat')
                  ? 'bg-red-950/80 text-red-200 border-red-800'
                  : ind.includes('Trauma') || ind.includes('Coercion')
                  ? 'bg-amber-950/80 text-amber-200 border-amber-800'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              • {ind}
            </span>
          ))}
        </div>
      </div>

      {/* Trigger Key Phrases Extracted */}
      {keyPhrases.length > 0 && (
        <div className="mb-4">
          <span className="text-xs font-medium text-slate-400 block mb-1.5">Extracted Key Trigger Expressions:</span>
          <div className="flex flex-wrap gap-1.5">
            {keyPhrases.map((phrase, idx) => (
              <span key={idx} className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded font-mono border border-slate-700">
                "{phrase}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Case Summary */}
      <div className="mb-5 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
          <FileText className="w-4 h-4" />
          <span>Structured AI Case Summary (For Officer Review)</span>
        </h4>
        <pre className="whitespace-pre-wrap text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
          {assessment.ai_case_summary}
        </pre>
      </div>

      {/* Recommended Advisory Action Points */}
      {actions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <CheckSquare className="w-4 h-4" />
            <span>Advisory Triage Action Recommendations</span>
          </h4>
          <ul className="space-y-1.5">
            {actions.map((act, idx) => (
              <li key={idx} className="text-xs sm:text-sm text-slate-200 flex items-start space-x-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="font-bold text-indigo-400">{idx + 1}.</span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Non-Medical Advisory Disclaimer */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <DisclaimerBanner compact={true} />
      </div>
    </div>
  );
}
