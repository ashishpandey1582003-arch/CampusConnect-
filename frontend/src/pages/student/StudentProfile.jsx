import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../hooks/useAxios';
import { getFullUrl } from '../../utils/apiUrls';
import {
  User,
  FileText,
  ShieldCheck,
  Mail,
  Phone,
  BookOpen,
  KeyRound,
  GraduationCap,
  Building,
  Award,
  Upload,
  Camera,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

const BRANCH_OPTIONS = [
  { value: 'CSE', label: 'Computer Science & Engineering (CSE)' },
  { value: 'CSE(AI/ML)', label: 'CSE (Artificial Intelligence & Machine Learning)' },
  { value: 'IT', label: 'Information Technology (IT)' },
  { value: 'ECE', label: 'Electronics & Communication Engineering (ECE)' },
  { value: 'EE', label: 'Electrical Engineering (EE)' },
  { value: 'ME', label: 'Mechanical Engineering (ME)' },
  { value: 'CE', label: 'Civil Engineering (CE)' },
  { value: 'MCA', label: 'Master of Computer Applications (MCA)' },
  { value: 'MBA', label: 'Master of Business Administration (MBA)' },
];

const YEAR_OPTIONS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
];

const StudentProfile = () => {
  const { user, updateProfileState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form states - Personal
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');

  // Form states - Academic Correction
  const [collegeRollNo, setCollegeRollNo] = useState('');
  const [universityRollNo, setUniversityRollNo] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [cgpa, setCgpa] = useState('');

  // Form states - Skills & Documents
  const [skills, setSkills] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState(null);
  const [passErrorMsg, setPassErrorMsg] = useState(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState('all');

  // Load user data into form on mount or user state change
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setMobileNo(user.mobileNo || '');
      setCollegeRollNo(user.collegeRollNo || '');
      setUniversityRollNo(user.universityRollNo || '');
      setBranch(user.branch || '');
      setYear(user.year || '');
      setSection(user.section || '');
      setCgpa(user.cgpa !== undefined && user.cgpa !== null ? String(user.cgpa) : '');
      setSkills(user.skills ? user.skills.join(', ') : '');
    }
  }, [user]);

  // Handle Photo Picker
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Submit Profile & Academic Changes
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Basic client validations
    if (!name.trim()) {
      setErrorMsg('Full Name is required.');
      setLoading(false);
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Email address is required.');
      setLoading(false);
      return;
    }
    if (!mobileNo.trim() || mobileNo.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }
    if (!collegeRollNo.trim()) {
      setErrorMsg('University/College name is required.');
      setLoading(false);
      return;
    }
    if (!universityRollNo.trim()) {
      setErrorMsg('University Roll Number is required.');
      setLoading(false);
      return;
    }
    const numCgpa = parseFloat(cgpa);
    if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
      setErrorMsg('CGPA must be a valid number between 0 and 10.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', email.trim());
    formData.append('mobileNo', mobileNo.trim());
    formData.append('collegeRollNo', collegeRollNo.trim());
    formData.append('universityRollNo', universityRollNo.trim());
    formData.append('branch', branch);
    formData.append('year', year);
    formData.append('section', section.trim());
    formData.append('cgpa', cgpa);
    formData.append('skills', skills);

    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    try {
      const response = await api.put(`/api/students/${user._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccessMsg('Your profile and data corrections have been saved successfully!');
        updateProfileState(response.data.data);
        setResumeFile(null);
        setPhotoFile(null);
        setPhotoPreview(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Profile update failed. Please check the entered details.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassSuccessMsg(null);
    setPassErrorMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setPassErrorMsg('New password must be at least 6 characters.');
      setPassLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassErrorMsg('New passwords do not match.');
      setPassLoading(false);
      return;
    }

    try {
      const payload = {
        password: newPassword,
      };
      if (oldPassword.trim()) {
        payload.oldPassword = oldPassword;
      }

      const response = await api.put(`/api/students/${user._id}`, payload);

      if (response.data.success) {
        setPassSuccessMsg('Password changed successfully! Keep your new credentials safe.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPassErrorMsg(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  // Parsed skills chips
  const skillsArray = skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 p-6 sm:p-8 text-white shadow-xl shadow-sky-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Student Self-Service Portal
            </div>
            <h2 className="text-2xl font-bold md:text-3xl">Profile & Data Correction</h2>
            <p className="mt-1 text-xs sm:text-sm text-sky-100 max-w-2xl">
              Aap login karne ke baad bhi apna personal data, university roll number, college name, branch,
              year, CGPA, resume, aur profile photo kabhi bhi update ya correct kar sakte hain.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold backdrop-blur-md border border-white/20">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Direct Sync Enabled
            </span>
          </div>
        </div>
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"></div>
      </div>

      {/* Main Grid: Left Column Summary, Right Column Editor */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Student Quick Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Avatar & Photo Picker */}
            <div className="relative mx-auto mb-4 h-28 w-28">
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-4xl font-bold text-white shadow-lg shadow-sky-500/20 overflow-hidden ring-4 ring-white dark:ring-slate-800">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : user?.photo ? (
                  <img
                    src={getFullUrl(user.photo)}
                    alt={user?.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const textNode = document.createTextNode(user?.name ? user.name.charAt(0).toUpperCase() : '?');
                      e.target.parentNode.appendChild(textNode);
                    }}
                  />
                ) : (
                  (user?.name ? user.name.charAt(0).toUpperCase() : 'S')
                )}
              </div>

              {/* Photo upload floating button */}
              <label
                htmlFor="quick-photo-upload"
                className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-sky-500 text-white shadow-md hover:bg-sky-600 transition-colors"
                title="Change Photo"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="quick-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{user?.name || 'Student Name'}</h3>
            <p className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-0.5">
              Roll: {user?.universityRollNo || 'Not Set'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {user?.collegeRollNo || 'University'} • {user?.branch || 'Branch'}
            </p>

            {/* Quick Metrics Badges */}
            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">CGPA</p>
                <p className="text-base font-extrabold text-slate-800 dark:text-sky-400">{user?.cgpa ?? '-'}</p>
              </div>
              <div className="text-center border-l border-slate-200 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Year / Sec</p>
                <p className="text-base font-extrabold text-slate-800 dark:text-indigo-400">
                  {user?.year ? `${user.year} yr` : '-'} / {user?.section || '-'}
                </p>
              </div>
            </div>

            {/* Contact Details List */}
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 text-left text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-sky-500 shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-sky-500 shrink-0" />
                <span>{user?.mobileNo || 'No phone added'}</span>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap className="h-4 w-4 text-sky-500 shrink-0" />
                <span>{user?.branch} Engineering</span>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-sky-500 shrink-0" />
                <span className="truncate">{user?.collegeRollNo || 'College / University'}</span>
              </div>
            </div>

            {/* Resume Button */}
            {user?.resume ? (
              <a
                href={getFullUrl(user.resume)}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-50 py-3 text-xs font-bold text-sky-700 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-950/60 transition-colors border border-sky-200 dark:border-sky-800 shadow-sm"
              >
                <FileText className="h-4 w-4" />
                <span>View Current Resume PDF</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            ) : (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-100 p-3 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                Resume not uploaded yet
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Full Profile & Academic Data Correction Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          {successMsg && (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-medium text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-300">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tab Navigation Filter */}
          <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100 p-1.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            {[
              { id: 'all', label: 'All Sections' },
              { id: 'personal', label: 'Personal Info' },
              { id: 'academics', label: 'Academics & College' },
              { id: 'documents', label: 'Documents & Skills' },
              { id: 'security', label: 'Password & Security' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-md dark:bg-gradient-to-r dark:from-sky-500 dark:to-indigo-600 dark:text-white dark:shadow-md dark:shadow-sky-500/30 border border-slate-200/60 dark:border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* 1. PERSONAL INFORMATION CARD */}
            {(activeTab === 'all' || activeTab === 'personal') && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-850 dark:text-white">Personal Information</h3>
                    <p className="text-xs text-slate-400">Update your official contact details and full name</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ashish Pandey"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-850 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. student@college.edu"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-850 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">Used for recruiter and drive notifications</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">10-digit mobile contact</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ACADEMICS & COLLEGE CORRECTION CARD */}
            {(activeTab === 'all' || activeTab === 'academics') && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Academic & University Data Correction
                    </h3>
                    <p className="text-xs text-slate-400">
                      Correct college roll number, university registration, branch, and CGPA
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      University / College Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={collegeRollNo}
                      onChange={(e) => setCollegeRollNo(e.target.value)}
                      placeholder="e.g. AKTU / College Name"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      University Roll Number (Unique) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={universityRollNo}
                      onChange={(e) => setUniversityRollNo(e.target.value)}
                      placeholder="e.g. 2100970100045"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Branch / Stream <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    >
                      <option value="">Select Branch</option>
                      {BRANCH_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Current Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    >
                      <option value="">Select Year</option>
                      {YEAR_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="e.g. A, B, or C"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Current CGPA (Out of 10.0) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="e.g. 8.45"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">Recruiter drive eligibility is calculated using this CGPA</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SKILLS & DOCUMENTS CARD */}
            {(activeTab === 'all' || activeTab === 'documents') && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Skills & Uploaded Documents</h3>
                    <p className="text-xs text-slate-400">Update your resume PDF, profile photo, and core technical skills</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Skills input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Key Technical & Soft Skills (Comma Separated)
                    </label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. React.js, Node.js, Python, SQL, Git, Problem Solving"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                    />

                    {/* Skills Chips Preview */}
                    {skillsArray.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {skillsArray.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-100 dark:border-sky-900"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Document upload grid */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 pt-2">
                    {/* Resume Upload */}
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center hover:border-sky-500 dark:border-slate-800 dark:bg-slate-950 transition-colors">
                      <FileText className="mx-auto mb-2 h-7 w-7 text-sky-500" />
                      <p className="text-xs font-bold text-slate-800 dark:text-white">Update Resume (PDF)</p>
                      <p className="text-[10px] text-slate-400 mb-3">Accepts PDF file (Max 10MB)</p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setResumeFile(e.target.files[0])}
                        className="hidden"
                        id="profile-resume-upload"
                      />
                      <label
                        htmlFor="profile-resume-upload"
                        className="inline-block rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-600 cursor-pointer transition-colors"
                      >
                        {resumeFile ? resumeFile.name : 'Choose New Resume'}
                      </label>
                      {resumeFile && (
                        <p className="mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Selected: {resumeFile.name}
                        </p>
                      )}
                    </div>

                    {/* Profile Picture Upload */}
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center hover:border-sky-500 dark:border-slate-800 dark:bg-slate-950 transition-colors">
                      <Camera className="mx-auto mb-2 h-7 w-7 text-indigo-500" />
                      <p className="text-xs font-bold text-slate-800 dark:text-white">Update Profile Picture</p>
                      <p className="text-[10px] text-slate-400 mb-3">Accepts JPG, PNG (Max 10MB)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="profile-photo-upload"
                      />
                      <label
                        htmlFor="profile-photo-upload"
                        className="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 cursor-pointer transition-colors"
                      >
                        {photoFile ? photoFile.name : 'Choose New Photo'}
                      </label>
                      {photoFile && (
                        <p className="mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Selected: {photoFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button for Profile & Academics */}
            {activeTab !== 'security' && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Save & Update Profile Details</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

          {/* 4. SECURITY & CHANGE PASSWORD CARD */}
          {(activeTab === 'all' || activeTab === 'security') && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Change Account Password</h3>
                  <p className="text-xs text-slate-400">Keep your login credentials secure</p>
                </div>
              </div>

              {passSuccessMsg && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-300">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>{passSuccessMsg}</span>
                </div>
              )}

              {passErrorMsg && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-medium text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-300">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                  <span>{passErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Current Password <span className="text-slate-400 font-normal">(Optional verification)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPass ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={passLoading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 hover:from-sky-600 hover:to-indigo-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {passLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        <span>Save & Update Password</span>
                      </>
                    )}
                  </button>

                  {passSuccessMsg && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 rounded-xl">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      {passSuccessMsg}
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
