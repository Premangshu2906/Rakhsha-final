import React, { useState } from 'react';
import { Send, Mic, ShieldAlert, Lock, Search, PhoneCall, AlertTriangle, CheckCircle } from 'lucide-react';
import VoiceRecorder from '../components/VoiceRecorder';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { submitComplaint, trackComplaint } from '../api';

const INDIAN_STATES = [
  'Delhi NCR', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh',
  'West Bengal', 'Gujarat', 'Kerala', 'Telangana', 'Rajasthan', 'Madhya Pradesh', 'Other'
];

const CATEGORIES = [
  { id: 'DOMESTIC_ABUSE', label: 'Domestic Abuse / Physical Violence' },
  { id: 'HARASSMENT', label: 'Workplace or Public Harassment' },
  { id: 'CYBER_CRIME', label: 'Cyber Harassment / Blackmail / Morphing' },
  { id: 'TRAFFICKING', label: 'Human Trafficking / Illegal Imprisonment' },
  { id: 'PHYSICAL_ASSAULT', label: 'Physical Assault / Threat to Life' },
  { id: 'OTHER', label: 'General Grievance / Other Distress' }
];

export default function PublicPortal({ onSubmitSuccess }) {
  const [complainantType, setComplainantType] = useState('VICTIM');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [stateRegion, setStateRegion] = useState('Delhi NCR');
  const [category, setCategory] = useState('DOMESTIC_ABUSE');
  const [inputMode, setInputMode] = useState('TEXT');
  const [inputText, setInputText] = useState('');
  const [voiceFile, setVoiceFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Tracking Search state
  const [searchRefId, setSearchRefId] = useState('');
  const [searchToken, setSearchToken] = useState('');
  const [trackedCase, setTrackedCase] = useState(null);
  const [trackingError, setTrackingError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!inputText || inputText.trim().length < 5) {
      setErrorMsg('Please describe your situation or use the voice recording feature before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        complainant_type: complainantType,
        complainant_name: complainantType !== 'ANONYMOUS' ? name : 'Anonymous',
        complainant_phone: complainantType !== 'ANONYMOUS' ? phone : '',
        complainant_email: complainantType !== 'ANONYMOUS' ? email : '',
        state_region: stateRegion,
        category: category,
        input_mode: inputMode,
        raw_input_text: inputText
      };

      const result = await submitComplaint(payload);
      onSubmitSuccess(result);
    } catch (err) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    setTrackingError(null);
    setTrackedCase(null);

    if (!searchRefId.trim()) {
      setTrackingError('Please enter a valid Reference ID (e.g., NHAA-2026-89101)');
      return;
    }

    try {
      const res = await trackComplaint(searchRefId.trim(), searchToken.trim());
      setTrackedCase(res);
    } catch (err) {
      setTrackingError(err.message || 'Reference ID not found.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner & Mandatory Disclaimer */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl mb-6 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-200 mb-3">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Confidential & Secure Intake Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            NHAA 14566 Distress Grievance & AI Triage System
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Report incidents of domestic violence, harassment, trafficking, cyber threats, or severe distress. 
            Our AI real-time triage module immediately prioritizes urgent cases to alert duty officers.
          </p>
        </div>
      </div>

      <DisclaimerBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Intake Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Step 1: Complainant Intake Details</span>
              <span className="text-xs text-indigo-600 font-normal">Confidential Encryption Enabled</span>
            </h3>

            {errorMsg && (
              <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Complainant Type Switcher */}
            <div className="my-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Who is filing this report?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'VICTIM', label: 'Victim / Self' },
                  { id: 'THIRD_PARTY', label: 'Third Party / Relative' },
                  { id: 'ANONYMOUS', label: 'Anonymous Reporter' }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setComplainantType(type.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                      complainantType === type.id
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm ring-1 ring-indigo-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Personal Information fields */}
            {complainantType !== 'ANONYMOUS' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Contact No.</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Region & Incident Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State / Region in India</label>
                <select
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="w-full bg-white text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input Mode Selector */}
            <div className="my-5 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Step 2: Choose Statement Input Mode
              </label>
              <div className="flex space-x-3 mb-4">
                <button
                  type="button"
                  onClick={() => setInputMode('TEXT')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center space-x-2 transition ${
                    inputMode === 'TEXT'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>Type Text Statement</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('VOICE')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center space-x-2 transition ${
                    inputMode === 'VOICE'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Voice Statement (STT)</span>
                </button>
              </div>

              {/* Voice Recorder Component */}
              <div className="mb-4">
                <VoiceRecorder onTranscriptChange={(text) => setInputText(text)} />
              </div>

              {/* Main Text Input Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Statement & Incident Description:
                </label>
                <textarea
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe what happened, location details, threats faced, or immediate assistance needed..."
                  className="w-full bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm p-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-inner"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Running Real-Time AI Stress Assessment...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Complaint for Immediate AI Triage</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar: Emergency Helplines & Status Tracker */}
        <div className="space-y-6">
          {/* Track Existing Complaint Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 pb-2 border-b border-slate-100 mb-3">
              <Search className="w-4 h-4 text-indigo-600" />
              <span>Track Complaint Progress</span>
            </h3>

            <form onSubmit={handleTrackSearch} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={searchRefId}
                  onChange={(e) => setSearchRefId(e.target.value)}
                  placeholder="Reference ID (e.g. NHAA-2026-89101)"
                  className="w-full bg-slate-50 text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-lg transition"
              >
                Track Status
              </button>
            </form>

            {trackingError && (
              <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {trackingError}
              </div>
            )}

            {trackedCase && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>{trackedCase.reference_id}</span>
                  <span className="text-indigo-600 font-semibold">{trackedCase.status}</span>
                </div>
                <div className="text-slate-600">Category: {trackedCase.category}</div>
                <div className="text-slate-500 text-[11px]">Submitted: {new Date(trackedCase.submitted_at).toLocaleString()}</div>
              </div>
            )}
          </div>

          {/* National Emergency Helplines Widget */}
          <div className="bg-gradient-to-b from-indigo-900 to-slate-950 text-white rounded-2xl p-5 shadow-lg border border-indigo-800">
            <h3 className="font-bold text-base flex items-center space-x-2 text-yellow-300 pb-3 border-b border-indigo-800/80 mb-4">
              <PhoneCall className="w-5 h-5 animate-pulse text-red-400" />
              <span>National Distress Helplines</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-indigo-950/80 p-3 rounded-xl border border-indigo-800/60">
                <div className="font-bold text-yellow-300 text-sm">NHAA Helpline: 14566</div>
                <div className="text-indigo-200 mt-0.5">National Helpline for Action Against Abuse</div>
              </div>

              <div className="bg-indigo-950/80 p-3 rounded-xl border border-indigo-800/60">
                <div className="font-bold text-red-300 text-sm">National Emergency: 112</div>
                <div className="text-indigo-200 mt-0.5">Instant Police, Ambulance & Fire Response</div>
              </div>

              <div className="bg-indigo-950/80 p-3 rounded-xl border border-indigo-800/60">
                <div className="font-bold text-emerald-300 text-sm">Tele-MANAS: 14416</div>
                <div className="text-indigo-200 mt-0.5">24/7 National Tele-Mental Health Counseling</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
