/**
 * ComplaintPage.jsx — Grievance Management Desk
 * ===============================================
 * For Students: Submit new complaints & view personal status history.
 * For Admins: View all student complaints & update resolution statuses.
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, CheckCircle2, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import API from '../services/api';

const ComplaintPage = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'admin';

  const [complaints, setComplaints] = useState([]);
  const [complaintText, setComplaintText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/admin/complaints' : '/student/complaints';
      const res = await API.get(endpoint);
      setComplaints(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch complaint logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [isAdmin]);

  // Handle complaint submission for student
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintText.trim()) {
      setError('Please provide detailed grievance text before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await API.post('/student/complaints', { complaint_text: complaintText.trim() });
      setSuccess('Your complaint has been lodged successfully and routed to maintenance.');
      setComplaintText('');
      fetchComplaints();
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle status update for admin
  const handleStatusChange = async (complaintId, newStatus) => {
    setStatusUpdating(complaintId);
    setError('');
    setSuccess('');

    try {
      await API.put(`/admin/complaints/${complaintId}`, { status: newStatus });
      setSuccess(`Complaint #${complaintId} status successfully updated to "${newStatus}".`);
      fetchComplaints();
    } catch (err) {
      setError(`Failed to update status for complaint #${complaintId}.`);
    } finally {
      setStatusUpdating(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-left">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              Grievance Desk
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              {isAdmin ? 'Campus Grievance Log' : 'Lodge a Complaint'}
            </h1>
            <p className="text-purple-100 text-sm sm:text-base max-w-xl">
              {isAdmin
                ? 'Review submitted maintenance issues across all residential blocks and update active resolution states.'
                : 'Having issues with plumbing, electricity, or Wi-Fi? Submit a request and our warden maintenance crew will take action.'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm font-semibold">
          <ShieldAlert size={20} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 text-sm font-semibold">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Student Complaint Submission Form Box */}
      {!isAdmin && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative">
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">New Grievance Submission</h2>
          <p className="text-sm text-slate-500 mb-6">Specify your room number and detailed description of the issue.</p>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Complaint Details & Room Scope
              </label>
              <textarea
                rows={4}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Example: Water heater in Room B-205 is not turning on. Needed urgent repair."
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 outline-hidden transition-all text-sm resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus size={18} />
                  <span>Submit Ticket Now</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Complaint History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isAdmin ? 'All Student Complaints' : 'Your Complaint History'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isAdmin ? 'Total active grievance records on server.' : 'Track real-time maintenance updates.'}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {complaints.length} Records Found
          </span>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Complaints Found</h3>
            <p className="text-sm text-slate-500 mt-1">There are currently no recorded grievances in the system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-medium">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">ID</th>
                  {isAdmin && <th className="py-3.5 px-4">Student & Room</th>}
                  <th className="py-3.5 px-4">Complaint Description</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Status</th>
                  {isAdmin && <th className="py-3.5 px-4 rounded-r-xl">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">#CMP-{item.id}</td>
                    
                    {isAdmin && (
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800">{item.student_name}</div>
                        <div className="text-xs text-slate-500">Room {item.room_number || 'N/A'}</div>
                      </td>
                    )}

                    <td className="py-4 px-4 text-slate-700 max-w-md">{item.complaint_text}</td>
                    
                    <td className="py-4 px-4 text-slate-500 text-xs">
                      {new Date(item.created_at).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
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

                    {isAdmin && (
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={item.status}
                            disabled={statusUpdating === item.id}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl px-3 py-1.5 focus:border-purple-600 focus:bg-white outline-hidden cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                          {statusUpdating === item.id && (
                            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                      </td>
                    )}
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

export default ComplaintPage;
