import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../hooks/useAxios';
import {
  Users,
  Briefcase,
  UserCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Award,
  ShieldCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#0ea5e9', '#a855f7', '#10b981', '#ef4444', '#f59e0b'];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [adminControllers, setAdminControllers] = useState([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [statsRes, adminsRes] = await Promise.allSettled([
          api.get('/api/admin/stats'),
          api.get('/api/admin/administrators'),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
          setStats(statsRes.value.data.data);
        }
        if (adminsRes.status === 'fulfilled' && adminsRes.value.data.success) {
          setAdminControllers(adminsRes.value.data.data.administrators || []);
        }
      } catch (err) {
        console.error('Failed to load admin statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-72 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl lg:col-span-2"></div>
          <div className="h-72 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const { cards, charts, recentApplications } = stats || {};

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Coordinator Admin Overview</h1>
          <p className="text-xs text-slate-500">Global metrics and analysis of recruitment drives</p>
        </div>
        <Link
          to="/admin/recruiters"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600 shadow-md shadow-brand-500/20"
        >
          Manage Recruiter Drives
          <ArrowUpRight className="h-4.5 w-4.5" />
        </Link>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Students</p>
              <h3 className="mt-2 text-2xl font-extrabold text-slate-800 dark:text-white">
                {cards?.totalStudents}
              </h3>
            </div>
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-950/40">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Total Upcoming drives */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Active/Upcoming Drives</p>
              <h3 className="mt-2 text-2xl font-extrabold text-slate-800 dark:text-white">
                {cards?.totalUpcomingRecruiters}
              </h3>
            </div>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/40">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Applied students */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Applied Candidates</p>
              <h3 className="mt-2 text-2xl font-extrabold text-slate-800 dark:text-white">
                {cards?.totalAppliedStudents}
              </h3>
            </div>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950/40">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Today's recruiters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Drives Today</p>
              <h3 className="mt-2 text-2xl font-extrabold text-slate-800 dark:text-white">
                {cards?.todaysRecruiters}
              </h3>
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/40">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Visualizations row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recruiters per Month (Area Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-brand-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Recruitment Drives Schedule
            </h3>
          </div>
          <div className="h-64">
            {charts?.recruitersPerMonth?.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No monthly drive statistics recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.recruitersPerMonth}>
                  <defs>
                    <linearGradient id="colorRecruiters" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="recruiters"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRecruiters)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Selection distribution status (Pie Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-brand-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Candidates Status Share
            </h3>
          </div>
          <div className="relative h-64">
            {charts?.placementStats?.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-405">
                No candidates statistics recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.placementStats}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charts?.placementStats?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Department analytics and Recent Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Department placements */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-4.5 w-4.5 text-brand-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Hires by Department
            </h3>
          </div>
          <div className="h-60">
            {charts?.departmentAnalytics?.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-405">
                No hires recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.departmentAnalytics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                  <YAxis dataKey="branch" type="category" stroke="#94a3b8" fontSize={9} width={40} />
                  <Tooltip />
                  <Bar dataKey="selected" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Applications table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h4 className="text-xs font-bold text-slate-805 dark:text-white uppercase tracking-wider mb-4">
            Recent Applications
          </h4>
          {recentApplications?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No applications logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-800">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Branch</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                  {recentApplications?.map((app) => (
                    <tr key={app._id} className="text-slate-650 dark:text-slate-350">
                      <td className="py-3 font-semibold text-slate-800 dark:text-white">
                        {app.student?.name}
                      </td>
                      <td className="py-3">{app.student?.branch}</td>
                      <td className="py-3 font-semibold">{app.recruiter?.companyName}</td>
                      <td className="py-3">{app.recruiter?.jobRole}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          app.status === 'Selected'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20'
                            : app.status === 'Rejected'
                            ? 'bg-red-50 text-red-750 dark:bg-red-950/20'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/20'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Portal Administrators & Controllers Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Portal Administrators & Controllers
                </h4>
                <p className="text-[11px] text-slate-400">
                  Authorized personnel governing CampusConnect recruitment drives and student data
                </p>
              </div>
            </div>
            <Link
              to="/admin/administrators"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors self-start sm:self-auto"
            >
              <span>View Full Directory</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {adminControllers.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Loading administrators...</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {adminControllers.map((adm) => (
                <div
                  key={adm._id}
                  className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-950/60 transition-all hover:border-indigo-200 dark:hover:border-indigo-900/60"
                >
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 font-extrabold text-white shadow-sm text-sm">
                    {(adm.name || 'A').charAt(0).toUpperCase()}
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                    </span>
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{adm.name}</p>
                      {adm.isCurrentAdmin && (
                        <span className="rounded-full bg-indigo-500 px-1.5 py-0.2 text-[8px] font-extrabold text-white">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{adm.email}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {adm.totalActions} logged actions
                      </span>
                      <span className="text-slate-400">{adm.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
