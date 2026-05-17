/**
 * Navbar.jsx — Top Navigation Header
 * ====================================
 * Displays application title, logged-in user profile, and role badge.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogOut, User, Menu } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {user && (
            <button 
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu size={22} />
            </button>
          )}
          <div className="flex items-center gap-2.5 text-indigo-600">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl shadow-inner">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SmartHostel
              </span>
              <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 ml-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Portal v1.0
              </span>
            </div>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
                <p className="text-xs font-medium text-slate-500 capitalize flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'admin' ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                  {user.role} {user.room_number ? `• Room ${user.room_number}` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all border border-red-200 hover:border-transparent shadow-xs hover:shadow-md cursor-pointer"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
