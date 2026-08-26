import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Filter, Search, RefreshCw, Eye, AlertTriangle, 
  Calendar, CheckCircle, Clock, ChevronRight, UserCheck, LifeBuoy
} from 'lucide-react';
import StatsCards from '../components/StatsCards';
import RiskChart from '../components/RiskChart';
import { RiskBadge, StatusBadge, PriorityBadge } from '../components/Badge';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { getDashboardStats, getOfficerComplaints, reseedDemoData } from '../api';

export default function OfficerDashboard({ onSelectComplaint }) {
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
        getDashboardStats(),
        getOfficerComplaints({
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Officer Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
              DUTY OFFICER CONSOLE
            </span>
            <span className="text-xs text-slate-400">Inspector Priya Sharma (Badge #NHAA-7841)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 text-white">
            NHAA 14566 Triage Control Room & Real-Time Case Queue
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleReseed}
            className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow transition"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Reset Demo Cases</span>
          </button>
        </div>
      </div>

      <DisclaimerBanner compact={true} />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Visual Risk Charts */}
      <RiskChart stats={stats} />

      {/* Queue Tabs & Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Main Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Registered Cases ({stats?.total_complaints || 0})
            </button>

            <button
              onClick={() => setActiveTab('URGENT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'URGENT'
                  ? 'bg-red-600 text-white shadow-sm animate-pulse'
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
                className="w-full bg-slate-50 text-xs p-2.5 pl-8 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
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
              className="w-full bg-slate-50 text-slate-800 p-2 rounded-lg border border-slate-300 focus:outline-none"
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
              className="w-full bg-slate-50 text-slate-800 p-2 rounded-lg border border-slate-300 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="DOMESTIC_ABUSE">Domestic Abuse</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="CYBER_CRIME">Cyber Crime</option>
              <option value="TRAFFICKING">Trafficking</option>
              <option value="PHYSICAL_ASSAULT">Physical Assault</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter by Case Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 p-2 rounded-lg border border-slate-300 focus:outline-none"
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

      {/* Main Complaints Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <span>Triage Cases Queue ({complaints.length} loaded)</span>
          </h3>
          <span className="text-xs text-slate-500">Sorted by AI Risk Score & Time</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
            Loading real-time complaints queue...
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
                  <th className="py-3 px-4">Ref ID & Time</th>
                  <th className="py-3 px-4">Complainant / Region</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">AI Risk & Score</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-indigo-50/40 transition cursor-pointer ${
                      c.risk_level === 'HIGH' ? 'bg-red-50/30' : ''
                    }`}
                    onClick={() => onSelectComplaint(c.id)}
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{c.reference_id}</div>
                      <div className="text-[11px] text-slate-400 font-sans">
                        {new Date(c.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{c.complainant_name || 'Anonymous'}</div>
                      <div className="text-[11px] text-slate-500">{c.state_region} • {c.input_mode}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {c.category.replace('_', ' ')}
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
                        className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg font-semibold text-[11px] inline-flex items-center space-x-1 transition shadow-sm"
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
