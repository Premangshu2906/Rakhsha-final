import React from 'react';
import { X, User, FileText, CheckCircle, Clock, ShieldAlert, LogOut, PlusCircle, ArrowRight } from 'lucide-react';
import { PriorityBadge, StatusBadge, RiskBadge } from './Badge';

export default function CitizenDashboardModal({ isOpen, citizen, onClose, onLogout, onNewReport, onTrackCase }) {
  if (!isOpen || !citizen) return null;

  // Demo user dockets
  const sampleDockets = [
    {
      id: 'NHAA-2026-89101',
      date: '2026-08-26',
      mode: 'VOICE',
      category: 'DOMESTIC_ABUSE',
      priority: 'URGENT',
      risk_level: 'HIGH',
      risk_score: 88.5,
      status: 'ACTION_REQUIRED',
      statement: 'Landlord threatening physical eviction with weapon in Varanasi.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                Verified Citizen Profile
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                {citizen.name}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Details Strip */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Mobile Number</span>
              <strong className="text-slate-900">+91 {citizen.mobile}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Category</span>
              <strong className="text-blue-700 font-bold">{citizen.category || 'SC'}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Location</span>
              <strong className="text-slate-700">{citizen.district}, {citizen.state}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Status</span>
              <strong className="text-emerald-700 font-bold">✓ Active</strong>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>My Filed Grievance Dockets</span>
            </h4>
            <button
              onClick={() => { onClose(); onNewReport(); }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-soft-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ File New Grievance</span>
            </button>
          </div>

          {/* Dockets List */}
          <div className="space-y-3">
            {sampleDockets.map((d) => (
              <div key={d.id} className="p-4 bg-slate-50 hover:bg-blue-50/30 rounded-2xl border border-slate-200 transition">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <strong className="font-mono text-sm text-blue-700">{d.id}</strong>
                    <span className="text-[11px] text-slate-500">({d.mode} Mode &bull; {d.date})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <PriorityBadge priority={d.priority} />
                    <StatusBadge status={d.status} />
                  </div>
                </div>

                <p className="text-xs text-slate-700 line-clamp-2 mb-3 leading-relaxed">
                  "{d.statement}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-500">Special Court &amp; Nodal Officer Assigned</span>
                  <button
                    onClick={() => { onClose(); onTrackCase(d.id); }}
                    className="text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1"
                  >
                    <span>Track Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => { onLogout(); onClose(); }}
            className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Citizen Portal</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-soft-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
