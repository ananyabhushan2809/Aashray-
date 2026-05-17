/**
 * Login.jsx — Authentication Page
 * =================================
 * Secure login interface with one-click demo credentials for quick evaluation.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, User, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import API from '../services/api';

const Login = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roomNumber, setRoomNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Switch role tab and auto-fill corresponding demo credentials if in Login mode
  const handleTabSwitch = (role) => {
    setActiveTab(role);
    setError('');
    setSuccess('');
    if (!isRegister) {
      if (role === 'admin') {
        setUsername('admin');
        setPassword('admin123');
      } else {
        setUsername('student1');
        setPassword('student123');
      }
    } else {
      setUsername('');
      setPassword('');
      setName('');
      setRoomNumber('');
    }
  };

  // Toggle between Login and Registration modes
  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setName('');
    setRoomNumber('');
    if (isRegister) {
      // Returning to login mode, restore demo
      if (activeTab === 'admin') {
        setUsername('admin');
        setPassword('admin123');
      } else {
        setUsername('student1');
        setPassword('student123');
      }
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || (isRegister && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    if (isRegister) {
      // Registration Flow
      try {
        await API.post('/auth/register', {
          username,
          password,
          name,
          role: activeTab,
          room_number: activeTab === 'student' ? (roomNumber || 'A-101') : null
        });

        setSuccess(`🎉 Account successfully created! You can now sign in.`);
        setIsRegister(false);
        // Pre-fill newly created credentials for easy sign-in
      } catch (err) {
        setError(err.response?.data?.error || 'Registration failed. Username may already exist.');
      } finally {
        setLoading(false);
      }
    } else {
      // Login Flow
      try {
        const res = await API.post('/auth/login', { username, password });
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        setSuccess(`Welcome back, ${res.data.user.name}! Redirecting...`);
        setTimeout(() => {
          if (res.data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        }, 1000);
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid credentials or server error.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-white flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Branding / Hero Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Background decorative blobs */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight">SmartHostel</span>
          </div>

          <div className="relative z-10 my-12 lg:my-0">
            <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-xs font-semibold text-indigo-100 uppercase tracking-widest mb-4">
              Beginner Friendly Architecture
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4 text-white">
              Effortless Hostel Administration.
            </h1>
            <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed mb-8">
              A comprehensive portal designed for seamless room allocation, instant grievance redressal, visitor logging, and automated fee tracking.
            </p>

            {/* Feature Checkpoints */}
            <div className="space-y-3 text-sm text-indigo-100 font-medium">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>Role-Based Secure JWT Authorization</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>Real-Time Grievance Tracker & Mess Rating</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>Automated Analytics & Charts</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-indigo-200 flex justify-between items-center">
            <span>Tech Stack: React • Flask • SQLite</span>
            <span>Version 1.0</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center lg:text-left mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                {isRegister ? `Create a ${activeTab === 'student' ? 'Student' : 'Administrator'} Account` : 'Sign in to your account'}
              </h2>
              <p className="text-slate-500 text-sm">
                {isRegister ? 'Fill out the details below to enroll.' : 'Select your portal role below to sign in.'}
              </p>
            </div>

            {/* Role Toggle Switch Bar */}
            <div className="mb-6 p-1.5 bg-slate-100 rounded-2xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleTabSwitch('student')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'student'
                    ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <User size={16} className={activeTab === 'student' ? 'text-indigo-600' : 'text-slate-400'} />
                <span>👨‍🎓 Student Portal</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleTabSwitch('admin')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-white text-purple-600 shadow-md shadow-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Lock size={16} className={activeTab === 'admin' ? 'text-purple-600' : 'text-slate-400'} />
                <span>🛡️ Admin Portal</span>
              </button>
            </div>

            {/* Quick Demo Notice (only in login mode) */}
            {!isRegister && (
              <div className="mb-6 px-4 py-2.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 flex items-center justify-between">
                <span className="font-semibold">⚡ Quick Demo Enabled:</span>
                <span className="text-indigo-700 font-bold">{activeTab === 'student' ? 'Student Credentials Auto-filled' : 'Admin Credentials Auto-filled'}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-shake">
                <ShieldAlert size={20} className="shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-pulse">
                <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              {isRegister && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 text-left">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ananya Bhushan"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 outline-hidden transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 text-left">
                  Username / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isRegister ? "Enter username or email" : "Enter your username (e.g., student1 or admin)"}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 outline-hidden transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 text-left">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRegister ? "Create a strong password" : "Enter password"}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 outline-hidden transition-all text-sm"
                  />
                </div>
              </div>

              {isRegister && activeTab === 'student' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 text-left">
                    Room Code (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 size={18} />
                    </div>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="e.g. B-304 (Defaults to A-101 if empty)"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 outline-hidden transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 text-white font-bold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2 ${
                  activeTab === 'student'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:shadow-xl'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-purple-600/25 hover:shadow-purple-600/35 hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {isRegister
                        ? `Register ${activeTab === 'student' ? 'Student' : 'Admin'} Account`
                        : (activeTab === 'student' ? 'Sign in as Student' : 'Sign in as Administrator')}
                    </span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Mode Switch Link */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition-all"
              >
                {isRegister ? "← Already registered? Sign in here" : "Don't have an account? Sign up here →"}
              </button>
            </div>

            <div className="mt-8 text-center bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-700">Interview Tip:</span> The backend uses SQLite with raw parameterized queries to demonstrate clean SQL injection prevention without ORM complexity.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
