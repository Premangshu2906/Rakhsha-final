import React, { useState } from 'react';
import { Shield, PhoneCall, User, ShieldAlert, LifeBuoy, FileText, LayoutDashboard, LogOut, Sun, Moon, Type, Zap } from 'lucide-react';

export default function Header({ 
  currentView, 
  setCurrentView, 
  citizenUser, 
  officerUser, 
  onOpenCitizenAuth, 
  onOpenOfficerAuth, 
  onOpenCitizenDashboard,
  onLogoutCitizen,
  onLogoutOfficer,
  onReseedDemo 
}) {
  const [fontSizeScale, setFontSizeScale] = useState(0);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [lang, setLang] = useState('en');

  const handleFontResize = (delta) => {
    let nextScale = 0;
    if (delta === 0) nextScale = 0;
    else nextScale = Math.max(-2, Math.min(3, fontSizeScale + delta));
    setFontSizeScale(nextScale);
    document.documentElement.style.setProperty('--font-base-size', `${16 + (nextScale * 2)}px`);
  };

  const toggleContrast = () => {
    setIsHighContrast(!isHighContrast);
    document.body.classList.toggle('high-contrast');
  };

  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 text-white shadow-2xl border-b border-slate-800 backdrop-blur-md">
      {/* Top Tricolor Accent Line */}
      <div className="tricolor-stripe"></div>

      {/* Top Government & Emergency Hotlines Banner */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-1.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3 text-[11px] sm:text-xs">
          <span className="font-semibold text-white flex items-center space-x-1">
            <span>🇮🇳</span>
            <span>भारत सरकार &bull; Ministry of Social Justice and Empowerment</span>
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:flex items-center space-x-1 text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse-dot"></span>
            <span>24x7 Toll-Free: <strong>14566</strong></span>
          </span>
          <span className="hidden lg:inline text-slate-600">|</span>
          <span className="hidden lg:inline text-red-300 font-bold">Police: 112</span>
        </div>

        {/* Accessibility & Quick Exit Tools */}
        <div className="flex items-center space-x-2 text-[11px]">
          {/* Font Scaling */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-900 px-1.5 py-0.5 rounded-md border border-slate-800">
            <button onClick={() => handleFontResize(-1)} className="px-1.5 py-0.5 font-bold hover:text-white text-slate-400">A-</button>
            <button onClick={() => handleFontResize(0)} className="px-1.5 py-0.5 font-bold hover:text-white text-slate-200">A</button>
            <button onClick={() => handleFontResize(1)} className="px-1.5 py-0.5 font-bold hover:text-white text-slate-400">A+</button>
          </div>

          {/* High Contrast */}
          <button 
            onClick={toggleContrast}
            title="Toggle High Contrast Mode"
            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-md border border-slate-800"
          >
            🌓 Contrast
          </button>

          {/* Quick Exit */}
          <button
            onClick={handleQuickExit}
            className="bg-red-700 hover:bg-red-600 text-white font-bold px-2.5 py-0.5 rounded-md shadow flex items-center space-x-1"
          >
            <Zap className="w-3 h-3" />
            <span>Quick Exit</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Emblem */}
        <div 
          onClick={() => setCurrentView('public')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-2 rounded-2xl text-white shadow-xl flex items-center justify-center border border-indigo-400/30 group-hover:scale-105 transition-transform">
            <Shield className="w-7 h-7 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>NHAA &bull; RAKHSHA</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-md uppercase tracking-wider shadow-sm">
                  Govt. of India
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              National Helpline Against Atrocities &bull; राष्ट्रीय अत्याचार निवारण हेल्पलाइन
            </p>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Link to Documents */}
          <a
            href="#statutoryDocuments"
            onClick={() => { if (currentView !== 'public') setCurrentView('public'); }}
            className="hidden md:flex items-center space-x-1 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-900 transition"
          >
            <span>📜 Statutory Gazettes</span>
          </a>

          {/* Citizen Account Trigger */}
          {citizenUser ? (
            <button
              onClick={onOpenCitizenDashboard}
              className="flex items-center space-x-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>👤 {citizenUser.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={onOpenCitizenAuth}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Citizen Login</span>
            </button>
          )}

          {/* Officer Command Center Trigger */}
          {officerUser ? (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentView(currentView === 'officer' ? 'public' : 'officer')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-md ${
                  currentView === 'officer'
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                    : 'bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/80'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>🛡️ Officer Console</span>
              </button>
              <button
                onClick={onLogoutOfficer}
                title="Log Out Officer"
                className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-900"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenOfficerAuth}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-red-800 to-indigo-900 hover:from-red-700 hover:to-indigo-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-md"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
              <span>Officer Portal</span>
            </button>
          )}

          {/* SIH Reset Demo Data button */}
          <button
            onClick={onReseedDemo}
            title="Reset & seed demo data for SIH Judges"
            className="hidden lg:flex items-center space-x-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
