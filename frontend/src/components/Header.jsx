import React from 'react';
import { Shield, PhoneCall, UserCheck, AlertTriangle, LifeBuoy, FileText, LayoutDashboard } from 'lucide-react';

export default function Header({ currentView, setCurrentView, officerUser, onReseedDemo }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Helpline Banner */}
      <div className="bg-gradient-to-r from-red-700 via-amber-600 to-indigo-800 px-4 py-1.5 text-xs text-white flex flex-wrap items-center justify-between font-medium">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 font-semibold">
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span>NHAA Helpline: <strong className="underline text-yellow-200">14566</strong></span>
          </span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">National Emergency: <strong>112</strong></span>
          <span className="hidden lg:inline">|</span>
          <span className="hidden lg:inline">Tele-MANAS Mental Health: <strong>14416</strong></span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="bg-red-950/60 text-red-200 px-2 py-0.5 rounded text-[11px] border border-red-500/40">
            Advisory AI Decision Support System
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-inner flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                NHAA 14566 <span className="font-light text-slate-300 text-sm hidden sm:inline">| AI Stress & Trauma Module</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              National Helpline for Action Against Abuse & Integrated Portal (PS 26093)
            </p>
          </div>
        </div>

        {/* Navigation Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setCurrentView('public')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentView === 'public'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Complainant Portal</span>
          </button>

          <button
            onClick={() => setCurrentView('officer')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              currentView === 'officer'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Officer Dashboard</span>
          </button>

          {/* SIH Judge Quick Action */}
          <button
            onClick={onReseedDemo}
            title="Reset & seed demo data for SIH Judges"
            className="hidden sm:flex items-center space-x-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </header>
  );
}
