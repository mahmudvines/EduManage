// components/common/Navbar.js
import React from 'react';
import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const getPageTitle = () => {
    const path = window.location.pathname.slice(1);
    const titles = {
      dashboard: 'Dashboard', students: 'Students', teachers: 'Teachers',
      courses: 'Courses', attendance: 'Attendance', grades: 'Grades', profile: 'Profile'
    };
    return titles[path] || 'Dashboard';
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-10">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Page Title */}
      <h1 className="text-lg font-semibold text-gray-800 dark:text-white">{getPageTitle()}</h1>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification bell */}
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm ml-1">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
