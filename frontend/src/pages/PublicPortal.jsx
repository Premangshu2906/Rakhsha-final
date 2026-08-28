import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Mic, ShieldAlert, Lock, Search, PhoneCall, AlertTriangle, 
  CheckCircle, FileText, Scale, Shield, Sparkles, User, ExternalLink, 
  ArrowRight, HeartHandshake, Eye, CheckCircle2, ChevronRight, Clock 
} from 'lucide-react';
import VoiceRecorder from '../components/VoiceRecorder';
import DisclaimerBanner from '../components/DisclaimerBanner';
import StatutoryDocuments from '../components/StatutoryDocuments';
import { useAuth } from '../context/AuthContext';
import { createGrievance, trackGrievancePublic } from '../services/grievanceService';

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

export default function PublicPortal({ 
  onSubmitSuccess, 
  onRequireAuth 
}) {
  const { user, profile } = useAuth();
  const formRef = useRef(null);
  const trackRef = useRef(null);

  const [complainantType, setComplainantType] = useState('VICTIM');
  const [name, setName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [stateRegion, setStateRegion] = useState(profile?.state_region || 'Uttar Pradesh');
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
    if (profile || user) {
      if (profile?.full_name) setName(profile.full_name);
      if (profile?.phone) setPhone(profile.phone);
      if (user?.email) setEmail(user.email);
      if (profile?.state_region) setStateRegion(profile.state_region);
    }
  }, [profile, user]);

  const handleGetHelpClick = () => {
    if (!user) {
      // Trigger protected redirect flow: redirect to login with intended target 'grievance'
      onRequireAuth('grievance');
    } else {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTrack = () => {
    trackRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!inputText || inputText.trim().length < 5) {
      setErrorMsg('Please describe what happened or record your voice statement before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        complainant_type: complainantType,
        complainant_name: complainantType !== 'ANONYMOUS' ? (name || profile?.full_name || 'Citizen Complainant') : 'Anonymous',
        complainant_phone: complainantType !== 'ANONYMOUS' ? (phone || profile?.phone || '') : '',
        complainant_email: complainantType !== 'ANONYMOUS' ? (email || user?.email || '') : '',
        state_region: stateRegion,
        category: category,
        input_mode: inputMode,
        raw_input_text: inputText
      };

      const result = await createGrievance(payload, user, profile);
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
      const res = await trackGrievancePublic(searchRefId.trim(), searchToken.trim());
      setTrackedCase(res);
    } catch (err) {
      setTrackingError(err.message || 'Docket reference ID not found.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-12 text-slate-900">
      {/* 1. Hero Section with Human/Reassuring Visual and Floating Cards */}
      <section className="hero-gradient-bg border border-slate-200/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-soft-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/60 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-700 shadow-soft-sm">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>National Helpline Against Atrocities &bull; MoSJE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.18]">
              You don't have to face it <span className="text-blue-600">alone.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              A secure, confidential space to report caste discrimination, harassment, and violence. 
              Our AI decision support module triages urgent cases in real time to guarantee swift legal counsel and police intervention under the SC/ST (PoA) Act.
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleGetHelpClick}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Write a Grievance &bull; Get Help Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={scrollToTrack}
                className="px-5 py-3.5 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 shadow-soft-sm transition-all flex items-center space-x-2"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Track Complaint</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 pt-4 text-xs font-semibold text-slate-500 border-t border-slate-200/80">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Confidential</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mandatory Zero-FIR</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Free Legal Assistance</span>
              </span>
            </div>
          </div>

          {/* Hero Right Visual: "We Are With You" Circular Emblem Badge */}
          <div className="lg:col-span-5 relative flex items-center justify-center p-2">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-500 via-blue-600 to-indigo-600 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <img
                src="/we-are-with-you.png"
                alt="We Are With You • You Are Not Alone"
                className="relative w-64 sm:w-72 lg:w-80 h-auto rounded-full shadow-2xl border-4 border-white/90 transform group-hover:scale-102 transition duration-300"
              />
            </div>
          </div>
        </div>

        {/* Horizontal Support System Active Strip */}
        <div className="mt-10 pt-6 border-t border-slate-200/80">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 live-pulse-dot"></div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Support System Active</span>
            </div>
            <span className="text-xs font-mono text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-soft-sm">
              24x7 Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Horizontal Card 1: AI-Assisted Assessment */}
            <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-soft-sm flex items-center space-x-3.5 hover:border-blue-300 transition hover:shadow-md">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-soft-sm flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">AI-Assisted Distress Assessment</h4>
                <p className="text-[11px] text-slate-500">Real-time acoustic tremor &amp; threat detection</p>
              </div>
            </div>

            {/* Horizontal Card 2: Dedicated Human Review */}
            <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-soft-sm flex items-center space-x-3.5 hover:border-teal-300 transition hover:shadow-md">
              <div className="p-2.5 bg-teal-600 text-white rounded-xl shadow-soft-sm flex-shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Dedicated Human Review</h4>
                <p className="text-[11px] text-slate-500">District Nodal Officers &amp; Special Prosecutors</p>
              </div>
            </div>

            {/* Horizontal Card 3: End-to-End Secure Assistance */}
            <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-soft-sm flex items-center space-x-3.5 hover:border-indigo-300 transition hover:shadow-md">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-soft-sm flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">End-to-End Secure Assistance</h4>
                <p className="text-[11px] text-slate-500">Victim privacy protected under Section 15A</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Emergency Section */}
      <section className="bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200/80 rounded-3xl p-6 sm:p-8 shadow-soft-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-red-600 text-white rounded-2xl shadow-soft-sm flex-shrink-0 mt-0.5">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-700">Immediate Danger?</span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                Need Immediate Help?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Access 24x7 emergency response if you are facing active violence, confinement, or life-threatening situations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <a
              href="tel:14566"
              className="flex-1 md:flex-none px-4 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl border border-red-200 shadow-soft-sm flex items-center space-x-3 transition"
            >
              <div className="w-2 h-2 rounded-full bg-red-600"></div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">NHAA Toll-Free</span>
                <strong className="text-base text-red-600 font-mono">14566</strong>
              </div>
            </a>

            <a
              href="tel:112"
              className="flex-1 md:flex-none px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-md flex items-center space-x-3 transition"
            >
              <div>
                <span className="text-[10px] text-red-200 uppercase font-bold block">Police SOS</span>
                <strong className="text-base text-white font-mono">112</strong>
              </div>
            </a>

            <a
              href="tel:1091"
              className="flex-1 md:flex-none px-4 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 shadow-soft-sm flex items-center space-x-3 transition"
            >
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Women Help</span>
                <strong className="text-base text-slate-800 font-mono">1091</strong>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 3. Main Grievance Submission Guided Experience */}
      <div ref={formRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Guided Step Cards */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-md space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Guided Filing</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                  File Incident Grievance Docket
                </h2>
              </div>
              <div className="text-xs text-slate-400 font-medium hidden sm:flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Supabase PostgreSQL + RLS Protected</span>
              </div>
            </div>

            {/* If user is not logged in, show helpful banner */}
            {!user && (
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center justify-between">
                <span>
                  <strong>Tip:</strong> Sign in with your citizen account to automatically link and track this grievance in your personal dashboard.
                </span>
                <button
                  type="button"
                  onClick={() => onRequireAuth('grievance')}
                  className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-[11px] shadow-soft-sm ml-2 flex-shrink-0"
                >
                  Sign In / Register &rarr;
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center space-x-3">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: Complainant Identity Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Step 1: Who is reporting this incident?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'VICTIM', label: 'Victim / Self', desc: 'Direct applicant' },
                  { id: 'THIRD_PARTY', label: 'Relative / Witness', desc: 'On behalf of victim' },
                  { id: 'ANONYMOUS', label: 'Anonymous Reporter', desc: 'Identity withheld' }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setComplainantType(type.id)}
                    className={`py-3 px-3.5 rounded-2xl text-xs font-bold border text-left transition ${
                      complainantType === type.id
                        ? 'bg-blue-50/80 border-blue-600 text-blue-900 shadow-soft-sm ring-1 ring-blue-600'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block font-bold text-slate-900">{type.label}</span>
                    <span className="text-[11px] text-slate-500 font-normal">{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Complainant Personal Fields if not anonymous */}
            {complainantType !== 'ANONYMOUS' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50/70 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Legal Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white text-xs sm:text-sm p-3 rounded-xl border border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mobile Contact No.</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white text-xs sm:text-sm p-3 rounded-xl border border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Region & Incident Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">State / UT in India</label>
                <select
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="w-full bg-white text-xs sm:text-sm p-3 rounded-xl border border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Incident Category (SC/ST PoA Act)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white text-xs sm:text-sm p-3 rounded-xl border border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2: Choose Statement Input Mode */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Step 2: Choose Statement Mode (Voice or Text)
              </label>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setInputMode('VOICE')}
                  className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold border flex items-center justify-center space-x-2 transition ${
                    inputMode === 'VOICE'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Voice Statement (Speech-to-Text)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInputMode('TEXT')}
                  className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold border flex items-center justify-center space-x-2 transition ${
                    inputMode === 'TEXT'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Type Written Statement</span>
                </button>
              </div>

              {/* Voice Recorder Component */}
              {inputMode === 'VOICE' && (
                <div className="pt-2">
                  <VoiceRecorder onTranscriptChange={(text) => setInputText(text)} />
                </div>
              )}

              {/* Statement Text Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Statement &amp; Incident Description:
                </label>
                <textarea
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe what happened, persons involved, threats or physical harm faced, location, and immediate assistance needed..."
                  className="w-full bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm p-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition shadow-inner"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>Running Real-Time AI Distress Assessment &bull; Saving to Database...</span>
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

        {/* Right Sidebar: Complaint Tracker & Hotlines */}
        <div className="lg:col-span-4 space-y-6">
          {/* Tracking Card */}
          <div ref={trackRef} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Search className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Track Complaint Progress</h3>
            </div>

            <form onSubmit={handleTrackSearch} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Reference ID:</label>
                <input
                  type="text"
                  value={searchRefId}
                  onChange={(e) => setSearchRefId(e.target.value)}
                  placeholder="e.g. NHAA-2026-89101"
                  className="w-full bg-slate-50 text-xs p-3 rounded-xl border border-slate-200 text-slate-900 uppercase font-mono placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-soft-sm"
              >
                Track Status &rarr;
              </button>
            </form>

            {trackingError && (
              <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                {trackingError}
              </div>
            )}

            {/* Tracked Case Progress Card */}
            {trackedCase && (
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs space-y-3 animate-fadeIn">
                <div className="flex justify-between items-center font-bold">
                  <span className="font-mono text-blue-700">{trackedCase.reference_id}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px]">
                    {trackedCase.status}
                  </span>
                </div>

                <div className="text-slate-600 space-y-1 text-[11px]">
                  <div>Category: <strong>{trackedCase.category}</strong></div>
                  <div>Region: <strong>{trackedCase.state_region}</strong></div>
                  <div className="text-slate-400">
                    Logged: {new Date(trackedCase.created_at || trackedCase.submitted_at).toLocaleString()}
                  </div>
                </div>

                {/* Progress Mini Timeline */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Workflow Status
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span className="text-blue-600 font-bold">Submitted ✓</span>
                    <span>→</span>
                    <span className="text-blue-600 font-bold">AI Triaged ✓</span>
                    <span>→</span>
                    <span className={trackedCase.status !== 'NEW' ? 'text-blue-600 font-bold' : 'text-slate-400'}>
                      Officer Review
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reassurance Info Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft-sm space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>Statutory Legal Safeguards</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Under the <strong>SC/ST (Prevention of Atrocities) Amendment Act 2018 (Section 18A)</strong>, registration of FIRs for atrocities cannot be delayed, and anticipatory bail is prohibited.
            </p>
            <a
              href="#statutoryDocuments"
              className="text-xs text-blue-600 hover:text-blue-700 font-bold inline-flex items-center space-x-1"
            >
              <span>Explore Statutory Gazettes &amp; Relief Slabs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 4. Statutory Documents & Gazettes Repository Section */}
      <StatutoryDocuments />
    </div>
  );
}
