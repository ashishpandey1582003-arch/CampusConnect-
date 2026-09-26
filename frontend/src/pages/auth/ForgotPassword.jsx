import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../hooks/useAxios';
import { Mail, ArrowLeft, ShieldCheck, ShieldAlert } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await api.post('/api/auth/forgot-password', { email, role });
      if (response.data.success) {
        setMessage('A password reset link has been dispatched to your email.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-8 bg-cover bg-center"
      style={{
        backgroundImage: `url(${localStorage.getItem('cc_wallpaper') || '/wallpapers/cyber_network.jpg'})`,
      }}
    >
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/15 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xl shadow-sky-500/30">
              <Mail className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
            <p className="text-xs text-slate-400 mt-1">Enter your registered email and we'll dispatch a link</p>
          </div>

          {message && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-950/40 border border-emerald-900/50 p-4 text-xs text-emerald-450">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-950/40 border border-red-900/50 p-4 text-xs text-red-400">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1.5">Your Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="student">Student Profile</option>
                  <option value="admin">Placement Coordinator Office</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1.5">Registered Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending link...' : 'Dispatch Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-350"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
