import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PublicPortal from './pages/PublicPortal';
import AssessmentResultPage from './pages/AssessmentResultPage';
import OfficerDashboard from './pages/OfficerDashboard';
import CaseDetailPage from './pages/CaseDetailPage';
import FollowUpMonitoringPage from './pages/FollowUpMonitoringPage';
import MyGrievancesPage from './pages/MyGrievancesPage';
import { CitizenAuthModal, OfficerAuthModal } from './components/AuthModals';
import { AuthProvider, useAuth } from './context/AuthContext';
import { reseedDemoData } from './api';

function MainApp() {
  const { user, profile, isOfficer, isCitizen } = useAuth();

  const [currentView, setCurrentView] = useState('public'); // 'public', 'result', 'officer', 'detail', 'follow_up', 'my_grievances'
  const [submittedComplaint, setSubmittedComplaint] = useState(null);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Modal open states & redirect targets
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [authRedirectTarget, setAuthRedirectTarget] = useState(null);

  const handleComplaintSubmitted = (complaint) => {
    setSubmittedComplaint(complaint);
    setCurrentView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectComplaint = (id) => {
    setSelectedComplaintId(id);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequireAuth = (target = 'grievance') => {
    setAuthRedirectTarget(target);
    setAuthInitialMode('login');
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccessRedirect = (target) => {
    setIsAuthModalOpen(false);
    if (target === 'officer') {
      setCurrentView('officer');
    } else if (target === 'my_grievances') {
      setCurrentView('my_grievances');
    } else {
      setCurrentView('public');
      // Scroll to grievance form
      setTimeout(() => {
        const formElement = document.querySelector('form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleReseedDemo = async () => {
    if (window.confirm('Reset and seed database with standard SIH evaluation cases?')) {
      try {
        await reseedDemoData();
        alert('Database successfully re-seeded with realistic NHAA demo cases!');
        if (currentView === 'officer' || currentView === 'detail') {
          setCurrentView('officer');
        }
      } catch (err) {
        alert(`Reseed failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Header Navigation */}
      <Header
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          setSelectedComplaintId(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCitizenAuth={() => {
          setAuthInitialMode('login');
          setAuthRedirectTarget(null);
          setIsAuthModalOpen(true);
        }}
        onOpenOfficerAuth={() => {
          setAuthInitialMode('login');
          setAuthRedirectTarget('officer');
          setIsAuthModalOpen(true);
        }}
        onReseedDemo={handleReseedDemo}
      />

      {/* Main Views */}
      <main className="flex-1 pb-16">
        {currentView === 'public' && (
          <PublicPortal
            onSubmitSuccess={handleComplaintSubmitted}
            onRequireAuth={handleRequireAuth}
          />
        )}

        {currentView === 'my_grievances' && (
          <MyGrievancesPage
            onNewGrievance={() => {
              setCurrentView('public');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectGrievance={(id) => {
              // View detail modal
            }}
          />
        )}

        {currentView === 'result' && (
          <AssessmentResultPage
            complaint={submittedComplaint}
            onReset={() => {
              setCurrentView('public');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewOfficer={() => {
              setCurrentView('officer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'officer' && (
          <OfficerDashboard
            onSelectComplaint={handleSelectComplaint}
            onRequireOfficerAuth={(target) => {
              setAuthRedirectTarget(target);
              setIsAuthModalOpen(true);
            }}
          />
        )}

        {currentView === 'detail' && selectedComplaintId && (
          <CaseDetailPage
            complaintId={selectedComplaintId}
            onBack={() => {
              setCurrentView('officer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'follow_up' && (
          <FollowUpMonitoringPage onSelectComplaint={handleSelectComplaint} />
        )}
      </main>

      {/* Authentication Modal */}
      <CitizenAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authInitialMode}
        redirectTarget={authRedirectTarget}
        onSuccessRedirect={handleAuthSuccessRedirect}
      />

      {/* Premium Government Digital Platform Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="text-white font-extrabold text-base flex items-center space-x-2">
                <span>🛡️ NHAA 14566 &bull; RAKSHA</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                National Helpline Against Atrocities, Ministry of Social Justice and Empowerment, Government of India.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">
                Smart India Hackathon (SIH 2026) &bull; PS 26093
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3">24x7 Helplines</h4>
              <ul className="space-y-2 text-slate-400">
                <li><strong className="text-amber-400">14566</strong> &bull; NHAA Atrocities Toll-Free</li>
                <li><strong className="text-red-400">112</strong> &bull; Police SOS Dispatch</li>
                <li><strong className="text-emerald-400">1091</strong> &bull; Women Helpline</li>
                <li><strong className="text-blue-400">14416</strong> &bull; Tele-MANAS Counseling</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3">Statutory Protections</h4>
              <ul className="space-y-2 text-slate-400">
                <li>SC/ST (Prevention of Atrocities) Act, 1989</li>
                <li>PoA Amendment Act, 2018 (Section 18A)</li>
                <li>Annexure-I Relief Compensation Norms</li>
                <li>Protection of Civil Rights Act, 1955</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3">Secure Portal Access</h4>
              <div className="flex flex-col space-y-2 text-slate-400">
                <button 
                  onClick={() => {
                    if (user && !isOfficer) setCurrentView('my_grievances');
                    else handleRequireAuth('my_grievances');
                  }} 
                  className="text-left hover:text-white transition"
                >
                  &bull; Citizen Grievance Dashboard
                </button>
                <button 
                  onClick={() => {
                    if (isOfficer) setCurrentView('officer');
                    else handleRequireAuth('officer');
                  }} 
                  className="text-left hover:text-white transition"
                >
                  &bull; Authorized Duty Officer Console
                </button>
                <button onClick={handleReseedDemo} className="text-left hover:text-amber-400 transition">
                  &bull; Reset Demo Evaluation Cases
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              &copy; 2026 Ministry of Social Justice and Empowerment, Government of India. All rights reserved.
            </div>
            <div>
              Supabase Auth + Row Level Security &bull; WCAG 2.1 AA Compliant
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
