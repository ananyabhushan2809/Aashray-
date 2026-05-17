/**
 * FeeReminderPage.jsx — Fee Dues & Billing Desk
 * ===============================================
 * For Admins: Monitor outstanding student dues, send reminders, and record payments.
 */

import React, { useState, useEffect } from 'react';
import { DollarSign, Search, CheckCircle2, AlertCircle, ShieldAlert, Edit, Save, X } from 'lucide-react';
import API from '../services/api';

const FeeReminderPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFeeAmount, setEditFeeAmount] = useState('');
  const [filterPending, setFilterPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/fees');
      setStudents(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load student fee schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleStartEdit = (student) => {
    setEditingId(student.id);
    setEditFeeAmount(student.fees_due.toString());
    setError('');
    setSuccess('');
  };

  const handleSaveFee = async (studentId) => {
    const parsedFee = parseFloat(editFeeAmount);
    if (isNaN(parsedFee) || parsedFee < 0) {
      setError('Please enter a valid non-negative numerical fee amount.');
      return;
    }

    setSavingId(studentId);
    setError('');
    setSuccess('');

    try {
      await API.put(`/admin/fees/${studentId}`, { fees_due: parsedFee });
      setSuccess(`Fee balance for student #${studentId} successfully updated.`);
      setEditingId(null);
      fetchFees();
    } catch (err) {
      setError(`Failed to update fees for student #${studentId}.`);
    } finally {
      setSavingId(null);
    }
  };

  const handleClearFee = async (studentId) => {
    setSavingId(studentId);
    setError('');
    setSuccess('');

    try {
      await API.put(`/admin/fees/${studentId}`, { fees_due: 0 });
      setSuccess(`Fee balance for student #${studentId} marked as fully paid.`);
      setEditingId(null);
      fetchFees();
    } catch (err) {
      setError(`Failed to clear fees for student #${studentId}.`);
    } finally {
      setSavingId(null);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPending = filterPending ? s.fees_due > 0 : true;
    return matchesSearch && matchesPending;
  });

  const totalOutstanding = students.reduce((acc, curr) => acc + (curr.fees_due || 0), 0);
  const pendingCount = students.filter(s => s.fees_due > 0).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-left">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-orange-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              Finance & Billing
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Fee Management Desk 💵
            </h1>
            <p className="text-amber-100 text-sm sm:text-base max-w-xl">
              Track outstanding semester hostel balances, adjust billing amounts, and mark accounts as settled upon payment receipt.
            </p>
          </div>

          <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-center sm:text-right">
            <p className="text-xs font-bold text-amber-200 uppercase tracking-widest mb-1">Campus Outstanding Dues</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              ₹{totalOutstanding.toLocaleString()}
            </h2>
            <p className="text-xs text-amber-200/80 mt-1">{pendingCount} Accounts with Pending Balances</p>
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-600/10 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 outline-hidden transition-all text-sm"
          />
        </div>

        <button
          onClick={() => setFilterPending(!filterPending)}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer
            ${filterPending 
              ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20' 
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }
          `}
        >
          <AlertCircle size={16} />
          <span>{filterPending ? 'Showing Pending Balances Only (Click to Reset)' : 'Filter by Pending Balances'}</span>
        </button>
      </div>

      {/* Students Fee Schedule Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Accounts Directory</h2>
            <p className="text-sm text-slate-500 mt-0.5">Click "Edit" to modify dues or "Mark Paid" to zero out the balance.</p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {filteredStudents.length} Students Listed
          </span>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
              <DollarSign size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Records Match Filter</h3>
            <p className="text-sm text-slate-500 mt-1">Try resetting your search query or balance filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-medium">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Student ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Room Allocation</th>
                  <th className="py-3.5 px-4">Current Dues</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 rounded-r-xl text-right">Accounting Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">#STU-{item.id}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {item.room_number ? `Room ${item.room_number}` : <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    
                    <td className="py-4 px-4">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1 max-w-[150px]">
                          <span className="text-slate-500 font-bold">₹</span>
                          <input
                            type="number"
                            value={editFeeAmount}
                            onChange={(e) => setEditFeeAmount(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-amber-600 rounded-lg text-slate-900 font-bold text-sm outline-hidden shadow-2xs"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span className="font-extrabold text-slate-900 text-base">
                          ₹{item.fees_due.toLocaleString()}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                        ${item.fees_due > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.fees_due > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {item.fees_due > 0 ? 'Dues Outstanding' : 'Fully Settled'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      {editingId === item.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSaveFee(item.id)}
                            disabled={savingId === item.id}
                            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all cursor-pointer"
                            title="Save Fee Amount"
                          >
                            {savingId === item.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-all cursor-pointer"
                            title="Cancel Edit"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit size={14} />
                            <span>Modify Dues</span>
                          </button>
                          {item.fees_due > 0 && (
                            <button
                              onClick={() => handleClearFee(item.id)}
                              disabled={savingId === item.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <span>Mark Paid</span>
                            </button>
                          )}
                        </div>
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

export default FeeReminderPage;
