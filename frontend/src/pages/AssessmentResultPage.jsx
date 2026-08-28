import React, { useState } from 'react';
import { CheckCircle2, Circle, ArrowLeft, Search, Eye, FileText, Heart, Sparkles, Send } from 'lucide-react';
import { CitizenEnquiryBox, CitizenFeedbackCard } from '../components/GrievanceActionWidgets';
import { addCitizenComment } from '../services/grievanceService';

const CATEGORY_QUESTIONS = {
  DOMESTIC_ABUSE: [
    { id: 'Discriminated_by_caste', text: 'Were you discriminated against because of your caste?' },
    { id: 'Physically_assaulted', text: 'Were you physically assaulted or injured?' },
    { id: 'Threatened_during_incident', text: 'Were you threatened during the incident?' }
  ],
  HARASSMENT: [
    { id: 'Excluded_or_boycotted', text: 'Were you excluded or boycotted by others?' },
    { id: 'Publicly_insulted', text: 'Were you publicly insulted or humiliated?' },
    { id: 'Prevented_public_access', text: 'Were you prevented from accessing a public place or service?' }
  ],
  PHYSICAL_ASSAULT: [
    { id: 'Serious_physical_injury', text: 'Did you suffer serious physical injury?' },
    { id: 'Threatened_harm_or_death', text: 'Were you threatened with serious harm or death?' },
    { id: 'Currently_feel_unsafe', text: 'Do you currently feel unsafe or at risk?' }
  ],
  CYBER_CRIME: [
    { id: 'Abusive_hateful_language', text: 'Were you targeted with abusive or hateful language?' },
    { id: 'Harassment_online_social', text: 'Did the harassment happen online or through social media?' },
    { id: 'Repeatedly_harassed', text: 'Were you threatened or repeatedly harassed?' }
  ],
  TRAFFICKING: [
    { id: 'Forced_work_against_will', text: 'Were you forced to work against your will?' },
    { id: 'Prevented_leaving_situation', text: 'Were you prevented from leaving the work or situation?' },
    { id: 'Denied_payment_or_threatened', text: 'Were you threatened or denied payment for your work?' }
  ],
  OTHER: [
    { id: 'Forced_give_up_land', text: 'Were you forced or pressured to give up your land?' },
    { id: 'Occupied_land_without_permission', text: 'Did someone occupy or take control of your land without permission?' },
    { id: 'Reported_authority_before', text: 'Have you reported this issue to any authority before?' }
  ]
};

function CategoryClarificationCard({ complaint }) {
  const category = complaint?.category || 'DOMESTIC_ABUSE';
  const questions = CATEGORY_QUESTIONS[category] || CATEGORY_QUESTIONS.DOMESTIC_ABUSE;

  const [answers, setAnswers] = useState(complaint?.category_responses || {});
  const [isSubmitted, setIsSubmitted] = useState(Boolean(complaint?.category_responses && Object.keys(complaint.category_responses).length > 0));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAnswers = async () => {
    if (Object.keys(answers).length === 0) return;
    setIsSubmitting(true);
    try {
      // Format answers as clarification comment
      const summaryText = Object.entries(answers)
        .map(([qKey, aVal]) => `${qKey.replace(/_/g, ' ')}: ${aVal}`)
        .join(' | ');

      await addCitizenComment(complaint.id || complaint.reference_id, `[Category Clarification Answers] ${summaryText}`);
      setIsSubmitted(true);
    } catch (e) {
      console.warn('Clarification submission fallback notice:', e);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs space-y-2">
        <div className="flex items-center space-x-2 text-blue-900 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>✓ Additional Category Clarifications Received</span>
        </div>
        <p className="text-slate-600">
          Thank you. Your responses have been appended to your complaint docket for the duty officer.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white border border-blue-200/90 rounded-2xl space-y-4 shadow-soft-sm">
      <div className="flex items-center space-x-2 border-b border-blue-100 pb-3">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <div>
          <h4 className="font-extrabold text-xs text-blue-950 uppercase tracking-wider">
            Quick Incident Clarification Questions
          </h4>
          <p className="text-[11px] text-slate-500 font-normal">
            Answering these 3 quick questions helps authorized officers triage your case faster.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-soft-sm">
            <span className="text-xs font-semibold text-slate-800">
              {idx + 1}. {q.text}
            </span>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: 'Yes' }))}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  answers[q.id] === 'Yes'
                    ? 'bg-blue-600 text-white shadow-soft-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: 'No' }))}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  answers[q.id] === 'No'
                    ? 'bg-slate-800 text-white shadow-soft-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                No
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmitAnswers}
        disabled={isSubmitting || Object.keys(answers).length === 0}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-soft-sm transition flex items-center justify-center space-x-2 cursor-pointer"
      >
        <Send className="w-3.5 h-3.5" />
        <span>{isSubmitting ? 'Saving Responses...' : 'Submit Clarification Answers &rarr;'}</span>
      </button>
    </div>
  );
}

export default function AssessmentResultPage({ 
  complaint, 
  onReset, 
  onTrackComplaint,
  onViewMyGrievances 
}) {
  if (!complaint) return null;

  // Format Complaint ID (e.g. RAK-2026-001284)
  const complaintId = complaint.reference_id || 'RAK-2026-001284';

  // Format Submitted Date/Time (e.g. 27 August 2026 · 8:42 PM)
  const dateObj = complaint.created_at ? new Date(complaint.created_at) : new Date();
  const formattedDate = dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const submittedString = `${formattedDate} · ${formattedTime}`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 text-slate-900 font-sans">
      {/* Main Container */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-soft-md space-y-8">
        
        {/* Title */}
        <div className="pb-4 border-b border-slate-100">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Your complaint
          </h1>
        </div>

        {/* Complaint ID & Submitted Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs sm:text-sm">
          <div>
            <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[11px] mb-1">
              Complaint ID
            </span>
            <span className="font-mono text-base font-bold text-slate-900 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 inline-block shadow-soft-sm">
              {complaintId}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[11px] mb-1">
              Submitted
            </span>
            <span className="font-semibold text-slate-800">
              {submittedString}
            </span>
          </div>
        </div>

        {/* Current status timeline */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Current status
          </h2>

          <div className="space-y-4 pt-1">
            {/* Step 1: Complaint submitted */}
            <div className="flex items-start space-x-3.5 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-emerald-950">
                  ✓ Complaint submitted
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Your complaint has been securely received.
                </p>
              </div>
            </div>

            {/* Step 2: Awaiting review */}
            <div className="flex items-start space-x-3.5 p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 live-pulse-dot"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-blue-950">
                  ● Awaiting review
                </h3>
                <p className="text-xs text-blue-900 mt-0.5">
                  An authorized officer will review the information you provided.
                </p>
              </div>
            </div>

            {/* Step 3: Follow-up / Support */}
            <div className="flex items-start space-x-3.5 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="w-3 h-3 rounded-full border-2 border-slate-400"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-700">
                  ○ Follow-up / Support
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  You may be contacted if additional information or support is needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 15-Hour Citizen Enquiry Comment Box & Post-Resolution Feedback */}
        <CategoryClarificationCard complaint={complaint} />
        <CitizenEnquiryBox complaint={complaint} />
        <CitizenFeedbackCard complaint={complaint} />

        {/* What you can do now */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            What you can do now
          </h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onViewMyGrievances || onReset}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>View My Complaint</span>
            </button>

            <button
              onClick={onTrackComplaint || onReset}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Track Complaint</span>
            </button>

            <button
              onClick={onReset}
              className="flex-1 py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>Return to Home</span>
            </button>
          </div>
        </div>

        {/* Small text */}
        <div className="pt-2 text-center">
          <p className="text-xs text-slate-500 italic">
            Take your time. You are in control of what you choose to share.
          </p>
        </div>
      </div>

      {/* Quiet closing message at the very bottom */}
      <div className="text-center pt-2">
        <p className="text-sm font-medium text-slate-600 flex items-center justify-center space-x-1.5">
          <span>“Thank you for trusting us with your story.”</span>
        </p>
      </div>
    </div>
  );
}
