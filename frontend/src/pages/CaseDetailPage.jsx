import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Shield, UserCheck, Clock, Calendar, CheckSquare, 
  AlertTriangle, Save, History, FileText, UserX, PlusCircle
} from 'lucide-react';
import { RiskBadge, StatusBadge, PriorityBadge } from '../components/Badge';
import AIAssessmentCard from '../components/AIAssessmentCard';
import AuditTrailView from '../components/AuditTrailView';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { getComplaintDetail, updateComplaintStatus, scheduleFollowUp, getAuditTrail } from '../api';

export default function CaseDetailPage({ complaintId, onBack }) {
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
        getComplaintDetail(complaintId),
        getAuditTrail(complaintId)
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
      const updated = await updateComplaintStatus(complaintId, updatePayload);
      setCaseData(updated);
      setUpdateMsg('Case status & officer review updated successfully!');
      // Refresh audit logs
      const logs = await getAuditTrail(complaintId);
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
      await scheduleFollowUp(complaintId, {
        scheduled_date: new Date(followUpDate).toISOString(),
        notes: followUpNotes
      });
      alert('Follow-up scheduled successfully!');
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
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500 animate-pulse text-xs">
        Loading case details and AI assessment payload...
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="text-xs text-indigo-600 font-bold mb-4 flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" /> <span>Back to Dashboard</span>
        </button>
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs">
          {error || 'Case not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Triage Queue</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-mono">Case ID #{caseData.id}</span>
          <RiskBadge level={caseData.risk_level} score={caseData.risk_score} />
          <StatusBadge status={caseData.status} />
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Ref ID: <strong className="font-mono text-indigo-700">{caseData.reference_id}</strong></span>
              <span>•</span>
              <span>Submitted: {new Date(caseData.submitted_at).toLocaleString()}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Category: {caseData.category.replace('_', ' ')}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Complainant: <strong>{caseData.complainant_name || 'Anonymous'}</strong> ({caseData.complainant_type}) • State: {caseData.state_region}
            </p>
          </div>

          <div className="flex flex-col items-end justify-center">
            <span className="text-xs text-slate-400">Assigned Duty Officer</span>
            <span className="text-xs font-bold text-indigo-950 flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Inspector Priya Sharma</span>
            </span>
          </div>
        </div>

        {/* Original Complaint Statement Box */}
        <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Complainant Raw Statement ({caseData.input_mode} Mode)</span>
          </h4>
          <p className="text-xs sm:text-sm text-slate-900 whitespace-pre-wrap leading-relaxed font-sans">
            "{caseData.raw_input_text}"
          </p>
        </div>
      </div>

      {/* AI Stress Assessment Component */}
      <AIAssessmentCard
        assessment={caseData.ai_assessment}
        riskScore={caseData.risk_score}
        riskLevel={caseData.risk_level}
        priority={caseData.priority}
      />

      {/* Human Officer Decision & Override Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <span>Human Officer Decision, Risk Override & Status Control</span>
        </h3>

        {updateMsg && (
          <div className="my-3 p-3 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-semibold">
            {updateMsg}
          </div>
        )}

        <form onSubmit={handleUpdateCase} className="space-y-4 my-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Case Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 text-xs p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-800"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 text-xs p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-800"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="URGENT">URGENT</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            {/* Human Risk Level Override */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Human Risk Override (Optional):
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full bg-slate-50 text-xs p-2.5 rounded-lg border border-slate-300 font-bold text-red-700"
              >
                <option value="LOW">LOW RISK</option>
                <option value="MODERATE">MODERATE RISK</option>
                <option value="HIGH">HIGH RISK</option>
              </select>
            </div>
          </div>

          {/* Override Reason input if risk level modified */}
          {riskLevel !== caseData.risk_level && (
            <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
              <label className="block text-xs font-bold text-purple-900 mb-1">
                Human Officer Override Justification Reason (Required for Audit Trail):
              </label>
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="State officer justification for changing AI risk classification..."
                className="w-full bg-white text-xs p-2 rounded-lg border border-purple-300 focus:outline-none"
                required
              />
            </div>
          )}

          {/* Officer Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Official Officer Investigation Notes:</label>
            <textarea
              rows={3}
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              placeholder="Record official actions taken, contact log with complainant, police station referral notes..."
              className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isUpdating ? 'Saving Update...' : 'Save Case Updates & Log Audit Event'}</span>
          </button>
        </form>
      </div>

      {/* Schedule Follow-up Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Schedule Follow-Up Monitoring Check</span>
        </h4>

        <form onSubmit={handleScheduleFollowUp} className="flex flex-col sm:flex-row gap-3">
          <input
            type="datetime-local"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="bg-slate-50 text-xs p-2.5 rounded-lg border border-slate-300"
            required
          />
          <input
            type="text"
            value={followUpNotes}
            onChange={(e) => setFollowUpNotes(e.target.value)}
            placeholder="Follow-up instructions (e.g. Call complainant to confirm police dispatch)..."
            className="flex-1 bg-slate-50 text-xs p-2.5 rounded-lg border border-slate-300"
          />
          <button
            type="submit"
            disabled={isSchedulingFollowUp}
            className="bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition"
          >
            Schedule
          </button>
        </form>

        {/* Existing Follow-ups list */}
        {caseData.follow_ups?.length > 0 && (
          <div className="mt-4 space-y-2">
            <span className="text-xs font-semibold text-slate-500 block">Scheduled Monitoring Tasks:</span>
            {caseData.follow_ups.map((f) => (
              <div key={f.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800">{new Date(f.scheduled_date).toLocaleString()}</span>
                  <span className="text-slate-600 ml-2">— {f.notes || 'Routine check'}</span>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-bold">
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Trail Log View */}
      <AuditTrailView auditLogs={auditLogs} />
    </div>
  );
}
