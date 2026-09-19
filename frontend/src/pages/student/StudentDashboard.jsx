import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../hooks/useAxios';
import { isBranchEligible } from '../../utils/branchHelper';
import {
  Briefcase,
  Bell,
  Calendar,
  CheckCircle,
  FileCheck,
  Building2,
  Clock,
  ChevronRight,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [drivesRes, appsRes, noticesRes] = await Promise.all([
          api.get('/api/recruiters?limit=5'),
          api.get('/api/applications/my-applications'),
          api.get('/api/notifications'),
        ]);

        if (drivesRes.data.success) setDrives(drivesRes.data.data);
        if (appsRes.data.success) setApplications(appsRes.data.data);
        if (noticesRes.data.success) setNotifications(noticesRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute stats
  const activeApplications = applications.length;
  const shortlistedCount = applications.filter((app) => app.status === 'Shortlisted').length;
  const offersCount = applications.filter((app) => app.status === 'Selected').length;

  // Check general eligibility count
  const eligibleDrives = drives.filter(
    (drive) => user && user.cgpa >= drive.minCGPA && isBranchEligible(drive.allowedBranches, user.branch)
  );

  const getStatusBadge = (status) => {
    const styles = {
      Applied: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      'Under Review': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      Shortlisted: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900',
      Selected: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900 border animate-pulse',
      Rejected: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900',
    };
    return (
      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status] || ''}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
          <div className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
          <div className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 lg:col-span-2"></div>
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-brand-850 p-6 text-white shadow-xl shadow-brand-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold md:text-2xl">Academic Placement Overview</h3>
            <p className="mt-1 text-sm text-brand-100 max-w-lg">
              Manage drive schedules, prepare with placement papers, and track application states.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/student/profile"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all shadow-sm"
            >
              <UserCheck className="h-4 w-4" />
              Edit / Correct Profile
            </Link>
            <Link
              to="/student/recruiters"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-brand-700 hover:bg-slate-50 transition-colors shadow-md"
            >
              Browse Drives
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {/* Background designs */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl"></div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        {/* GPA */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-400 uppercase">My CGPA</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{user?.cgpa}</span>
            <span className="text-xs font-medium text-slate-450 dark:text-slate-500">/ 10.0</span>
          </div>
        </div>

        {/* Applied */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-400 uppercase">Applied</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{activeApplications}</span>
            <span className="text-xs text-slate-500 font-medium">Companies</span>
          </div>
        </div>

        {/* Shortlisted */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-400 uppercase">Shortlists</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{shortlistedCount}</span>
            <span className="text-xs text-slate-500 font-medium">Rounds</span>
          </div>
        </div>

        {/* Selected / Placement Offers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold text-slate-400 uppercase">Offers Secured</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-455">{offersCount}</span>
            <span className="text-xs text-slate-550 font-medium">Hired</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Columns: Applications & Announcements */}
        <div className="space-y-6 lg:col-span-2">
          {/* Applications list */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Recent Applications</h4>
              <Link to="/student/profile" className="text-xs font-semibold text-brand-500 hover:text-brand-600">
                View History
              </Link>
            </div>
            {applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileCheck className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs font-medium text-slate-450 dark:text-slate-500">
                  No active applications. Browse jobs and apply!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.slice(0, 3).map((app) => (
                  <div key={app._id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-750 dark:bg-slate-850 dark:text-slate-200">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-white">
                          {app.recruiter?.companyName}
                        </h5>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-brand-500" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Announcements</h4>
            </div>
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-450 dark:text-slate-500 text-center py-6">
                No active notifications broadcasted yet.
              </p>
            ) : (
              <div className="space-y-4">
                {notifications.slice(0, 3).map((note) => (
                  <div key={note._id} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-850">
                    <div className="flex justify-between items-start">
                      <h5 className="text-xs font-bold text-slate-800 dark:text-white">{note.title}</h5>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-650 dark:text-slate-350">{note.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming drives & Calendars */}
        <div className="space-y-6">
          {/* Upcoming drives widget */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Upcoming Recruitment Drives</h4>
            {drives.length === 0 ? (
              <p className="text-xs text-slate-450 dark:text-slate-500 text-center py-6">
                No drives listed yet.
              </p>
            ) : (
              <div className="space-y-4">
                {drives.slice(0, 3).map((drive) => {
                  const isEligible =
                    user && user.cgpa >= drive.minCGPA && isBranchEligible(drive.allowedBranches, user.branch);

                  return (
                    <div
                      key={drive._id}
                      className="group flex flex-col gap-2 rounded-xl border border-slate-100 p-4 hover:border-brand-200 dark:border-slate-800 dark:hover:border-brand-900 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 dark:text-white">
                            {drive.companyName}
                          </h5>
                          <p className="text-[10px] text-slate-550 dark:text-slate-450">{drive.jobRole}</p>
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            isEligible
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                          }`}
                        >
                          {isEligible ? 'Eligible' : 'Not Eligible'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-1.5">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                          <span>{drive.packageCTC} LPA</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{new Date(drive.driveDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Link
                        to={`/student/recruiter/${drive._id}`}
                        className="mt-2 text-center rounded-lg bg-slate-50 py-1.5 text-[10px] font-semibold text-brand-600 hover:bg-brand-50 group-hover:bg-brand-500 group-hover:text-white transition-all"
                      >
                        View Drive
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
