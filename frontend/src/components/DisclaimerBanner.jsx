import React from 'react';
import { Info, ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center space-x-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span>
          <strong>Advisory Notice:</strong> AI distress scores provide decision support for triage. Final assessment and intervention decisions remain with authorized human officers.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 sm:p-5 text-slate-700 text-xs sm:text-sm flex items-start space-x-3.5 shadow-soft-sm">
      <div className="p-2 bg-blue-100/80 rounded-xl text-blue-700 flex-shrink-0 mt-0.5">
        <Info className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
          Advisory AI Decision Support &bull; Confidentiality Guarantee
        </h4>
        <p className="text-slate-600 leading-relaxed text-xs">
          This system provides automated real-time distress prioritization to assist duty officers. It is not a clinical or psychological diagnostic tool. In case of active threats or danger to life, direct emergency services are immediately alerted.
        </p>
      </div>
    </div>
  );
}
