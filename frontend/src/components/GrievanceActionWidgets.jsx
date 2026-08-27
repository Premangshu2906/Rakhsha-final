import React, { useState } from 'react';
import { AlertTriangle, MessageSquare, Star, ThumbsUp, ThumbsDown, Send, CheckCircle2, Clock } from 'lucide-react';
import { addCitizenComment, addComplaintFeedback } from '../services/grievanceService';

/**
 * Calculates 12h SLA Exceeded and 15h Citizen Comment eligibility
 */
export function getSlaInfo(complaint) {
  if (!complaint) return { hoursElapsed: 0, isExceeded12h: false, canComment15h: false, isResolved: false };

  const timestamp = complaint.submitted_at || complaint.created_at;
  const createdTime = timestamp ? new Date(timestamp).getTime() : Date.now();
  const now = Date.now();
  const hoursElapsed = Math.max(0, (now - createdTime) / (1000 * 60 * 60));
  const isResolved = complaint.status === 'RESOLVED' || complaint.status === 'CLOSED';

  return {
    hoursElapsed: Math.round(hoursElapsed * 10) / 10,
    isExceeded12h: hoursElapsed >= 12 && !isResolved,
    canComment15h: hoursElapsed >= 15 && !isResolved,
    isResolved
  };
}

/**
 * 12h SLA Exceeded Badge & Alert Banner
 */
export function SlaStatusBadge({ complaint }) {
  const { hoursElapsed, isExceeded12h } = getSlaInfo(complaint);
  if (!isExceeded12h) return null;

  return (
    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-red-600 text-white animate-pulse shadow-sm">
      <AlertTriangle className="w-3.5 h-3.5" />
      <span>🚨 Time Limit Exceeded ({hoursElapsed}h elapsed)</span>
    </span>
  );
}

/**
 * Citizen 15-Hour Enquiry Comment Box
 */
export function CitizenEnquiryBox({ complaint, onCommentSubmitted }) {
  const { hoursElapsed, canComment15h } = getSlaInfo(complaint);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState(null);

  if (!canComment15h) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const updated = await addCitizenComment(complaint.id || complaint.reference_id, commentText.trim());
      setSubmittedMsg('Your enquiry comment has been submitted and escalated to duty officers.');
      setCommentText('');
      if (onCommentSubmitted) onCommentSubmitted(updated);
    } catch (err) {
      alert(err.message || 'Failed to submit comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 shadow-soft-sm text-slate-900 space-y-3">
      <div className="flex items-center space-x-2 text-amber-900">
        <MessageSquare className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <h4 className="font-extrabold text-sm">Citizen Delayed Resolution Enquiry (15+ Hours Elapsed)</h4>
          <p className="text-[11px] text-amber-800">
            {hoursElapsed} hours have passed since your complaint was registered. You may provide additional comments or inquire about resolution status below.
          </p>
        </div>
      </div>

      {complaint.citizen_comment ? (
        <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs">
          <span className="font-bold text-amber-900 block mb-1">Your Submitted Enquiry Comment ({new Date(complaint.citizen_comment_at || Date.now()).toLocaleString()}):</span>
          <p className="text-slate-800 italic">"{complaint.citizen_comment}"</p>
        </div>
      ) : submittedMsg ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{submittedMsg}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2 text-xs">
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Type your inquiry, comments, or additional details about your unresolved grievance..."
            className="w-full bg-white border border-amber-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-soft-sm transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Enquiry Comment'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/**
 * Citizen Post-Resolution Feedback Card (Satisfied / Not Satisfied)
 */
export function CitizenFeedbackCard({ complaint, onFeedbackSubmitted }) {
  const isResolved = complaint?.status === 'RESOLVED' || complaint?.status === 'CLOSED';
  const [selectedRating, setSelectedRating] = useState(complaint?.feedback_rating || null);
  const [commentText, setCommentText] = useState(complaint?.feedback_comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState(null);

  if (!isResolved) return null;

  const handleSubmit = async (rating, comment = null) => {
    setIsSubmitting(true);
    try {
      const updated = await addComplaintFeedback(complaint.id || complaint.reference_id, rating, comment);
      setSubmittedMsg('Thank you! Your feedback has been recorded.');
      setSelectedRating(rating);
      if (onFeedbackSubmitted) onFeedbackSubmitted(updated);
    } catch (err) {
      alert(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-5 shadow-soft-sm text-slate-900 space-y-3">
      <div className="flex items-center space-x-2 text-emerald-950">
        <Star className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div>
          <h4 className="font-extrabold text-sm">Grievance Resolution Feedback</h4>
          <p className="text-[11px] text-emerald-800">
            Your grievance has been marked as resolved by authorized officers. Please let us know your feedback below.
          </p>
        </div>
      </div>

      {submittedMsg || complaint?.feedback_rating ? (
        <div className="p-4 bg-white rounded-xl border border-emerald-200 text-xs space-y-1">
          <div className="flex items-center space-x-2 font-bold text-slate-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Feedback Status: {complaint?.feedback_rating || selectedRating}</span>
          </div>
          {(complaint?.feedback_comment || commentText) && (
            <p className="text-slate-700 italic pl-6">"{complaint?.feedback_comment || commentText}"</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleSubmit('SATISFIED')}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-soft-sm transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Satisfied 😊</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRating('NOT_SATISFIED')}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-soft-sm transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>Not Satisfied 🙁</span>
            </button>
          </div>

          {selectedRating === 'NOT_SATISFIED' && (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('NOT_SATISFIED', commentText.trim()); }} className="space-y-2 text-xs animate-fadeIn">
              <label className="block font-semibold text-slate-700">Please describe why you are not satisfied with the resolution:</label>
              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Explain your concern or why the resolution was incomplete..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedRating(null)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-soft-sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Explanation'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
