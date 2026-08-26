import React from 'react';
import { X, User, FileText, CheckCircle, Clock, ShieldAlert, LogOut, PlusCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-600/30 border border-indigo-400/30 rounded-2xl text-indigo-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                Verified Citizen Account
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                {citizen.name}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Strip */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Mobile Number</span>
              <strong className="text-white">+91 {citizen.mobile}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Category</span>
              <strong className="text-amber-400 font-bold">{citizen.category || 'SC'}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">District / State</span>
              <strong className="text-slate-300">{citizen.district}, {citizen.state}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Account Status</span>
              <strong className="text-emerald-400 font-bold">✓ Active</strong>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>My Filed Grievance Dockets</span>
            </h4>
            <button
              onClick={() => { onClose(); onNewReport(); }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ File New Grievance</span>
            </button>
          </div>

          {/* Dockets List */}
          <div className="space-y-3">
            {sampleDockets.map((d) => (
              <div key={d.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <strong className="font-mono text-sm text-indigo-400">{d.id}</strong>
                    <span className="text-[11px] text-slate-500">({d.mode} Mode &bull; {d.date})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <PriorityBadge priority={d.priority} />
                    <StatusBadge status={d.status} />
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                  "{d.statement}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                  <span className="text-slate-400">Assigned: District Nodal Officer &bull; PoA Special Court</span>
                  <button
                    onClick={() => { onClose(); onTrackCase(d.id); }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    Track Progress &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => { onLogout(); onClose(); }}
            className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Citizen Portal</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
