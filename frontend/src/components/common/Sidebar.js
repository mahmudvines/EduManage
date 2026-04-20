// ============================================================
// components/common/Sidebar.js
// ============================================================

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, BookOpen,
  ClipboardList, BarChart3, User, LogOut, GraduationCap, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Nav item definition with role-based visibility
const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',  roles: ['admin','teacher','student'] },
  { to: '/students',   icon: Users,           label: 'Students',   roles: ['admin','teacher'] },
  { to: '/teachers',   icon: UserCheck,       label: 'Teachers',   roles: ['admin'] },
  { to: '/courses',    icon: BookOpen,        label: 'Courses',    roles: ['admin','teacher','student'] },
  { to: '/attendance', icon: ClipboardList,   label: 'Attendance', roles: ['admin','teacher','student'] },
  { to: '/grades',     icon: BarChart3,       label: 'Grades',     roles: ['admin','teacher','student'] },
  { to: '/profile',    icon: User,            label: 'Profile',    roles: ['admin','teacher','student'] }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter nav items based on user role
  const visibleItems = navItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  const roleBadgeColor = {
    admin:   'bg-purple-100 text-purple-700',
    teacher: 'bg-blue-100 text-blue-700',
    student: 'bg-green-100 text-green-700'
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900
      border-r border-gray-100 dark:border-gray-800
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 flex flex-col
    `}>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">EduManage</p>
            <p className="text-[10px] text-gray-400 leading-tight">School Management</p>
          </div>
        </div>
        {/* Close button on mobile */}
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user.name}</p>
              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded capitalize ${roleBadgeColor[user.role]}`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-150 group
              ${isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
                     text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
