/**
 * MessLeadPage.jsx — Advanced Mess Lead & Kitchen Operations Desk
 * ================================================================
 * Features:
 * 1. Monthly & Daily Menu Planner / Sorter
 * 2. Zero-Wastage Meal Opt-Out Tracker with Instant Opt-Out Creation & Full Resident Status
 * 3. Dual Fee System: Separated Semester Room Fee vs. Mess & Dining Fee Tracking
 */

import React, { useState, useEffect } from 'react';
import { Utensils, CheckCircle2, ShieldAlert, Clock, Calendar, Users, DollarSign, Leaf, Filter, Search, Plus, Sparkles, Coffee } from 'lucide-react';
import API from '../services/api';

const defaultMenus = {
  Monday: {
    breakfast: ['Aloo Paratha', 'Fresh Curd', 'Sprouted Moong Salad', 'Masala Chai'],
    lunch: ['Paneer Butter Masala', 'Yellow Dal Tadka', 'Jeera Rice', 'Tandoori Roti', 'Green Salad'],
    dinner: ['Kadai Mushroom', 'Chana Masala', 'Basmati Pulao', 'Phulka Chapati', 'Turmeric Milk']
  },
  Tuesday: {
    breakfast: ['Poha & Sev', 'Green Chutney', 'Boiled Eggs / Sprouts', 'Filter Coffee'],
    lunch: ['Rajma Chawal', 'Aloo Gobi', 'Steamed Rice', 'Butter Roti', 'Boondi Raita'],
    dinner: ['Palak Paneer', 'Moong Dal', 'Peas Rice', 'Hot Chapati', 'Warm Milk']
  },
  Wednesday: {
    breakfast: ['Idli & Sambar', 'Coconut Chutney', 'Fresh Banana', 'Masala Tea'],
    lunch: ['Special Veg Biryani', 'Mirchi Ka Salan', 'Mixed Vegetable Raita', 'Papad'],
    dinner: ['Malai Kofta', 'Dal Makhani', 'Garlic Naan', 'Jeera Rice', 'Gulab Jamun']
  },
  Thursday: {
    breakfast: ['Upma & Coconut Chutney', 'Jalebi', 'Boiled Corn', 'Coffee / Tea'],
    lunch: ['Kadhi Pakora', 'Jeera Aloo', 'Steamed Rice', 'Phulka', 'Cucumber Salad'],
    dinner: ['Paneer Bhurji', 'Panchmel Dal', 'Steamed Rice', 'Tawa Paratha', 'Milk']
  },
  Friday: {
    breakfast: ['Chole Bhature', 'Pickled Onions', 'Fresh Curd', 'Masala Chai'],
    lunch: ['Dal Bati Churma', 'Garlic Chutney', 'Gatte Ki Sabzi', 'Steamed Rice'],
    dinner: ['Mutter Paneer', 'Toor Dal', 'Jeera Rice', 'Butter Roti', 'Fruit Custard']
  },
  Saturday: {
    breakfast: ['Methi Thepla', 'Chhundo (Mango Relish)', 'Sweet Curd', 'Hot Tea'],
    lunch: ['Chana Dal', 'Bhindi Masala', 'Steamed Rice', 'Phulka', 'Buttermilk'],
    dinner: ['Pav Bhaji', 'Extra Butter Pav', 'Tawa Veg Pulao', 'Onion Salad', 'Warm Milk']
  },
  Sunday: {
    breakfast: ['Masala Dosa', 'Sambar & Coconut Chutney', 'Kesari Bath', 'Filter Coffee'],
    lunch: ['Special Paneer Tikka Masala', 'Dal Tadka', 'Kashmiri Pulao', 'Butter Naan', 'Ice Cream'],
    dinner: ['Vegetable Khichdi', 'Gujarati Kadhi', 'Roasted Papad', 'Ghee', 'Warm Milk']
  }
};

const monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MessLeadPage = () => {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'optout', 'fees'
  
  // Menu states
  const [selectedMonth, setSelectedMonth] = useState('May');
  const [selectedDay, setSelectedDay] = useState('Monday');

  // Opt-outs & Fees states
  const [optOuts, setOptOuts] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // New Opt-Out Form state
  const [showOptOutModal, setShowOptOutModal] = useState(false);
  const [newOptOut, setNewOptOut] = useState({
    studentId: '',
    mealType: 'Lunch',
    optOutDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [optRes, stdRes] = await Promise.all([
        API.get('/admin/meal-opt-outs'),
        API.get('/admin/students')
      ]);
      setOptOuts(optRes.data);
      setStudents(stdRes.data);
    } catch (err) {
      console.error(err);
      setError('Note: Zero-wastage opt-outs or fee tables may require a backend restart to sync demo entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateSemFee = async (studentId, newFee) => {
    setError('');
    setSuccess('');
    try {
      await API.put(`/admin/fees/${studentId}`, { fees_due: newFee });
      setSuccess('Semester Room accommodation fee successfully updated!');
      fetchData();
    } catch (err) {
      setError('Failed to update semester fee status.');
    }
  };

  const handleUpdateMessFee = async (studentId, newFee) => {
    setError('');
    setSuccess('');
    try {
      await API.put(`/admin/mess-fees/${studentId}`, { mess_fees_due: newFee });
      setSuccess('Mess & Dining fee successfully updated!');
      fetchData();
    } catch (err) {
      setError('Failed to update mess fee status.');
    }
  };

  const handleCreateOptOut = async (e) => {
    e.preventDefault();
    if (!newOptOut.studentId) {
      setError('Please select a student from the resident list.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await API.post('/admin/meal-opt-outs', {
        student_id: parseInt(newOptOut.studentId),
        meal_type: newOptOut.mealType,
        opt_out_date: newOptOut.optOutDate,
        reason: newOptOut.reason || 'Dining Out / Leave'
      });
      setSuccess('Meal opt-out successfully recorded! Portion counts have been adjusted.');
      setShowOptOutModal(false);
      setNewOptOut({
        studentId: students[0]?.id || '',
        mealType: 'Lunch',
        optOutDate: new Date().toISOString().split('T')[0],
        reason: ''
      });
      fetchData();
    } catch (err) {
      setError('Failed to record meal opt-out.');
    }
  };

  // Filtered students for fee tracking & resident search
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.room_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMenu = defaultMenus[selectedDay] || defaultMenus['Monday'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-left">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              Kitchen Operations & Mess Management Desk
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
              Mess Lead Portal 🧑‍🍳
            </h1>
            <p className="text-teal-100 text-sm sm:text-base max-w-2xl">
              Plan and sort monthly dining menus, track real-time meal opt-outs to achieve zero food wastage, and oversee dual fee tracking (Semester Rent vs. Mess Dining).
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 shrink-0">
            <Leaf size={28} className="text-emerald-300 animate-pulse" />
            <div>
              <p className="text-[11px] uppercase tracking-widest text-teal-200 font-bold">Zero Wastage Target</p>
              <p className="text-2xl font-black text-white">100% <span className="text-xs font-normal text-teal-100">Efficiency</span></p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center gap-3 text-sm font-semibold">
          <ShieldAlert size={20} className="shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-pulse">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex-1 min-w-[180px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'menu'
              ? 'bg-white text-teal-700 shadow-md shadow-slate-200/50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Calendar size={18} />
          <span>📅 Sort Menus & Planner</span>
        </button>

        <button
          onClick={() => setActiveTab('optout')}
          className={`flex-1 min-w-[180px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'optout'
              ? 'bg-white text-emerald-700 shadow-md shadow-slate-200/50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Leaf size={18} />
          <span>🚫 Zero-Wastage Tracker ({optOuts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`flex-1 min-w-[180px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'fees'
              ? 'bg-white text-indigo-700 shadow-md shadow-slate-200/50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <DollarSign size={18} />
          <span>💳 Dual Fee Directory ({students.length})</span>
        </button>
      </div>

      {/* TAB 1: Menu Planner / Sorter */}
      {activeTab === 'menu' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Monthly & Daily Menu Sorter</h2>
              <p className="text-sm text-slate-500 mt-0.5">Filter and customize dining schedules across all months and weekdays.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                <Filter size={16} className="text-teal-600" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 outline-hidden cursor-pointer"
                >
                  {monthsList.map(m => <option key={m} value={m}>{m} 2026</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                <Calendar size={16} className="text-emerald-600" />
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 outline-hidden cursor-pointer"
                >
                  {daysList.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Weekday Quick Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {daysList.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedDay === day
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Menu Display Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Breakfast */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative overflow-hidden group hover:border-amber-500 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl font-bold">
                    <Coffee size={20} />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-lg">Breakfast</h3>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                  7:30 - 9:30 AM
                </span>
              </div>
              <ul className="space-y-3 text-sm text-slate-700 font-medium border-t border-slate-200 pt-4">
                {currentMenu.breakfast.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 font-bold text-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lunch */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative overflow-hidden group hover:border-rose-500 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl font-bold">
                    <Utensils size={20} />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-lg">Lunch Menu</h3>
                </div>
                <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-lg">
                  12:30 - 2:30 PM
                </span>
              </div>
              <ul className="space-y-3 text-sm text-slate-700 font-medium border-t border-slate-200 pt-4">
                {currentMenu.lunch.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 font-bold text-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dinner */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative overflow-hidden group hover:border-teal-500 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-teal-100 text-teal-700 rounded-xl font-bold">
                    <Utensils size={20} />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-lg">Dinner Menu</h3>
                </div>
                <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-lg">
                  7:30 - 9:30 PM
                </span>
              </div>
              <ul className="space-y-3 text-sm text-slate-700 font-medium border-t border-slate-200 pt-4">
                {currentMenu.dinner.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 font-bold text-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Zero-Wastage Opt-Out Tracker with Resident List */}
      {activeTab === 'optout' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Leaf className="text-emerald-600" /> Live Zero-Wastage Meal Opt-Outs
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">Record students skipping upcoming meals. Portions are deducted to ensure zero kitchen waste.</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-200">
                {optOuts.length} Portions Saved Today
              </span>
              <button
                onClick={() => {
                  if (!newOptOut.studentId && students.length > 0) {
                    setNewOptOut(prev => ({ ...prev, studentId: students[0].id }));
                  }
                  setShowOptOutModal(!showOptOutModal);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Record Meal Opt-Out</span>
              </button>
            </div>
          </div>

          {/* Record Opt Out Inline Form */}
          {showOptOutModal && (
            <form onSubmit={handleCreateOptOut} className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-4">
              <h3 className="font-extrabold text-emerald-950 text-base">Record Resident Meal Cancellation</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Resident</label>
                  <select
                    value={newOptOut.studentId}
                    onChange={(e) => setNewOptOut({ ...newOptOut, studentId: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.room_number || 'Room Unassigned'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meal Category</label>
                  <select
                    value={newOptOut.mealType}
                    onChange={(e) => setNewOptOut({ ...newOptOut, mealType: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Opt-Out Date</label>
                  <input
                    type="date"
                    value={newOptOut.optOutDate}
                    onChange={(e) => setNewOptOut({ ...newOptOut, optOutDate: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Visiting home / Dining out"
                    value={newOptOut.reason}
                    onChange={(e) => setNewOptOut({ ...newOptOut, reason: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOptOutModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Confirm Opt-Out Deduction
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : optOuts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-medium">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 rounded-l-xl">Student Name</th>
                    <th className="py-3.5 px-4">Room No.</th>
                    <th className="py-3.5 px-4">Meal Category</th>
                    <th className="py-3.5 px-4">Opt-Out Date</th>
                    <th className="py-3.5 px-4">Reason / Notes</th>
                    <th className="py-3.5 px-4 rounded-r-xl">Kitchen Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {optOuts.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors font-semibold">
                      <td className="py-4 px-4 text-slate-900 font-bold">{item.student_name || `Student #${item.student_id}`}</td>
                      <td className="py-4 px-4 text-indigo-600 font-bold">{item.room_number || 'A-101'}</td>
                      <td className="py-4 px-4 font-extrabold text-slate-800">{item.meal_type}</td>
                      <td className="py-4 px-4 text-slate-600">
                        {new Date(item.opt_out_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-4 text-slate-500 max-w-xs truncate">{item.reason || 'Personal / Dining Out'}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200">
                          Portion Deducted
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 p-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm mx-auto mb-3">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Cancellations Recorded Today</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                All registered hostel students listed below are scheduled to dine in for all upcoming meals.
              </p>
            </div>
          )}

          {/* Full List of Resident Students in Zero Wastage Section */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Users size={18} className="text-teal-600" />
              <span>Full Resident Roster Status ({students.length} Registered Diners)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {students.map((std) => {
                const hasOptedOut = optOuts.some(o => o.student_id === std.id);
                return (
                  <div key={std.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">{std.name}</p>
                      <p className="text-xs text-indigo-600 font-bold">Room: {std.room_number || 'Unassigned'}</p>
                    </div>
                    {hasOptedOut ? (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full border border-amber-200">
                        Opted Out
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-200">
                        ✓ Dining In
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Dual Fee Tracker (Semester Room Fee vs. Mess Fee) */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <DollarSign className="text-indigo-600" /> Dual Fee Directory & Remittance Status
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">Manage Semester Accommodation Rent and Dining Mess fees independently for all residents.</p>
            </div>

            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or room..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-sm font-semibold outline-hidden"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-bold">
              No students matched your search query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-medium">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 rounded-l-xl">Resident Name</th>
                    <th className="py-3.5 px-4">Room No.</th>
                    <th className="py-3.5 px-4">Semester Room Fee</th>
                    <th className="py-3.5 px-4">Mess & Dining Fee</th>
                    <th className="py-3.5 px-4 rounded-r-xl text-right">Instant Remittance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50/70 transition-colors font-semibold">
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-slate-900 block">{std.name}</span>
                        <span className="text-xs text-slate-400 font-mono">{std.username}</span>
                      </td>
                      <td className="py-4 px-4 text-indigo-600 font-bold">{std.room_number || 'Unassigned'}</td>
                      
                      {/* Semester Room Fee */}
                      <td className="py-4 px-4">
                        {std.fees_due > 0 ? (
                          <span className="font-extrabold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 inline-block">
                            ₹{std.fees_due.toLocaleString()} Due
                          </span>
                        ) : (
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                            ✓ Sem Rent Paid
                          </span>
                        )}
                      </td>

                      {/* Mess & Dining Fee */}
                      <td className="py-4 px-4">
                        {std.mess_fees_due > 0 ? (
                          <span className="font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
                            ₹{std.mess_fees_due.toLocaleString()} Due
                          </span>
                        ) : (
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                            ✓ Mess Paid
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right space-x-2">
                        {std.fees_due > 0 ? (
                          <button
                            onClick={() => handleUpdateSemFee(std.id, 0)}
                            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer transition-all"
                          >
                            Mark Sem Paid
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateSemFee(std.id, 15000)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer transition-all"
                          >
                            Reset Sem Fee
                          </button>
                        )}

                        {std.mess_fees_due > 0 ? (
                          <button
                            onClick={() => handleUpdateMessFee(std.id, 0)}
                            className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer transition-all"
                          >
                            Mark Mess Paid
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateMessFee(std.id, 12000)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer transition-all"
                          >
                            Reset Mess Fee
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
      )}
    </div>
  );
};

export default MessLeadPage;
