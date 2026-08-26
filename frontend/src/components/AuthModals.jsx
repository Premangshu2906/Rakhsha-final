import React, { useState } from 'react';
import { X, User, Shield, Lock, Phone, Mail, MapPin, CheckCircle, Zap } from 'lucide-react';

export function CitizenAuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regCategory, setRegCategory] = useState('SC');
  const [regState, setRegState] = useState('Uttar Pradesh');
  const [regDistrict, setRegDistrict] = useState('Varanasi');
  const [regPassword, setRegPassword] = useState('');

  if (!isOpen) return null;

  const handleDemoFill = () => {
    setLoginMobile('9876543210');
    setLoginPassword('citizen123');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginMobile || !loginPassword) {
      alert('Please enter your mobile number and password.');
      return;
    }
    const citizenUser = {
      id: 'CIT-98765',
      name: 'Rameshwar Paswan',
      mobile: loginMobile.replace(/\D/g, ''),
      category: 'SC',
      state: 'Uttar Pradesh',
      district: 'Varanasi'
    };
    localStorage.setItem('nhaa_citizen_user', JSON.stringify(citizenUser));
    onLoginSuccess(citizenUser);
    onClose();
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName || !regMobile || !regPassword) {
      alert('Name, mobile number, and password are required.');
      return;
    }
    const citizenUser = {
      id: `CIT-${Math.floor(10000 + Math.random() * 90000)}`,
      name: regName,
      mobile: regMobile,
      category: regCategory,
      state: regState,
      district: regDistrict
    };
    localStorage.setItem('nhaa_citizen_user', JSON.stringify(citizenUser));
    onLoginSuccess(citizenUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-900">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Citizen Self-Service Portal</h3>
              <span className="text-[11px] text-slate-500">Confidential Grievance Tracking</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-100/70 p-1">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'login' ? 'bg-white text-blue-700 shadow-soft-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Citizen Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'register' ? 'bg-white text-blue-700 shadow-soft-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            New Registration
          </button>
        </div>

        <div className="p-6 space-y-4">
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Demo Account Fill Button */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                <span className="text-blue-900 font-medium">⚡ Demo Account:</span>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition text-[11px] shadow-soft-sm"
                >
                  Fill Rameshwar Paswan (SC)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">10-Digit Mobile Number:</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={loginMobile}
                    onChange={(e) => setLoginMobile(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-8 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password / Access PIN:</label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-8 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md"
              >
                Sign In to Citizen Portal &rarr;
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name:</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Rameshwar Paswan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile No.:</label>
                  <input
                    type="tel"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category:</label>
                  <select
                    value={regCategory}
                    onChange={(e) => setRegCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="ST">Scheduled Tribe (ST)</option>
                    <option value="OBC">Other Backward Class (OBC)</option>
                    <option value="General">General / Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State:</label>
                  <input
                    type="text"
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District:</label>
                  <input
                    type="text"
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Create Password:</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md"
              >
                Register Citizen Account &rarr;
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function OfficerAuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleDemoFill = (email) => {
    setOfficerId(email);
    setPassword('admin123');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!officerId || !password) {
      alert('Officer ID/Email and password required.');
      return;
    }
    const officerUser = {
      name: officerId.includes('legal') ? 'Adv. Meenakshi Sundaram' : 'Rajesh Kumar Verma',
      officer_id: officerId.includes('legal') ? 'NHAA-LEGAL-204' : 'NHAA-OFF-101',
      email: officerId,
      designation: officerId.includes('legal') ? 'Special Public Prosecutor (PoA Court)' : 'Senior Nodal Officer (SC/ST Protection Cell)',
      department: 'Ministry of Social Justice and Empowerment'
    };
    localStorage.setItem('nhaa_officer_user', JSON.stringify(officerUser));
    onLoginSuccess(officerUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-900">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-red-50 border border-red-100 rounded-xl text-red-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Government Officials Only
              </span>
              <h3 className="font-extrabold text-base text-slate-900 mt-0.5">Authorized Officer Authentication</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Quick 1-Click Passkeys */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-[11px] font-bold text-slate-600 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Official Passkeys:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleDemoFill('officer@nhaa.gov.in')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-700 rounded-lg text-[11px] font-semibold border border-slate-200 transition shadow-soft-sm"
              >
                Nodal Officer (Rajesh Verma)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('legal.officer@nhaa.gov.in')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-amber-800 rounded-lg text-[11px] font-semibold border border-slate-200 transition shadow-soft-sm"
              >
                Special Prosecutor (Meenakshi)
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Officer ID / Gov Email:</label>
            <div className="relative">
              <input
                type="text"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                placeholder="officer@nhaa.gov.in"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-8 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Authentication Passkey:</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-8 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition shadow-md"
          >
            Authorize &amp; Access Officer Dashboard &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}
