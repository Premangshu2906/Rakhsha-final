import React, { useState } from 'react';
import Header from './components/Header';
import PublicPortal from './pages/PublicPortal';
import AssessmentResultPage from './pages/AssessmentResultPage';
import OfficerDashboard from './pages/OfficerDashboard';
import CaseDetailPage from './pages/CaseDetailPage';
import FollowUpMonitoringPage from './pages/FollowUpMonitoringPage';
import { reseedDemoData } from './api';

export default function App() {
  const [currentView, setCurrentView] = useState('public'); // 'public', 'officer', 'follow_up', 'result', 'detail'
  const [submittedComplaint, setSubmittedComplaint] = useState(null);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  const handleComplaintSubmitted = (complaint) => {
    setSubmittedComplaint(complaint);
    setCurrentView('result');
  };

  const handleSelectComplaint = (id) => {
    setSelectedComplaintId(id);
    setCurrentView('detail');
  };

  const handleReseedDemo = async () => {
    if (window.confirm('Reset and seed demo data with realistic SIH evaluation cases?')) {
      try {
        await reseedDemoData();
        alert('Database successfully re-seeded!');
        if (currentView === 'officer' || currentView === 'detail') {
          setCurrentView('officer');
        }
      } catch (err) {
        alert(`Reseed failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          setSelectedComplaintId(null);
        }}
        onReseedDemo={handleReseedDemo}
      />

      <main className="flex-1 pb-12">
        {currentView === 'public' && (
          <PublicPortal onSubmitSuccess={handleComplaintSubmitted} />
        )}

        {currentView === 'result' && (
          <AssessmentResultPage
            complaint={submittedComplaint}
            onReset={() => setCurrentView('public')}
            onViewOfficer={() => {
              setCurrentView('officer');
            }}
          />
        )}

        {currentView === 'officer' && (
          <OfficerDashboard onSelectComplaint={handleSelectComplaint} />
        )}

        {currentView === 'detail' && selectedComplaintId && (
          <CaseDetailPage
            complaintId={selectedComplaintId}
            onBack={() => setCurrentView('officer')}
          />
        )}

        {currentView === 'follow_up' && (
          <FollowUpMonitoringPage onSelectComplaint={handleSelectComplaint} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-300">
            Smart India Hackathon (SIH 2026) Prototype — PS 26093
          </p>
          <p>
            AI-Based Real-Time Stress & Trauma Assessment Module for NHAA (14566) & Integrated Portal
          </p>
          <p className="text-[11px] text-slate-500">
            Advisory decision-support module only. Does not provide clinical, medical, or psychological diagnosis.
          </p>
        </div>
      </footer>
    </div>
  );
}
