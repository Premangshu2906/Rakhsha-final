import React, { useState, useEffect } from 'react';
import { 
  FileText, PlusCircle, Clock, CheckCircle2, AlertTriangle, 
  ArrowRight, Shield, Search, RefreshCw, ChevronRight, X, HeartHandshake 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyGrievances } from '../services/grievanceService';
import { RiskBadge, StatusBadge, PriorityBadge } from '../components/Badge';
import { SlaStatusBadge, CitizenEnquiryBox, CitizenFeedbackCard } from '../components/GrievanceActionWidgets';

export default function MyGrievancesPage({ onNewGrievance, onSelectGrievance }) {
  const { user, profile } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadGrievances = async () => {
    setIsLoading(true);
    try {
      const data = await getMyGrievances(user?.id, user?.email);
      setGrievances(data);
    } catch (err) {
      console.error('Error loading citizen grievances:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGrievances();
  }, [user?.id, user?.email]);

  const filtered = grievances.filter(g => {
    const matchesStatus = filterStatus === 'ALL' || g.status === filterStatus;
    const matchesSearch = !searchQuery || 
      g.reference_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.raw_input_text?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = grievances.filter(g => g.status !== 'RESOLVED' && g.status !== 'CLOSED').length;
  const resolvedCount = grievances.filter(g => g.status === 'RESOLVED' || g.status === 'CLOSED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 text-slate-900">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 mb-1">
            <Shield className="w-4 h-4" />
            <span>Citizen Grievance Dashboard &bull; MoSJE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {profile?.full_name || user?.email?.split('@')[0] || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View, track, and monitor all confidential grievances filed under your verified citizen account.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadGrievances}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition shadow-soft-sm"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onNewGrievance}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center space-x-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Write a New Grievance</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-soft-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Registered</span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">{grievances.length}</div>
          <span className="text-xs text-slate-400 mt-0.5 block">All submissions on record</span>
        </div>

        <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-100 shadow-soft-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Active In-Triage / Review</span>
          <div className="mt-2 text-3xl font-extrabold text-blue-700 font-mono">{activeCount}</div>
          <span className="text-xs text-blue-600 mt-0.5 block">Under officer review or police alert</span>
        </div>

        <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-100 shadow-soft-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Resolved / Assistance Completed</span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-700 font-mono">{resolvedCount}</div>
          <span className="text-xs text-emerald-600 mt-0.5 block">FIR registered &amp; relief claimed</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-soft-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex space-x-2 w-full sm:w-auto">
          {['ALL', 'NEW', 'IN_REVIEW', 'ACTION_REQUIRED', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterStatus === st
                  ? 'bg-blue-600 text-white shadow-soft-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search my grievances..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 pl-8 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Grievance Cards List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 animate-pulse space-y-2">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>Loading your registered grievances...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-4 shadow-soft-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Grievances Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {grievances.length === 0 
              ? "You haven't filed any grievance dockets yet. Click below to submit a confidential report."
              : "No complaints matched your search filter criteria."}
          </p>
          {grievances.length === 0 && (
            <button
              onClick={onNewGrievance}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              + File First Grievance
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((g) => (
            <div
              key={g.id}
              onClick={() => setSelectedCase(g)}
              className="bg-white hover:bg-blue-50/30 border border-slate-200 rounded-3xl p-5 sm:p-6 transition shadow-soft-sm hover:shadow-soft-md cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    {g.reference_id}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    &bull; Logged: {new Date(g.created_at).toLocaleDateString()} at {new Date(g.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <SlaStatusBadge complaint={g} />
                  <StatusBadge status={g.status} />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900">
                  Category: {g.category.replace(/_/g, ' ')}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans">
                  "{g.raw_input_text}"
                </p>
              </div>

              {/* Workflow Status Bar */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                  <span>Input Mode: <strong className="text-slate-800">{g.input_mode}</strong></span>
                  <span>&bull;</span>
                  <span>State: <strong className="text-slate-800">{g.state_region}</strong></span>
                </div>

                <span className="text-blue-600 font-bold text-xs flex items-center space-x-1 hover:underline">
                  <span>View Status &amp; Timeline Details</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grievance Detail Modal for Citizen */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                  Confidential Citizen Docket
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 font-mono">
                  {selectedCase.reference_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Category</span>
                  <strong className="text-slate-900">{selectedCase.category.replace(/_/g, ' ')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Status</span>
                  <StatusBadge status={selectedCase.status} />
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">State / Region</span>
                  <strong className="text-slate-800">{selectedCase.state_region}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Date Logged</span>
                  <strong className="text-slate-700">{new Date(selectedCase.created_at).toLocaleDateString()}</strong>
                </div>
              </div>

              {/* Statement Description */}
              <div>
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">
                  Grievance Description Statement
                </h4>
                <p className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 leading-relaxed font-sans text-xs sm:text-sm">
                  "{selectedCase.raw_input_text}"
                </p>
              </div>

              {/* Next Steps & Workflow Progress */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <HeartHandshake className="w-4 h-4 text-blue-600" />
                  <span>Workflow Progress &amp; Next Steps</span>
                </h4>
                
                <div className="grid grid-cols-4 gap-2 text-[11px] text-center">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 font-bold">
                    1. Received ✓
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 font-bold">
                    2. Intake Processed ✓
                  </div>
                  <div className={`p-3 rounded-xl font-bold ${
                    selectedCase.status !== 'NEW' ? 'bg-blue-50 border border-blue-200 text-blue-950' : 'bg-slate-100 text-slate-400'
                  }`}>
                    3. Officer Review
                  </div>
                  <div className={`p-3 rounded-xl font-bold ${
                    selectedCase.status === 'RESOLVED' || selectedCase.status === 'CLOSED' ? 'bg-emerald-50 border border-emerald-200 text-emerald-950' : 'bg-slate-100 text-slate-400'
                  }`}>
                    4. Relief &amp; Closed
                  </div>
                </div>
              </div>

              {/* 15-Hour Citizen Enquiry Comment Box */}
              <CitizenEnquiryBox
                complaint={selectedCase}
                onCommentSubmitted={(updated) => setSelectedCase(updated)}
              />

              {/* Post-Resolution Feedback Card (Satisfied / Not Satisfied) */}
              <CitizenFeedbackCard
                complaint={selectedCase}
                onFeedbackSubmitted={(updated) => setSelectedCase(updated)}
              />

              {/* Emergency Hotline Banner */}
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-900">
                <strong>Facing active threats or urgent danger?</strong> Call <strong>14566</strong> or Police SOS <strong>112</strong> immediately.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-soft-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
