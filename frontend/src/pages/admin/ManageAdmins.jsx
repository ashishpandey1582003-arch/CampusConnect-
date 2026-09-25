import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../hooks/useAxios';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Search,
  UserPlus,
  RefreshCw,
  Mail,
  Calendar,
  Activity,
  Check,
  Copy,
  Clock,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Sparkles,
  Trash2,
} from 'lucide-react';

const ManageAdmins = () => {
  const { user: currentAuthUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [summary, setSummary] = useState({ totalAdmins: 0, totalSystemActions: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [globalFeedback, setGlobalFeedback] = useState({ type: '', message: '' });

  // Add Admin Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const fetchAdministrators = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const response = await api.get('/api/admin/administrators');
      if (response.data.success) {
        setAdmins(response.data.data.administrators || []);
        setSummary(response.data.data.summary || {});
      }
    } catch (err) {
      console.error('Failed to load administrators:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdministrators();
  }, []);

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleDeleteAdmin = async (id, name, email) => {
    if (!window.confirm(`Are you sure you want to remove administrator ${name} (${email})? This action will revoke their system access.`)) {
      return;
    }

    setDeletingId(id);
    setGlobalFeedback({ type: '', message: '' });

    try {
      const response = await api.delete(`/api/admin/administrators/${id}`);
      if (response.data.success) {
        setGlobalFeedback({
          type: 'success',
          message: `Administrator ${name} (${email}) was removed successfully.`,
        });
        setAdmins((prev) => prev.filter((adm) => adm._id !== id));
        setSummary((prev) => ({
          ...prev,
          totalAdmins: Math.max(0, (prev.totalAdmins || 1) - 1),
        }));
      }
    } catch (err) {
      setGlobalFeedback({
        type: 'error',
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to delete administrator account.',
      });
    } finally {
      setDeletingId(null);
      setTimeout(() => setGlobalFeedback({ type: '', message: '' }), 5000);
    }
  };

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    setModalSuccess('');

    try {
      const response = await api.post('/api/admin/administrators', formData);
      if (response.data.success) {
        setModalSuccess('Administrator registered successfully!');
        setFormData({ name: '', email: '', password: '', role: 'admin' });
        setTimeout(() => {
          setIsModalOpen(false);
          setModalSuccess('');
          fetchAdministrators(true);
        }, 1200);
      }
    } catch (err) {
      setModalError(
        err.response?.data?.error || err.response?.data?.message || 'Failed to create administrator account.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter((adm) => {
    const name = adm.name || '';
    const email = adm.email || '';
    const role = adm.role || '';
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search) ||
      role.toLowerCase().includes(search);

    const matchesRole = roleFilter === 'All' || adm.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateStr);
  };

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-semibold backdrop-blur-md mb-3 border border-indigo-500/30 text-indigo-200">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              Restricted Administrative Directory • Internal Governance
            </div>
            <h1 className="text-2xl font-bold md:text-3xl tracking-tight text-white flex items-center gap-3">
              System Administrators & Portal Controllers
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              Real-time directory of verified administrator accounts governing CampusConnect recruitment drives, student approvals, and system audit logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchAdministrators(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md border border-white/15 hover:bg-white/20 transition-all cursor-pointer"
              title="Refresh list"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:from-sky-600 hover:to-indigo-700 transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Add Administrator</span>
            </button>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-20 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Global Feedback Notification */}
      {globalFeedback.message && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-xs font-semibold ${
            globalFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300'
          }`}
        >
          {globalFeedback.type === 'success' ? (
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          )}
          <span>{globalFeedback.message}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Admins */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Administrators
              </p>
              <h3 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {summary.totalAdmins || admins.length}
              </h3>
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Authorized with Full Control
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Total System Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Administrative Actions
              </p>
              <h3 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                {summary.totalSystemActions || 0}
              </h3>
              <p className="mt-1 text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                Recorded in Audit Trails
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Security Policy */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Access Protocol
              </p>
              <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                Strict Role-Based (RBAC)
              </h3>
              <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                Only Verified Admins
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Lock className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Current Active Admin */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Your Admin Session
              </p>
              <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white truncate">
                {currentAuthUser?.name || 'Administrator'}
              </h3>
              <p className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                {currentAuthUser?.email}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search administrator by name, email, or role..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:outline-none transition-all"
          >
            <option value="All">All Roles</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Administrators Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No administrators match your search</h3>
          <p className="mt-1 text-xs text-slate-400">Try adjusting your search criteria or add a new administrator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAdmins.map((adm) => (
            <div
              key={adm._id}
              className={`relative flex flex-col justify-between rounded-3xl border p-6 shadow-sm transition-all hover:shadow-lg ${
                adm.isCurrentAdmin
                  ? 'border-indigo-400/80 bg-gradient-to-b from-indigo-50/30 to-white dark:border-indigo-500/50 dark:from-indigo-950/20 dark:to-slate-900 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              {/* Top Row: Avatar, Identity, Badges */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    {/* Visual Avatar */}
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-xl font-extrabold text-white shadow-md shadow-indigo-500/20 ring-4 ring-white dark:ring-slate-800">
                      {(adm.name || 'A').charAt(0).toUpperCase()}
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                      </span>
                    </div>

                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {adm.name}
                        </h3>
                        {adm.isCurrentAdmin && (
                          <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                            You
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="truncate max-w-[170px]">{adm.email}</span>
                        <button
                          onClick={() => handleCopyEmail(adm.email)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
                          title="Copy Email"
                        >
                          {copiedEmail === adm.email ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role and Access Level Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {adm.role === 'super_admin' ? 'Super Administrator' : 'Portal Coordinator'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    Active Controller
                  </span>
                </div>

                {/* Metrics Stats within card */}
                <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center dark:border-slate-800/80 dark:bg-slate-950/60">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      System Actions
                    </p>
                    <p className="mt-0.5 text-base font-extrabold text-slate-900 dark:text-sky-400">
                      {adm.totalActions}
                    </p>
                  </div>
                  <div className="border-l border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Member Since
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-300">
                      {formatDate(adm.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Last Recorded Activity Box */}
                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      Last Activity
                    </span>
                    <span className="text-slate-500 font-semibold">{getRelativeTime(adm.lastActive)}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 font-medium">
                    {adm.lastAction}
                  </p>
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">
                  ID: <span className="font-mono text-[10px]">{adm._id.slice(-6)}</span>
                </span>

                <div className="flex items-center gap-2.5">
                  <Link
                    to="/admin/logs"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                  >
                    <span>Audit Trail</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>

                  {!adm.isCurrentAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAdmin(adm._id, adm.name, adm.email)}
                      disabled={deletingId === adm._id}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-400 disabled:opacity-50 transition-colors cursor-pointer"
                      title="Remove Administrator"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{deletingId === adm._id ? '...' : 'Delete'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Administrator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Add Portal Administrator
                  </h3>
                  <p className="text-xs text-slate-400">Provision a new verified platform controller</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Notification messages */}
            {modalError && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddAdminSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter administrator full name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Official Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter official email address"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Initial Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Administrative Role Level
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:outline-none transition-all"
                >
                  <option value="admin">Administrator / Placement Coordinator</option>
                  <option value="super_admin">Super Administrator (Head of TPO)</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:from-sky-600 hover:to-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Provision Administrator</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAdmins;
