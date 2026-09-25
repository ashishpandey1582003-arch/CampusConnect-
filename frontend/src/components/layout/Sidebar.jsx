import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  BookOpen,
  Calendar,
  User,
  Users,
  FileText,
  Bell,
  Activity,
  LogOut,
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Recruitment Drives', path: '/student/recruiters', icon: Briefcase },
    { name: 'Bookmarks', path: '/student/bookmarks', icon: Bookmark },
    { name: 'Interview Prep', path: '/student/prep', icon: BookOpen },
    { name: 'Calendar', path: '/student/calendar', icon: Calendar },
    { name: 'My Profile', path: '/student/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Recruiters', path: '/admin/recruiters', icon: Briefcase },
    { name: 'Manage Students', path: '/admin/students', icon: Users },
    { name: 'Applications', path: '/admin/applications', icon: FileText },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Activity Logs', path: '/admin/logs', icon: Activity },
  ];

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  const activeStyle = 'flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-500 text-white font-medium shadow-md transition-all duration-200';
  const inactiveStyle = 'flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200';

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white p-5 dark:border-slate-850 dark:bg-slate-900 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/30">
              <span className="text-xl font-bold">C</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">CampusConnect</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">Recruitment Portal</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-850/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-600 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-slate-800 dark:text-white">
                {user?.name || 'User'}
              </p>
              <span className="inline-block rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-brand-700 dark:bg-sky-950 dark:text-sky-300 border border-brand-200 dark:border-sky-800">
                {user?.role || 'student'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
              onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
              }}
            >
              <link.icon className="h-5 w-5 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="mt-auto flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="font-medium">Logout</span>
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
