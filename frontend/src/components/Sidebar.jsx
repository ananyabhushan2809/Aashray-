/**
 * Sidebar.jsx — Navigation Sidebar
 * =================================
 * Responsive side menu tailored for Student vs. Admin roles.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  AlertCircle, 
  UserCheck, 
  DollarSign, 
  Utensils, 
  BarChart3, 
  Users,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const navItems = isAdmin ? [
    { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
    { name: 'Students & Rooms', path: '/admin/students', icon: Users },
    { name: 'Complaints', path: '/admin/complaints', icon: AlertCircle },
    { name: 'Visitor Logs', path: '/admin/visitors', icon: UserCheck },
    { name: 'Fee Management', path: '/admin/fees', icon: DollarSign },
    { name: 'Mess Lead Desk', path: '/admin/mess-lead', icon: Utensils },
  ] : [
    { name: 'Dashboard', path: '/student/dashboard', icon: Home },
    { name: 'Complaints', path: '/student/complaints', icon: AlertCircle },
    { name: 'Mess Feedback', path: '/student/mess-feedback', icon: Utensils },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity" 
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed lg:sticky top-[61px] left-0 z-40 w-64 h-[calc(100vh-61px)] bg-white border-r border-slate-200 p-4 transition-transform duration-300 ease-in-out flex flex-col justify-between shadow-lg lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-6 lg:hidden pb-3 border-b border-slate-100">
            <span className="font-bold text-slate-800">Navigation Menu</span>
            <button 
              onClick={onClose} 
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-4 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Current Portal</p>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'bg-purple-600' : 'bg-indigo-600'} animate-pulse`} />
              <span className="font-bold text-slate-700 capitalize text-sm">{user.role} Portal</span>
            </div>
          </div>

          <nav className="space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 translate-x-1' 
                      : 'text-slate-600 hover:bg-indigo-50/80 hover:text-indigo-600 hover:translate-x-0.5'
                    }
                  `}
                >
                  <Icon size={20} className="shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100/80 text-center mt-6">
          <p className="text-xs font-bold text-indigo-900 mb-1">Need Administrator Support?</p>
          <p className="text-xs text-indigo-700/80 mb-3 leading-relaxed">
            Contact the warden office or hostel desk at ext. 4021.
          </p>
          <div className="inline-block px-3 py-1 bg-white text-[11px] font-bold text-indigo-600 rounded-full shadow-2xs border border-indigo-100">
            24/7 Helpline Active
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
