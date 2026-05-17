/**
 * StudentDashboard.jsx — Student Home Overview
 * ============================================
 * Displays room details, pending fees card, and complaint statuses.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, DollarSign, AlertCircle, Plus, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import API from '../services/api';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [profileRes, complaintsRes] = await Promise.all([
          API.get('/student/profile'),
          API.get('/student/complaints')
        ]);
        setProfile(profileRes.data);
        setComplaints(complaintsRes.data);
      } catch (err) {
        setError('Failed to fetch profile data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-semibold max-w-xl mx-auto my-12">
        {error}
      </div>
    );
  }

  const activeComplaintsCount = complaints.filter(c => c.status !== 'Resolved').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-left">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              Student Dashboard Overview
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Hello, {profile?.name}! 👋
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base max-w-xl">
              Welcome back to your hostel portal. Keep track of your accommodation, dues, and requests right here.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/student/complaints"
              className="px-5 py-3 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus size={18} />
              <span>Lodge Grievance</span>
            </Link>
            <Link
              to="/student/mess-feedback"
              className="px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Mess Rating</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Room Number Card */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-indigo-50/80 rounded-full group-hover:scale-125 transition-transform duration-300 pointer-events-none z-0" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
              <Building2 size={26} />
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Allocated & Active
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room Allocation</p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
              {profile?.room_number ? `Room ${profile.room_number}` : 'Unassigned'}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-3">Block A Premium Residential Wing</p>
          </div>
        </div>

        {/* Pending Fees Card */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-amber-50/80 rounded-full group-hover:scale-125 transition-transform duration-300 pointer-events-none z-0" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
              <DollarSign size={26} />
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${profile?.fees_due > 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
              {profile?.fees_due > 0 ? 'Dues Pending' : 'All Clear'}
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Fee Dues</p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
              ₹{profile?.fees_due ? profile.fees_due.toLocaleString() : '0'}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-3">Semester accommodation & utility balance</p>
          </div>
        </div>

        {/* Complaint Status Card */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-purple-50/80 rounded-full group-hover:scale-125 transition-transform duration-300 pointer-events-none z-0" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
              <AlertCircle size={26} />
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              Grievance Desk
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Complaints</p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
              {activeComplaintsCount} <span className="text-lg font-bold text-slate-400">Open</span>
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-3">{complaints.length} Total grievances lodged to date</p>
          </div>
        </div>
      </div>

      {/* Recent Complaints Preview Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Recent Grievance Status</h2>
            <p className="text-sm text-slate-500 mt-0.5">Real-time status updates from the hostel maintenance staff.</p>
          </div>
          <Link
            to="/student/complaints"
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 font-bold text-xs text-indigo-600 rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>View History</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Complaints Recorded</h3>
            <p className="text-sm text-slate-500 mt-1">Everything seems to be working perfectly in your room!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Complaint ID</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Date Submitted</th>
                  <th className="py-3.5 px-4 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {complaints.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">#CMP-{item.id}</td>
                    <td className="py-4 px-4 text-slate-600 max-w-md truncate">{item.complaint_text}</td>
                    <td className="py-4 px-4 text-slate-500">
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                        ${item.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          item.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'Resolved' ? 'bg-emerald-500' :
                          item.status === 'In Progress' ? 'bg-indigo-500' : 'bg-amber-500'
                        }`} />
                        {item.status}
                      </span>
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
};

export default StudentDashboard;
