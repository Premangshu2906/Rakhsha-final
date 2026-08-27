import React, { useState } from 'react';
import { 
  Shield, PhoneCall, User, ShieldAlert, LifeBuoy, FileText, 
  LayoutDashboard, LogOut, Menu, X, ArrowRight, Lock, Bell, Sparkles, PlusCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ 
  currentView, 
  setCurrentView, 
  onOpenCitizenAuth, 
  onOpenOfficerAuth, 
  onReseedDemo 
}) {
  const { user, profile, isOfficer, isCitizen, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setCurrentView('public');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-soft-sm text-slate-900 transition-all">
      {/* 1. National Tricolor Accent Top Bar */}
      <div className="tricolor-stripe"></div>

      {/* 2. Top Emergency Bar */}
      <div className="bg-slate-900 text-slate-200 px-4 sm:px-6 lg:px-8 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 font-sans">
        <div className="flex items-center space-x-3 text-[11px] sm:text-xs">
          <span className="font-semibold text-white flex items-center space-x-1.5">
            <span>🛡️</span>
            <span>RAKHSHA &bull; AI-Assisted Victim Support System</span>
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:flex items-center space-x-1.5 text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse-dot"></span>
            <span>24x7 Helpline: <strong className="text-white">14566</strong></span>
          </span>
          <span className="hidden lg:inline text-slate-600">|</span>
          <span className="hidden lg:inline text-red-300 font-semibold">Police SOS: 112</span>
        </div>
      </div>

      {/* 3. Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Emblem */}
        <div 
          onClick={() => { setCurrentView('public'); setMobileMenuOpen(false); }}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-xl text-white shadow-soft-sm flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              RAKHSHA
            </h1>
            <p className="text-xs text-slate-500 font-bold tracking-wide">
              24x7 with you.
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1.5">
          <button
            onClick={() => setCurrentView('public')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentView === 'public' || currentView === 'result'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Complainant Portal</span>
          </button>

          {/* Citizen's "My Grievances" Tab */}
          {user && !isOfficer && (
            <button
              onClick={() => setCurrentView('my_grievances')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentView === 'my_grievances'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-soft-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>My Grievances</span>
            </button>
          )}

          {/* Officer Dashboard Link */}
          {(isOfficer || !user) && (
            <button
              onClick={() => {
                if (!isOfficer && !user) {
                  onOpenOfficerAuth();
                } else {
                  setCurrentView('officer');
                }
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentView === 'officer' || currentView === 'detail' || currentView === 'follow_up'
                  ? 'bg-slate-900 text-white shadow-soft-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Officer Dashboard</span>
            </button>
          )}

          <a
            href="#statutoryDocuments"
            onClick={() => { if (currentView !== 'public') setCurrentView('public'); }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-50 transition"
          >
            Statutory Gazettes
          </a>
        </nav>

        {/* Auth & Actions */}
        <div className="hidden sm:flex items-center space-x-2">
          {/* If Logged in as Citizen */}
          {user && !isOfficer && (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentView('my_grievances')}
                className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-soft-sm"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>👤 {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}</span>
              </button>

              <button
                onClick={handleSignOut}
                title="Sign out of account"
                className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* If Logged in as Officer */}
          {user && isOfficer && (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentView('officer')}
                className="flex items-center space-x-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-soft-sm"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Officer Console</span>
              </button>

              <button
                onClick={handleSignOut}
                title="Sign out of Officer Console"
                className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* If Not Logged In */}
          {!user && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenCitizenAuth}
                className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shadow-soft-sm"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Citizen Login</span>
              </button>

              <button
                onClick={onOpenOfficerAuth}
                className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-soft-sm"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Officer Login</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-2 text-xs animate-fadeIn">
          <button
            onClick={() => { setCurrentView('public'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2.5 px-3 rounded-xl font-bold flex items-center space-x-2 text-slate-800 hover:bg-slate-50"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Complainant Portal</span>
          </button>

          {user && !isOfficer && (
            <button
              onClick={() => { setCurrentView('my_grievances'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2.5 px-3 rounded-xl font-bold flex items-center space-x-2 text-slate-800 hover:bg-slate-50"
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>My Grievances ({profile?.full_name || 'Citizen'})</span>
            </button>
          )}

          {(isOfficer || !user) && (
            <button
              onClick={() => { 
                if (!isOfficer && !user) onOpenOfficerAuth();
                else setCurrentView('officer'); 
                setMobileMenuOpen(false); 
              }}
              className="w-full text-left py-2.5 px-3 rounded-xl font-bold flex items-center space-x-2 text-slate-800 hover:bg-slate-50"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
              <span>Officer Dashboard</span>
            </button>
          )}

          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            {!user ? (
              <>
                <button
                  onClick={() => { onOpenCitizenAuth(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 px-3 bg-blue-50 text-blue-700 font-bold rounded-xl text-center"
                >
                  Citizen Login &amp; Registration
                </button>
                <button
                  onClick={() => { onOpenOfficerAuth(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 px-3 bg-slate-900 text-white font-bold rounded-xl text-center"
                >
                  Authorized Officer Login
                </button>
              </>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 px-3 bg-red-50 text-red-700 font-bold rounded-xl text-center"
              >
                Sign Out ({user.email})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
