import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Menu, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      {/* Mobile Hamburger menu */}
      <div className="flex items-center gap-4">
        <button
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-6 w-6 text-slate-600 dark:text-slate-300" />
        </button>

        <div className="hidden lg:block">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Welcome back, {(user?.name || 'User').split(' ')[0]}!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user?.role === 'admin'
              ? 'Administrator Control Panel'
              : `B.Tech ${user?.branch || ''} - Section ${user?.section || ''} (${user?.year ? `${user.year} Year` : ''})`}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Icon (Redirects to notifications page) */}
        <Link
          to={user?.role === 'admin' ? '/admin/notifications' : '/student/dashboard'}
          className="relative rounded-xl bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-brand-500 border-2 border-white dark:border-slate-850 animate-pulse"></span>
        </Link>

        {/* User profile dropdown trigger */}
        <Link
          to={user?.role === 'admin' ? '/admin/dashboard' : '/student/profile'}
          className="flex items-center gap-2 rounded-xl border border-slate-200 p-1.5 pr-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {user?.name || 'User'}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
              {user?.role}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
