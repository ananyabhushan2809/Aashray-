/**
 * MessFeedbackPage.jsx — Kitchen & Dining Feedback Desk + Meal Opt-Out
 * =======================================================================
 * For Students: Submit meal ratings and cancel upcoming meals (Zero Wastage).
 */

import React, { useState, useEffect } from 'react';
import { Utensils, CheckCircle2, ShieldAlert, Star, Plus, Award, Coffee, Clock, Sparkles, Leaf, Calendar } from 'lucide-react';
import API from '../services/api';

const MessFeedbackPage = () => {
  // Feedback States
  const [feedbackList, setFeedbackList] = useState([]);
  const [rating, setRating] = useState(5);
  const [mealType, setMealType] = useState('Lunch');
  const [comment, setComment] = useState('');

  // Opt-Out / Cancellation States
  const [optOutList, setOptOutList] = useState([]);
  const [cancelMealType, setCancelMealType] = useState('Dinner');
  const [cancelDate, setCancelDate] = useState(new Date().toISOString().split('T')[0]);
  const [cancelReason, setCancelReason] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fbRes, optRes] = await Promise.all([
        API.get('/student/mess-feedback'),
        API.get('/student/meal-opt-outs')
      ]);
      setFeedbackList(fbRes.data);
      setOptOutList(optRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch dining history or opt-outs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide comments or suggestions for the mess committee.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await API.post('/student/mess-feedback', {
        rating,
        meal_type: mealType,
        comment: comment.trim()
      });
      setSuccess(`Thank you! Your feedback for "${mealType}" has been submitted to the mess committee.`);
      setComment('');
      setRating(5);
      fetchData();
    } catch (err) {
      setError('Failed to submit mess feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelMeal = async (e) => {
    e.preventDefault();
    if (!cancelDate) {
      setError('Please select a valid date for cancellation.');
      return;
    }

    setCancelling(true);
    setError('');
    setSuccess('');

    try {
      const res = await API.post('/student/meal-opt-out', {
        meal_type: cancelMealType,
        opt_out_date: cancelDate,
        reason: cancelReason.trim() || 'Dining Out / Leave'
      });
      setSuccess(res.data.message || 'Meal cancellation recorded successfully.');
      setCancelReason('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record meal cancellation.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-left">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-red-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              Dining Committee Central
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Mess & Food Rating 🍲
            </h1>
            <p className="text-rose-100 text-sm sm:text-base max-w-xl">
              Rate meals or cancel your upcoming breakfast, lunch, or dinner to help kitchen cooks prepare exact portions and prevent food wastage.
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
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-pulse">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Mess Lead of the Month Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="p-4 bg-white text-amber-600 rounded-2xl shadow-md shrink-0">
            <Award size={36} className="animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md text-white font-bold text-xs rounded-full uppercase tracking-wider">
                🌟 Excellence Award
              </span>
              <span className="text-xs text-amber-100 font-semibold">May 2026</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Mess Lead of the Month: Head Chef Balbeer Singh</h2>
            <p className="text-amber-100 text-sm mt-1 max-w-xl">
              "Maintaining 100% kitchen hygiene standards and achieving an outstanding student satisfaction score of 4.9 / 5 Stars across all wings!"
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 shrink-0">
          <Sparkles size={24} className="text-amber-200" />
          <div>
            <p className="text-[11px] uppercase tracking-widest text-amber-200 font-bold">Committee Rating</p>
            <p className="text-2xl font-black text-white">4.9 <span className="text-sm font-normal text-amber-100">/ 5.0</span></p>
          </div>
        </div>
      </div>

      {/* Today's Menu Schedule */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Today's Dining Menu 🍳</h2>
            <p className="text-sm text-slate-500 mt-0.5">Freshly prepared, nutritionally balanced campus meals.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Daily Menu Schedule
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Breakfast Menu */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative overflow-hidden group hover:border-amber-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl font-bold">
                  <Coffee size={20} />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">Breakfast</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <Clock size={12} /> 07:30 - 09:30 AM
              </span>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-700 font-medium border-t border-slate-200/80 pt-4">
              <li className="flex items-center gap-2">🥔 <span className="font-bold text-slate-900">Aloo Stuffed Paratha</span></li>
              <li className="flex items-center gap-2">🥣 Fresh Curd & White Butter</li>
              <li className="flex items-center gap-2">🌱 Sprouted Moong Salad</li>
              <li className="flex items-center gap-2">☕ Hot Masala Chai / Filter Coffee</li>
            </ul>
          </div>

          {/* Lunch Menu */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative overflow-hidden group hover:border-rose-600 transition-all shadow-xs sm:scale-105 bg-gradient-to-b from-white to-rose-50/30 border-rose-200">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-100/50 rounded-full pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl font-bold">
                  <Utensils size={20} />
                </div>
                <h3 className="font-extrabold text-rose-900 text-base sm:text-lg">Special Lunch</h3>
              </div>
              <span className="text-xs font-bold text-rose-700 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
                <Clock size={12} /> 12:30 - 02:30 PM
              </span>
            </div>
            <ul className="relative z-10 space-y-2.5 text-sm text-slate-700 font-medium border-t border-rose-100 pt-4">
              <li className="flex items-center gap-2">🧀 <span className="font-black text-rose-900">Paneer Butter Masala</span></li>
              <li className="flex items-center gap-2">🍲 Yellow Dal Tadka</li>
              <li className="flex items-center gap-2">🍚 Steamed Jeera Rice</li>
              <li className="flex items-center gap-2">🫓 Butter Tandoori Roti</li>
              <li className="flex items-center gap-2">🥗 Fresh Green Salad</li>
              <li className="flex items-center gap-2">🧁 Warm Gulab Jamun Dessert</li>
            </ul>
          </div>

          {/* Dinner Menu */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative overflow-hidden group hover:border-indigo-600 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl font-bold">
                  <Utensils size={20} />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">Dinner</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <Clock size={12} /> 07:30 - 09:30 PM
              </span>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-700 font-medium border-t border-slate-200/80 pt-4">
              <li className="flex items-center gap-2">🍄 <span className="font-bold text-slate-900">Kadai Mushroom Masala</span></li>
              <li className="flex items-center gap-2">🫘 Punjabi Chana Masala</li>
              <li className="flex items-center gap-2">🍚 Basmati Peas Pulao</li>
              <li className="flex items-center gap-2">🫓 Hot Phulka Chapati</li>
              <li className="flex items-center gap-2">🥛 Warm Turmeric Milk</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Zero Wastage Meal Opt-Out Section */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-emerald-800/80">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-xs uppercase tracking-widest mb-1.5">
              <Leaf size={16} />
              <span>Zero-Wastage Initiative</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">Cancel Upcoming Meal / Opt-Out 🚫</h2>
            <p className="text-emerald-100 text-sm max-w-xl">
              Going out with friends or visiting home? Cancel your meal in advance. The kitchen will automatically deduct your portion, preventing food wastage.
            </p>
          </div>

          <form onSubmit={handleCancelMeal} className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 w-full lg:w-auto space-y-4 shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-emerald-200 mb-1 tracking-wider">Meal</label>
                <select
                  value={cancelMealType}
                  onChange={(e) => setCancelMealType(e.target.value)}
                  className="w-full py-2 px-3 bg-white/20 border border-white/30 rounded-xl text-xs font-bold text-white outline-hidden cursor-pointer"
                >
                  <option className="text-slate-900" value="Breakfast">🍳 Breakfast</option>
                  <option className="text-slate-900" value="Lunch">🍛 Lunch</option>
                  <option className="text-slate-900" value="Dinner">🍲 Dinner</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-emerald-200 mb-1 tracking-wider">Date</label>
                <input
                  type="date"
                  value={cancelDate}
                  onChange={(e) => setCancelDate(e.target.value)}
                  className="w-full py-2 px-3 bg-white/20 border border-white/30 rounded-xl text-xs font-bold text-white outline-hidden cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-emerald-200 mb-1 tracking-wider">Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Dining out"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full py-2 px-3 bg-white/20 border border-white/30 rounded-xl text-xs font-bold text-white placeholder:text-emerald-300 outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={cancelling}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {cancelling ? 'Recording Opt-Out...' : 'Confirm Meal Cancellation 🚫'}
            </button>
          </form>
        </div>

        {/* Personal Opt Out History */}
        <div className="relative z-10 pt-6">
          <h3 className="text-xs uppercase tracking-widest font-extrabold text-emerald-300 mb-4">
            Your Recorded Meal Cancellations ({optOutList.length})
          </h3>

          {loading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : optOutList.length === 0 ? (
            <div className="py-6 text-center text-emerald-200/80 text-xs font-semibold bg-white/5 rounded-xl border border-white/10">
              No meal cancellations recorded. You are currently scheduled for all dining hall meals.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {optOutList.map((opt) => (
                <div key={opt.id} className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-white text-sm block">{opt.meal_type}</span>
                    <span className="text-[11px] text-emerald-200 block">
                      {new Date(opt.opt_out_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-emerald-300 italic">{opt.reason || 'Leave'}</span>
                  </div>
                  <span className="px-2 py-1 bg-amber-500/20 border border-amber-400 text-amber-200 text-[10px] font-extrabold rounded-full">
                    Portion Saved
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submission Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative">
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Rate Today's Meal Quality</h2>
        <p className="text-sm text-slate-500 mb-6">Select the meal type, assign a star rating, and write constructive remarks.</p>

        <form onSubmit={handleSubmitFeedback} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Meal Category</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-rose-600 focus:bg-white focus:ring-4 focus:ring-rose-600/10 rounded-2xl text-slate-800 font-bold text-sm outline-hidden cursor-pointer"
              >
                <option value="Breakfast">🍳 Breakfast Menu</option>
                <option value="Lunch">🍛 Lunch Menu</option>
                <option value="Dinner">🍲 Dinner Menu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Overall Quality Star Rating</label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      star <= rating
                        ? 'bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/20 scale-110'
                        : 'bg-slate-50 border-slate-200 text-slate-300 hover:text-amber-400'
                    }`}
                  >
                    <Star size={20} fill={star <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
                <span className="ml-3 font-extrabold text-sm text-slate-700">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Comments & Feedback</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. The paneer curry was excellent today, but chapati was a bit dry."
              required
              className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-rose-600 focus:bg-white focus:ring-4 focus:ring-rose-600/10 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 outline-hidden transition-all text-sm resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="py-3.5 px-6 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={18} />
                <span>Submit Dining Feedback</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Past Feedback Reviews</h2>
            <p className="text-sm text-slate-500 mt-0.5">Chronological record of ratings submitted to the warden office.</p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {feedbackList.length} Reviews Submitted
          </span>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Utensils size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Feedback History Found</h3>
            <p className="text-sm text-slate-500 mt-1">You haven't submitted any dining reviews yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-medium">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Review ID</th>
                  <th className="py-3.5 px-4">Meal Category</th>
                  <th className="py-3.5 px-4">Star Rating</th>
                  <th className="py-3.5 px-4">Comments</th>
                  <th className="py-3.5 px-4 rounded-r-xl">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbackList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">#FB-{item.id}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">{item.meal_type}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} size={15} fill="currentColor" />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-700 max-w-md">{item.comment || '—'}</td>
                    <td className="py-4 px-4 text-slate-500 text-xs font-semibold">
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

export default MessFeedbackPage;
