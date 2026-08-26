import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Shield, UserCheck, Clock, Calendar, CheckSquare, 
  AlertTriangle, Save, History, FileText, UserX, PlusCircle, Sparkles, CheckCircle2 
} from 'lucide-react';
import { RiskBadge, StatusBadge, PriorityBadge } from '../components/Badge';
import AIAssessmentCard from '../components/AIAssessmentCard';
import AuditTrailView from '../components/AuditTrailView';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { useAuth } from '../context/AuthContext';
import { 
  getGrievanceDetail, 
  updateGrievanceStatus, 
  scheduleCaseFollowUp, 
  getCaseAuditTrail 
} from '../services/grievanceService';

export default function CaseDetailPage({ complaintId, onBack }) {
  const { user, profile, isOfficer } = useAuth();

  const [caseData, setCaseData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states for updates
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [officerNotes, setOfficerNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState(null);

  // Follow up state
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [isSchedulingFollowUp, setIsSchedulingFollowUp] = useState(false);

  const fetchCaseDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, logs] = await Promise.all([
        getGrievanceDetail(complaintId),
        getCaseAuditTrail(complaintId)
      ]);
      setCaseData(data);
      setAuditLogs(logs);

      setStatus(data.status);
      setPriority(data.priority);
      setRiskLevel(data.risk_level);
      setOfficerNotes(data.officer_notes || '');
    } catch (err) {
      setError(err.message || 'Failed to load case details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [complaintId]);

  const handleUpdateCase = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMsg(null);

    const updatePayload = {
      status,
      priority,
      risk_level: riskLevel,
      override_reason: riskLevel !== caseData.risk_level ? overrideReason : undefined,
      officer_notes: officerNotes
    };

    try {
      const updated = await updateGrievanceStatus(complaintId, updatePayload, profile || user);
      setCaseData(updated);
      setUpdateMsg('Case status, risk classification, and officer notes updated in database.');
      const logs = await getCaseAuditTrail(complaintId);
      setAuditLogs(logs);
    } catch (err) {
      setUpdateMsg(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleScheduleFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpDate) return;

    setIsSchedulingFollowUp(true);
    try {
      await scheduleCaseFollowUp(complaintId, {
        scheduled_date: new Date(followUpDate).toISOString(),
        notes: followUpNotes
      }, profile || user);
      alert('Follow-up monitoring check scheduled successfully!');
      setFollowUpNotes('');
      fetchCaseDetails();
    } catch (err) {
      alert(`Follow-up scheduling failed: ${err.message}`);
    } finally {
      setIsSchedulingFollowUp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-xs space-y-3 animate-pulse">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div>Loading comprehensive case dossier &amp; AI triage logs from Supabase...</div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <button onClick={onBack} className="text-xs text-blue-600 font-bold flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" /> <span>Back to Triage Queue</span>
        </button>
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs">
          {error || 'Docket record not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 text-slate-900">
      {/* Top Back Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-soft-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Triage Queue</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-mono">Ref #{caseData.reference_id}</span>
          <RiskBadge level={caseData.risk_level} score={caseData.risk_score} />
          <StatusBadge status={caseData.status} />
        </div>
      </div>

      {/* Case Overview Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-sm space-y-5">
        <div className="flex flex-col md:flex-row justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Ref ID: <strong className="font-mono text-blue-700">{caseData.reference_id}</strong></span>
              <span>&bull;</span>
              <span>Logged: {new Date(caseData.created_at || caseData.submitted_at).toLocaleString()}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Category: {caseData.category.replace(/_/g, ' ')}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Complainant: <strong>{caseData.complainant_name || 'Anonymous'}</strong> ({caseData.complainant_type}) &bull; State: {caseData.state_region}
            </p>
          </div>

          <div className="flex flex-col md:items-end justify-center">
            <span className="text-[11px] text-slate-400 font-medium">Assigned Duty Officer</span>
            <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mt-0.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>{profile?.full_name || 'Inspector Rajesh Verma (SC/ST Cell)'}</span>
            </span>
          </div>
        </div>

        {/* Original Complaint Statement Box */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Complainant Statement ({caseData.input_mode} Mode)</span>
          </h4>
          <p className="text-xs sm:text-sm text-slate-900 whitespace-pre-wrap leading-relaxed font-sans">
            "{caseData.raw_input_text}"
          </p>
        </div>
      </div>

      {/* AI Assessment Card Component */}
      <AIAssessmentCard
        assessment={caseData.ai_assessment}
        riskScore={caseData.risk_score}
        riskLevel={caseData.risk_level}
        priority={caseData.priority}
      />

      {/* Human Officer Decision & Risk Override Component */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Human Officer Decision, Risk Override &amp; Status Control
              </h3>
              <p className="text-xs text-slate-500">Authorized officer oversight and review action log</p>
            </div>
          </div>
        </div>

        {updateMsg && (
          <div className="p-3.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-2xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>{updateMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdateCase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Case Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white text-xs p-3 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              >
                <option value="NEW">NEW</option>
                <option value="IN_REVIEW">IN REVIEW</option>
                <option value="ACTION_REQUIRED">ACTION REQUIRED</option>
                <option value="ESCALATED">ESCALATED TO POLICE</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority Level:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-white text-xs p-3 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="URGENT">URGENT</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            {/* Human Risk Level Override */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Human Risk Override:
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full bg-white text-xs p-3 rounded-xl border border-slate-200 font-bold text-red-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              >
                <option value="LOW">LOW RISK</option>
                <option value="MODERATE">MODERATE RISK</option>
                <option value="HIGH">HIGH RISK</option>
              </select>
            </div>
          </div>

          {/* Override Reason input if risk level is changed */}
          {riskLevel !== caseData.risk_level && (
            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-bold text-amber-900">
                Officer Override Justification Reason (Mandatory for Chain of Custody):
              </label>
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="State statutory reason for modifying the AI risk classification..."
                className="w-full bg-white text-xs p-2.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
                required
              />
            </div>
          )}

          {/* Official Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Officer Case Notes &amp; Action Log:</label>
            <textarea
              rows={3}
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              placeholder="Record official actions taken, contact with complainant, FIR registration number, referral to Special Public Prosecutor..."
              className="w-full bg-white text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-soft-sm transition flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isUpdating ? 'Saving Updates...' : 'Save Case Updates & Log Audit Event'}</span>
          </button>
        </form>
      </div>

      {/* Schedule Follow-up Monitoring Box */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-sm space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Schedule Follow-Up Monitoring Check</span>
        </h4>

        <form onSubmit={handleScheduleFollowUp} className="flex flex-col sm:flex-row gap-3">
          <input
            type="datetime-local"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 text-slate-800"
            required
          />
          <input
            type="text"
            value={followUpNotes}
            onChange={(e) => setFollowUpNotes(e.target.value)}
            placeholder="Follow-up instructions (e.g. Call complainant to confirm police FIR dispatch)..."
            className="flex-1 bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isSchedulingFollowUp}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-soft-sm"
          >
            Schedule
          </button>
        </form>
      </div>

      {/* Audit Trail Timeline View Component */}
      <AuditTrailView auditLogs={auditLogs} />
    </div>
  );
}
