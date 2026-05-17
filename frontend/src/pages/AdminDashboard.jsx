/**
 * AdminDashboard.jsx — Administrator Home Overview
 * ================================================
 * Displays key metrics (Students, Complaints, Visitors, Fees) and analytical charts.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, AlertCircle, UserCheck, DollarSign, ArrowRight, RefreshCw } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import API from '../services/api';

// Register ChartJS modules
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/analytics')
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load administrator dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-semibold max-w-xl mx-auto my-12 text-center">
        {error}
        <button onClick={fetchDashboardData} className="mt-3 px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl block mx-auto">
          Retry
        </button>
      </div>
    );
  }

  // Prepare chart data for Complaint Status
  const complaintChartData = {
    labels: analytics?.complaint_stats ? analytics.complaint_stats.map(item => item.status) : ['Pending', 'In Progress', 'Resolved'],
    datasets: [
      {
        label: 'Number of Complaints',
        data: analytics?.complaint_stats ? analytics.complaint_stats.map(item => item.count) : [0, 0, 0],
        backgroundColor: ['#f59e0b', '#6366f1', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  // Prepare chart data for Mess Ratings
  const messChartData = {
    labels: analytics?.mess_ratings ? analytics.mess_ratings.map(item => item.meal_type) : ['Breakfast', 'Lunch', 'Dinner'],
    datasets: [
      {
        label: 'Average Meal Rating (out of 5)',
        data: analytics?.mess_ratings ? analytics.mess_ratings.map(item => item.avg_rating) : [0, 0, 0],
        backgroundColor: '#a855f7',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-left">
      {/* Administrator Hero Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
                Administrator Central
              </span>
              <span className="px-3 py-1 bg-purple-500 text-white font-bold rounded-full text-xs shadow-xs">
                Active Session
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Hostel Command Center 🚀
            </h1>
            <p className="text-purple-100 text-sm sm:text-base max-w-xl leading-relaxed">
              Real-time monitoring of campus occupancy, unresolved maintenance issues, visitor security logs, and tuition receivables.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="p-3 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline">Refresh Dials</span>
            </button>
            <Link
              to="/admin/complaints"
              className="px-5 py-3 bg-white text-purple-800 hover:bg-purple-50 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>Manage Complaints</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core Summary Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-indigo-50/80 rounded-full group-hover:scale-125 transition-transform duration-300 pointer-events-none z-0" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
              <Users size={24} />
            </div>
            <Link to="/admin/students" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              View <ArrowRight size={12} />
            </Link>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enrolled Students</p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
              {stats?.total_students || 0}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-2">Active hostel allocations</p>
          </div>
        </div>

        {/* Total Complaints */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-purple-50/80 rounded-full group-hover:scale-125 transition-transform duration-300 pointer-events-none z-0" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
              <AlertCircle size={24} />
            </div>
            <Link to="/admin/complaints" className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1">
              Resolve <ArrowRight size={12} />
            </Link>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Complaints</p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
              {stats?.open_complaints || 0}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-2">Requiring immediate attention</p>
          </div>
        </div>

        {/* Visitor Count */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-50/80 rounded-full group-hover:scale-125 transition-transform duration-300 pointer-events-none z-0" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
              <UserCheck size={24} />
            </div>
            <Link to="/admin/visitors" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              Log Desk <ArrowRight size={12} />
            </Link>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Visitors</p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
              {stats?.today_visitors || 0}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-2">Checked in at front security</p>
          </div>
        </div>

        {/* Total Fees */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-amber-50/80 rounded-full group-hover:scale-125 transition-transform duration-300 pointer-events-none z-0" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
              <DollarSign size={24} />
            </div>
            <Link to="/admin/fees" className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
              Remind <ArrowRight size={12} />
            </Link>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Fees Dues</p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
              ₹{stats?.total_fees_due ? stats.total_fees_due.toLocaleString() : '0'}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-2">Uncollected receivables balance</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Complaint Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Grievance Status Distribution</h2>
            <p className="text-xs font-medium text-slate-500 mt-1 mb-6">Breakdown of pending, ongoing, and fully resolved student complaints.</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            {analytics?.complaint_stats?.length > 0 ? (
              <Doughnut 
                data={complaintChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }} 
              />
            ) : (
              <p className="text-sm text-slate-400">No complaint data available for chart visualization.</p>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Data updated in real-time</span>
            <span className="font-semibold text-purple-600">Chart.js Engine</span>
          </div>
        </div>

        {/* Chart 2: Mess Ratings */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Mess & Kitchen Satisfaction</h2>
            <p className="text-xs font-medium text-slate-500 mt-1 mb-6">Average student ratings across Breakfast, Lunch, and Dinner menus.</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            {analytics?.mess_ratings?.length > 0 ? (
              <Bar 
                data={messChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, max: 5 }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }} 
              />
            ) : (
              <p className="text-sm text-slate-400">No mess rating data available for chart visualization.</p>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Scale: 1 (Poor) to 5 (Excellent)</span>
            <span className="font-semibold text-purple-600">Chart.js Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
