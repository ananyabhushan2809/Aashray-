/**
 * VisitorPage.jsx — Security & Visitor Logging Desk
 * ==================================================
 * For Admins: Log new visitors entering the premises & mark departures.
 */

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, CheckCircle2, Clock, ShieldAlert, ArrowRight, User } from 'lucide-react';
import API from '../services/api';

const VisitorPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [students, setStudents] = useState([]);
  const [visitorName, setVisitorName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [purpose, setPurpose] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exitUpdating, setExitUpdating] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [visitorsRes, studentsRes] = await Promise.all([
        API.get('/admin/visitors'),
        API.get('/admin/students')
      ]);
      setVisitors(visitorsRes.data);
      setStudents(studentsRes.data);
      if (studentsRes.data.length > 0) {
        setStudentId(studentsRes.data[0].id);
      }
      setError('');
    } catch (err) {
      setError('Failed to fetch visitor records or student directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogVisitor = async (e) => {
    e.preventDefault();
    if (!visitorName.trim() || !studentId) {
      setError('Please provide the visitor name and select a target student.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await API.post('/admin/visitors', {
        visitor_name: visitorName.trim(),
        student_id: intOrStr(studentId),
        purpose: purpose.trim() || 'General Visit'
      });
      setSuccess(`Visitor "${visitorName.trim()}" logged successfully at front gate.`);
      setVisitorName('');
      setPurpose('');
      fetchData();
    } catch (err) {
      setError('Failed to log visitor. Please verify details.');
    } finally {
      setSubmitting(false);
    }
  };

  const intOrStr = (val) => parseInt(val, 10);

  const handleMarkExit = async (visitorId) => {
    setExitUpdating(visitorId);
    setError('');
    setSuccess('');

    try {
      await API.put(`/admin/visitors/${visitorId}/exit`);
      setSuccess(`Visitor #${visitorId} marked as successfully departed.`);
      fetchData();
    } catch (err) {
      setError(`Failed to log exit for visitor #${visitorId}.`);
    } finally {
      setExitUpdating(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-left">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              Front Security Log
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Visitor Security Register 🛡️
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base max-w-xl">
              Log incoming guests, parents, and authorized visitors. Monitor check-in times and record departures securely.
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

      {/* Log Visitor Form Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative">
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Register Front Gate Entry</h2>
        <p className="text-sm text-slate-500 mb-6">Record visitor identity and select the resident student host.</p>

        <form onSubmit={handleLogVisitor} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Visitor Full Name</label>
            <input
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="e.g. Mr. Rakesh Mehta"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 outline-hidden transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Visiting Student (Host)</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-2xl text-slate-800 font-bold text-sm outline-hidden cursor-pointer"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (Room {s.room_number || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Purpose of Visit</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Parent visit / Dropping supplies"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 outline-hidden transition-all text-sm"
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus size={18} />
                  <span>Check In Visitor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Visitor Register Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active Visitor Logs</h2>
            <p className="text-sm text-slate-500 mt-0.5">Chronological record of front gate entries and exit timestamps.</p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {visitors.length} Logged Entries
          </span>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visitors.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
              <UserCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Visitors Recorded</h3>
            <p className="text-sm text-slate-500 mt-1">The visitor register is currently empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-medium">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Log ID</th>
                  <th className="py-3.5 px-4">Visitor Name</th>
                  <th className="py-3.5 px-4">Host Student</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4">Check-in Time</th>
                  <th className="py-3.5 px-4">Departure Time</th>
                  <th className="py-3.5 px-4 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitors.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">#VS-{item.id}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">{item.visitor_name}</td>
                    <td className="py-4 px-4">
                      <div className="text-slate-800 font-semibold">{item.student_name}</div>
                      <div className="text-xs text-slate-500">Room {item.room_number || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{item.purpose || '—'}</td>
                    
                    <td className="py-4 px-4 text-slate-500 text-xs font-semibold">
                      {new Date(item.entry_time).toLocaleTimeString(undefined, {
                        hour: '2-digit', minute: '2-digit'
                      })}
                      <div className="text-[10px] text-slate-400">
                        {new Date(item.entry_time).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {item.exit_time ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                          <CheckCircle2 size={12} />
                          {new Date(item.exit_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200 animate-pulse">
                          <Clock size={12} />
                          Inside Campus
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {!item.exit_time && (
                        <button
                          onClick={() => handleMarkExit(item.id)}
                          disabled={exitUpdating === item.id}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {exitUpdating === item.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>Log Exit</span>
                              <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      )}
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

export default VisitorPage;
