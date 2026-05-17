/**
 * StudentsPage.jsx — Student & Room Directory
 * =============================================
 * For Admins: Complete roster of enrolled students and active room assignments.
 */

import React, { useState, useEffect } from 'react';
import { Users, Building2, Search, CheckCircle2, ShieldAlert } from 'lucide-react';
import API from '../services/api';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await API.get('/admin/students');
        setStudents(res.data);
        setError('');
      } catch (err) {
        setError('Failed to load student directory.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.room_number && s.room_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-left">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              Accommodation Roster
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Student & Room Directory 🏢
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl">
              Complete overview of residential student assignments, room allocations across campus blocks, and enrollment dates.
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

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, ID, or room number..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 outline-hidden transition-all text-sm"
          />
        </div>
      </div>

      {/* Students Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Enrolled Students Roster</h2>
            <p className="text-sm text-slate-500 mt-0.5">Active resident details across all wings.</p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {filteredStudents.length} Students Listed
          </span>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Students Found</h3>
            <p className="text-sm text-slate-500 mt-1">No resident records matched your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-medium">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Student ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">System Username</th>
                  <th className="py-3.5 px-4">Room Allocation</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Fee Status</th>
                  <th className="py-3.5 px-4 rounded-r-xl text-right">Enrollment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">#STU-{item.id}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-4 px-4 text-slate-500 font-mono text-xs">@{item.username}</td>
                    
                    <td className="py-4 px-4 font-semibold">
                      {item.room_number ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                          <Building2 size={13} />
                          Room {item.room_number}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <span className={`font-bold ${item.fees_due > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        ₹{item.fees_due.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-500 text-xs font-semibold text-right">
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
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

export default StudentsPage;
