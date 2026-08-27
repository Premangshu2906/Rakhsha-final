import React, { useState } from 'react';
import { 
  X, User, Shield, Lock, Phone, Mail, MapPin, CheckCircle, 
  Zap, AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function CitizenAuthModal({ 
  isOpen, 
  onClose, 
  onSuccessRedirect, 
  initialMode = 'login',
  redirectTarget = null 
}) {
  const { signUpCitizen, signIn, signInOfficer, resetPasswordForEmail, authError } = useAuth();
  
  const [activeTab, setActiveTab] = useState(initialMode); // 'login', 'register', 'forgot'
  const [userType, setUserType] = useState('citizen'); // 'citizen' or 'officer'
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [category, setCategory] = useState('SC');
  const [stateRegion, setStateRegion] = useState('Uttar Pradesh');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  if (!isOpen) return null;

  const handleDemoCitizen = () => {
    setUserType('citizen');
    setEmail('rameshwar.paswan@example.com');
    setPassword('citizen123');
    setFormError(null);
  };

  const handleDemoOfficer = () => {
    setUserType('officer');
    setEmail('pc@gmail.com');
    setPassword('1234');
    setFormError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessNotice(null);

    if (!email || !password) {
      setFormError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      if (userType === 'officer') {
        await signInOfficer({ email, password });
      } else {
        await signIn({ email, password });
      }
      onClose();
      if (onSuccessRedirect) onSuccessRedirect(redirectTarget || (userType === 'officer' ? 'officer' : 'grievance'));
    } catch (err) {
      setFormError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessNotice(null);

    if (!fullName || !email || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      await signUpCitizen({
        email,
        password,
        fullName,
        phone: mobile,
        stateRegion,
        category
      });
      setSuccessNotice('Account created successfully! Redirecting...');
      setTimeout(() => {
        onClose();
        if (onSuccessRedirect) onSuccessRedirect(redirectTarget || 'grievance');
      }, 1000);
    } catch (err) {
      setFormError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!email) {
      setFormError('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordForEmail(email);
      setSuccessNotice('If an account exists for this email, password reset instructions have been dispatched.');
    } catch (err) {
      setFormError(err.message || 'Failed to dispatch password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-900">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl border shadow-soft-sm ${
              userType === 'officer' 
                ? 'bg-red-50 text-red-600 border-red-100' 
                : 'bg-blue-50 text-blue-600 border-blue-100'
            }`}>
              {userType === 'officer' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-base text-slate-900">
                  {userType === 'officer' ? 'NHAA Duty Officer Console' : 'Citizen Access & Grievance Portal'}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {redirectTarget === 'grievance' 
                  ? '🔒 Authenticate to continue filing your grievance'
                  : 'Encrypted National Atrocities Redressal System'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Type Selector (Citizen vs Officer) */}
        <div className="p-2 bg-slate-100/80 border-b border-slate-200/80 flex gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setUserType('citizen'); setFormError(null); }}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              userType === 'citizen'
                ? 'bg-white text-blue-700 shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Citizen Portal</span>
          </button>

          <button
            type="button"
            onClick={() => { setUserType('officer'); setActiveTab('login'); setFormError(null); }}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              userType === 'officer'
                ? 'bg-slate-900 text-white shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Authorized Officer</span>
          </button>
        </div>

        {/* Login / Register / Forgot Tabs */}
        {userType === 'citizen' && (
          <div className="flex border-b border-slate-100 bg-slate-50/50 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('login'); setFormError(null); setSuccessNotice(null); }}
              className={`flex-1 py-2.5 text-center border-b-2 transition ${
                activeTab === 'login' ? 'border-blue-600 text-blue-700 font-bold bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setFormError(null); setSuccessNotice(null); }}
              className={`flex-1 py-2.5 text-center border-b-2 transition ${
                activeTab === 'register' ? 'border-blue-600 text-blue-700 font-bold bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              New Citizen Registration
            </button>
          </div>
        )}

        {/* Content Box */}
        <div className="p-6 space-y-4">

          {/* Feedback Messages */}
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {userType === 'officer' ? 'Official Gov Email / Officer ID:' : 'Email Address:'}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={userType === 'officer' ? 'officer@nhaa.gov.in' : 'name@example.com'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Password / Access Passkey:</label>
                  {userType === 'citizen' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot')}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-9 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center space-x-2 ${
                  userType === 'officer' ? 'bg-slate-900 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <span className="animate-pulse">Authenticating Session...</span>
                ) : (
                  <>
                    <span>Sign In {userType === 'officer' ? 'to Control Console' : '& Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. CITIZEN REGISTRATION FORM */}
          {activeTab === 'register' && userType === 'citizen' && (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Rameshwar Paswan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-8 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                    required
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rameshwar@email.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile No.</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / UT</label>
                  <input
                    type="text"
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Caste Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="ST">Scheduled Tribe (ST)</option>
                    <option value="OBC">Other Backward Class (OBC)</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <span className="animate-pulse">Creating Encrypted Account...</span>
                ) : (
                  <>
                    <span>Register Citizen Profile &rarr;</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FLOW */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900">
                Enter your registered email address below. A password reset link will be dispatched securely.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address:</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-9 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function OfficerAuthModal({ isOpen, onClose, onSuccessRedirect }) {
  return (
    <CitizenAuthModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccessRedirect={onSuccessRedirect}
      initialMode="login"
      redirectTarget="officer"
    />
  );
}
