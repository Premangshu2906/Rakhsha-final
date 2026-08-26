import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Filter, Search, RefreshCw, Eye, AlertTriangle, 
  Calendar, CheckCircle, Clock, ChevronRight, UserCheck, LifeBuoy, Sparkles, Scale, Shield, Lock 
} from 'lucide-react';
import StatsCards from '../components/StatsCards';
import RiskChart from '../components/RiskChart';
import { RiskBadge, StatusBadge, PriorityBadge } from '../components/Badge';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { useAuth } from '../context/AuthContext';
import { getOfficerCases, getDashboardKPIs } from '../services/grievanceService';
import { reseedDemoData } from '../api';

const TRIGGER_WORDS = [
  'kill', 'dead', 'die', 'murder', 'threat', 'threaten', 'dhamki', 'harm',
  'hurt', 'attack', 'weapon', 'gun', 'knife', 'suicide', 'caste', 'dalit', 'evict',
  'discriminate', 'marne', 'धमकी', 'मारने', 'हमला', 'हत्या', 'जाति', 'भेदभाव'
];

function highlightTriggers(text) {
  if (!text) return '';
  let highlighted = text;
  TRIGGER_WORDS.forEach(w => {
    const reg = new RegExp(`\\b(${w})\\b`, 'gi');
    highlighted = highlighted.replace(reg, '<mark class="trigger-highlight">$1</mark>');
  });
  return highlighted;
}

export default function OfficerDashboard({ onSelectComplaint, onRequireOfficerAuth }) {
  const { user, profile, isOfficer } = useAuth();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' or 'URGENT'
  const [riskFilter, setRiskFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        getDashboardKPIs(),
        getOfficerCases({
          risk_level: riskFilter || undefined,
          category: categoryFilter || undefined,
          status: statusFilter || undefined,
          search: searchQuery || undefined,
          urgent_only: activeTab === 'URGENT'
        })
      ]);
      setStats(statsRes);
      setComplaints(complaintsRes);
    } catch (err) {
      setError(err.message || 'Failed to load officer dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab, riskFilter, categoryFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const handleReseed = async () => {
    if (window.confirm('Reset database with standard SIH judge demo cases?')) {
      setIsLoading(true);
      try {
        await reseedDemoData();
        await fetchDashboardData();
      } catch (err) {
        alert(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Route & Role Protection guard
  if (!isOfficer && user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-3xl space-y-3">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Access Denied: Authorized Officers Only</h2>
          <p className="text-xs text-red-700 max-w-md mx-auto leading-relaxed">
            Your current logged in account ({user.email}) has a <strong>citizen</strong> role and cannot access the NHAA Duty Control Room.
          </p>
          <button
            onClick={() => onRequireOfficerAuth('officer')}
            className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Sign In with Officer Credentials &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 text-slate-900">
      {/* Officer Dashboard Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-soft-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center space-x-1">
              <Shield className="w-3 h-3 text-blue-600" />
              <span>NHAA Duty Officer Console</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {profile?.full_name || 'Inspector Rajesh Verma'} ({profile?.badge_number || 'NHAA-OFF-101'})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            NHAA Control Room
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time assistance, AI distress scoring and triage overview &bull; Connected to Supabase PostgreSQL
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition shadow-soft-sm"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleReseed}
            className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-soft-sm transition"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Reset Demo Cases</span>
          </button>
        </div>
      </div>

      <DisclaimerBanner compact={true} />

      {/* KPI Stats Cards */}
      <StatsCards stats={stats} />

      {/* Recharts Visual Charts */}
      <RiskChart stats={stats} />

      {/* Case Queue Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-soft-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          {/* Main Segmented Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-soft-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Registered Cases ({stats?.total_complaints || complaints.length})
            </button>

            <button
              onClick={() => setActiveTab('URGENT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'URGENT'
                  ? 'bg-red-600 text-white shadow-md animate-pulse'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>🚨 Urgent High-Risk Queue ({stats?.high_risk_count || 0})</span>
            </button>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Ref ID, complainant..."
                className="w-full bg-slate-50 text-xs p-2.5 pl-8 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-soft-sm"
            >
              Search
            </button>
          </form>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter by Risk Classification:</label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Risk Levels (HIGH, MOD, LOW)</option>
              <option value="HIGH">HIGH RISK ONLY</option>
              <option value="MODERATE">MODERATE RISK ONLY</option>
              <option value="LOW">LOW RISK ONLY</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter by Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="DOMESTIC_ABUSE">Domestic / Physical Abuse</option>
              <option value="HARASSMENT">Social Boycott / Harassment</option>
              <option value="PHYSICAL_ASSAULT">Physical Assault</option>
              <option value="CYBER_CRIME">Cyber Crime</option>
              <option value="TRAFFICKING">Trafficking</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter by Case Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="IN_REVIEW">IN REVIEW</option>
              <option value="ACTION_REQUIRED">ACTION REQUIRED</option>
              <option value="ESCALATED">ESCALATED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Complaints Table & Queue */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-soft-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <span>Triage Cases Queue ({complaints.length} loaded)</span>
          </h3>
          <span className="text-xs text-slate-500">Sorted by AI Risk Score &amp; Time</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 animate-pulse space-y-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>Loading real-time triage queue from Supabase...</div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No complaints match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Ref ID &amp; Time</th>
                  <th className="py-3.5 px-4">Complainant / Region</th>
                  <th className="py-3.5 px-4">Statement Snippet</th>
                  <th className="py-3.5 px-4">AI Risk &amp; Score</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-blue-50/40 transition cursor-pointer ${
                      c.risk_level === 'HIGH' ? 'bg-red-50/30' : ''
                    }`}
                    onClick={() => onSelectComplaint(c.id)}
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{c.reference_id}</div>
                      <div className="text-[11px] text-slate-400 font-sans">
                        {new Date(c.created_at || c.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{c.complainant_name || 'Anonymous'}</div>
                      <div className="text-[11px] text-slate-500">{c.state_region} &bull; {c.input_mode}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-slate-600">
                      <span dangerouslySetInnerHTML={{ __html: highlightTriggers(c.raw_input_text || '') }} />
                    </td>

                    <td className="py-3.5 px-4">
                      <RiskBadge level={c.risk_level} score={c.risk_score} />
                    </td>

                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(c.id);
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold text-[11px] inline-flex items-center space-x-1 transition shadow-soft-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
