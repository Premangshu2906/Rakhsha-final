import React from 'react';
import { AlertOctagon, Info } from 'lucide-react';

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 flex items-start space-x-2">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p>
          <strong>Advisory Notice:</strong> AI risk output is for triage prioritization only. It does not replace medical or psychological diagnosis. Final decisions rest with human officers.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/90 border-l-4 border-amber-500 rounded-r-xl p-4 shadow-sm text-xs sm:text-sm text-amber-950 my-3">
      <div className="flex items-start space-x-3">
        <AlertOctagon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-amber-900 uppercase tracking-wider text-xs mb-1">
            Mandatory Safety & Ethical AI Guardrail Disclaimer
          </h4>
          <p className="leading-relaxed">
            This module provides automated stress, distress, and trauma-risk indicator assessment solely as an 
            <strong> advisory decision-support and triage prioritization tool</strong>. It <strong>DOES NOT</strong> perform 
            clinical, psychiatric, or psychological diagnosis. Final investigation, priority override, and intervention decisions 
            remain strictly with designated human officers of the NHAA / police authorities.
          </p>
        </div>
      </div>
    </div>
  );
}
