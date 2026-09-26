import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyRound, Mail, ShieldAlert, GraduationCap, Lock } from 'lucide-react';
import rrgiRealImg from '../../assets/wallpapers/rrgi_real_campus.jpg';
import rrgiGrandImg from '../../assets/wallpapers/rrgi_grand_campus.jpg';
import cyberImg from '../../assets/wallpapers/cyber_network.jpg';
import auroraImg from '../../assets/wallpapers/campus_aurora.jpg';

const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email or Roll number is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student'); // 'student' or 'admin'
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setSubmitError(null);
    const result = await login(data.email, data.password, role);
    setLoading(false);

    if (result.success) {
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setSubmitError(result.error);
    }
  };

  // RRGI College Wallpaper collection
  const wallpapers = [
    {
      id: 'rrgi_real',
      name: 'RRGI Real Campus',
      image: rrgiRealImg,
      tag: 'Official Campus Photo'
    },
    {
      id: 'rrgi_grand',
      name: 'RRGI Grand Campus',
      image: rrgiGrandImg,
      tag: '8K Architectural View'
    },
    {
      id: 'cyber',
      name: 'Cyber Tech Hub',
      image: cyberImg,
      tag: 'Futuristic AI & Tech'
    },
    {
      id: 'aurora',
      name: 'Aurora Twilight',
      image: auroraImg,
      tag: 'Architectural & Starlit'
    },
  ];

  const [activeWallpaperId, setActiveWallpaperId] = useState(() => {
    return localStorage.getItem('cc_wallpaper_id') || 'rrgi_real';
  });

  const currentWallpaper = wallpapers.find((w) => w.id === activeWallpaperId)?.image || rrgiRealImg;

  const handleWallpaperChange = (id) => {
    setActiveWallpaperId(id);
    localStorage.setItem('cc_wallpaper_id', id);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-8 bg-cover bg-center transition-all duration-700 ease-in-out"
      style={{
        backgroundImage: `url(${currentWallpaper})`,
      }}
    >
      {/* Dynamic atmospheric overlay for contrast */}
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/60 pointer-events-none"></div>

      {/* Main container with side-by-side Hero on desktop */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* Left Side: Campus Branding & Live Placement Highlights */}
        <div className="hidden lg:flex flex-col max-w-lg text-white space-y-6">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-sky-400/30 bg-sky-950/60 px-4 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-sky-200 uppercase tracking-widest">
              RRGI Placement Season {currentYear} Live
            </span>
          </div>

          <div>
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              Welcome to <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">CampusConnect</span>
            </h1>
            <p className="text-lg font-bold text-sky-300 mt-2 tracking-wide">
              R.R. Group of Institutions (RRGI), Lucknow
            </p>
            <p className="mt-2 text-sm text-slate-300 font-normal leading-relaxed drop-shadow">
              Official Training & Placement Cell portal connecting RRGI students with top multinational recruiters.
            </p>
          </div>

          {/* Quick Highlight Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 backdrop-blur-xl shadow-lg">
              <p className="text-2xl font-black text-sky-400">98.2%</p>
              <p className="text-[11px] font-medium text-slate-300 mt-0.5">Placement Rate</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 backdrop-blur-xl shadow-lg">
              <p className="text-2xl font-black text-emerald-400">₹48 LPA</p>
              <p className="text-[11px] font-medium text-slate-300 mt-0.5">Highest Package</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 backdrop-blur-xl shadow-lg">
              <p className="text-2xl font-black text-indigo-400">500+</p>
              <p className="text-[11px] font-medium text-slate-300 mt-0.5">Top Recruiters</p>
            </div>
          </div>

          {/* Wallpaper Switcher Bar */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <span>🎨 Choose Campus Wallpaper Theme:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {wallpapers.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => handleWallpaperChange(wp.id)}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-xl transition-all border ${
                    activeWallpaperId === wp.id
                      ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/30 scale-105'
                      : 'bg-slate-900/70 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {wp.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Ultra Glassmorphism Login Card */}
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white/15 bg-slate-950/75 p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xl shadow-sky-500/30">
                <KeyRound className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">CampusConnect</h2>
              <p className="text-xs font-semibold text-sky-400 mt-1">R.R. Group of Institutions (RRGI)</p>
              <p className="text-[11px] text-slate-400">Training & Placement Cell Portal</p>
            </div>

            {/* Role selection tab */}
            <div className="mb-6 flex rounded-xl bg-slate-900/80 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                  role === 'student'
                    ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                Student Login
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                  role === 'admin'
                    ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="h-4 w-4" />
                Coordinator Login
              </button>
            </div>

            {/* Form error alerts */}
            {submitError && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-950/60 border border-red-500/40 p-3.5 text-xs text-red-300">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Form fields */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {role === 'student' ? 'Email or University Roll No' : 'Email Address'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    {role === 'student' ? (
                      <GraduationCap className="h-4.5 w-4.5 text-slate-400" />
                    ) : (
                      <Mail className="h-4.5 w-4.5 text-slate-400" />
                    )}
                  </span>
                  <input
                    type={role === 'student' ? 'text' : 'email'}
                    placeholder={
                      role === 'student'
                        ? 'Roll No (e.g. 1472583690) or email'
                        : 'coordinator@college.edu'
                    }
                    {...register('email')}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-[11px] text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4.5 w-4.5 text-slate-400" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-all"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11px] text-red-400">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-xl shadow-sky-500/25 hover:from-sky-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50 transition-all active:scale-[0.99]"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Mobile Wallpaper Selector */}
            <div className="mt-6 pt-4 border-t border-white/10 lg:hidden text-center">
              <p className="text-[11px] font-medium text-slate-400 mb-2">Wallpaper Style:</p>
              <div className="flex justify-center gap-1.5 flex-wrap">
                {wallpapers.map((wp) => (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => handleWallpaperChange(wp.id)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                      activeWallpaperId === wp.id
                        ? 'bg-sky-500 border-sky-400 text-white font-bold'
                        : 'bg-slate-900/80 border-white/10 text-slate-400'
                    }`}
                  >
                    {wp.id === 'rrgi_real' ? 'RRGI Real' : wp.id === 'rrgi_grand' ? 'RRGI 8K' : wp.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {role === 'student' && (
              <p className="mt-6 text-center text-xs text-slate-400">
                New candidate?{' '}
                <Link to="/register" className="font-semibold text-sky-400 hover:text-sky-300">
                  Register Profile
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

