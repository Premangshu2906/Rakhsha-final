import React, { useState, useEffect } from 'react';
import { 
  Send, Mic, ShieldAlert, Lock, Search, PhoneCall, AlertTriangle, 
  CheckCircle, FileText, Scale, Shield, Sparkles, User, ExternalLink, ArrowRight 
} from 'lucide-react';
import VoiceRecorder from '../components/VoiceRecorder';
import DisclaimerBanner from '../components/DisclaimerBanner';
import StatutoryDocuments from '../components/StatutoryDocuments';
import { submitComplaint, trackComplaint } from '../api';

const INDIAN_STATES = [
  'Uttar Pradesh', 'Maharashtra', 'Delhi NCR', 'Karnataka', 'Tamil Nadu',
  'Madhya Pradesh', 'Rajasthan', 'Bihar', 'West Bengal', 'Gujarat', 'Kerala', 'Telangana', 'Other'
];

const CATEGORIES = [
  { id: 'DOMESTIC_ABUSE', label: 'Caste Discrimination & Physical Assault', sub: 'PoA Act Sec. 3(1) Offences' },
  { id: 'HARASSMENT', label: 'Social Boycott & Public Humiliation', sub: 'PoA Act Sec. 3(1)(r) Insult' },
  { id: 'PHYSICAL_ASSAULT', label: 'Grievous Hurt & Threat to Life', sub: 'Immediate Police & SP Alert' },
  { id: 'CYBER_CRIME', label: 'Hate Speech & Online Harassment', sub: 'Digital Atrocity Protection' },
  { id: 'TRAFFICKING', label: 'Forced Labor & Bonded Exploitation', sub: 'Relief Slab Reimbursement' },
  { id: 'OTHER', label: 'Land Dispossession / General Grievance', sub: 'Magistrate Relief Claim' }
];

export default function PublicPortal({ onSubmitSuccess, citizenUser, onOpenCitizenAuth }) {
  const [complainantType, setComplainantType] = useState('VICTIM');
  const [name, setName] = useState(citizenUser ? citizenUser.name : '');
  const [phone, setPhone] = useState(citizenUser ? citizenUser.mobile : '');
  const [email, setEmail] = useState('');
  const [stateRegion, setStateRegion] = useState(citizenUser ? citizenUser.state || 'Uttar Pradesh' : 'Uttar Pradesh');
  const [category, setCategory] = useState('DOMESTIC_ABUSE');
  const [inputMode, setInputMode] = useState('VOICE');
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Tracking Search state
  const [searchRefId, setSearchRefId] = useState('');
  const [searchToken, setSearchToken] = useState('');
  const [trackedCase, setTrackedCase] = useState(null);
  const [trackingError, setTrackingError] = useState(null);

  useEffect(() => {
    if (citizenUser) {
      setName(citizenUser.name);
      setPhone(citizenUser.mobile);
      if (citizenUser.state) setStateRegion(citizenUser.state);
    }
  }, [citizenUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!inputText || inputText.trim().length < 5) {
      setErrorMsg('Please record your voice or write what happened before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        complainant_type: complainantType,
        complainant_name: complainantType !== 'ANONYMOUS' ? (name || 'Citizen Reporter') : 'Anonymous',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. Hero Banner with High-Tech Graphic Design */}
      <div className="hero-glow-bg text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>MoSJE Initiative &bull; SC/ST (PoA) Act 1989 &bull; Section 18A Safeguard</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              You Don't Have to Face Injustice &amp; Atrocities <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">Alone.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Report incidents of caste-based violence, discrimination, or distress through secure voice or text. 
              Our real-time AI evaluates urgency to immediately alert District Nodal Officers, Special Public Prosecutors, and Emergency Response Units.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <span className="bg-slate-950/60 border border-slate-700/80 px-3 py-1 rounded-xl text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Confidential</span>
              </span>
              <span className="bg-slate-950/60 border border-slate-700/80 px-3 py-1 rounded-xl text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Mandatory Zero-FIR</span>
              </span>
              <span className="bg-slate-950/60 border border-slate-700/80 px-3 py-1 rounded-xl text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Mic className="w-3.5 h-3.5 text-indigo-400" />
                <span>Multilingual Voice AI</span>
              </span>
              <span className="bg-slate-950/60 border border-slate-700/80 px-3 py-1 rounded-xl text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <span>💰 Statutory Relief Slabs</span>
              </span>
            </div>
          </div>

          {/* Hero Side Action Box */}
          <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse-dot"></span>
                <span>24x7 Triage Active</span>
              </span>
              <span className="text-[11px] font-mono text-indigo-400">Toll-Free 14566</span>
            </div>

            <div className="space-y-2">
              <a
                href="tel:14566"
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-between transition shadow-md"
              >
                <span className="flex items-center space-x-2">
                  <PhoneCall className="w-4 h-4" />
                  <span>Call 14566 (NHAA Toll-Free)</span>
                </span>
                <span className="text-[10px] bg-amber-900/60 px-2 py-0.5 rounded font-mono">24/7</span>
              </a>

              <a
                href="tel:112"
                className="w-full py-2.5 px-3 bg-red-800/80 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-between transition border border-red-700"
              >
                <span className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-300" />
                  <span>Call 112 (Police Emergency)</span>
                </span>
                <span className="text-[10px] bg-red-950 px-2 py-0.5 rounded font-mono">SOS</span>
              </a>
            </div>

            <div className="pt-2 text-center">
              {!citizenUser ? (
                <button
                  onClick={onOpenCitizenAuth}
                  className="text-xs text-indigo-300 hover:text-white font-semibold underline underline-offset-4"
                >
                  Sign In to save grievances to your Citizen Profile &rarr;
                </button>
              ) : (
                <div className="text-xs text-emerald-400 font-semibold">
                  ✓ Signed in as {citizenUser.name} ({citizenUser.category || 'SC'})
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 24x7 Immediate Danger SOS Ribbon */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-red-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-red-600 rounded-xl text-white shadow-inner flex-shrink-0 animate-bounce">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              Are you or your family in immediate physical danger?
            </h3>
            <p className="text-xs text-red-200">
              Do not wait for AI evaluation. Connect directly with Emergency Dispatch Units &bull; Dial <strong>112</strong> or <strong>14566</strong> now.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <a
            href="tel:112"
            className="flex-1 sm:flex-none px-4 py-2 bg-white text-red-900 hover:bg-red-50 font-bold text-xs rounded-xl shadow transition text-center"
          >
            🚨 Dial 112
          </a>
          <a
            href="tel:14566"
            className="flex-1 sm:flex-none px-4 py-2 bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-xs rounded-xl shadow transition text-center"
          >
            📞 Dial 14566
          </a>
        </div>
      </div>

      <DisclaimerBanner />

      {/* 3. Main Grievance Submission Form & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Main Intake Form */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-indigo-400 uppercase">
                  Step 1: Confidential Grievance Details
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  Record Incident Statement
                </h3>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Statutory Encryption</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Complainant Type Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Who is filing this report?
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'VICTIM', label: 'Victim / Self', icon: '👤' },
                  { id: 'THIRD_PARTY', label: 'Relative / Witness', icon: '👥' },
                  { id: 'ANONYMOUS', label: 'Anonymous Reporter', icon: '🛡️' }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setComplainantType(type.id)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold border transition text-center flex flex-col items-center gap-1 ${
                      complainantType === type.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-base">{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Complainant Info Fields */}
            {complainantType !== 'ANONYMOUS' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-900 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Contact No.</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-900 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Region & Incident Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State / UT in India</label>
                <select
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="w-full bg-slate-950 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Category (PoA Act)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mode Switcher & Input */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Step 2: Choose Statement Input Mode
              </label>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setInputMode('VOICE')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-2 transition ${
                    inputMode === 'VOICE'
                      ? 'bg-gradient-to-r from-red-600 to-indigo-600 text-white border-indigo-500 shadow-lg'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Mic className="w-4 h-4 text-amber-300" />
                  <span>🎙️ Voice Statement (AI Speech-to-Text)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInputMode('TEXT')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center space-x-2 transition ${
                    inputMode === 'TEXT'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>✍️ Type Written Statement</span>
                </button>
              </div>

              {/* Voice Recorder Component */}
              {inputMode === 'VOICE' && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <VoiceRecorder onTranscriptChange={(text) => setInputText(text)} />
                </div>
              )}

              {/* Main Statement Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Statement &amp; Incident Description:
                </label>
                <textarea
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe what happened, persons involved, weapons/threats used, location, and immediate assistance needed..."
                  className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 text-xs sm:text-sm p-4 rounded-2xl border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-inner"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="animate-pulse flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Running Real-Time AI Stress &amp; Threat Triage...</span>
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Grievance for Immediate AI Triage &rarr;</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Docket Tracker & Emergency Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Docket Tracker Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-100 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Search className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Track Existing Docket / FIR</h3>
            </div>

            <form onSubmit={handleTrackSearch} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Reference ID:</label>
                <input
                  type="text"
                  value={searchRefId}
                  onChange={(e) => setSearchRefId(e.target.value)}
                  placeholder="e.g. NHAA-2026-89101"
                  className="w-full bg-slate-950 text-xs p-2.5 rounded-xl border border-slate-700 text-white uppercase font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow"
              >
                Track Live Status &rarr;
              </button>
            </form>

            {trackingError && (
              <div className="p-3 text-xs text-red-300 bg-red-950/80 border border-red-800 rounded-xl">
                {trackingError}
              </div>
            )}

            {trackedCase && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2 animate-fadeIn">
                <div className="flex justify-between items-center font-bold">
                  <span className="font-mono text-indigo-400">{trackedCase.reference_id}</span>
                  <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono">{trackedCase.status}</span>
                </div>
                <div className="text-slate-300">Category: {trackedCase.category}</div>
                <div className="text-slate-400">Region: {trackedCase.state_region}</div>
                <div className="text-[11px] text-slate-500">Submitted: {new Date(trackedCase.submitted_at).toLocaleString()}</div>
              </div>
            )}
          </div>

          {/* Quick Helplines Box */}
          <div className="bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 border border-indigo-800/60 rounded-3xl p-6 shadow-xl text-slate-100 space-y-3">
            <h4 className="font-bold text-sm text-yellow-300 flex items-center space-x-2 pb-2 border-b border-indigo-900/80">
              <PhoneCall className="w-4 h-4 text-red-400 animate-pulse" />
              <span>National 24x7 Helplines</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-900/90 rounded-xl border border-indigo-900/60">
                <div className="font-bold text-yellow-300 text-sm">NHAA: 14566</div>
                <div className="text-slate-400 text-[11px]">National Helpline Against Atrocities</div>
              </div>
              <div className="p-3 bg-slate-900/90 rounded-xl border border-indigo-900/60">
                <div className="font-bold text-red-300 text-sm">Police SOS: 112</div>
                <div className="text-slate-400 text-[11px]">Instant Police &amp; Dispatch Alert</div>
              </div>
              <div className="p-3 bg-slate-900/90 rounded-xl border border-indigo-900/60">
                <div className="font-bold text-emerald-300 text-sm">Women Help: 1091</div>
                <div className="text-slate-400 text-[11px]">24x7 Women in Distress Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Statutory Documents & Gazettes Repository Component */}
      <StatutoryDocuments />
    </div>
  );
}
